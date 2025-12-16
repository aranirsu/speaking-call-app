"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "@/hooks/useTimer";
import { useCall } from "@/context/CallContext";
import { getOrCreateUserName } from "@/lib/nameGenerator";

const TIPS = [
  { emoji: "💬", title: "Be Curious", text: "Ask about their hobbies and interests" },
  { emoji: "🌍", title: "Share Culture", text: "Share something unique about your country" },
  { emoji: "🎯", title: "Stay Focused", text: "Practice a specific topic you're learning" },
  { emoji: "😊", title: "Be Friendly", text: "Start with a warm greeting and smile" },
  { emoji: "📚", title: "Tell Stories", text: "Discuss a book or movie you enjoyed" },
  { emoji: "🎵", title: "Common Ground", text: "Find shared interests like music or sports" },
];

const SEARCHING_MESSAGES = [
  "Scanning the globe...",
  "Finding perfect match...",
  "Connecting minds...",
  "Almost there...",
];

export default function MatchPage() {
  const router = useRouter();
  const timer = useTimer(true);
  const { callState, findMatch, cancelMatch } = useCall();
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("English");
  const [languageFlag, setLanguageFlag] = useState("🇺🇸");
  const [currentTip, setCurrentTip] = useState(0);
  const [searchMessage, setSearchMessage] = useState(0);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 150) + 85);
  const [particles, setParticles] = useState<Array<{left: number, top: number, duration: number, delay: number}>>([]);
  const hasStartedMatching = useRef(false);

  useEffect(() => {
    if (hasStartedMatching.current) return;
    hasStartedMatching.current = true;
    
    const name = getOrCreateUserName();
    setUserName(name);
    
    const savedLang = localStorage.getItem("practiceLanguage") || "en";
    const langData: Record<string, { name: string; flag: string }> = {
      en: { name: "English", flag: "🇺🇸" },
      es: { name: "Spanish", flag: "🇪🇸" },
      fr: { name: "French", flag: "🇫🇷" },
      de: { name: "German", flag: "🇩🇪" },
      it: { name: "Italian", flag: "🇮🇹" },
      pt: { name: "Portuguese", flag: "🇧🇷" },
      ru: { name: "Russian", flag: "🇷🇺" },
      ja: { name: "Japanese", flag: "🇯🇵" },
      ko: { name: "Korean", flag: "🇰🇷" },
      zh: { name: "Chinese", flag: "🇨🇳" },
      ar: { name: "Arabic", flag: "🇸🇦" },
      hi: { name: "Hindi", flag: "🇮🇳" },
    };
    setLanguage(langData[savedLang]?.name || "English");
    setLanguageFlag(langData[savedLang]?.flag || "🇺🇸");
    
    // Generate particles on client side
    setParticles(Array.from({ length: 15 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    })));
    
    findMatch(name);
  }, [findMatch]);

  useEffect(() => {
    if (callState.status === "connected") {
      router.push("/connect");
    }
  }, [callState.status, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchMessage((prev) => (prev + 1) % SEARCHING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    cancelMatch();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 md:w-[500px] md:h-[500px] bg-purple-600/25 rounded-full blur-[100px] md:blur-[120px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 md:w-[500px] md:h-[500px] bg-cyan-600/25 rounded-full blur-[100px] md:blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 md:w-[600px] md:h-[600px] bg-violet-600/15 rounded-full blur-[80px] md:blur-[150px]" />
        
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-400/40 rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-30 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/80 via-[#0a0a0f]/90 to-cyan-900/80 backdrop-blur-2xl safe-top">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button onClick={handleCancel} className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all duration-300">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm text-gray-400 group-hover:text-white hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10">
            <span className="text-xl md:text-2xl">{languageFlag}</span>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500">Practicing</p>
              <p className="text-xs md:text-sm font-medium text-white">{language}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
            </span>
            <span className="text-xs md:text-sm font-medium text-emerald-400">{onlineCount}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-10 relative z-10">
        
        {/* Desktop Two Column Layout */}
        <div className="w-full max-w-5xl lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          
          {/* Left - Search Animation */}
          <div className="flex flex-col items-center lg:items-center mb-6 lg:mb-0">
            {/* Search Animation */}
            <div className="relative mb-6 md:mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 relative">
                  <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(139, 92, 246, 0.3) 25%, transparent 50%, rgba(6, 182, 212, 0.3) 75%, transparent 100%)", animation: "spin 4s linear infinite" }} />
                  <div className="absolute inset-3 md:inset-4 rounded-full border border-purple-500/20" />
                  <div className="absolute inset-6 md:inset-8 rounded-full border border-cyan-500/20" />
                  <div className="absolute inset-9 md:inset-12 rounded-full border border-purple-500/30" />
                  <div className="absolute inset-12 md:inset-16 rounded-full border border-cyan-500/30" />
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute inset-4 md:inset-6 rounded-full border border-cyan-500/20 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
                  
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-lg"
                      style={{
                        background: i === 0 ? '#8b5cf6' : i === 1 ? '#06b6d4' : '#f43f5e',
                        boxShadow: `0 0 20px ${i === 0 ? '#8b5cf6' : i === 1 ? '#06b6d4' : '#f43f5e'}`,
                        top: '50%', left: '50%',
                        animation: `orbit${i} 3s linear infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-2xl opacity-60 scale-125" />
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-cyan-500 p-[3px] shadow-2xl">
                    <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {userName.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-lg">
                    <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-wider">Searching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center mb-4 md:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">Finding Your Partner</h1>
              <p className="text-gray-400 text-sm md:text-base mb-2 md:mb-3">{SEARCHING_MESSAGES[searchMessage]}</p>
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Info Cards */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-purple-500/15 to-purple-500/5 backdrop-blur-sm border border-purple-500/25 rounded-2xl p-3 md:p-4 text-center shadow-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1.5 md:mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center text-base md:text-xl">⏱️</div>
                <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-white">{timer.formatted}</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-purple-400 mt-0.5 md:mt-1 font-medium">Wait Time</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 backdrop-blur-sm border border-cyan-500/25 rounded-2xl p-3 md:p-4 text-center shadow-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1.5 md:mb-2 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm md:text-base font-bold shadow-lg">{userName.charAt(0).toUpperCase()}</div>
                <p className="text-sm md:text-base font-medium text-white truncate">{userName}</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-cyan-400 mt-0.5 md:mt-1 font-medium">Your Profile</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/15 to-pink-500/5 backdrop-blur-sm border border-pink-500/25 rounded-2xl p-3 md:p-4 text-center shadow-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1.5 md:mb-2 rounded-xl bg-pink-500/20 flex items-center justify-center text-base md:text-xl">{languageFlag}</div>
                <p className="text-sm md:text-base font-medium text-white">{language}</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-pink-400 mt-0.5 md:mt-1 font-medium">Language</p>
              </div>
            </div>

            {/* Tip */}
            <div className="mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-2xl" />
                <div className="relative flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 border border-white/10 shadow-lg">
                    {TIPS[currentTip].emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] md:text-[10px] font-bold text-purple-400 uppercase tracking-wider">Pro Tip</span>
                      <span className="w-1 h-1 bg-purple-400 rounded-full" />
                      <span className="text-[9px] md:text-[10px] text-gray-500">{currentTip + 1}/{TIPS.length}</span>
                    </div>
                    <p className="text-sm md:text-base font-semibold text-white mb-0.5 md:mb-1">{TIPS[currentTip].title}</p>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{TIPS[currentTip].text}</p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${((currentTip + 1) / TIPS.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Cancel */}
            <button onClick={handleCancel} className="group w-full px-5 py-3.5 md:py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-sm md:text-base font-medium text-gray-400 group-hover:text-red-400 transition-colors">Cancel Search</span>
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes orbit0 { from { transform: rotate(0deg) translateX(85px) rotate(0deg); } to { transform: rotate(360deg) translateX(85px) rotate(-360deg); } }
        @keyframes orbit1 { from { transform: rotate(120deg) translateX(85px) rotate(-120deg); } to { transform: rotate(480deg) translateX(85px) rotate(-480deg); } }
        @keyframes orbit2 { from { transform: rotate(240deg) translateX(85px) rotate(-240deg); } to { transform: rotate(600deg) translateX(85px) rotate(-600deg); } }
        @media (min-width: 768px) {
          @keyframes orbit0 { from { transform: rotate(0deg) translateX(110px) rotate(0deg); } to { transform: rotate(360deg) translateX(110px) rotate(-360deg); } }
          @keyframes orbit1 { from { transform: rotate(120deg) translateX(110px) rotate(-120deg); } to { transform: rotate(480deg) translateX(110px) rotate(-480deg); } }
          @keyframes orbit2 { from { transform: rotate(240deg) translateX(110px) rotate(-240deg); } to { transform: rotate(600deg) translateX(110px) rotate(-600deg); } }
        }
        .safe-top { padding-top: env(safe-area-inset-top, 0); }
      `}</style>
    </div>
  );
}
