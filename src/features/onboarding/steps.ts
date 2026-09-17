import { conditionDef } from '@/features/questionnaire/definition';
import { foodIds } from '@/features/questionnaire/rules';
import type { QuestionnaireAnswers } from '@/types';

/**
 * Ordered questionnaire steps, built from the answers so far: some questions
 * only appear when an earlier answer makes them relevant, and questions 5 to
 * 8 repeat for every food. Progress is computed over the active list so the
 * bar always increases.
 */
export interface OnboardingStep {
  /** Unique key: the route, plus `:id` for the per-food and per-condition steps. */
  key: string;
  route: string;
  params?: Record<string, string>;
  /** Shows the back button + progress bar header. */
  header: boolean;
}

const simple = (route: string, header = true): OnboardingStep => ({ key: route, route, header });
const perItem = (route: string, id: string): OnboardingStep => ({
  key: `${route}:${id}`,
  route,
  params: { id },
  header: true,
});

export function activeSteps(answers: QuestionnaireAnswers): OnboardingStep[] {
  const steps: OnboardingStep[] = [simple('who')];
  if (answers.target === 'other') steps.push(simple('person-name'));
  if (answers.target === 'existing') steps.push(simple('person-pick'));
  steps.push(simple('allergies'));
  if (answers.hasAllergies === 'yes' || answers.hasAllergies === 'unsure') {
    steps.push(simple('foods'), simple('foods-other'));
    for (const id of foodIds(answers)) {
      const food = answers.perFood[id];
      steps.push(perItem('food-reaction', id));
      if (food?.kind === 'choice') {
        steps.push(perItem('food-strictness', id));
      } else if (food?.kind) {
        steps.push(perItem('food-worst', id), perItem('food-doctor', id));
      }
    }
  }
  steps.push(simple('conditions'));
  if (answers.hasConditions) {
    steps.push(simple('conditions-pick'));
    for (const id of answers.conditions) {
      if (conditionDef(id).temporary) steps.push(perItem('condition-end', id));
    }
  }
  steps.push(simple('note'));
  steps.push(simple('camera'));
  if (answers.cameraScanning === true) steps.push(simple('camera-permission'));
  steps.push(simple('all-done'), simple('setup', false), simple('ready', false));
  steps.push(simple('save-profile'), simple('notifications', false));
  return steps;
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

export function stepPosition(key: string, answers: QuestionnaireAnswers): StepPosition {
  const steps = activeSteps(answers);
  const index = steps.findIndex((step) => step.key === key);
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

/** Step key for a per-food or per-condition screen. */
export const stepKey = (route: string, id?: string): string => (id ? `${route}:${id}` : route);

export const FIRST_STEP = 'who';

/** Routes that exist as files under `app/(onboarding)/`; used to validate a persisted resume step. */
export const ONBOARDING_ROUTES = [
  'welcome',
  'who',
  'person-name',
  'person-pick',
  'allergies',
  'foods',
  'foods-other',
  'food-reaction',
  'food-worst',
  'food-strictness',
  'food-doctor',
  'conditions',
  'conditions-pick',
  'condition-end',
  'note',
  'camera',
  'camera-permission',
  'all-done',
  'setup',
  'ready',
  'save-profile',
  'notifications',
] as const;
