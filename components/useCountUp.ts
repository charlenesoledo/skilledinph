"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// Ease-out curve shared by the count-ups (cubic).
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Counts from `from` to `to` over `ms`. Shows the final value at once when `ms` is 0
// or the viewer prefers reduced motion.
export function useCountUp(to: number, ms: number, delay = 0, from = 0): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(ms > 0 && !reduce ? from : to);
  useEffect(() => {
    if (reduce || ms <= 0) {
      setValue(to);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const tick = (now: number) => {
        start ??= now;
        const t = Math.min(1, (now - start) / ms);
        setValue(Math.round(from + (to - from) * easeOut(t)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [to, ms, delay, from, reduce]);
  return value;
}

// A number that appears at its real value at once, and counts old -> new only when it changes later.
export function useChangeCount(value: number, ms: number): number {
  const [span, setSpan] = useState({ from: value, to: value });
  if (span.to !== value) setSpan({ from: span.to, to: value }); // a new value arrived: count from the old one
  return useCountUp(span.to, span.from === span.to ? 0 : ms, 0, span.from);
}
