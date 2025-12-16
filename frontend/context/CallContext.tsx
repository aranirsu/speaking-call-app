"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSocket } from "@/hooks/useSocket";
import { CallState } from "@/types/call";
import { Socket } from "socket.io-client";

interface CallContextType {
  socket: Socket | null;
  isConnected: boolean;
  callState: CallState;
  findMatch: (name: string) => void;
  cancelMatch: () => void;
  endCall: () => void;
  sendOffer: (offer: RTCSessionDescriptionInit) => void;
  sendAnswer: (answer: RTCSessionDescriptionInit) => void;
  sendIceCandidate: (candidate: RTCIceCandidate) => void;
  toggleMute: () => void;
  resetState: () => void;
  sendMessage: (message: string, senderName: string) => void;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const socketHook = useSocket();

  return (
    <CallContext.Provider value={socketHook}>{children}</CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
