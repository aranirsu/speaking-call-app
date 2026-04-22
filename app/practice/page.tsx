"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FeedbackCard } from "@/components/FeedbackCard";
import { ArrowLeft, Mic, RefreshCw, Sparkles, MessageCircle, BookOpen } from "lucide-react";

interface SpeechFeedback {
  overallScore: number;
  fluency: {
    score: number;
    feedback: string;
  };
  grammar: {
    score: number;
    corrections: Array<{
      original: string;
      suggestion: string;
      explanation: string;
    }>;
  };
  vocabulary: {
    level: string;
    suggestions: string[];
  };
  pronunciation: {
    tips: string[];
  };
  encouragement: string;
}

const SPEAKING_PROMPTS = [
  {
    id: "intro",
    category: "Introduction",
    icon: MessageCircle,
    prompt: "Introduce yourself: your name, where you're from, and what you do.",
  },
  {
    id: "hobby",
    category: "Hobbies",
    icon: Sparkles,
    prompt: "Describe your favorite hobby and why you enjoy it.",
  },
  {
    id: "travel",
    category: "Travel",
    icon: BookOpen,
    prompt: "Talk about a place you've visited or would like to visit.",
  },
  {
    id: "work",
    category: "Work",
    icon: MessageCircle,
    prompt: "Describe your job or studies and what you find interesting about them.",
  },
  {
    id: "food",
    category: "Food",
    icon: Sparkles,
    prompt: "Describe your favorite meal and how it's prepared.",
  },
  {
    id: "future",
    category: "Goals",
    icon: BookOpen,
    prompt: "Talk about your goals for the next year and how you plan to achieve them.",
  },
];

export default function PracticePage() {
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState(SPEAKING_PROMPTS[0]);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);

  const handleTranscription = useCallback(async (text: string) => {
    setTranscript(text);
    setIsAnalyzing(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/analyze-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          prompt: selectedPrompt.prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze speech");
      }

      const data = await response.json();
      setFeedback(data.feedback);
    } catch {
      setError("Failed to analyze your speech. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedPrompt.prompt]);

  const handleNewPrompt = () => {
    const currentIndex = SPEAKING_PROMPTS.findIndex(p => p.id === selectedPrompt.id);
    const nextIndex = (currentIndex + 1) % SPEAKING_PROMPTS.length;
    setSelectedPrompt(SPEAKING_PROMPTS[nextIndex]);
    setFeedback(null);
    setTranscript("");
    setError(null);
  };

  const handleReset = () => {
    setFeedback(null);
    setTranscript("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <span className="font-semibold">Voice Practice</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Speaking Prompt Card */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                {selectedPrompt.category}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className="p-2 rounded-lg bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                title="Change prompt"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={handleNewPrompt}
                className="p-2 rounded-lg bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                title="Next prompt"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-foreground font-medium leading-relaxed">
            {selectedPrompt.prompt}
          </p>
        </div>

        {/* Prompt Selection Modal */}
        {showPrompts && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" 
              onClick={() => setShowPrompts(false)} 
            />
            <div className="fixed inset-x-4 bottom-4 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[70vh]">
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
                <span className="font-semibold text-foreground">Choose a Topic</span>
                <button 
                  onClick={() => setShowPrompts(false)} 
                  className="w-8 h-8 rounded-full bg-muted hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                {SPEAKING_PROMPTS.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={prompt.id}
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setShowPrompts(false);
                        handleReset();
                      }}
                      className={`w-full flex items-start gap-4 px-4 py-4 hover:bg-muted transition-colors border-b border-border/50 text-left ${
                        selectedPrompt.id === prompt.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary mb-1">{prompt.category}</p>
                        <p className="text-sm text-foreground">{prompt.prompt}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Voice Recorder */}
        {!feedback && (
          <VoiceRecorder 
            onTranscription={handleTranscription} 
            isAnalyzing={isAnalyzing} 
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={handleReset}
              className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && transcript && (
          <>
            <FeedbackCard feedback={feedback} transcript={transcript} />
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={handleNewPrompt}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                New Topic
              </button>
            </div>
          </>
        )}

        {/* Tips Section */}
        {!feedback && !isAnalyzing && (
          <div className="mt-8 p-4 bg-muted/50 border border-border rounded-xl">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Tips for Better Practice
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">1.</span>
                <span>Speak clearly and at a natural pace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">2.</span>
                <span>Try to speak for at least 30 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">3.</span>
                <span>Use complete sentences and varied vocabulary</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">4.</span>
                <span>Don&apos;t worry about mistakes - they help you learn!</span>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
