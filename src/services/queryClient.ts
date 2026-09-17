import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Central query key factory so invalidation is consistent across features. */
export const queryKeys = {
  ingredients: {
    all: ['ingredients'] as const,
    search: (query: string) => ['ingredients', 'search', query] as const,
    suggested: ['ingredients', 'suggested'] as const,
  },
  history: {
    all: ['history'] as const,
    list: (profileId: string, filterKey: string) => ['history', profileId, filterKey] as const,
    detail: (id: string) => ['history', 'detail', id] as const,
  },
  products: {
    search: (query: string) => ['products', 'search', query] as const,
    barcode: (code: string) => ['products', 'barcode', code] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  insights: {
    all: ['insights'] as const,
    home: (profileId: string, date: string) => ['insights', 'home', profileId, date] as const,
    days: (profileId: string, from: string, to: string) =>
      ['insights', 'days', profileId, from, to] as const,
    overview: (profileId: string) => ['insights', 'overview', profileId] as const,
    series: (profileId: string, range: string) => ['insights', 'series', profileId, range] as const,
    changes: (profileId: string) => ['insights', 'changes', profileId] as const,
    daily: (profileId: string, week: number) => ['insights', 'daily', profileId, week] as const,
    weekly: (profileId: string, week: number) => ['insights', 'weekly', profileId, week] as const,
    topFlagged: (profileId: string) => ['insights', 'topFlagged', profileId] as const,
  },
  reactions: {
    all: ['reactions'] as const,
    list: (profileId: string) => ['reactions', profileId] as const,
    detail: (id: string) => ['reactions', 'detail', id] as const,
  },
  badges: {
    all: ['badges'] as const,
    list: (profileId: string) => ['badges', profileId] as const,
  },
  actionPlan: {
    all: ['actionPlan'] as const,
    list: (profileId: string) => ['actionPlan', profileId] as const,
  },
} as const;
