"use client";

interface UserProfileCardProps {
  name: string;
  language: string;
  languageFlag: string;
  onChangeName?: () => void;
}

export default function UserProfileCard({
  name,
  language,
  languageFlag,
  onChangeName,
}: UserProfileCardProps) {
  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg truncate">{name}</h3>
            {onChangeName && (
              <button
                onClick={onChangeName}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                🔄 New name
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{languageFlag}</span>
            <span>Learning {language}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
