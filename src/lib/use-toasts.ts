import { useEffect, useRef, useState, useCallback } from "react";

const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 300;

export type Toast<T> = T & { exiting: boolean };

type ToastItem = { id: string };

export function useToasts<T extends ToastItem>() {
  const [toasts, setToasts] = useState<Toast<T>[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const add = useCallback((items: T[]) => {
    const newToasts = items.map((item) => ({ ...item, exiting: false }) as Toast<T>);
    setToasts((prev) => [...prev, ...newToasts]);

    newToasts.forEach((t) => {
      const timer = setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS);
      timersRef.current.set(t.id, timer);
    });
  }, [dismiss]);

  return { toasts, add, dismiss };
}
