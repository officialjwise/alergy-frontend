import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getServices } from '@/services';
import { ServiceError } from '@/services/types';
import { useAppStore } from '@/store/appStore';
import type { AuthProvider, AuthSession } from '@/types';

export function authErrorKey(error: unknown): string {
  if (error instanceof ServiceError) {
    switch (error.code) {
      case 'invalid_code':
        return 'email.wrongCode';
      case 'expired_code':
        return 'email.expired';
      case 'too_many_attempts':
        return 'email.tooManyAttempts';
      case 'cancelled':
        return '';
      default:
        return 'saveProfile.signInFailed';
    }
  }
  return 'saveProfile.signInFailed';
}

/** Social sign in (Apple / Google) through the AuthService; stores the session. */
export function useSocialSignIn() {
  const setSession = useAppStore((state) => state.setSession);
  const mutation = useMutation({
    mutationFn: async (provider: Exclude<AuthProvider, 'email'>): Promise<AuthSession> => {
      const services = getServices();
      return provider === 'apple'
        ? services.auth.signInWithApple()
        : services.auth.signInWithGoogle();
    },
    onSuccess: (session) => setSession(session),
  });
  const signIn = useCallback(
    (provider: Exclude<AuthProvider, 'email'>) => mutation.mutateAsync(provider),
    [mutation],
  );
  return { signIn, pending: mutation.isPending ? mutation.variables : null, error: mutation.error };
}

export function useEmailCode() {
  const request = useMutation({
    mutationFn: (email: string) => getServices().auth.requestEmailCode(email),
  });
  const setSession = useAppStore((state) => state.setSession);
  const verify = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      getServices().auth.verifyEmailCode(email, code),
    onSuccess: (session) => setSession(session),
  });
  return { request, verify };
}
