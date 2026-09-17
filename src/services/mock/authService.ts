import { simulate } from './support';
import { mockConfig } from '../config';
import { ServiceError, type AuthService } from '../types';
import { useAppStore } from '@/store/appStore';
import type { AuthProvider, AuthSession } from '@/types';
import { createId } from '@/utils/id';

const pendingCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>();

function makeSession(provider: AuthProvider, email?: string, name?: string): AuthSession {
  return {
    // Mock sign-ins count as confirmed addresses (Apple and Google verify them; the email flow used a code).
    user: { id: createId('user'), provider, email, name, emailConfirmed: true },
    token: createId('token'),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  };
}

/**
 * Mock auth. Apple / Google resolve instantly with a fake session (the native
 * SDKs are wired in `src/features/auth/providers.ts` but their results are
 * not sent anywhere yet). The email flow accepts `mockConfig.emailCode`.
 */
export const mockAuthService: AuthService = {
  async signInWithApple() {
    await simulate(1.5);
    return makeSession('apple', 'appleid@privaterelay.appleid.com', 'Apple User');
  },
  async signInWithGoogle() {
    await simulate(1.5);
    return makeSession('google', 'you@gmail.com', 'Google User');
  },
  async requestEmailCode(email) {
    await simulate(1.4);
    pendingCodes.set(email.toLowerCase(), {
      code: mockConfig.emailCode,
      expiresAt: Date.now() + 10 * 60_000,
      attempts: 0,
    });
    return { expiresInSeconds: 600 };
  },
  async verifyEmailCode(email, code) {
    await simulate(1.2);
    const entry = pendingCodes.get(email.toLowerCase());
    if (!entry) throw new ServiceError('No pending code', 'expired_code');
    if (Date.now() > entry.expiresAt) throw new ServiceError('Code expired', 'expired_code');
    if (entry.attempts >= 5) throw new ServiceError('Too many attempts', 'too_many_attempts');
    entry.attempts += 1;
    if (code !== entry.code) throw new ServiceError('Invalid code', 'invalid_code');
    pendingCodes.delete(email.toLowerCase());
    return makeSession('email', email);
  },
  async signOut() {
    await simulate(0.5);
  },
  async deleteAccount() {
    await simulate(1.5);
  },
  async restoreSession() {
    await simulate(0.2);
    return useAppStore.getState().session;
  },
};
