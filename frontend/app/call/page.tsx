"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "@/hooks/useTimer";
import { useCall } from "@/context/CallContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import RatingModal from "@/components/RatingModal";
import { getOrCreateUserName } from "@/lib/nameGenerator";

interface ChatMessage {
  id: string;
  message: string;
  senderName: string;
  senderId: string;
  isMe: boolean;
  timestamp: number;
}

const TOPICS = [
  { emoji: "🌍", text: "Travel experiences", color: "from-blue-500 to-cyan-500" },
  { emoji: "🎬", text: "Favorite movies", color: "from-red-500 to-orange-500" },
  { emoji: "🍕", text: "Food & cuisine", color: "from-yellow-500 to-red-500" },
  { emoji: "📚", text: "Books & learning", color: "from-emerald-500 to-teal-500" },
  { emoji: "🎵", text: "Music tastes", color: "from-purple-500 to-pink-500" },
  { emoji: "💼", text: "Work & career", color: "from-gray-500 to-slate-500" },
  { emoji: "🎮", text: "Hobbies", color: "from-violet-500 to-purple-500" },
  { emoji: "🌟", text: "Future goals", color: "from-amber-500 to-yellow-500" },
];

export default function CallPage() {
  const router = useRouter();
  const timer = useTimer(true);
  const { socket, callState, endCall, resetState, sendMessage } = useCall();
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [showRating, setShowRating] = useState(false);
  const [userName, setUserName] = useState("You");
  const [currentTopic, setCurrentTopic] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [particles, setParticles] = useState<Array<{top: number, left: number, duration: number, delay: number}>>([]);

  const { remoteStream, isConnected, isMuted, startCall, endCall: endWebRTC, toggleMute } =
    useWebRTC({
      socket,
      roomId: callState.roomId,
      isInitiator: callState.isInitiator,
      onConnectionStateChange: (state) => {
        switch (state) {
          case "connecting":
            setConnectionStatus("Connecting...");
            break;
          case "connected":
            setConnectionStatus("Connected");
            break;
          case "disconnected":
            setConnectionStatus("Reconnecting...");
            break;
          case "failed":
            setConnectionStatus("Connection failed");
            break;
          default:
            setConnectionStatus(state);
        }
      },
    });

  useEffect(() => {
    setUserName(getOrCreateUserName());
    // Generate particles on client side
    setParticles(Array.from({ length: 20 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })));
  }, []);

  // Simulate audio levels for visual feedback
  useEffect(() => {
    if (!isConnected || isMuted) {
      setAudioLevel([0, 0, 0, 0, 0, 0, 0]);
      return;
    }
    
    const interval = setInterval(() => {
      setAudioLevel(prev => prev.map(() => Math.random() * 100));
    }, 150);
    
    return () => clearInterval(interval);
  }, [isConnected, isMuted]);

  // Listen for incoming chat messages
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: { message: string; senderName: string; senderId: string; timestamp: number }) => {
      const newMsg: ChatMessage = {
        id: `${data.timestamp}-${data.senderId}`,
        message: data.message,
        senderName: data.senderName,
        senderId: data.senderId,
        isMe: false,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, newMsg]);
      if (!showChat) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, [socket, showChat]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle when partner ends the call
  useEffect(() => {
    if (callState.status === "ended" && !showRating) {
      console.log("📞 Partner ended call, showing rating");
      endWebRTC();
      setShowRating(true);
    }
  }, [callState.status, endWebRTC, showRating]);

  // Start call with a small delay - only redirect if status is idle (not ended, as we need to show rating)
  useEffect(() => {
    // Don't redirect if rating modal is showing
    if (showRating) {
      return;
    }
    
    // Don't redirect if call just ended - we need to show rating modal
    if (callState.status === "ended") {
      return;
    }
    
    // Only redirect if status is idle (user manually navigated here without a match)
    if (callState.status === "idle") {
      router.push("/");
      return;
    }
    
    // Start call if we're connected
    if (callState.status === "connected" || callState.status === "in-call") {
      const timer = setTimeout(() => {
        console.log("🚀 Starting call, isInitiator:", callState.isInitiator);
        startCall();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [callState.status, callState.isInitiator, router, startCall, showRating]);

  useEffect(() => {
    if (remoteStream && audioRef.current) {
      console.log("🎵 Setting remote stream to audio element");
      const tracks = remoteStream.getTracks();
      console.log("Remote stream tracks:", tracks.map(t => `${t.kind}:${t.enabled}:${t.readyState}`));
      
      const audioTracks = remoteStream.getAudioTracks();
      if (audioTracks.length > 0) {
        setHasRemoteAudio(true);
        console.log("✅ Has remote audio tracks:", audioTracks.length);
      }
      
      const audioElement = audioRef.current;
      
      if (audioElement.srcObject) {
        audioElement.srcObject = null;
      }
      
      audioElement.srcObject = remoteStream;
      audioElement.volume = 1.0;
      audioElement.muted = false;
      
      audioTracks.forEach(track => {
        track.enabled = true;
      });
      
      const playAudio = async (skipDelay = false) => {
        try {
          if (!skipDelay) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          await audioElement.play();
          console.log("✅ Audio playing successfully");
          setAudioEnabled(true);
          setAudioError(null);
        } catch (err) {
          console.log("⚠️ Audio autoplay blocked", err);
          setAudioEnabled(false);
          setAudioError("Audio playback is blocked by the browser. Tap anywhere to enable sound.");
        }
      };
      
      playAudio();
      
      remoteStream.onaddtrack = (e) => {
        console.log("Track added:", e.track.kind);
        e.track.enabled = true;
        if (e.track.kind === 'audio') {
          setHasRemoteAudio(true);
        }
        playAudio(true);
      };
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    console.log("📞 Ending call, showing rating modal");
    endWebRTC();
    // Show rating modal first, don't call endCall() yet as it changes status
    setShowRating(true);
  };

  const handleCloseRating = () => {
    console.log("📞 Closing rating modal, navigating home");
    setShowRating(false);
    endCall(); // Now end the call (updates status)
    resetState();
    router.push("/");
  };

  const handleEnableAudio = useCallback(async () => {
    if (!audioRef.current) {
      return;
    }

    try {
      const audioElement = audioRef.current;

      if (remoteStream) {
        audioElement.srcObject = remoteStream;
        remoteStream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
      }

      audioElement.volume = 1.0;
      audioElement.muted = false;

      await audioElement.play();
      console.log("✅ Audio enabled via user interaction");
      setAudioEnabled(true);
      setAudioError(null);
    } catch (error) {
      console.error("Failed to enable audio:", error);
      setAudioEnabled(false);
      setAudioError("Could not start audio playback. Please check permissions and tap again.");
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteStream) {
      setAudioEnabled(false);
      setAudioError(null);
      setHasRemoteAudio(false);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteStream || audioEnabled) {
      return;
    }

    const resumeAudio = () => {
      handleEnableAudio();
    };

    window.addEventListener("pointerdown", resumeAudio);
    window.addEventListener("keydown", resumeAudio);

    return () => {
      window.removeEventListener("pointerdown", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
    };
  }, [remoteStream, audioEnabled, handleEnableAudio]);

  const nextTopic = () => {
    setCurrentTopic((prev) => (prev + 1) % TOPICS.length);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: `${Date.now()}-me`,
      message: newMessage.trim(),
      senderName: userName,
      senderId: "me",
      isMe: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, msg]);
    sendMessage(newMessage.trim(), userName);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      setUnreadCount(0);
    }
  };

  const partnerName = callState.partnerName || "Partner";

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] relative overflow-hidden" onClick={handleEnableAudio}>
      {/* Premium Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px]" />
        
        {/* Floating particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`, 
            backgroundSize: '60px 60px' 
          }} 
        />
      </div>

      {/* Audio element */}
      <audio 
        ref={audioRef} 
        autoPlay 
        playsInline 
        controls={false}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        onPlay={() => setAudioEnabled(true)}
      />
      
      {/* Enable Audio Banner - Responsive */}
      {remoteStream && !audioEnabled && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 cursor-pointer"
          onClick={handleEnableAudio}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 py-3 sm:py-4 px-3 sm:px-4">
            <div className="max-w-5xl mx-auto flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl animate-bounce">🔊</span>
                <span className="text-white font-bold text-sm sm:text-lg">TAP ANYWHERE TO ENABLE AUDIO</span>
                <span className="text-lg sm:text-2xl animate-bounce" style={{ animationDelay: "0.1s" }}>🔊</span>
              </div>
              <span className="text-white/80 text-xs sm:text-sm">
                {audioError || "Browser requires interaction to play sound"}
              </span>
            </div>
          </div>
          <div className="h-0.5 sm:h-1 bg-white/20">
            <div className="h-full bg-white animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}
      
      {/* Rating Modal */}
      {showRating && (
        <RatingModal
          partnerName={partnerName}
          callDuration={timer.formatted}
          onClose={handleCloseRating}
        />
      )}

      {/* Premium Header - Clean mobile layout */}
      <header className="relative z-30 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/80 via-[#0a0a0f]/90 to-cyan-900/80 backdrop-blur-2xl" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Connection status - Only show when connected */}
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm bg-emerald-500/15 border border-emerald-500/40">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">Live</span>
              </div>
            )}

            {/* Timer - Hidden on mobile, shown in main content */}
            <div className="hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-white/20">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-50" />
              </div>
              <span className="text-lg sm:text-2xl lg:text-3xl font-mono font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {timer.formatted}
              </span>
            </div>

            {/* Mic status - Icon only on mobile */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
              isMuted 
                ? "bg-red-500/15 border border-red-500/40" 
                : "bg-purple-500/15 border border-purple-500/40"
            }`}>
              <span className="text-base sm:text-lg">{isMuted ? "🔇" : "🎤"}</span>
              <span className={`text-xs sm:text-sm font-bold hidden sm:inline ${isMuted ? "text-red-400" : "text-purple-400"}`}>
                {isMuted ? "Muted" : "Live"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Centered layout */}
      <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch lg:justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative z-10 gap-8 lg:gap-12 xl:gap-16 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Left Column - Call Info */}
        <div className="flex flex-col items-center justify-center lg:flex-1 lg:max-w-lg w-full">
          {/* Partner Avatar Section - Larger on mobile */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-5 sm:mb-6">
              {/* Outer glow rings - More visible */}
              <div className={`absolute inset-0 rounded-full scale-[1.5] transition-opacity duration-500 ${isConnected ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" style={{ animationDuration: "3s" }} />
              </div>
              <div className={`absolute inset-0 rounded-full scale-[1.3] transition-opacity duration-500 ${isConnected ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 animate-ping" style={{ animationDuration: "2s" }} />
              </div>
              
              {/* Gradient glow - Stronger */}
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-3xl transition-opacity duration-500 ${isConnected ? "opacity-60" : "opacity-30"}`} style={{ transform: "scale(1.4)" }} />
              
              {/* Main avatar - LARGER on mobile */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 xl:w-60 xl:h-60 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-cyan-500 p-1 sm:p-1.5 shadow-2xl shadow-purple-500/30">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
                  {/* Inner gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-cyan-500/15" />
                  <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-br from-purple-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
                    {partnerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Online indicator - Bigger */}
              {isConnected && (
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#0a0a0f] flex items-center justify-center border-3 border-emerald-500 shadow-lg shadow-emerald-500/50">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full bg-emerald-500" />
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">{partnerName}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Speaking with you
            </p>

            {/* Timer - Mobile only (shown below name) */}
            <div className="sm:hidden mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-50" />
              </div>
              <span className="text-2xl font-mono font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {timer.formatted}
              </span>
            </div>
          </div>

          {/* Audio Visualization - Bigger bars */}
          <div className="mb-6 sm:mb-8 w-full max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-16 sm:h-20 lg:h-24">
              {audioLevel.map((level, i) => (
                <div
                  key={i}
                  className={`w-2 sm:w-2.5 lg:w-3 rounded-full transition-all duration-150 ${
                    isConnected && !isMuted 
                      ? "bg-gradient-to-t from-purple-500 via-violet-500 to-cyan-500" 
                      : "bg-gray-700"
                  }`}
                  style={{
                    height: isConnected && !isMuted 
                      ? `${Math.max(16, level * 0.7)}px` 
                      : "16px",
                    boxShadow: isConnected && !isMuted ? '0 0 15px rgba(139, 92, 246, 0.6)' : 'none',
                  }}
                />
              ))}
            </div>
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              {isConnected ? (isMuted ? "🔇 You're muted" : "🎙️ Audio active") : "⏳ Connecting audio..."}
            </p>
          </div>

        </div>

        {/* Right Column - Topic & Stats */}
        <div className="w-full lg:flex-1 lg:max-w-lg flex flex-col items-center lg:items-stretch justify-center gap-5 sm:gap-6">
          {/* Topic Suggestion Card - Improved mobile design */}
          <div className="w-full max-w-md lg:max-w-none">
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${TOPICS[currentTopic].color} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
              <div className="relative bg-gradient-to-br from-white/12 to-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 hover:border-white/25 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <p className="text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-wider">Talk About</p>
                  </div>
                  <button 
                    onClick={nextTopic}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/15 active:scale-95 border border-white/10"
                  >
                    <span>Next</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br ${TOPICS[currentTopic].color} bg-opacity-30 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 border border-white/15 shadow-lg`}>
                    {TOPICS[currentTopic].emoji}
                  </div>
                  <p className="text-base sm:text-lg lg:text-xl text-white font-semibold leading-snug">{TOPICS[currentTopic].text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats - Visible on mobile too */}
          <div className="w-full max-w-md lg:max-w-none">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-30" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center border border-white/5">
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{timer.formatted}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">Duration</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center border border-white/5">
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">{isConnected ? "HD" : "--"}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card - Desktop only */}
          <div className="hidden lg:block w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-30" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💪</span>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pro Tips</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Speak clearly and at a natural pace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Don't be afraid to make mistakes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Ask follow-up questions to keep the conversation flowing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Control Panel - Larger buttons on mobile */}
      <div className="sticky bottom-0 z-40 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/98 to-transparent pt-4 sm:pt-6 pb-5 sm:pb-6 lg:pb-8 px-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)' }}>
        <div className="max-w-md lg:max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/25 to-cyan-500/25 rounded-3xl blur-xl" />
            <div className="relative bg-black/70 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-6">
                {/* Mute button - Larger */}
                <button
                  onClick={toggleMute}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
                    isMuted 
                      ? "bg-gradient-to-br from-red-500/40 to-red-600/40 border-2 border-red-500/60 shadow-lg shadow-red-500/20" 
                      : "bg-white/15 border-2 border-white/25 hover:bg-white/25"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{isMuted ? "🔇" : "🎤"}</span>
                  {!isMuted && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/50 animate-ping opacity-30" style={{ animationDuration: "2s" }} />
                  )}
                </button>

                {/* Chat button - Larger */}
                <button
                  onClick={toggleChat}
                  className="group relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl bg-white/15 border-2 border-white/25 flex items-center justify-center transition-all duration-300 hover:bg-white/25 active:scale-95"
                >
                  <span className="text-2xl sm:text-3xl">💬</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm flex items-center justify-center font-bold animate-bounce shadow-lg">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* End call button - Prominent */}
                <button
                  onClick={handleEndCall}
                  className="group relative w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-red-500/40"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white transform rotate-[135deg] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>

                {/* Speaker button - Larger */}
                <button
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
                    audioEnabled
                      ? "bg-emerald-500/25 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/20"
                      : "bg-white/15 border-2 border-white/25 hover:bg-white/25"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{audioEnabled ? "🔊" : "🔈"}</span>
                </button>
              </div>

              {/* Labels - Bigger text */}
              <div className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-6 mt-3">
                <span className="w-14 sm:w-16 text-center text-[10px] sm:text-xs text-gray-400 font-semibold">
                  {isMuted ? "Unmute" : "Mute"}
                </span>
                <span className="w-14 sm:w-16 text-center text-[10px] sm:text-xs text-gray-400 font-semibold">Chat</span>
                <span className="w-16 sm:w-20 text-center text-[10px] sm:text-xs text-red-400 font-bold">End</span>
                <span className="w-14 sm:w-16 text-center text-[10px] sm:text-xs text-gray-400 font-semibold">Speaker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel - Improved responsive design */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-end lg:p-6 xl:p-8 bg-black/70 backdrop-blur-md" onClick={toggleChat}>
          <div 
            className="w-full sm:w-[420px] lg:w-[400px] xl:w-[450px] h-[80vh] sm:h-[600px] lg:h-[calc(100vh-48px)] xl:h-[calc(100vh-64px)] bg-[#0f0f18] border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl lg:mr-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur opacity-50" />
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                    {partnerName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{partnerName}</p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleChat}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
              >
                <span className="text-gray-400 text-base sm:text-lg">✕</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl">💬</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-gray-400">No messages yet</p>
                  <p className="text-xs sm:text-sm text-gray-500">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 ${
                        msg.isMe
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                          : "bg-white/10 text-white border border-white/10"
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 sm:mt-1.5 ${msg.isMe ? "text-white/70" : "text-gray-500"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)' }}>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-purple-500/30"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
