"use client";

import { useState } from "react";
import { LANGUAGES, Language } from "@/lib/languages";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelect: (code: string) => void;
}

export default function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition rounded-xl w-full md:w-auto"
      >
        <span className="text-2xl">{selected.flag}</span>
        <div className="text-left">
          <p className="font-medium">{selected.name}</p>
          <p className="text-xs text-gray-400">Practice language</p>
        </div>
        <span className="ml-2 text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 glass-card p-2 z-50 w-64 max-h-80 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition ${
                  lang.code === selectedLanguage
                    ? "bg-purple-500/30"
                    : "hover:bg-white/10"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-xs text-gray-400">{lang.nativeName}</p>
                </div>
                {lang.code === selectedLanguage && (
                  <span className="ml-auto text-purple-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
