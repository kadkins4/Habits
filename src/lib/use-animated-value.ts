"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from its previous to its current target
 * using requestAnimationFrame for smooth, frame-synced transitions.
 */
export function useAnimatedValue(target: number, durationMs = 800): number {
  const [display, setDisplay] = useState(target);
  const prevTarget = useRef(target);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    prevTarget.current = target;

    if (from === to) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDisplay(Math.round(current * 100) / 100);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, durationMs]);

  return display;
}
