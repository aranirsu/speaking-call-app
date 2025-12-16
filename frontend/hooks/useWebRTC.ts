"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

interface UseWebRTCProps {
  socket: Socket | null;
  roomId: string | null;
  isInitiator: boolean;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export function useWebRTC({
  socket,
  roomId,
  isInitiator,
  onConnectionStateChange,
}: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const isStarted = useRef(false);
  const roomIdRef = useRef(roomId);
  const socketRef = useRef(socket);

  // Keep refs updated
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Get user microphone
  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      console.log("🎤 Got local audio stream");
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("❌ Failed to get microphone:", error);
      throw error;
    }
  };

  // Create peer connection
  const createPC = useCallback(() => {
    console.log("🔧 Creating new RTCPeerConnection");
    
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
    });

    // Create remote stream container
    remoteStreamRef.current = new MediaStream();
    setRemoteStream(remoteStreamRef.current);

    pc.ontrack = (event) => {
      console.log("🎵 Got remote track:", event.track.kind, "enabled:", event.track.enabled);
      
      if (remoteStreamRef.current) {
        // Remove existing tracks of same kind
        remoteStreamRef.current.getTracks().forEach(t => {
          if (t.kind === event.track.kind) {
            remoteStreamRef.current?.removeTrack(t);
          }
        });
        
        // Add new track
        remoteStreamRef.current.addTrack(event.track);
        console.log("✅ Added track to remote stream. Total tracks:", remoteStreamRef.current.getTracks().length);
        
        // Force React state update
        setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && roomIdRef.current) {
        console.log("🧊 Sending ICE candidate");
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          roomId: roomIdRef.current,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("📡 Connection state:", pc.connectionState);
      setIsConnected(pc.connectionState === "connected");
      onConnectionStateChange?.(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("🧊 ICE state:", pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [onConnectionStateChange]);

  // Start call as initiator
  const startAsInitiator = useCallback(async () => {
    console.log("📞 Starting as INITIATOR");
    
    const stream = await getLocalStream();
    const pc = createPC();

    // Add local tracks
    stream.getTracks().forEach((track) => {
      console.log("➕ Adding local track:", track.kind);
      pc.addTrack(track, stream);
    });

    // Create and send offer
    console.log("📤 Creating offer...");
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });
    
    await pc.setLocalDescription(offer);
    console.log("📤 Sending offer to room:", roomIdRef.current);
    
    socketRef.current?.emit("offer", {
      offer,
      roomId: roomIdRef.current,
    });
  }, [createPC]);

  // Handle incoming offer (non-initiator)
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    console.log("📥 Handling incoming offer...");
    
    const stream = await getLocalStream();
    const pc = createPC();

    // Add local tracks
    stream.getTracks().forEach((track) => {
      console.log("➕ Adding local track:", track.kind);
      pc.addTrack(track, stream);
    });

    // Set remote description
    console.log("📝 Setting remote description (offer)");
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Add any pending ICE candidates
    for (const candidate of pendingCandidates.current) {
      console.log("➕ Adding pending ICE candidate");
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidates.current = [];

    // Create and send answer
    console.log("📤 Creating answer...");
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    console.log("📤 Sending answer to room:", roomIdRef.current);
    socketRef.current?.emit("answer", {
      answer,
      roomId: roomIdRef.current,
    });
  }, [createPC]);

  // Handle incoming answer (initiator)
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    console.log("📥 Handling incoming answer...");
    const pc = peerConnectionRef.current;
    
    if (pc && pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("✅ Remote description set (answer)");

      // Add any pending ICE candidates
      for (const candidate of pendingCandidates.current) {
        console.log("➕ Adding pending ICE candidate");
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidates.current = [];
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    
    if (pc && pc.remoteDescription) {
      console.log("➕ Adding ICE candidate");
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      console.log("⏳ Storing ICE candidate for later");
      pendingCandidates.current.push(candidate);
    }
  }, []);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) {
      console.log("⚠️ No socket");
      return;
    }

    console.log("🔌 Setting up socket listeners for WebRTC");

    const onOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📥 Received offer from:", from);
      try {
        await handleOffer(offer);
      } catch (error) {
        console.error("❌ Error handling offer:", error);
      }
    };

    const onAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📥 Received answer from:", from);
      try {
        await handleAnswer(answer);
      } catch (error) {
        console.error("❌ Error handling answer:", error);
      }
    };

    const onIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log("📥 Received ICE from:", from);
      try {
        await handleIceCandidate(candidate);
      } catch (error) {
        console.error("❌ Error handling ICE:", error);
      }
    };

    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);

    return () => {
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
    };
  }, [socket, handleOffer, handleAnswer, handleIceCandidate]);

  // Start call function
  const startCall = useCallback(async () => {
    if (isStarted.current) {
      console.log("⚠️ Call already started");
      return;
    }
    isStarted.current = true;

    try {
      if (isInitiator) {
        await startAsInitiator();
      } else {
        console.log("⏳ Waiting for offer (non-initiator)...");
        // Non-initiator just waits for offer via socket
      }
    } catch (error) {
      console.error("❌ Error starting call:", error);
      isStarted.current = false;
    }
  }, [isInitiator, startAsInitiator]);

  // End call
  const endCall = useCallback(() => {
    console.log("📴 Ending call");
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    isStarted.current = false;
    pendingCandidates.current = [];
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log("🔇 Muted:", !audioTrack.enabled);
      }
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    startCall,
    endCall,
    toggleMute,
  };
}
