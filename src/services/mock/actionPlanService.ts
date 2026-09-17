import { simulate } from './support';
import type { ActionPlanService } from '../types';
import { storage, storageKeys } from '@/store/storage';
import type { ActionPlanPhoto } from '@/types';
import { createId } from '@/utils/id';

function load(): ActionPlanPhoto[] {
  const raw = storage.getString(storageKeys.actionPlan);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ActionPlanPhoto[];
  } catch {
    return [];
  }
}

function save(items: ActionPlanPhoto[]): void {
  storage.set(storageKeys.actionPlan, JSON.stringify(items));
}

/** Allergy action plan documents: photo uris kept on the device. */
export const mockActionPlanService: ActionPlanService = {
  async list(profileId) {
    await simulate(0.2);
    return load()
      .filter((item) => item.profileId === profileId)
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  },
  async add(profileId, uri) {
    await simulate(0.3);
    const photo: ActionPlanPhoto = {
      id: createId('doc'),
      profileId,
      uri,
      addedAt: new Date().toISOString(),
    };
    save([photo, ...load()]);
    return photo;
  },
  async remove(id) {
    await simulate(0.2);
    save(load().filter((item) => item.id !== id));
  },
};
