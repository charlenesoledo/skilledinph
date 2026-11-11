"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// Counts from 0 to `to` over `ms` with an ease-out curve. Shows the final value at once
// when the viewer prefers reduced motion.
export function useCountUp(to: number, ms = 800, delay = 0): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const tick = (now: number) => {
        start ??= now;
        const t = Math.min(1, (now - start) / ms);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [to, ms, delay, reduce]);
  return value;
}
