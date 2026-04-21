"use client";

import { useRouter } from "next/navigation";
import { useCall } from "@/context/CallContext";
import { useState, useEffect } from "react";
import { getOrCreateUserName, regenerateUserName } from "@/lib/nameGenerator";
import { getLanguageByCode, LANGUAGES } from "@/lib/languages";
import { Mic, Phone, Clock, Target, Bot, RefreshCw, ChevronDown, ArrowRight, Globe, Users, MessageCircle, Star, Zap, Shield, Check } from "lucide-react";

type CallMode = "normal" | "short" | "topic" | "ai" | "practice";

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
    { id: "travel", icon: "plane", name: "Travel" },
    { id: "movies", icon: "film", name: "Movies" },
    { id: "food", icon: "utensils", name: "Food" },
    { id: "tech", icon: "laptop", name: "Tech" },
    { id: "sports", icon: "trophy", name: "Sports" },
    { id: "music", icon: "music", name: "Music" },
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
    if (callMode === "practice") {
      router.push("/practice");
    } else if (callMode === "ai") {
      router.push("/ai-chat");
    } else {
      router.push("/match");
    }
  };

  const handleNewName = () => setUserName(regenerateUserName());

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem("practiceLanguage", code);
    setShowLanguages(false);
  };

  const selectedLang = getLanguageByCode(language);

  const CALL_MODES = [
    { id: "normal" as CallMode, icon: Phone, title: "Normal", description: "Free conversation" },
    { id: "short" as CallMode, icon: Clock, title: "5 Min", description: "Quick practice" },
    { id: "topic" as CallMode, icon: Target, title: "Topic", description: "Focused chat" },
    { id: "ai" as CallMode, icon: Bot, title: "AI Chat", description: "AI partner" },
    { id: "practice" as CallMode, icon: Mic, title: "Practice", description: "Voice feedback", isNew: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg md:text-xl text-foreground">SpeakFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-accent">{onlineCount} online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-32 lg:pb-12">
        <div className="lg:grid lg:grid-cols-5 lg:gap-12 lg:items-start">
          
          {/* Left Column - Hero & CTA */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            {/* Hero */}
            <section className="text-center lg:text-left mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Live Practice Available</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-balance">
                Practice Speaking{" "}
                <span className="gradient-text-subtle">With Real People</span>
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg max-w-lg mx-auto lg:mx-0">
                Connect instantly with language partners worldwide. No signup, completely free, and totally anonymous.
              </p>
            </section>

            {/* Call Modes */}
            <section className="mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Select Mode</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {CALL_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = callMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setCallMode(mode.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "bg-card border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      {mode.isNew && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-accent text-accent-foreground rounded-full">
                          NEW
                        </span>
                      )}
                      <Icon className={`w-5 h-5 ${isActive ? "" : "text-muted-foreground"}`} />
                      <div className="text-center">
                        <span className="text-sm font-semibold block">{mode.title}</span>
                        <span className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {mode.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Topic Selection */}
            {callMode === "topic" && (
              <section className="mb-6 p-4 bg-card border border-border rounded-xl fade-in-up">
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Choose a Topic
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTopic === topic.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <span>{topic.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* AI Info */}
            {callMode === "ai" && (
              <section className="mb-6 p-4 bg-card border border-border rounded-xl flex items-center gap-4 fade-in-up">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">AI Speaking Partner</p>
                  <p className="text-sm text-muted-foreground">Practice anytime with instant AI feedback</p>
                </div>
              </section>
            )}

            {/* Practice Info */}
            {callMode === "practice" && (
              <section className="mb-6 p-4 bg-card border border-accent/30 rounded-xl flex items-center gap-4 fade-in-up">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Voice Recording & Feedback</p>
                  <p className="text-sm text-muted-foreground">Record yourself and get AI-powered feedback on your speech</p>
                </div>
              </section>
            )}

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <button
                onClick={handleStartCall}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                {callMode === "practice" ? (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Practice Session
                  </>
                ) : callMode === "ai" ? (
                  <>
                    <Bot className="w-5 h-5" />
                    Talk with AI
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Start Speaking Now
                  </>
                )}
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-accent" /> No signup
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-accent" /> 100% free
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-accent" /> Instant match
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Info */}
          <div className="lg:col-span-2">
            {/* User Profile Card */}
            <section className="mb-4 p-4 md:p-5 bg-card border border-border rounded-xl card-elevated">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary flex items-center justify-center text-lg md:text-xl font-bold text-primary-foreground">
                  {userName.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{userName || "Loading..."}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Anonymous User
                  </p>
                </div>
                <button
                  onClick={handleNewName}
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
                  title="Generate new name"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              {/* Language Selector */}
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="w-full flex items-center justify-between mt-4 p-3 bg-muted border border-border rounded-lg hover:bg-secondary transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedLang?.flag || "🇺🇸"}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{selectedLang?.name || "English"}</p>
                    <p className="text-xs text-muted-foreground">{selectedLang?.nativeName || "English"}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showLanguages ? "rotate-180" : ""}`} />
              </button>

              {/* Language Modal */}
              {showLanguages && (
                <>
                  <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowLanguages(false)} />
                  <div className="fixed inset-x-4 bottom-4 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md">
                    <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
                      <span className="font-semibold text-foreground">Select Language</span>
                      <button 
                        onClick={() => setShowLanguages(false)} 
                        className="w-8 h-8 rounded-full bg-muted hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 ${
                            language === lang.code ? "bg-primary/5" : ""
                          }`}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium text-foreground">{lang.name}</p>
                            <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                          </div>
                          {language === lang.code && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Stats */}
            <section className="grid grid-cols-4 gap-2 mb-4">
              {[
                { icon: Globe, value: "150+", label: "Countries" },
                { icon: Users, value: "10K+", label: "Users" },
                { icon: MessageCircle, value: "1M+", label: "Calls" },
                { icon: Star, value: "4.9", label: "Rating" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-all">
                    <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="text-sm md:text-base font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </section>

            {/* How it Works */}
            <section className="p-4 bg-card border border-border rounded-xl">
              <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider text-center">How It Works</h2>
              <div className="flex items-center justify-between gap-2">
                {[
                  { step: "1", icon: "👆", title: "Tap" },
                  { step: "2", icon: "🎯", title: "Match" },
                  { step: "3", icon: "🗣️", title: "Talk" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 relative">
                    {i < 2 && <div className="absolute top-6 left-[60%] w-[80%] h-px bg-border hidden sm:block" />}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-xl">
                        {item.icon}
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                        {item.step}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{item.title}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Features - Desktop Only */}
            <section className="hidden lg:grid grid-cols-2 gap-3 mt-4">
              {[
                { icon: Zap, title: "Instant", desc: "Match in seconds" },
                { icon: Shield, title: "Private", desc: "Stay anonymous" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
                    <Icon className="w-5 h-5 mb-2 text-primary" />
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-background via-background to-transparent z-40 lg:hidden">
        <button
          onClick={handleStartCall}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {callMode === "practice" ? (
            <>
              <Mic className="w-5 h-5" />
              Start Practice
            </>
          ) : callMode === "ai" ? (
            <>
              <Bot className="w-5 h-5" />
              Talk with AI
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Start Speaking
            </>
          )}
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-2">No signup required - 100% Free</p>
      </div>

      {/* Footer - Desktop Only */}
      <footer className="hidden lg:block border-t border-border py-6 bg-card">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">SpeakFlow</span>
          </div>
          <p className="text-muted-foreground text-sm">Practice speaking with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
