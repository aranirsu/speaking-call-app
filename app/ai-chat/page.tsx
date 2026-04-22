"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUserName } from "@/lib/nameGenerator";
import { getLanguageByCode } from "@/lib/languages";
import { ArrowLeft, Send, Bot, Lightbulb, MessageCircle, Clock, Globe } from "lucide-react";

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
  { text: "Hello!" },
  { text: "How are you?" },
  { text: "Tell me more" },
  { text: "That's interesting!" },
  { text: "Good question!" },
  { text: "Let me think..." },
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
      content: `Hi ${getOrCreateUserName()}! I'm your AI speaking partner. I'm here to help you practice ${langData?.name || "English"}. Let's have a conversation! ${AI_PROMPTS[Math.floor(Math.random() * AI_PROMPTS.length)]}`,
      timestamp: Date.now(),
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, [tips.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleEndChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-secondary border border-border transition-all text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Exit</span>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground">AI Partner</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {language} Mode
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
              <Clock className="w-4 h-4 text-destructive" />
              <span className="text-sm font-mono font-semibold text-foreground">
                {formatTime(callDuration)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} fade-in-up`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%]`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start fade-in-up">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-lg p-4">
        <div className="max-w-3xl mx-auto">
          {/* Quick replies */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {QUICK_REPLIES.map((reply, i) => (
              <button
                key={i}
                onClick={() => setInputText(reply.text)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-muted hover:bg-secondary border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                {reply.text}
              </button>
            ))}
          </div>

          {/* Input box */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center transition-all hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Tips Banner */}
      <div className="border-t border-border bg-muted/50 py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground flex-1">
            <span className="text-primary font-medium">Tip:</span>{" "}
            {tips[currentTip]}
          </p>
          <div className="flex gap-1">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentTip ? "bg-primary w-3" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Session Stats - Desktop */}
      <div className="fixed bottom-32 right-4 z-40 hidden lg:block">
        <div className="bg-card border border-border rounded-xl p-4 w-44 shadow-lg">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Session Stats</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3" /> Messages
              </span>
              <span className="text-sm font-semibold text-foreground">{messages.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Send className="w-3 h-3" /> Your replies
              </span>
              <span className="text-sm font-semibold text-primary">{messages.filter(m => m.role === "user").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Language
              </span>
              <span className="text-sm font-semibold text-accent">{language}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
