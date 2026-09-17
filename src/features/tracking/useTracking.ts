import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bodyOf, goalsOf } from './profile';
import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import { useDevStore } from '@/store/devStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import type {
  BodyMetrics,
  InsightsRange,
  NutritionGoals,
  WeightEntryInput,
  WorkoutInput,
} from '@/types';

/** Query hooks for the nutrition, activity and weight tracking model. */

export function useHomeDashboard(profileId: string | null, date: string) {
  return useQuery({
    queryKey: queryKeys.insights.dashboard(profileId ?? 'none', date),
    queryFn: () => getServices().insights.homeDashboard(profileId ?? '', date),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useDayNutrition(profileId: string | null, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: queryKeys.insights.nutritionDays(profileId ?? 'none', fromDate, toDate),
    queryFn: () => getServices().insights.dayNutrition(profileId ?? '', fromDate, toDate),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useTrackingOverview(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.insights.tracking(profileId ?? 'none'),
    queryFn: () => getServices().insights.trackingOverview(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useWeightSeries(profileId: string | null, range: InsightsRange) {
  return useQuery({
    queryKey: queryKeys.insights.weightSeries(profileId ?? 'none', range),
    queryFn: () => getServices().insights.weightSeries(profileId ?? '', range),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useWeightChanges(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.insights.weightChanges(profileId ?? 'none'),
    queryFn: () => getServices().insights.weightChanges(profileId ?? ''),
    enabled: !!profileId,
  });
}

export function useDailyCalories(profileId: string | null, weekOffset: number) {
  return useQuery({
    queryKey: queryKeys.insights.dailyCalories(profileId ?? 'none', weekOffset),
    queryFn: () => getServices().insights.dailyCalories(profileId ?? '', weekOffset),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useWeeklyEnergy(profileId: string | null, weekOffset: number) {
  return useQuery({
    queryKey: queryKeys.insights.weeklyEnergy(profileId ?? 'none', weekOffset),
    queryFn: () => getServices().insights.weeklyEnergy(profileId ?? '', weekOffset),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useExpenditureChanges(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.insights.expenditure(profileId ?? 'none'),
    queryFn: () => getServices().insights.expenditureChanges(profileId ?? ''),
    enabled: !!profileId,
  });
}

// Weight log

export function useWeights(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.weight.list(profileId ?? 'none'),
    queryFn: () => getServices().weight.list(profileId ?? ''),
    enabled: !!profileId,
  });
}

function useInvalidateTracking() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.insights.all });
    void client.invalidateQueries({ queryKey: queryKeys.weight.all });
    void client.invalidateQueries({ queryKey: queryKeys.activity.all });
    void client.invalidateQueries({ queryKey: queryKeys.badges.all });
  };
}

export function useLogWeight() {
  const invalidate = useInvalidateTracking();
  return useMutation({
    mutationFn: (input: WeightEntryInput) => getServices().weight.add(input),
    onSuccess: invalidate,
  });
}

export function useRemoveWeight() {
  const invalidate = useInvalidateTracking();
  return useMutation({
    mutationFn: (id: string) => getServices().weight.remove(id),
    onSuccess: invalidate,
  });
}

// Apple Health, workouts and water

export function useHealthConnection() {
  return useQuery({
    queryKey: queryKeys.activity.health,
    queryFn: () => getServices().activity.health(),
  });
}

export function useConnectHealth() {
  const invalidate = useInvalidateTracking();
  return useMutation({
    mutationFn: (connect: boolean) =>
      connect ? getServices().activity.connectHealth() : getServices().activity.disconnectHealth(),
    onSuccess: invalidate,
  });
}

export function useActivity(profileId: string | null, date: string) {
  return useQuery({
    queryKey: queryKeys.activity.day(profileId ?? 'none', date),
    queryFn: () => getServices().activity.activity(profileId ?? '', date),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useWorkouts(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.activity.workouts(profileId ?? 'none'),
    queryFn: () => getServices().activity.workouts(profileId ?? ''),
    enabled: !!profileId,
  });
}

export function useLogWorkout() {
  const invalidate = useInvalidateTracking();
  return useMutation({
    mutationFn: (input: WorkoutInput) => getServices().activity.logWorkout(input),
    onSuccess: invalidate,
  });
}

export function useRemoveWorkout() {
  const invalidate = useInvalidateTracking();
  return useMutation({
    mutationFn: (id: string) => getServices().activity.removeWorkout(id),
    onSuccess: invalidate,
  });
}

export function useWater(profileId: string | null, date: string) {
  return useQuery({
    queryKey: queryKeys.activity.water(profileId ?? 'none', date),
    queryFn: () => getServices().activity.water(profileId ?? '', date),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useLogWater() {
  const invalidate = useInvalidateTracking();
  return useMutation({
    mutationFn: ({ profileId, date, ounces }: { profileId: string; date: string; ounces: number }) =>
      getServices().activity.logWater(profileId, date, ounces),
    onSuccess: invalidate,
  });
}

// Body metrics and goals live on the profile (persisted store), with defaults.

export function useBodyMetrics(): BodyMetrics {
  const profile = useProfileStore(selectActiveProfile);
  // Subscribing to the data set keeps the demo values in sync with the dev switch.
  useDevStore((state) => state.mockDataset);
  return bodyOf(profile);
}

export function useNutritionGoals(): NutritionGoals {
  const profile = useProfileStore(selectActiveProfile);
  return goalsOf(profile);
}

export function useUpdateBody() {
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const invalidate = useInvalidateTracking();
  return (patch: Partial<BodyMetrics>) => {
    if (!profile) return;
    updateProfile(profile.id, { body: { ...bodyOf(profile), ...patch } });
    invalidate();
  };
}

export function useUpdateGoals() {
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const invalidate = useInvalidateTracking();
  return (goals: NutritionGoals) => {
    if (!profile) return;
    updateProfile(profile.id, { nutritionGoals: goals });
    invalidate();
  };
}
