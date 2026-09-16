import type { OnboardingAnswers } from '@/types';

/**
 * Ordered onboarding steps. Route names match files in `app/(onboarding)/`.
 * `when` hides steps that do not apply; progress is computed over the active
 * list so the bar always increases (the PDF's bar lengths were inconsistent).
 */
export interface OnboardingStep {
  route: string;
  /** Shows the back button + progress bar header. */
  header: boolean;
  when?: (answers: OnboardingAnswers) => boolean;
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  { route: 'who', header: true },
  {
    route: 'profile-name',
    header: true,
    when: (a) => a.profileFor !== null && a.profileFor !== 'myself',
  },
  { route: 'birth', header: true },
  { route: 'frequency', header: true },
  { route: 'tried-apps', header: true },
  { route: 'watch-for', header: true },
  { route: 'ingredients', header: true },
  { route: 'severity', header: true, when: (a) => a.ingredients.length > 0 },
  { route: 'reasons', header: true },
  { route: 'caution', header: true },
  { route: 'challenges', header: true },
  { route: 'diet', header: true },
  { route: 'goal', header: true },
  { route: 'camera', header: true },
  { route: 'camera-permission', header: true, when: (a) => a.cameraScanning === true },
  { route: 'social', header: true },
  { route: 'remember', header: true },
  { route: 'all-done', header: true },
  { route: 'setup', header: false },
  { route: 'ready', header: false },
  { route: 'why', header: false },
  { route: 'save-profile', header: true },
  { route: 'notifications', header: false },
];

export function activeSteps(answers: OnboardingAnswers): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((step) => !step.when || step.when(answers));
}

export interface StepPosition {
  index: number;
  total: number;
  /** 0..1 */
  progress: number;
  previous: OnboardingStep | null;
  next: OnboardingStep | null;
  step: OnboardingStep | null;
}

export function stepPosition(route: string, answers: OnboardingAnswers): StepPosition {
  const steps = activeSteps(answers);
  const index = steps.findIndex((s) => s.route === route);
  if (index === -1) {
    return {
      index: -1,
      total: steps.length,
      progress: 0,
      previous: null,
      next: steps[0] ?? null,
      step: null,
    };
  }
  return {
    index,
    total: steps.length,
    progress: (index + 1) / steps.length,
    previous: index > 0 ? (steps[index - 1] ?? null) : null,
    next: steps[index + 1] ?? null,
    step: steps[index] ?? null,
  };
}

export const FIRST_STEP = ONBOARDING_STEPS[0]!.route;
