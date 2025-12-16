"use client";

interface StatsCardProps {
  icon: string;
  value: string;
  label: string;
  trend?: string;
}

export default function StatsCard({ icon, value, label, trend }: StatsCardProps) {
  return (
    <div className="glass-card p-4 md:p-6 flex items-center gap-4">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xl md:text-2xl font-bold">{value}</p>
        <p className="text-xs md:text-sm text-gray-400">{label}</p>
      </div>
      {trend && (
        <span className="text-green-400 text-sm">{trend}</span>
      )}
    </div>
  );
}
