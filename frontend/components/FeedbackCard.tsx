"use client";

import { CircleCheck, AlertCircle, Lightbulb, BookOpen, Mic2, TrendingUp } from "lucide-react";

interface GrammarCorrection {
  original: string;
  suggestion: string;
  explanation: string;
}

interface SpeechFeedback {
  overallScore: number;
  fluency: {
    score: number;
    feedback: string;
  };
  grammar: {
    score: number;
    corrections: GrammarCorrection[];
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

interface FeedbackCardProps {
  feedback: SpeechFeedback;
  transcript: string;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: "#14B8A6", bg: "bg-accent/10", text: "text-accent" };
    if (score >= 60) return { stroke: "#F59E0B", bg: "bg-yellow-500/10", text: "text-yellow-500" };
    return { stroke: "#EF4444", bg: "bg-destructive/10", text: "text-destructive" };
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center`}>
        <span className={`text-xl font-bold ${colors.text}`}>{score}</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-accent";
    if (score >= 60) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function FeedbackCard({ feedback, transcript }: FeedbackCardProps) {
  return (
    <div className="space-y-4 fade-in-up">
      {/* Overall Score Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-6">
          <ScoreRing score={feedback.overallScore} size={100} />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Overall Score</h3>
            <p className="text-sm text-muted-foreground mb-3">{feedback.encouragement}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                {feedback.vocabulary.level} Vocabulary
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mic2 className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Your Speech</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
          {transcript}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Score Breakdown</h4>
        </div>
        <div className="space-y-4">
          <ScoreBar score={feedback.fluency.score} label="Fluency" />
          <ScoreBar score={feedback.grammar.score} label="Grammar" />
        </div>
        {feedback.fluency.feedback && (
          <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
            {feedback.fluency.feedback}
          </p>
        )}
      </div>

      {/* Grammar Corrections */}
      {feedback.grammar.corrections.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-foreground">Grammar Suggestions</h4>
          </div>
          <div className="space-y-3">
            {feedback.grammar.corrections.map((correction, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-sm line-through text-destructive">{correction.original}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-sm font-medium text-accent">{correction.suggestion}</span>
                </div>
                <p className="text-xs text-muted-foreground">{correction.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Suggestions */}
      {feedback.vocabulary.suggestions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-foreground">Vocabulary Enhancements</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.vocabulary.suggestions.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pronunciation Tips */}
      {feedback.pronunciation.tips.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-foreground">Pronunciation Tips</h4>
          </div>
          <ul className="space-y-2">
            {feedback.pronunciation.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CircleCheck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
