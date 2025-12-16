"use client";

interface AudioWaveProps {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AudioWave({ isActive = true, size = "md" }: AudioWaveProps) {
  const heights = {
    sm: { min: 4, max: 12 },
    md: { min: 8, max: 24 },
    lg: { min: 12, max: 36 },
  };

  const barWidth = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const gap = size === "sm" ? 2 : 3;

  if (!isActive) {
    return (
      <div className="flex items-center gap-1" style={{ gap }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-500 rounded-full"
            style={{
              width: barWidth,
              height: heights[size].min,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="audio-wave" style={{ height: heights[size].max, gap }}>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          style={{
            width: barWidth,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
