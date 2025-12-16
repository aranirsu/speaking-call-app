"use client";

import { useRouter } from "next/navigation";
import { useCall } from "@/context/CallContext";
import { useState, useEffect } from "react";
import { getOrCreateUserName, regenerateUserName } from "@/lib/nameGenerator";
import { getLanguageByCode, LANGUAGES } from "@/lib/languages";

type CallMode = "normal" | "short" | "topic" | "ai";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useCall();
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("en");
  const [showLanguages, setShowLanguages] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [callMode, setCallMode] = useState<CallMode>("normal");
  const [selectedTopic, setSelectedTopic] = useState("");

  const TOPICS = [
    { id: "travel", emoji: "✈️", name: "Travel", color: "from-blue-500 to-cyan-500" },
    { id: "movies", emoji: "🎬", name: "Movies", color: "from-red-500 to-orange-500" },
    { id: "food", emoji: "🍕", name: "Food", color: "from-yellow-500 to-red-500" },
    { id: "tech", emoji: "💻", name: "Tech", color: "from-gray-500 to-blue-500" },
    { id: "sports", emoji: "⚽", name: "Sports", color: "from-green-500 to-emerald-500" },
    { id: "music", emoji: "🎵", name: "Music", color: "from-purple-500 to-pink-500" },
  ];

  useEffect(() => {
    setUserName(getOrCreateUserName());
    const savedLang = localStorage.getItem("practiceLanguage") || "en";
    setLanguage(savedLang);
    setOnlineCount(Math.floor(Math.random() * 50) + 120);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => Math.max(100, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCall = () => {
    localStorage.setItem("practiceLanguage", language);
    localStorage.setItem("callMode", callMode);
    if (selectedTopic) localStorage.setItem("selectedTopic", selectedTopic);
    router.push(callMode === "ai" ? "/ai-chat" : "/match");
  };

  const handleNewName = () => setUserName(regenerateUserName());

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem("practiceLanguage", code);
    setShowLanguages(false);
  };

  const selectedLang = getLanguageByCode(language);

  const CALL_MODES = [
    { id: "normal" as CallMode, icon: "📞", title: "Normal", color: "purple" },
    { id: "short" as CallMode, icon: "⏱️", title: "5 Min", color: "orange" },
    { id: "topic" as CallMode, icon: "🎯", title: "Topic", color: "cyan" },
    { id: "ai" as CallMode, icon: "🤖", title: "AI", color: "pink", isNew: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background - Enhanced for mobile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 md:w-[500px] md:h-[500px] bg-purple-600/30 rounded-full blur-[80px] md:blur-[150px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 md:w-[500px] md:h-[500px] bg-cyan-600/25 rounded-full blur-[80px] md:blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-60 h-60 bg-pink-600/15 rounded-full blur-[60px] lg:hidden" />
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[200px]" />
      </div>

      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/80 via-[#0a0a0f]/90 to-cyan-900/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base md:text-lg shadow-lg shadow-purple-500/30">🎙️</div>
            <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">SpeakFlow</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <span className="w-2 h-2 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-xs md:text-sm font-semibold text-emerald-400">{onlineCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-12 pb-32 md:pb-12">
        
        {/* Desktop Layout - Two Column */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
          
          {/* Left Column - Hero & CTA */}
          <div className="lg:sticky lg:top-24">
            {/* Hero - Mobile Premium */}
            <section className="text-center lg:text-left mb-5 lg:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 mb-4 lg:hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="text-xs font-medium text-purple-300">Live Practice Mode</span>
              </div>
              <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 leading-[1.1]">
                <span className="text-white">Practice Speaking</span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent block mt-1">With Real People</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base lg:text-lg flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <span className="flex items-center gap-1"><span className="text-emerald-400">⚡</span> Instant</span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1"><span className="text-purple-400">🔒</span> Anonymous</span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1"><span className="text-cyan-400">🆓</span> Free</span>
              </p>
            </section>

            {/* Call Modes - Premium Cards for Mobile */}
            <section className="mb-5 lg:mb-8">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 lg:hidden">Choose Mode</p>
              <div className="grid grid-cols-4 gap-2 lg:flex lg:gap-3 lg:overflow-visible lg:pb-0 lg:flex-wrap">
                {CALL_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setCallMode(mode.id)}
                    className={`relative flex flex-col lg:flex-row items-center lg:gap-3 p-3 lg:px-6 lg:py-3 rounded-2xl border transition-all active:scale-95 lg:hover:scale-105 ${
                      callMode === mode.id
                        ? "text-white shadow-xl"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                    style={callMode === mode.id ? {
                      background: `linear-gradient(145deg, rgba(${mode.color === 'purple' ? '139,92,246' : mode.color === 'orange' ? '249,115,22' : mode.color === 'cyan' ? '6,182,212' : '236,72,153'}, 0.25), rgba(${mode.color === 'purple' ? '139,92,246' : mode.color === 'orange' ? '249,115,22' : mode.color === 'cyan' ? '6,182,212' : '236,72,153'}, 0.08))`,
                      borderColor: `rgba(${mode.color === 'purple' ? '139,92,246' : mode.color === 'orange' ? '249,115,22' : mode.color === 'cyan' ? '6,182,212' : '236,72,153'}, 0.5)`,
                      boxShadow: `0 8px 32px rgba(${mode.color === 'purple' ? '139,92,246' : mode.color === 'orange' ? '249,115,22' : mode.color === 'cyan' ? '6,182,212' : '236,72,153'}, 0.2)`
                    } : {}}
                  >
                    {mode.isNew && <span className="absolute -top-1 -right-1 lg:-top-1.5 lg:-right-1 px-1.5 py-0.5 text-[7px] lg:text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg">NEW</span>}
                    <span className="text-2xl lg:text-2xl mb-1 lg:mb-0">{mode.icon}</span>
                    <span className="text-[11px] lg:text-base font-semibold">{mode.title}</span>
                    {callMode === mode.id && <span className="hidden lg:flex w-5 h-5 rounded-full bg-white/20 items-center justify-center text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            {/* Topic Selection - Only when topic mode */}
            {callMode === "topic" && (
              <section className="mb-5 lg:mb-8 p-4 md:p-5 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/25 rounded-2xl md:rounded-2xl shadow-xl shadow-cyan-500/10">
                <p className="text-xs md:text-sm font-semibold text-cyan-400 mb-3 md:mb-3 flex items-center gap-2">
                  <span>🎯</span> Select Topic
                </p>
                <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-3">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 md:px-4 md:py-2 rounded-xl md:rounded-xl text-xs md:text-sm font-medium transition-all active:scale-95 lg:hover:scale-105 ${
                        selectedTopic === topic.id
                          ? "bg-white/20 text-white border border-white/40 shadow-lg"
                          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{topic.emoji}</span>
                      <span>{topic.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* AI Info - Only when AI mode */}
            {callMode === "ai" && (
              <section className="mb-5 lg:mb-8 p-4 md:p-5 bg-gradient-to-br from-pink-500/15 to-purple-500/10 border border-pink-500/25 rounded-2xl md:rounded-2xl flex items-center gap-4 md:gap-4 shadow-xl shadow-pink-500/10">
                <div className="w-14 h-14 md:w-14 md:h-14 rounded-2xl md:rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 shadow-lg shadow-pink-500/30">🤖</div>
                <div className="flex-1 min-w-0">
                  <p className="text-base md:text-lg font-semibold text-white mb-0.5">AI Speaking Partner</p>
                  <p className="text-xs md:text-sm text-gray-400">Practice 24/7 • Instant feedback</p>
                </div>
              </section>
            )}

            {/* Desktop CTA Button */}
            <div className="hidden lg:block mb-10">
              <button
                onClick={handleStartCall}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <span className="text-2xl">{callMode === "ai" ? "🤖" : "📞"}</span>
                <span>{callMode === "ai" ? "Talk with AI" : "Start Speaking Now"}</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="text-xs text-gray-500 flex items-center gap-1"><span className="text-emerald-500">✓</span> No signup</span>
                <span className="text-xs text-gray-500 flex items-center gap-1"><span className="text-emerald-500">✓</span> 100% free</span>
                <span className="text-xs text-gray-500 flex items-center gap-1"><span className="text-emerald-500">✓</span> Instant match</span>
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Info */}
          <div>
            {/* User Profile + Language - Combined Card for Mobile */}
            <section className="mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl md:rounded-2xl hover:border-white/20 transition-all shadow-xl">
              <div className="flex items-center gap-3 md:gap-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0 shadow-lg shadow-purple-500/30 ring-2 ring-white/10">
                  {userName.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-lg md:text-xl">{userName || "Loading..."}</p>
                  <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Anonymous User
                  </p>
                </div>
                <button
                  onClick={handleNewName}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-90 flex items-center justify-center text-lg"
                  title="Generate new name"
                >
                  🔄
                </button>
              </div>
              
              {/* Language Selector - Integrated */}
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="w-full flex items-center justify-between mt-4 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-3xl md:text-3xl">{selectedLang?.flag || "🇺🇸"}</span>
                  <div className="text-left">
                    <p className="text-sm md:text-lg font-semibold text-white">{selectedLang?.name || "English"}</p>
                    <p className="text-xs md:text-sm text-gray-500">{selectedLang?.nativeName || "English"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <span className="text-xs font-medium">Change</span>
                  <svg className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${showLanguages ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showLanguages && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowLanguages(false)} />
                  <div className="fixed inset-x-0 bottom-0 z-50 bg-[#12121a] border-t border-white/10 rounded-t-3xl shadow-2xl overflow-hidden max-h-[70vh]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                    <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#12121a] z-10">
                      <span className="font-semibold text-white text-lg">Select Language</span>
                      <button onClick={() => setShowLanguages(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">✕</button>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/5 ${
                            language === lang.code ? "bg-purple-500/15" : ""
                          }`}
                        >
                          <span className="text-3xl">{lang.flag}</span>
                          <div className="text-left flex-1">
                            <p className="text-base font-medium text-white">{lang.name}</p>
                            <p className="text-sm text-gray-500">{lang.nativeName}</p>
                          </div>
                          {language === lang.code && <span className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-xs text-white shadow-lg shadow-purple-500/50">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Stats Row - Premium Cards */}
            <section className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-5 md:mb-8">
              {[
                { icon: "🌍", value: "150+", label: "Countries", color: "from-blue-500/20 to-cyan-500/10" },
                { icon: "👥", value: "10K+", label: "Users", color: "from-purple-500/20 to-pink-500/10" },
                { icon: "💬", value: "1M+", label: "Calls", color: "from-emerald-500/20 to-teal-500/10" },
                { icon: "⭐", value: "4.9", label: "Rating", color: "from-amber-500/20 to-orange-500/10" },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} border border-white/10 rounded-2xl md:rounded-2xl p-3 md:p-4 text-center hover:border-white/20 active:scale-95 transition-all group shadow-lg`}>
                  <div className="text-xl md:text-2xl mb-1 md:mb-1 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <p className="text-base md:text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </section>

            {/* How it Works - Premium */}
            <section className="mb-5 md:mb-8 p-4 bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 rounded-2xl lg:p-0 lg:bg-transparent lg:border-0">
              <h2 className="text-xs md:text-base font-semibold text-gray-400 mb-4 md:mb-5 text-center uppercase tracking-wider">How It Works</h2>
              <div className="flex items-center justify-between gap-3 md:gap-4">
                {[
                  { step: "1", icon: "👆", title: "Tap", color: "purple" },
                  { step: "2", icon: "🎯", title: "Match", color: "cyan" },
                  { step: "3", icon: "🗣️", title: "Talk", color: "emerald" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-2 relative">
                    {i < 2 && <div className="absolute top-6 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/20 to-transparent hidden md:block" />}
                    <div className="relative group">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center text-2xl md:text-3xl group-hover:bg-white/15 transition-all shadow-lg active:scale-90">
                        {item.icon}
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-[10px] md:text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-[#0a0a0f]">{item.step}</span>
                    </div>
                    <span className="text-xs md:text-sm text-gray-300 font-medium">{item.title}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Features Grid - Better Mobile */}
            <section className="mb-6 lg:block hidden">
              <div className="flex gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide lg:grid lg:grid-cols-2 lg:gap-4">
                {[
                  { icon: "⚡", title: "Instant", desc: "Match in seconds" },
                  { icon: "🔒", title: "Private", desc: "Stay anonymous" },
                  { icon: "🆓", title: "Free", desc: "No hidden costs" },
                  { icon: "🌍", title: "Global", desc: "150+ countries" },
                ].map((f, i) => (
                  <div key={i} className="flex-shrink-0 w-32 lg:w-auto bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 hover:border-white/20 transition-all group">
                    <div className="text-xl md:text-2xl mb-1 md:mb-2 group-hover:scale-110 transition-transform">{f.icon}</div>
                    <p className="text-sm md:text-base font-medium text-white">{f.title}</p>
                    <p className="text-xs md:text-sm text-gray-500">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

      </main>

      {/* Fixed Bottom CTA - Mobile Only - Premium */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/98 to-transparent z-40 lg:hidden">
        <button
          onClick={handleStartCall}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/40 active:scale-[0.97] transition-transform ring-1 ring-white/20"
        >
          <span className="text-2xl">{callMode === "ai" ? "🤖" : "📞"}</span>
          <span>{callMode === "ai" ? "Talk with AI" : "Start Speaking"}</span>
          <svg className="w-5 h-5 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <p className="text-center text-[11px] text-gray-500 mt-2">No signup required • 100% Free</p>
      </div>

      {/* Footer - Hidden on mobile */}
      <footer className="relative z-10 border-t border-white/5 py-4 md:py-6 bg-black/40 mb-32 lg:mb-0 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2 md:mb-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs">🎙️</div>
            <span className="font-semibold text-sm">SpeakFlow</span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm">© 2024 SpeakFlow. Practice speaking with confidence.</p>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
