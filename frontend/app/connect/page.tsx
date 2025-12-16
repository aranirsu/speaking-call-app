"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCall } from "@/context/CallContext";
import { getOrCreateUserName } from "@/lib/nameGenerator";

const TOPICS = [
  { emoji: "🌍", text: "Favorite travel destinations" },
  { emoji: "🎬", text: "Movies you've watched recently" },
  { emoji: "🍕", text: "Favorite foods and cuisines" },
  { emoji: "📚", text: "Books that changed your life" },
  { emoji: "🎵", text: "Music and favorite artists" },
  { emoji: "💼", text: "Your work or studies" },
  { emoji: "🎮", text: "Hobbies and interests" },
  { emoji: "🌟", text: "Dreams and aspirations" },
];

const CONFETTI_COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#22c55e', '#fbbf24', '#ec4899'];

export default function ConnectPage() {
  const router = useRouter();
  const { callState } = useCall();
  const [countdown, setCountdown] = useState(5);
  const [userName, setUserName] = useState("You");
  const [topic] = useState(() => TOPICS[Math.floor(Math.random() * TOPICS.length)]);
  const hasNavigated = useRef(false);
  const [confetti, setConfetti] = useState<Array<{id: number, color: string, x: number, delay: number}>>([]);

  useEffect(() => {
    setUserName(getOrCreateUserName());
    // Generate confetti
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setConfetti(confettiPieces);
  }, []);

  useEffect(() => {
    if (countdown === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      router.push("/call");
    }
  }, [countdown, router]);

  useEffect(() => {
    if (callState.status !== "connected") {
      router.push("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callState.status, router]);

  const partnerName = callState.partnerName || "Partner";

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Success gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-[400px] md:h-[400px] bg-emerald-500/25 rounded-full blur-[100px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-[400px] md:h-[400px] bg-cyan-500/25 rounded-full blur-[100px] md:blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 md:w-[600px] md:h-[600px] bg-purple-500/15 rounded-full blur-[80px] md:blur-[150px]" />
        
        {/* Confetti */}
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-2 h-2 md:w-3 md:h-3 rounded-sm"
            style={{
              backgroundColor: piece.color,
              left: `${piece.x}%`,
              top: '-20px',
              animation: `confettiFall 3s ease-out ${piece.delay}s infinite`,
              opacity: 0.8,
            }}
          />
        ))}
        
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      {/* Header */}
      <header className="relative z-30 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/80 via-[#0a0a0f]/90 to-cyan-900/80 backdrop-blur-2xl safe-top">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-center">
          <div className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
            </span>
            <span className="text-sm md:text-base font-bold text-emerald-400">🎉 Match Found!</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-5 md:py-10 relative z-10">
        
        {/* Desktop Two Column Layout */}
        <div className="w-full max-w-5xl lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          
          {/* Left Column - Success & Connection */}
          <div className="flex flex-col items-center lg:items-center">
            {/* Success Icon */}
            <div className="relative mb-5 md:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-2xl md:blur-3xl opacity-40 scale-150" />
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 p-[3px] shadow-2xl">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                  <span className="text-4xl md:text-6xl animate-bounce">🎉</span>
                </div>
              </div>
              
              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%', left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-50px) md:translateY(-70px)`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                    boxShadow: '0 0 10px #fbbf24',
                  }}
                />
              ))}
            </div>

            {/* Title */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2">
                Perfect <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Match!</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base">Get ready for an amazing conversation</p>
            </div>

            {/* Users Connection */}
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8 mb-6 md:mb-8">
              {/* You */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-lg md:blur-xl opacity-50 scale-125" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px] md:p-[3px] shadow-xl">
                    <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                      <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 md:mt-3 text-xs sm:text-sm font-medium text-white truncate max-w-[70px] sm:max-w-[90px]">{userName}</p>
                <p className="text-[10px] md:text-xs text-purple-400">You</p>
              </div>

              {/* Connection Animation */}
              <div className="flex flex-col items-center gap-1.5 md:gap-2">
                <div className="relative">
                  <div className="w-12 sm:w-20 md:w-28 lg:w-32 h-[2px] md:h-[3px] bg-gradient-to-r from-purple-500 via-emerald-500 to-cyan-500 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" style={{ animation: "shimmer 1.5s infinite" }} />
                  </div>
                  {/* Connection sparks */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-emerald-400 rounded-full animate-ping opacity-60" />
                </div>
                <div className="text-xl md:text-2xl animate-pulse">⚡</div>
              </div>

              {/* Partner */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur-lg md:blur-xl opacity-50 scale-125" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-[2px] md:p-[3px] shadow-xl">
                    <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                      <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {partnerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#0a0a0f] flex items-center justify-center">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                  </div>
                </div>
                <p className="mt-2 md:mt-3 text-xs sm:text-sm font-medium text-emerald-400 truncate max-w-[70px] sm:max-w-[90px]">{partnerName}</p>
                <p className="text-[10px] md:text-xs text-gray-500">Partner</p>
              </div>
            </div>
          </div>

          {/* Right Column - Countdown & Info */}
          <div className="flex flex-col items-center w-full max-w-sm mx-auto lg:max-w-none">
            {/* Countdown */}
            <div className="text-center mb-5 md:mb-8">
              <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">Call starting in</p>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 mx-auto">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl md:blur-2xl opacity-30" />
                
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke="url(#countdownGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(countdown / 5) * 283} 283`}
                    style={{ transition: "stroke-dasharray 1s linear" }}
                  />
                  <defs>
                    <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white ${countdown > 0 ? 'animate-pulse' : ''}`}>
                    {countdown}
                  </span>
                </div>
              </div>
            </div>

            {/* Topic Suggestion */}
            <div className="w-full mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-purple-500/15 to-cyan-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <span className="text-base md:text-lg">💡</span>
                  <p className="text-[10px] md:text-xs font-bold text-purple-400 uppercase tracking-wider">Suggested Topic</p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 border border-white/10 shadow-lg">
                    {topic.emoji}
                  </div>
                  <p className="text-sm md:text-base lg:text-lg text-white font-medium">{topic.text}</p>
                </div>
              </div>
            </div>

            {/* Mic Reminder */}
            <div className="w-full flex items-center gap-3 md:gap-4 bg-gradient-to-r from-white/[0.08] to-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                🎤
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium text-white">Microphone Ready?</p>
                <p className="text-xs md:text-sm text-gray-400">Make sure your audio is working!</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-sm md:text-base">✓</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .safe-top { padding-top: env(safe-area-inset-top, 0); }
      `}</style>
    </div>
  );
}
