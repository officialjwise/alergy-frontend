import { http } from './client';
import type { Services } from '../types';
import { evaluateProduct } from '../verdictEngine';
import type { Ingredient, Product, ScanResult, UserProfile, AuthSession } from '@/types';
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
    searchProducts: (query) => http<Product[]>(`/products?q=${encodeURIComponent(query)}`),
    verdictFor: async (product, profile) => evaluateProduct(product, profile),
  },
  history: {
    list: (profileId, filter) =>
      http<ScanResult[]>(
        `/profiles/${profileId}/scans?${new URLSearchParams(filter as Record<string, string>).toString()}`,
      ),
    get: (id) => http<ScanResult | null>(`/scans/${id}`),
    add: (result) => http<ScanResult>('/scans', { method: 'POST', body: JSON.stringify(result) }),
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
};
