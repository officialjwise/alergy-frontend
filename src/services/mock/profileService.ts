import { simulate } from './support';
import { ServiceError, type ProfileService } from '../types';
import { useProfileStore } from '@/store/profileStore';

/**
 * Profiles are owned by the zustand store (persisted with MMKV) so the app
 * works fully offline. The mock service just mirrors that store with latency,
 * which is exactly the shape the HTTP service will have.
 */
export const mockProfileService: ProfileService = {
  async list() {
    await simulate(0.3);
    return useProfileStore.getState().profiles;
  },
  async get(id) {
    await simulate(0.2);
    return useProfileStore.getState().profiles.find((p) => p.id === id) ?? null;
  },
  async create(profile) {
    await simulate();
    useProfileStore.getState().addProfile(profile, false);
    return profile;
  },
  async update(id, patch) {
    await simulate(0.6);
    useProfileStore.getState().updateProfile(id, patch);
    const updated = useProfileStore.getState().profiles.find((p) => p.id === id);
    if (!updated) throw new ServiceError('Profile not found', 'not_found');
    return updated;
  },
  async remove(id) {
    await simulate(0.6);
    useProfileStore.getState().removeProfile(id);
  },
};
