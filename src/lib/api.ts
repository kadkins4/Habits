import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHabits(status?: string) {
  const url = status ? `/api/habits?status=${status}` : "/api/habits";
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return {
    habits: data?.habits ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useAllHabits() {
  return useHabits("all");
}

export function useCompletions(date: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/completions?date=${date}`,
    fetcher
  );
  return {
    completions: data?.completions ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useAntiHabitEntries(date: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/anti-habit-entries?date=${date}`,
    fetcher
  );
  return {
    entries: data?.entries ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR("/api/stats", fetcher);
  return {
    stats: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useDailyStats(date: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/stats?date=${date}`,
    fetcher
  );
  return {
    daily: data?.daily ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR("/api/settings", fetcher);
  return {
    settings: data?.settings ?? {},
    isLoading,
    error,
    mutate,
  };
}
