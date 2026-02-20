"use client";

import { useCallback, useSyncExternalStore } from "react";
import { formatDate } from "@/lib/types";

const CONFIRMED_KEY = "yesterday-confirmed";

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

export function getYesterdayDate(): string {
  return formatDate(getYesterday());
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getSnapshot(): string | null {
  return localStorage.getItem(CONFIRMED_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useYesterday() {
  const yesterdayDate = getYesterdayDate();
  const yesterdayDisplayDate = formatDisplayDate(getYesterday());

  const confirmedDate = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isYesterdayConfirmed = confirmedDate === yesterdayDate;

  const confirmYesterday = useCallback(() => {
    localStorage.setItem(CONFIRMED_KEY, yesterdayDate);
    window.dispatchEvent(new StorageEvent("storage", { key: CONFIRMED_KEY }));
  }, [yesterdayDate]);

  return {
    yesterdayDate,
    yesterdayDisplayDate,
    isYesterdayConfirmed,
    confirmYesterday,
  };
}
