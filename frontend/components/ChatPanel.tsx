"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "partner";
  timestamp: Date;
}

interface ChatPanelProps {
  partnerName: string;
  onSendMessage?: (message: string) => void;
  messages?: Message[];
}

export default function ChatPanel({ partnerName, onSendMessage, messages = [] }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
      >
        💬
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="glass-card w-80 h-96 mb-16 mr-2 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                {partnerName.charAt(0)}
              </div>
              <span className="font-semibold">{partnerName}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-8">
                Send a message to break the ice! 🧊
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender === "me"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 rounded-br-sm"
                        : "bg-white/10 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center hover:scale-105 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
