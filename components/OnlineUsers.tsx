"use client";

interface OnlineUsersProps {
  count: number;
}

export default function OnlineUsers({ count }: OnlineUsersProps) {
  return (
    <div className="glass px-4 py-2 flex items-center gap-3">
      <div className="flex -space-x-2">
        {[...Array(Math.min(count, 5))].map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-[#0f0f23] flex items-center justify-center text-xs font-bold"
            style={{
              background: `linear-gradient(135deg, hsl(${260 + i * 20}, 70%, 60%), hsl(${180 + i * 20}, 70%, 50%))`,
              zIndex: 5 - i,
            }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-medium">
          <span className="text-green-400">{count}</span> online now
        </p>
        <p className="text-xs text-gray-400">Ready to practice</p>
      </div>
    </div>
  );
}
