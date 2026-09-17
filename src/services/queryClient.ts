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
    dashboard: (profileId: string, date: string) =>
      ['insights', 'dashboard', profileId, date] as const,
    nutritionDays: (profileId: string, from: string, to: string) =>
      ['insights', 'nutritionDays', profileId, from, to] as const,
    tracking: (profileId: string) => ['insights', 'tracking', profileId] as const,
    weightSeries: (profileId: string, range: string) =>
      ['insights', 'weightSeries', profileId, range] as const,
    weightChanges: (profileId: string) => ['insights', 'weightChanges', profileId] as const,
    dailyCalories: (profileId: string, week: number) =>
      ['insights', 'dailyCalories', profileId, week] as const,
    weeklyEnergy: (profileId: string, week: number) =>
      ['insights', 'weeklyEnergy', profileId, week] as const,
    expenditure: (profileId: string) => ['insights', 'expenditure', profileId] as const,
  },
  weight: {
    all: ['weight'] as const,
    list: (profileId: string) => ['weight', profileId] as const,
  },
  activity: {
    all: ['activity'] as const,
    health: ['activity', 'health'] as const,
    day: (profileId: string, date: string) => ['activity', 'day', profileId, date] as const,
    workouts: (profileId: string) => ['activity', 'workouts', profileId] as const,
    water: (profileId: string, date: string) => ['activity', 'water', profileId, date] as const,
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
  groups: {
    all: ['groups'] as const,
    list: ['groups', 'list'] as const,
    detail: (id: string) => ['groups', 'detail', id] as const,
    members: (id: string) => ['groups', 'members', id] as const,
    member: (id: string) => ['groups', 'member', id] as const,
    posts: (id: string, filter: string) => ['groups', 'posts', id, filter] as const,
    post: (id: string) => ['groups', 'post', id] as const,
    comments: (id: string) => ['groups', 'comments', id] as const,
    invite: (id: string) => ['groups', 'invite', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  actionPlan: {
    all: ['actionPlan'] as const,
    list: (profileId: string) => ['actionPlan', profileId] as const,
  },
} as const;
