"use client";

interface ControlButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: "default" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export default function ControlButton({
  icon,
  label,
  onClick,
  isActive = false,
  variant = "default",
  size = "md",
}: ControlButtonProps) {
  const sizes = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  const variants = {
    default: isActive
      ? "bg-purple-500 hover:bg-purple-600"
      : "bg-white/10 hover:bg-white/20",
    danger: "bg-red-500 hover:bg-red-600",
    success: "bg-green-500 hover:bg-green-600",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`${sizes[size]} ${variants[variant]} rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg`}
      >
        {icon}
      </button>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
