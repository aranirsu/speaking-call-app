"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUserName } from "@/lib/nameGenerator";
import { getLanguageByCode } from "@/lib/languages";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

const AI_RESPONSES = [
  "That's a great point! Can you tell me more about it?",
  "Interesting! I'd love to hear your thoughts on this topic.",
  "That's wonderful! How did that experience make you feel?",
  "I understand. What would you do differently next time?",
  "That sounds exciting! When did this happen?",
  "I see! Can you elaborate on that a bit more?",
  "Great answer! Let me ask you another question...",
  "Very thoughtful response! What inspired you to think this way?",
  "Excellent! Your speaking is improving. Keep it up!",
  "That's a unique perspective. I appreciate you sharing that.",
];

const AI_PROMPTS = [
  "What's your favorite thing to do on weekends?",
  "Tell me about a memorable trip you've taken.",
  "What kind of music do you enjoy listening to?",
  "Describe your ideal vacation destination.",
  "What's something new you learned recently?",
  "Tell me about your hobbies and interests.",
  "What's your favorite food and why?",
  "Describe your dream job.",
  "What motivates you in life?",
  "Tell me about a book or movie you enjoyed.",
];

const QUICK_REPLIES = [
  { emoji: "👋", text: "Hello!" },
  { emoji: "😊", text: "How are you?" },
  { emoji: "🤔", text: "Tell me more" },
  { emoji: "✨", text: "That's interesting!" },
  { emoji: "🎯", text: "Good question!" },
  { emoji: "💭", text: "Let me think..." },
];

export default function AIChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState("You");
  const [language, setLanguage] = useState("English");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [particles, setParticles] = useState<Array<{top: number, left: number, duration: number, delay: number}>>([]);

  const tips = [
    "Practice speaking out loud while typing to improve both skills!",
    "Don't worry about making mistakes - that's how we learn!",
    "Try to use new vocabulary words in your responses.",
    "Challenge yourself to give longer, more detailed answers.",
  ];

  useEffect(() => {
    setUserName(getOrCreateUserName());
    const savedLang = localStorage.getItem("practiceLanguage") || "en";
    const langData = getLanguageByCode(savedLang);
    setLanguage(langData?.name || "English");

    const greeting: Message = {
      id: "greeting",
      role: "ai",
      content: `Hi ${getOrCreateUserName()}! 👋 I'm your AI speaking partner. I'm here to help you practice ${langData?.name || "English"}. Let's have a conversation! ${AI_PROMPTS[Math.floor(Math.random() * AI_PROMPTS.length)]}`,
      timestamp: Date.now(),
    };
    setMessages([greeting]);
    
    // Generate particles on client side
    setParticles(Array.from({ length: 15 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })));
  }, []);

  // Rotate tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, [tips.length]);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)] + " " + AI_PROMPTS[Math.floor(Math.random() * AI_PROMPTS.length)],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndChat = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
        
        {/* Floating particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)`, 
            backgroundSize: '50px 50px' 
          }} 
        />
      </div>

      {/* Premium Header */}
      <header className="relative z-30 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={handleEndChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm text-gray-300 hidden sm:inline">Exit</span>
            </button>

            {/* AI Partner Card */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur opacity-50" />
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white">AI Partner</p>
                <p className="text-xs text-pink-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  {language} Mode
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-50" />
              </div>
              <span className="text-base sm:text-lg font-mono font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {formatTime(callDuration)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div className={`flex items-end gap-3 max-w-[90%] sm:max-w-[80%]`}>
                {msg.role === "ai" && (
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur opacity-40" />
                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                  </div>
                )}
                <div className="relative group">
                  <div
                    className={`px-5 py-3.5 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-lg"
                        : "bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10 rounded-bl-lg"
                    }`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-white/60" : "text-gray-500"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur opacity-40" />
                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end gap-3">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur opacity-40" />
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-bl-lg">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Premium Input Area */}
      <div className="relative z-30 border-t border-white/5 bg-black/60 backdrop-blur-2xl p-4 sm:p-5">
        <div className="max-w-3xl mx-auto">
          {/* Quick replies */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_REPLIES.map((reply, i) => (
              <button
                key={i}
                onClick={() => setInputText(reply.text)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-all hover:scale-105"
              >
                <span>{reply.emoji}</span>
                <span>{reply.text}</span>
              </button>
            ))}
          </div>

          {/* Input box */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all text-base"
              />
              {inputText && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  Press Enter ↵
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-14 h-14 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-pink-500/30"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Animated Tips Banner */}
      <div className="relative z-30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-t border-white/5 py-3.5 px-4 overflow-hidden">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-xl flex-shrink-0 border border-white/10">
            💡
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-gray-300 animate-fade-in">
              <span className="text-pink-400 font-bold">Pro Tip:</span>{" "}
              {tips[currentTip]}
            </p>
          </div>
          <div className="flex gap-1">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentTip ? "bg-pink-500 w-3" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Session Stats Floating Card */}
      <div className="fixed bottom-40 right-4 z-40 hidden lg:block">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-48">
          <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Session Stats</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Messages</span>
              <span className="text-sm font-bold text-white">{messages.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Your replies</span>
              <span className="text-sm font-bold text-cyan-400">{messages.filter(m => m.role === "user").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Language</span>
              <span className="text-sm font-bold text-pink-400">{language}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.2; }
          50% { transform: translateY(-20px); opacity: 0.4; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
