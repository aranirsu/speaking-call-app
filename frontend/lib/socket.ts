"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Socket server URL - use environment variable for production
const getSocketUrl = (): string => {
  // For production, use NEXT_PUBLIC_SOCKET_URL environment variable
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  // For local development, backend runs on port 3001
  return "http://localhost:5000";
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};
