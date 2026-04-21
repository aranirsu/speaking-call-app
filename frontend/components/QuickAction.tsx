"use client";

interface QuickActionProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function QuickAction({
  icon,
  title,
  description,
  onClick,
  variant = "secondary",
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 md:p-6 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
        variant === "primary"
          ? "bg-gradient-to-r from-purple-500 to-cyan-500 glow"
          : "glass-card hover:bg-white/10"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
            variant === "primary" ? "bg-white/20" : "bg-purple-500/20"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className={`text-sm mt-1 ${variant === "primary" ? "text-white/80" : "text-gray-400"}`}>
            {description}
          </p>
        </div>
        <span className="text-xl mt-1">→</span>
      </div>
    </button>
  );
}
