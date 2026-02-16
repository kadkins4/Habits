import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHabits() {
  const { data, error, isLoading, mutate } = useSWR("/api/habits", fetcher);
  return {
    habits: data?.habits ?? [],
    isLoading,
    error,
    mutate,
  };
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

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR("/api/stats", fetcher);
  return {
    stats: data ?? null,
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
