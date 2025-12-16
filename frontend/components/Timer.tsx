type TimerProps = {
  value: string;
};

export default function Timer({ value }: TimerProps) {
  return (
    <div className="text-3xl font-mono font-semibold mt-4">
      {value}
    </div>
  );
}
