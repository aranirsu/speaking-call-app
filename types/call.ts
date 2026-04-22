export type CallStatus = "idle" | "matching" | "connected" | "in-call" | "ended";

export interface UserData {
  id: string;
  name: string;
  socketId?: string;
}

export interface MatchData {
  roomId: string;
  partnerId: string;
  partnerName: string;
  isInitiator: boolean;
}

export interface CallState {
  status: CallStatus;
  roomId: string | null;
  partnerId: string | null;
  partnerName: string | null;
  isInitiator: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
}
