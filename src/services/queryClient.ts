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
  },
} as const;
