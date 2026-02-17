"use client";

import { useEffect, useRef, useState } from "react";

type XpDeltaProps = {
  earned: number;
};

/**
 * Shows a floating "+X XP" badge that pops in and counts down to 0
 * whenever the earned XP increases, then fades out.
 */
export function XpDelta({ earned }: XpDeltaProps) {
  const prevEarned = useRef(earned);
  const [delta, setDelta] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafId = useRef<number>(0);
  const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const diff = earned - prevEarned.current;
    prevEarned.current = earned;

    if (diff <= 0) return;

    // Cancel any in-progress animation
    cancelAnimationFrame(rafId.current);
    clearTimeout(timeoutId.current);

    setDelta(diff);
    setVisible(true);

    // Count down the delta to 0 over 800ms (synced with bar fill)
    const start = performance.now();
    const durationMs = 800;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const remaining = Math.round(diff * (1 - eased));

      setDelta(remaining);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setDelta(0);
        // Fade out after countdown finishes
        timeoutId.current = setTimeout(() => setVisible(false), 400);
      }
    }

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      clearTimeout(timeoutId.current);
    };
  }, [earned]);

  if (!visible) return null;

  return (
    <span
      className={`inline-block ml-2 text-sm font-bold text-xp transition-opacity duration-300 ${
        delta === 0 ? "opacity-0" : "opacity-100 animate-bounce-in"
      }`}
    >
      +{delta} XP
    </span>
  );
}
