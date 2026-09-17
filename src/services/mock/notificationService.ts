import { simulate } from './support';
import type { NotificationService } from '../types';
import { useDevStore } from '@/store/devStore';
import { storage, storageKeys } from '@/store/storage';
import type { AppNotification } from '@/types';

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Seeded alerts for an active user; the "new user" data set has none. */
const SEED: Omit<AppNotification, 'read'>[] = [
  {
    id: 'n-1',
    kind: 'product',
    title: 'Ingredients changed',
    body: 'Lightly Salted Rice Cakes now lists a may-contain statement for sesame.',
    createdAt: hoursAgo(2),
    target: '/product/p-rice-cakes',
  },
  {
    id: 'n-2',
    kind: 'reply',
    title: 'Marcus replied',
    body: '"Same here, they are in every lunchbox now."',
    createdAt: hoursAgo(5),
    target: '/groups/posts/p-1',
  },
  {
    id: 'n-3',
    kind: 'group',
    title: 'New in Peanut allergy parents',
    body: 'Elena shared a label that flagged peanuts.',
    createdAt: hoursAgo(27),
    target: '/groups/g-peanut-parents',
  },
  {
    id: 'n-4',
    kind: 'reaction',
    title: 'How are you feeling?',
    body: 'You logged a reaction 12 days ago. Add notes while it is fresh.',
    createdAt: hoursAgo(30),
    target: '/reactions',
  },
  {
    id: 'n-5',
    kind: 'reminder',
    title: 'Time to check your foods',
    body: 'Scan what you eat today and keep your streak safe.',
    createdAt: hoursAgo(50),
    target: '/scan',
  },
];

function readIds(): string[] {
  const raw = storage.getString(storageKeys.notifications);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveRead(ids: string[]): void {
  storage.set(storageKeys.notifications, JSON.stringify(ids));
}

export const mockNotificationService: NotificationService = {
  async list() {
    await simulate(0.4);
    if (useDevStore.getState().mockDataset === 'new') return [];
    const read = new Set(readIds());
    return SEED.map((item) => ({ ...item, read: read.has(item.id) }));
  },
  async markRead(id) {
    await simulate(0.1);
    saveRead([...new Set([...readIds(), id])]);
  },
  async markAllRead() {
    await simulate(0.2);
    saveRead(SEED.map((item) => item.id));
  },
};
