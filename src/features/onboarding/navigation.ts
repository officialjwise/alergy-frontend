import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { stepPosition, FIRST_STEP, type StepPosition } from './steps';
import { useOnboardingStore } from '@/store/onboardingStore';

export const ONBOARDING_GROUP = '/(onboarding)';

export function stepHref(route: string): Href {
  return `${ONBOARDING_GROUP}/${route}` as Href;
}

export interface OnboardingNav {
  position: StepPosition;
  /** Advances to the next active step (or finishes onboarding). */
  goNext: () => void;
  /** Goes to the previous step. Falls back to a replace when there is no history (resume). */
  goBack: () => void;
  isFirst: boolean;
}

/**
 * Navigation for one onboarding step. Computes progress from the real step
 * index so the bar always increases, and persists the current step so the
 * app resumes at the same place after a relaunch.
 */
export function useOnboardingNav(route: string, onFinish?: () => void): OnboardingNav {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const position = useMemo(() => stepPosition(route, answers), [route, answers]);

  const goNext = useCallback(() => {
    const next = stepPosition(route, useOnboardingStore.getState().answers).next;
    if (!next) {
      onFinish?.();
      return;
    }
    setCurrentStep(next.route);
    router.push(stepHref(next.route));
  }, [onFinish, route, router, setCurrentStep]);

  const goBack = useCallback(() => {
    const previous = stepPosition(route, useOnboardingStore.getState().answers).previous;
    if (router.canGoBack()) {
      router.back();
    } else if (previous) {
      router.replace(stepHref(previous.route));
    } else {
      router.replace(stepHref('welcome'));
    }
    if (previous) setCurrentStep(previous.route);
  }, [route, router, setCurrentStep]);

  return { position, goNext, goBack, isFirst: route === FIRST_STEP };
}
