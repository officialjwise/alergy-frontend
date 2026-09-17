import { simulate } from './support';
import { ServiceError, type ReactionService } from '../types';
import { useDevStore } from '@/store/devStore';
import { storage, storageKeys } from '@/store/storage';
import type { Reaction } from '@/types';
import { createId } from '@/utils/id';

const SEED_PREFIX = 'reaction_seed_';
const daysAgo = (days: number, hour = 19): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
};

function load(): Reaction[] {
  const raw = storage.getString(storageKeys.reactions);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reaction[];
  } catch {
    return [];
  }
}

function save(items: Reaction[]): void {
  storage.set(storageKeys.reactions, JSON.stringify(items));
}

/** Two believable past reactions so Insights has something to show for an active user. */
function seed(profileId: string): Reaction[] {
  return [
    {
      id: `${SEED_PREFIX}${profileId}_1`,
      profileId,
      occurredAt: daysAgo(12),
      foodName: 'Chocolate Protein Bar',
      symptoms: ['hives', 'itching'],
      severity: 'mild',
      notes: 'Ate two pieces at the gym. Itchy lips within 20 minutes.',
      createdAt: daysAgo(12, 21),
    },
    {
      id: `${SEED_PREFIX}${profileId}_2`,
      profileId,
      occurredAt: daysAgo(41, 13),
      foodName: 'Restaurant pad thai',
      symptoms: ['stomach', 'nausea'],
      severity: 'moderate',
      notes: 'Kitchen could not confirm the peanut oil.',
      createdAt: daysAgo(41, 15),
    },
  ];
}

function ensureSeeded(profileId: string): Reaction[] {
  const items = load();
  const flag = `reactions-seeded:${profileId}`;
  if (!storage.getBoolean(flag) && !items.some((item) => item.profileId === profileId)) {
    const seeded = [...items, ...seed(profileId)];
    save(seeded);
    storage.set(flag, true);
    return seeded;
  }
  return items;
}

function visible(profileId: string): Reaction[] {
  const items =
    useDevStore.getState().mockDataset === 'new'
      ? load().filter((item) => !item.id.startsWith(SEED_PREFIX))
      : ensureSeeded(profileId);
  return items
    .filter((item) => item.profileId === profileId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export const mockReactionService: ReactionService = {
  async list(profileId) {
    await simulate(0.4);
    return visible(profileId);
  },
  async get(id) {
    await simulate(0.2);
    return load().find((item) => item.id === id) ?? null;
  },
  async add(input) {
    await simulate(0.4);
    const reaction: Reaction = {
      ...input,
      id: createId('reaction'),
      createdAt: new Date().toISOString(),
    };
    save([reaction, ...load()]);
    return reaction;
  },
  async update(id, patch) {
    await simulate(0.3);
    const items = load();
    const index = items.findIndex((item) => item.id === id);
    const current = items[index];
    if (!current) throw new ServiceError('Reaction not found', 'not_found');
    const updated: Reaction = { ...current, ...patch };
    items[index] = updated;
    save(items);
    return updated;
  },
  async remove(id) {
    await simulate(0.3);
    save(load().filter((item) => item.id !== id));
  },
};
