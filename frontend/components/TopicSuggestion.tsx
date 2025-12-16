"use client";

const TOPICS = [
  { emoji: "🎬", text: "What's your favorite movie and why?" },
  { emoji: "✈️", text: "Describe your dream vacation destination" },
  { emoji: "🍕", text: "What's your favorite food to cook?" },
  { emoji: "📚", text: "What book changed your perspective?" },
  { emoji: "🎮", text: "What games do you enjoy playing?" },
  { emoji: "🎵", text: "What music gets you energized?" },
  { emoji: "💼", text: "What's your dream job?" },
  { emoji: "🌟", text: "What's a skill you want to learn?" },
  { emoji: "🏠", text: "Describe your perfect weekend" },
  { emoji: "🌍", text: "If you could live anywhere, where?" },
];

interface TopicSuggestionProps {
  onNewTopic?: () => void;
}

export default function TopicSuggestion({ onNewTopic }: TopicSuggestionProps) {
  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  return (
    <div className="glass-card p-6 max-w-sm w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{randomTopic.emoji}</span>
        <span className="text-purple-400 font-semibold text-sm uppercase tracking-wide">
          Topic Suggestion
        </span>
      </div>
      <p className="text-lg">{randomTopic.text}</p>
      {onNewTopic && (
        <button
          onClick={onNewTopic}
          className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
        >
          🔄 Get new topic
        </button>
      )}
    </div>
  );
}
