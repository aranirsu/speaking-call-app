"use client";

interface GlowingAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  isActive?: boolean;
  imageUrl?: string;
}

export default function GlowingAvatar({
  name,
  size = "lg",
  isActive = false,
  imageUrl,
}: GlowingAvatarProps) {
  const sizes = {
    sm: "w-12 h-12 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-32 h-32 text-4xl",
    xl: "w-40 h-40 text-5xl",
  };

  const ringSize = {
    sm: "w-14 h-14",
    md: "w-24 h-24",
    lg: "w-36 h-36",
    xl: "w-44 h-44",
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Animated rings when active */}
      {isActive && (
        <>
          <div
            className={`absolute ${ringSize[size]} rounded-full border-2 border-purple-500/30 animate-ping`}
            style={{ animationDuration: "2s" }}
          />
          <div
            className={`absolute ${ringSize[size]} rounded-full border-2 border-cyan-500/20 animate-ping`}
            style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
          />
        </>
      )}

      {/* Avatar */}
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold relative overflow-hidden ${
          isActive ? "glow" : ""
        }`}
        style={{
          background: imageUrl
            ? `url(${imageUrl}) center/cover`
            : "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        }}
      >
        {!imageUrl && (
          <span className="text-white drop-shadow-lg">{name.charAt(0).toUpperCase()}</span>
        )}

        {/* Shimmer effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 3s ease infinite",
          }}
        />
      </div>

      {/* Name */}
      <p className="mt-3 font-semibold text-lg">{name}</p>

      {/* Status indicator */}
      {isActive && (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm">Speaking</span>
        </div>
      )}
    </div>
  );
}
