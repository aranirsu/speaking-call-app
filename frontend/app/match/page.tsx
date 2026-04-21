"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "@/hooks/useTimer";
import { useCall } from "@/context/CallContext";
import { getOrCreateUserName } from "@/lib/nameGenerator";
import { ArrowLeft, X, Clock, User, Globe, Lightbulb } from "lucide-react";

const TIPS = [
  { title: "Be Curious", text: "Ask about their hobbies and interests" },
  { title: "Share Culture", text: "Share something unique about your country" },
  { title: "Stay Focused", text: "Practice a specific topic you're learning" },
  { title: "Be Friendly", text: "Start with a warm greeting and smile" },
  { title: "Tell Stories", text: "Discuss a book or movie you enjoyed" },
  { title: "Common Ground", text: "Find shared interests like music or sports" },
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={handleCancel} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-secondary border border-border transition-all text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-xl">{languageFlag}</span>
            <div>
              <p className="text-[10px] text-muted-foreground">Practicing</p>
              <p className="text-sm font-medium text-foreground">{language}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">{onlineCount}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          
          {/* Left - Search Animation */}
          <div className="flex flex-col items-center mb-8 lg:mb-0">
            {/* Search Animation */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 relative">
                  {/* Rotating ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
                    style={{ animation: "spin 8s linear infinite" }}
                  />
                  <div 
                    className="absolute inset-4 rounded-full border border-primary/20"
                    style={{ animation: "spin 12s linear infinite reverse" }}
                  />
                  <div 
                    className="absolute inset-8 rounded-full border border-accent/20"
                    style={{ animation: "spin 6s linear infinite" }}
                  />
                  
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute inset-6 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
                </div>
              </div>

              {/* Center Avatar */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground">
                      {userName.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full shadow-lg">
                    <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">Searching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Finding Your Partner</h1>
              <p className="text-muted-foreground text-sm md:text-base mb-3">{SEARCHING_MESSAGES[searchMessage]}</p>
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Info Cards */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-card border border-border rounded-xl p-3 md:p-4 text-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" />
                <p className="text-lg md:text-xl font-mono font-bold text-foreground">{timer.formatted}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Wait Time</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 md:p-4 text-center">
                <User className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm md:text-base font-medium text-foreground truncate">{userName}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Your Profile</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 md:p-4 text-center">
                <Globe className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm md:text-base font-medium text-foreground">{language}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Language</p>
              </div>
            </div>

            {/* Tip Card */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-5 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Pro Tip</span>
                    <span className="text-[10px] text-muted-foreground">{currentTip + 1}/{TIPS.length}</span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-foreground mb-0.5">{TIPS[currentTip].title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{TIPS[currentTip].text}</p>
                </div>
              </div>
              <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ width: `${((currentTip + 1) / TIPS.length) * 100}%` }} 
                />
              </div>
            </div>

            {/* Cancel Button */}
            <button 
              onClick={handleCancel} 
              className="w-full px-5 py-3.5 rounded-xl bg-muted hover:bg-destructive/10 border border-border hover:border-destructive/30 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Cancel Search</span>
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
