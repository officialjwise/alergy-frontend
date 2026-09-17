import { http } from './client';
import type { Services } from '../types';
import { evaluateProduct } from '../verdictEngine';
import type {
  ActionPlanPhoto,
  AppNotification,
  AuthSession,
  Badge,
  DailyScans,
  DaySummary,
  Group,
  GroupMember,
  InsightsOverview,
  Post,
  PostComment,
  Reaction,
  ScanChangeRow,
  SeriesPoint,
  TopFlagged,
  WeeklyOverview,
  HomeSummary,
  Ingredient,
  Product,
  ScanResult,
  UserProfile,
} from '@/types';
import { createId } from '@/utils/id';

/**
 * Real implementations. Endpoint paths are placeholders to be aligned with the
 * backend contract; the shapes match the interfaces in `../types.ts` so the
 * UI does not change when the switch is flipped.
 */
export const httpServices: Services = {
  ingredients: {
    search: (query, limit = 20) =>
      http<Ingredient[]>(`/ingredients?q=${encodeURIComponent(query)}&limit=${limit}`),
    getById: (id) => http<Ingredient | null>(`/ingredients/${id}`),
    getByIds: (ids) => http<Ingredient[]>(`/ingredients?ids=${ids.join(',')}`),
    suggested: () => http<Ingredient[]>('/ingredients/suggested'),
  },
  profiles: {
    list: () => http<UserProfile[]>('/profiles'),
    get: (id) => http<UserProfile | null>(`/profiles/${id}`),
    create: (profile) =>
      http<UserProfile>('/profiles', { method: 'POST', body: JSON.stringify(profile) }),
    update: (id, patch) =>
      http<UserProfile>(`/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id) => http<void>(`/profiles/${id}`, { method: 'DELETE' }),
  },
  scan: {
    analyze: async ({ profile, source, product, labelText, imageUri }) => {
      const data = await http<{ product: Product }>('/scans/analyze', {
        method: 'POST',
        body: JSON.stringify({ profileId: profile.id, source, product, labelText, imageUri }),
      });
      return {
        id: createId('scan'),
        profileId: profile.id,
        product: data.product,
        verdict: evaluateProduct(data.product, profile),
        source,
        scannedAt: new Date().toISOString(),
        saved: false,
      };
    },
    lookupBarcode: (barcode) => http<Product | null>(`/products/barcode/${barcode}`),
    getProduct: (id) => http<Product | null>(`/products/${id}`),
    searchProducts: (query) => http<Product[]>(`/products?q=${encodeURIComponent(query)}`),
    verdictFor: async (product, profile) => evaluateProduct(product, profile),
    report: (input) =>
      http<void>(`/scans/${input.scanId}/reports`, { method: 'POST', body: JSON.stringify(input) }),
  },
  history: {
    list: (profileId, filter) =>
      http<ScanResult[]>(
        `/profiles/${profileId}/scans?${new URLSearchParams(filter as Record<string, string>).toString()}`,
      ),
    get: (id) => http<ScanResult | null>(`/scans/${id}`),
    add: (result) => http<ScanResult>('/scans', { method: 'POST', body: JSON.stringify(result) }),
    update: (id, patch) =>
      http<ScanResult>(`/scans/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    setSaved: (id, saved) =>
      http<ScanResult>(`/scans/${id}`, { method: 'PATCH', body: JSON.stringify({ saved }) }),
    remove: (id) => http<void>(`/scans/${id}`, { method: 'DELETE' }),
    clearForProfile: (profileId) =>
      http<void>(`/profiles/${profileId}/scans`, { method: 'DELETE' }),
  },
  auth: {
    signInWithApple: () => http<AuthSession>('/auth/apple', { method: 'POST' }),
    signInWithGoogle: () => http<AuthSession>('/auth/google', { method: 'POST' }),
    requestEmailCode: (email) =>
      http<{ expiresInSeconds: number }>('/auth/email/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyEmailCode: (email, code) =>
      http<AuthSession>('/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      }),
    signOut: () => http<void>('/auth/signout', { method: 'POST' }),
    deleteAccount: () => http<void>('/auth/account', { method: 'DELETE' }),
    restoreSession: () => http<AuthSession | null>('/auth/session'),
  },
  insights: {
    homeSummary: (profileId, date) =>
      http<HomeSummary>(`/profiles/${profileId}/insights/home?date=${date}`),
    daySummaries: (profileId, fromDate, toDate) =>
      http<DaySummary[]>(`/profiles/${profileId}/insights/days?from=${fromDate}&to=${toDate}`),
    overview: (profileId) => http<InsightsOverview>(`/profiles/${profileId}/insights/overview`),
    flaggedSeries: (profileId, range) =>
      http<SeriesPoint[]>(`/profiles/${profileId}/insights/flagged?range=${range}`),
    scanChanges: (profileId) => http<ScanChangeRow[]>(`/profiles/${profileId}/insights/changes`),
    dailyScans: (profileId, week) =>
      http<DailyScans>(`/profiles/${profileId}/insights/daily?week=${week}`),
    weeklyOverview: (profileId, week) =>
      http<WeeklyOverview>(`/profiles/${profileId}/insights/weekly?week=${week}`),
    topFlagged: (profileId) => http<TopFlagged>(`/profiles/${profileId}/insights/top-flagged`),
  },
  reactions: {
    list: (profileId) => http<Reaction[]>(`/profiles/${profileId}/reactions`),
    get: (id) => http<Reaction | null>(`/reactions/${id}`),
    add: (input) => http<Reaction>('/reactions', { method: 'POST', body: JSON.stringify(input) }),
    update: (id, patch) =>
      http<Reaction>(`/reactions/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id) => http<void>(`/reactions/${id}`, { method: 'DELETE' }),
  },
  badges: {
    list: (profileId) => http<Badge[]>(`/profiles/${profileId}/badges`),
  },
  actionPlan: {
    list: (profileId) => http<ActionPlanPhoto[]>(`/profiles/${profileId}/action-plan`),
    add: (profileId, uri) =>
      http<ActionPlanPhoto>(`/profiles/${profileId}/action-plan`, {
        method: 'POST',
        body: JSON.stringify({ uri }),
      }),
    remove: (id) => http<void>(`/action-plan/${id}`, { method: 'DELETE' }),
  },
  groups: {
    list: () => http<Group[]>('/groups'),
    get: (id) => http<Group | null>(`/groups/${id}`),
    join: (id) => http<Group>(`/groups/${id}/join`, { method: 'POST' }),
    leave: (id) => http<void>(`/groups/${id}/leave`, { method: 'POST' }),
    create: (input) => http<Group>('/groups', { method: 'POST', body: JSON.stringify(input) }),
    members: (groupId) => http<GroupMember[]>(`/groups/${groupId}/members`),
    member: (id) => http<GroupMember | null>(`/members/${id}`),
    posts: (groupId, filter = 'all') => http<Post[]>(`/groups/${groupId}/posts?filter=${filter}`),
    post: (id) => http<Post | null>(`/posts/${id}`),
    createPost: (input) => http<Post>('/posts', { method: 'POST', body: JSON.stringify(input) }),
    react: (postId, emoji) =>
      http<Post>(`/posts/${postId}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) }),
    comments: (postId) => http<PostComment[]>(`/posts/${postId}/comments`),
    addComment: (postId, text) =>
      http<PostComment>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    reportPost: (postId, reason, notes) =>
      http<void>(`/posts/${postId}/reports`, {
        method: 'POST',
        body: JSON.stringify({ reason, notes }),
      }),
    blockMember: (memberId) => http<void>(`/members/${memberId}/block`, { method: 'POST' }),
    invite: (groupId) => http<{ link: string; code: string }>(`/groups/${groupId}/invite`),
  },
  notifications: {
    list: () => http<AppNotification[]>('/notifications'),
    markRead: (id) => http<void>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => http<void>('/notifications/read-all', { method: 'POST' }),
  },
};
