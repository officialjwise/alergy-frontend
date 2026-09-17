import { DEFAULT_GOALS, DEMO_BODY, EMPTY_BODY } from './nutrition';
import { apiMode } from '@/services/config';
import { useDevStore } from '@/store/devStore';
import type { BodyMetrics, NutritionGoals, UserProfile } from '@/types';

/**
 * Body metrics for a profile. Profiles created before Phase 3 have none; the
 * mock "active user" data set then shows the demo metrics so the dashboard is
 * not empty, while a brand-new user sees empty fields to fill in.
 */
export function bodyOf(profile: UserProfile | null | undefined): BodyMetrics {
  if (profile?.body) return profile.body;
  const demo = apiMode === 'mock' && useDevStore.getState().mockDataset === 'active';
  return demo ? DEMO_BODY : EMPTY_BODY;
}

export function goalsOf(profile: UserProfile | null | undefined): NutritionGoals {
  return profile?.nutritionGoals ?? DEFAULT_GOALS;
}
