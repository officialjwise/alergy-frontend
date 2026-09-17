import { simulate } from './support';
import type { ActivityService } from '../types';
import { stepCalories } from '@/features/tracking/nutrition';
import { useDevStore } from '@/store/devStore';
import { storage, storageKeys } from '@/store/storage';
import type { DailyActivity, HealthConnection, WaterDay, Workout } from '@/types';
import { dayKey } from '@/utils/date';
import { createId } from '@/utils/id';

/**
 * Apple Health stand-in. "Connecting" flips a flag in MMKV; from then on the
 * active-user data set reports today's steps and two workouts read from
 * Health, exactly like the "Add workouts to your daily budget" sheet shows.
 * Manual workouts and water are stored per day.
 */
function readJson<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const loadHealth = (): HealthConnection =>
  readJson<HealthConnection>(storageKeys.health, { connected: false, connectedAt: null });
const loadWorkouts = (): Workout[] => readJson<Workout[]>(storageKeys.workouts, []);
const loadWater = (): Record<string, number> => readJson<Record<string, number>>(storageKeys.water, {});

function healthWorkouts(profileId: string, date: string): Workout[] {
  if (useDevStore.getState().mockDataset !== 'active' || date !== dayKey(new Date())) return [];
  const day = new Date();
  const at = (hour: number, minute: number) =>
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute).toISOString();
  return [
    {
      id: `health_${profileId}_${date}_run`,
      profileId,
      kind: 'run',
      name: 'Morning Run',
      minutes: 32,
      calories: 320,
      source: 'apple_health',
      loggedAt: at(7, 10),
    },
    {
      id: `health_${profileId}_${date}_yoga`,
      profileId,
      kind: 'yoga',
      name: 'Yoga',
      minutes: 20,
      calories: 90,
      source: 'apple_health',
      loggedAt: at(18, 30),
    },
  ];
}

function healthSteps(date: string): number {
  if (useDevStore.getState().mockDataset !== 'active') return 0;
  return date === dayKey(new Date()) ? 12430 : 0;
}

export function activityFor(profileId: string, date: string): DailyActivity {
  const health = loadHealth();
  const manual = loadWorkouts().filter(
    (workout) => workout.profileId === profileId && dayKey(workout.loggedAt) === date,
  );
  const fromHealth = health.connected ? healthWorkouts(profileId, date) : [];
  const steps = health.connected ? healthSteps(date) : 0;
  const workouts = [...fromHealth, ...manual].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
  const stepCals = stepCalories(steps);
  return {
    date,
    steps,
    stepCalories: stepCals,
    workouts,
    caloriesBurned: workouts.reduce((sum, workout) => sum + workout.calories, 0) + stepCals,
  };
}

export function waterFor(profileId: string, date: string): WaterDay {
  return { date, ounces: loadWater()[`${profileId}:${date}`] ?? 0 };
}

export const healthConnection = loadHealth;

export const mockActivityService: ActivityService = {
  async health() {
    await simulate(0.2);
    return loadHealth();
  },
  async connectHealth() {
    await simulate(1.2);
    const next = { connected: true, connectedAt: new Date().toISOString() };
    storage.set(storageKeys.health, JSON.stringify(next));
    return next;
  },
  async disconnectHealth() {
    await simulate(0.4);
    const next = { connected: false, connectedAt: null };
    storage.set(storageKeys.health, JSON.stringify(next));
    return next;
  },
  async activity(profileId, date) {
    await simulate(0.3);
    return activityFor(profileId, date);
  },
  async workouts(profileId) {
    await simulate(0.3);
    const today = dayKey(new Date());
    const health = loadHealth().connected ? healthWorkouts(profileId, today) : [];
    return [...health, ...loadWorkouts().filter((workout) => workout.profileId === profileId)].sort(
      (a, b) => b.loggedAt.localeCompare(a.loggedAt),
    );
  },
  async logWorkout(input) {
    await simulate(0.4);
    const workout: Workout = {
      id: createId('workout'),
      profileId: input.profileId,
      kind: input.kind,
      name: input.name,
      minutes: input.minutes,
      calories: Math.round(input.calories),
      source: 'manual',
      loggedAt: input.loggedAt ?? new Date().toISOString(),
    };
    storage.set(storageKeys.workouts, JSON.stringify([workout, ...loadWorkouts()]));
    return workout;
  },
  async removeWorkout(id) {
    await simulate(0.3);
    storage.set(
      storageKeys.workouts,
      JSON.stringify(loadWorkouts().filter((workout) => workout.id !== id)),
    );
  },
  async water(profileId, date) {
    await simulate(0.2);
    return waterFor(profileId, date);
  },
  async logWater(profileId, date, ounces) {
    await simulate(0.3);
    const all = loadWater();
    all[`${profileId}:${date}`] = Math.max(0, Math.round(ounces));
    storage.set(storageKeys.water, JSON.stringify(all));
    return { date, ounces: all[`${profileId}:${date}`] ?? 0 };
  },
};
