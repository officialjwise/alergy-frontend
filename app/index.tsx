import Constants from 'expo-constants';
import { Redirect } from 'expo-router';
import { useState } from 'react';

import { appConfig } from '@/config/app';
import { stepHref } from '@/features/onboarding/navigation';
import { ONBOARDING_STEPS } from '@/features/onboarding/steps';
import { useAppStore } from '@/store/appStore';
import { useDevStore } from '@/store/devStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';

/** True when `current` is older than `minimum` (semver-ish "a.b.c"). */
export function isOlderVersion(current: string, minimum: string): boolean {
  const a = current.split('.').map((part) => Number(part) || 0);
  const b = minimum.split('.').map((part) => Number(part) || 0);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    if (left !== right) return left < right;
  }
  return false;
}

/**
 * Entry point: forced update and expired sessions come first, then the app
 * resumes onboarding at the persisted step or opens the main app once a
 * profile exists. Rendering a Redirect keeps the splash seamless.
 */
export default function Index() {
  const completed = useOnboardingStore((state) => state.completed);
  const hasStarted = useOnboardingStore((state) => state.hasStarted);
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const hasProfile = useProfileStore((state) => state.profiles.length > 0);
  const session = useAppStore((state) => state.session);
  const forceUpdate = useDevStore((state) => state.forceUpdateRequired);
  // Read the clock once per mount so the render stays pure.
  const [now] = useState(() => Date.now());

  const version = Constants.expoConfig?.version ?? '0.0.0';
  if (forceUpdate || isOlderVersion(version, appConfig.minimumVersion)) {
    return <Redirect href="/update-required" />;
  }
  if (session?.expiresAt && new Date(session.expiresAt).getTime() < now) {
    return <Redirect href="/(auth)/session-expired" />;
  }
  if (completed && hasProfile) {
    return <Redirect href="/(tabs)/home" />;
  }
  if (hasStarted && currentStep && ONBOARDING_STEPS.some((step) => step.route === currentStep)) {
    return <Redirect href={stepHref(currentStep)} />;
  }
  return <Redirect href="/(onboarding)/welcome" />;
}
