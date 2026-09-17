import { simulate } from './support';
import type { WeightService } from '../types';
import { DEMO_BODY } from '@/features/tracking/nutrition';
import { useDevStore } from '@/store/devStore';
import { useProfileStore } from '@/store/profileStore';
import { storage, storageKeys } from '@/store/storage';
import type { WeightEntry } from '@/types';
import { createId } from '@/utils/id';

/** Weight log in MMKV. The first entry is seeded from the profile's current weight. */
function load(): WeightEntry[] {
  const raw = storage.getString(storageKeys.weights);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WeightEntry[];
  } catch {
    return [];
  }
}

function save(items: WeightEntry[]): void {
  storage.set(storageKeys.weights, JSON.stringify(items));
}

const SEED_PREFIX = 'weight_seed_';

function ensureSeeded(profileId: string): WeightEntry[] {
  const items = load();
  const seedFlag = `weights-seeded:${profileId}`;
  if (items.some((entry) => entry.profileId === profileId) || storage.getBoolean(seedFlag)) {
    return items;
  }
  const profile = useProfileStore.getState().profiles.find((p) => p.id === profileId);
  const demo = useDevStore.getState().mockDataset === 'active';
  const weight = profile?.body?.currentWeightLbs ?? (demo ? DEMO_BODY.currentWeightLbs : null);
  if (!profile || weight === null) return items;
  const seeded: WeightEntry = {
    id: `${SEED_PREFIX}${profileId}`,
    profileId,
    weightLbs: weight,
    loggedAt: profile.createdAt,
  };
  const next = [...items, seeded];
  save(next);
  storage.set(seedFlag, true);
  return next;
}

export function listWeights(profileId: string): WeightEntry[] {
  const items =
    useDevStore.getState().mockDataset === 'new'
      ? load().filter((entry) => !entry.id.startsWith(SEED_PREFIX))
      : ensureSeeded(profileId);
  return items
    .filter((entry) => entry.profileId === profileId)
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
}

export const mockWeightService: WeightService = {
  async list(profileId) {
    await simulate(0.3);
    return listWeights(profileId);
  },
  async add(input) {
    await simulate(0.4);
    const entry: WeightEntry = {
      id: createId('weight'),
      profileId: input.profileId,
      weightLbs: Math.round(input.weightLbs * 10) / 10,
      loggedAt: input.loggedAt ?? new Date().toISOString(),
      photoUri: input.photoUri,
    };
    save([...load(), entry]);
    // The latest weigh-in is the current weight everywhere else.
    useProfileStore.getState().updateProfile(input.profileId, {
      body: {
        ...(useProfileStore.getState().profiles.find((p) => p.id === input.profileId)?.body ?? {
          currentWeightLbs: null,
          goalWeightLbs: null,
          heightInches: null,
          gender: null,
          dailyStepGoal: 10000,
        }),
        currentWeightLbs: entry.weightLbs,
      },
    });
    return entry;
  },
  async remove(id) {
    await simulate(0.3);
    save(load().filter((entry) => entry.id !== id));
  },
};
