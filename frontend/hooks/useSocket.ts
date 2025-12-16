"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { MatchData, CallState } from "@/types/call";
import { Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    roomId: null,
    partnerId: null,
    partnerName: null,
    isInitiator: false,
    isMuted: false,
    isVideoOn: false,
  });

  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    s.on("waiting", () => {
      console.log("Waiting for match...");
      setCallState((prev) => ({ ...prev, status: "matching" }));
    });

    s.on("matched", (data: MatchData) => {
      console.log("Matched with:", data);
      setCallState((prev) => ({
        ...prev,
        status: "connected",
        roomId: data.roomId,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        isInitiator: data.isInitiator,
      }));
    });

    s.on("call-ended", () => {
      console.log("Call ended by partner");
      setCallState({
        status: "ended",
        roomId: null,
        partnerId: null,
        partnerName: null,
        isInitiator: false,
        isMuted: false,
        isVideoOn: false,
      });
    });

    // Chat message listener - will be handled by component
    s.on("chat-message", (data) => {
      console.log("Chat message received:", data);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const findMatch = useCallback(
    (name: string) => {
      if (socket) {
        socket.emit("find-match", { name });
        setCallState((prev) => ({ ...prev, status: "matching" }));
      }
    },
    [socket]
  );

  const cancelMatch = useCallback(() => {
    if (socket) {
      socket.emit("cancel-match");
      setCallState((prev) => ({ ...prev, status: "idle" }));
    }
  }, [socket]);

  const endCall = useCallback(() => {
    if (socket) {
      socket.emit("end-call");
      setCallState({
        status: "ended",
        roomId: null,
        partnerId: null,
        partnerName: null,
        isInitiator: false,
        isMuted: false,
        isVideoOn: false,
      });
    }
  }, [socket]);

  const sendOffer = useCallback(
    (offer: RTCSessionDescriptionInit) => {
      if (socket && callStateRef.current.roomId) {
        socket.emit("offer", { offer, roomId: callStateRef.current.roomId });
      }
    },
    [socket]
  );

  const sendAnswer = useCallback(
    (answer: RTCSessionDescriptionInit) => {
      if (socket && callStateRef.current.roomId) {
        socket.emit("answer", { answer, roomId: callStateRef.current.roomId });
      }
    },
    [socket]
  );

  const sendIceCandidate = useCallback(
    (candidate: RTCIceCandidate) => {
      if (socket && callStateRef.current.roomId) {
        socket.emit("ice-candidate", {
          candidate,
          roomId: callStateRef.current.roomId,
        });
      }
    },
    [socket]
  );

  const toggleMute = useCallback(() => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const resetState = useCallback(() => {
    setCallState({
      status: "idle",
      roomId: null,
      partnerId: null,
      partnerName: null,
      isInitiator: false,
      isMuted: false,
      isVideoOn: false,
    });
  }, []);

  const sendMessage = useCallback(
    (message: string, senderName: string) => {
      if (socket && callStateRef.current.roomId) {
        socket.emit("chat-message", {
          message,
          roomId: callStateRef.current.roomId,
          senderName,
        });
      }
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    callState,
    findMatch,
    cancelMatch,
    endCall,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    toggleMute,
    resetState,
    sendMessage,
  };
}
