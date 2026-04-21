export default function ControlPanel() {
  return (
    <div className="flex gap-6 mt-6 text-2xl">
      <button className="w-14 h-14 bg-gray-200 rounded-full">
        🔇
      </button>

      <button className="w-16 h-16 bg-red-500 text-white rounded-full shadow-lg">
        📞
      </button>

      <button className="w-14 h-14 bg-gray-200 rounded-full">
        🎥
      </button>
    </div>
  );
}
