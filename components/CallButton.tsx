interface CallButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export default function CallButton({ onClick, disabled }: CallButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition transform hover:scale-105 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      📞 Call a Practice Partner
    </button>
  );
}
