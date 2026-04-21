import { useEffect, useRef, useState } from "react";

export function useTimer(start = false) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (start) {
      ref.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [start]);

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return {
    formatted: `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`,
  };
}
