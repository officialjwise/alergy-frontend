import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { stepPosition, FIRST_STEP, type OnboardingStep, type StepPosition } from './steps';
import { useOnboardingStore } from '@/store/onboardingStore';

export const ONBOARDING_GROUP = '/(onboarding)';

export function stepHref(step: OnboardingStep | string): Href {
  if (typeof step === 'string') return `${ONBOARDING_GROUP}/${step}` as Href;
  const query = step.params ? `?${new URLSearchParams(step.params).toString()}` : '';
  return `${ONBOARDING_GROUP}/${step.route}${query}` as Href;
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
 * Navigation for one questionnaire step (a route, or `route:id` for the
 * per-food and per-condition screens). Computes progress from the real step
 * index so the bar always increases, and persists the current step so the
 * app resumes at the same place after a relaunch.
 */
export function useOnboardingNav(stepKey: string, onFinish?: () => void): OnboardingNav {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const position = useMemo(() => stepPosition(stepKey, answers), [stepKey, answers]);

  const goNext = useCallback(() => {
    const next = stepPosition(stepKey, useOnboardingStore.getState().answers).next;
    if (!next) {
      onFinish?.();
      return;
    }
    setCurrentStep(next.key);
    router.push(stepHref(next));
  }, [onFinish, stepKey, router, setCurrentStep]);

  const goBack = useCallback(() => {
    const previous = stepPosition(stepKey, useOnboardingStore.getState().answers).previous;
    if (router.canGoBack()) {
      router.back();
    } else if (previous) {
      router.replace(stepHref(previous));
    } else {
      router.replace(stepHref('welcome'));
    }
    if (previous) setCurrentStep(previous.key);
  }, [stepKey, router, setCurrentStep]);

  return { position, goNext, goBack, isFirst: stepKey === FIRST_STEP };
}
