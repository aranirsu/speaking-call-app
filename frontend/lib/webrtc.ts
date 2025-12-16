"use client";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  // Free TURN servers for better NAT traversal
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

export const createPeerConnection = (
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onTrack: (stream: MediaStream) => void,
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection({ 
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE candidate generated:", event.candidate.type);
      onIceCandidate(event.candidate);
    }
  };

  // Keep track of remote stream
  let remoteStream: MediaStream | null = null;

  pc.ontrack = (event) => {
    console.log("🎵 Track received:", event.track.kind, "enabled:", event.track.enabled, "readyState:", event.track.readyState);
    
    // Use the stream from the event if available, otherwise create new one
    if (event.streams && event.streams[0]) {
      remoteStream = event.streams[0];
      console.log("✅ Using stream from event, tracks:", remoteStream.getTracks().length);
    } else {
      // Create a new MediaStream if not provided
      if (!remoteStream) {
        remoteStream = new MediaStream();
      }
      remoteStream.addTrack(event.track);
      console.log("✅ Added track to remote stream, total tracks:", remoteStream.getTracks().length);
    }
    
    // Ensure track is enabled
    event.track.enabled = true;
    
    // Handle track ending
    event.track.onended = () => {
      console.log("⚠️ Remote track ended:", event.track.kind);
    };
    
    event.track.onmute = () => {
      console.log("⚠️ Remote track muted:", event.track.kind);
    };
    
    event.track.onunmute = () => {
      console.log("✅ Remote track unmuted:", event.track.kind);
    };
    
    onTrack(remoteStream);
  };

  pc.onconnectionstatechange = () => {
    console.log("Connection state changed:", pc.connectionState);
    onConnectionStateChange?.(pc.connectionState);
  };

  pc.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", pc.iceConnectionState);
  };

  pc.onicegatheringstatechange = () => {
    console.log("ICE gathering state:", pc.iceGatheringState);
  };

  return pc;
};

export const getUserMedia = async (
  audio: boolean = true,
  video: boolean = false
): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: audio ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } : false, 
      video 
    });
    console.log("Got user media, tracks:", stream.getTracks().map(t => t.kind));
    return stream;
  } catch (error) {
    console.error("Error getting user media:", error);
    throw error;
  }
};

export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
      console.log("Stopped track:", track.kind);
    });
  }
};
