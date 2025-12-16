"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RatingModalProps {
  partnerName: string;
  callDuration: string;
  onClose: () => void;
}

export default function RatingModal({ partnerName, callDuration, onClose }: RatingModalProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log("Submitting rating:", { rating, feedback, partnerName, callDuration });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      router.push("/");
    }, 2000);
  };

  const handleSkip = () => {
    console.log("Skipping rating");
    onClose();
    router.push("/");
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">Thanks for the feedback!</h2>
          <p className="text-gray-400">Redirecting to home...</p>
          <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-xl opacity-50" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-4xl">📞</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Call Ended</h2>
          <p className="text-gray-400">
            You talked with <span className="text-purple-400 font-semibold">{partnerName}</span> for{" "}
            <span className="text-cyan-400 font-semibold">{callDuration}</span>
          </p>
        </div>

        {/* Star rating */}
        <div className="mb-8">
          <p className="text-center mb-4 text-gray-300 text-sm font-medium">How was your conversation?</p>
          <div className="flex justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-3xl sm:text-4xl transition-all duration-200 hover:scale-125 active:scale-95"
              >
                {star <= (hoveredRating || rating) ? "⭐" : "☆"}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback tags */}
        <div className="mb-8">
          <p className="text-center mb-4 text-gray-300 text-sm font-medium">Quick feedback:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Great listener", "Helpful", "Friendly", "Interesting", "Fun to talk to"].map((tag) => (
              <button
                key={tag}
                onClick={() => setFeedback(feedback === tag ? "" : tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  feedback === tag
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold transition-all duration-200 active:scale-95"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg shadow-purple-500/30"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
