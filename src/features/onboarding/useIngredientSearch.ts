import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';

export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [delayMs, value]);
  return debounced;
}

/** Ingredient search backed by the IngredientService (mock today), debounced and cached. */
export function useIngredientSearch(query: string) {
  const debounced = useDebounced(query.trim(), 180);
  return useQuery({
    queryKey: queryKeys.ingredients.search(debounced),
    queryFn: () => getServices().ingredients.search(debounced),
    placeholderData: (previous) => previous,
    staleTime: 5 * 60_000,
  });
}
