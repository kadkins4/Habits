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

export function useToggleWeekends() {
  const { settings, mutate: mutateSettings } = useSettings();
  const { mutate: mutateStats } = useStats();

  const includeWeekends = settings.include_weekends === true;

  async function toggle() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "include_weekends",
        value: !includeWeekends,
      }),
    });
    mutateSettings();
    mutateStats();
  }

  return { includeWeekends, toggle };
}
