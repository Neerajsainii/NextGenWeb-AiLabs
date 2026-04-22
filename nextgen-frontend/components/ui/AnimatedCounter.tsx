"use client";

import { useEffect, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  durationMs?: number;
};

export function AnimatedCounter({
  value,
  suffix = "",
  durationMs = 1200
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const frameCount = Math.max(1, Math.floor(durationMs / 16));
    const step = value / frameCount;
    const timer = setInterval(() => {
      frame += 1;
      const next = Math.min(value, Math.round(step * frame));
      setCurrent(next);
      if (frame >= frameCount) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, durationMs]);

  return (
    <span>
      {current}
      {suffix}
    </span>
  );
}
