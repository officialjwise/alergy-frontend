import type { IconName } from '@/components/ui/iconNames';
import type {
  DoctorConfirmed,
  HealthConditionId,
  ReactionKind,
  Strictness,
  WorstReaction,
} from '@/types';

/**
 * The questionnaire is managed centrally on the server; this is version 2 as
 * described in "The Onboarding Questionnaire" (17 Sep 2026). If a change
 * alters what an answer means the version goes up and people who answered
 * the old version are invited to go through it again.
 */
export const QUESTIONNAIRE_VERSION = 2;

/** Question 4 accepts up to this many typed-in foods. */
export const MAX_TYPED_FOODS = 10;

/** Two weeks after a temporary condition's end date the app asks whether it still applies. */
export const CONDITION_CHECK_DAYS = 14;

export interface ChoiceOption<V extends string> {
  value: V;
  labelKey: string;
  hintKey?: string;
  icon: IconName;
}

/** Question 5. */
export const REACTION_KINDS: readonly ChoiceOption<ReactionKind | 'unsure'>[] = [
  { value: 'allergy', labelKey: 'q5.allergy', hintKey: 'q5.allergyHint', icon: 'alert' },
  { value: 'intolerance', labelKey: 'q5.intolerance', hintKey: 'q5.intoleranceHint', icon: 'stomach' },
  { value: 'sensitivity', labelKey: 'q5.sensitivity', hintKey: 'q5.sensitivityHint', icon: 'pulse' },
  { value: 'choice', labelKey: 'q5.choice', hintKey: 'q5.choiceHint', icon: 'leaf' },
  { value: 'unsure', labelKey: 'q5.unsure', hintKey: 'q5.unsureHint', icon: 'helpCircle' },
];

/** Question 6. */
export const WORST_REACTIONS: readonly ChoiceOption<WorstReaction>[] = [
  { value: 'severe', labelKey: 'q6.severe', hintKey: 'q6.severeHint', icon: 'alert' },
  { value: 'treatment', labelKey: 'q6.treatment', hintKey: 'q6.treatmentHint', icon: 'medal' },
  { value: 'mild', labelKey: 'q6.mild', hintKey: 'q6.mildHint', icon: 'checkCircle' },
  { value: 'unsure', labelKey: 'q6.unsure', hintKey: 'q6.unsureHint', icon: 'helpCircle' },
];

/** Question 7. */
export const STRICTNESS_OPTIONS: readonly ChoiceOption<Strictness>[] = [
  { value: 'strict', labelKey: 'q7.strict', hintKey: 'q7.strictHint', icon: 'ban' },
  { value: 'prefers', labelKey: 'q7.prefers', hintKey: 'q7.prefersHint', icon: 'leaf' },
];

/** Question 8. */
export const DOCTOR_OPTIONS: readonly ChoiceOption<DoctorConfirmed>[] = [
  { value: 'yes', labelKey: 'common.yes', icon: 'checkCircle' },
  { value: 'no', labelKey: 'common.no', icon: 'closeCircle' },
  { value: 'unknown', labelKey: 'q8.unknown', icon: 'helpCircle' },
];

export interface HealthConditionDef {
  id: HealthConditionId;
  icon: IconName;
  /** Pregnancy and breastfeeding end; the app asks whether they still apply. */
  temporary: boolean;
}

/** Question 10. */
export const HEALTH_CONDITIONS: readonly HealthConditionDef[] = [
  { id: 'diabetes', icon: 'pulse', temporary: false },
  { id: 'kidney_disease', icon: 'heart', temporary: false },
  { id: 'pregnancy', icon: 'people', temporary: true },
  { id: 'breastfeeding', icon: 'people', temporary: true },
  { id: 'high_blood_pressure', icon: 'heart', temporary: false },
  { id: 'heart_disease', icon: 'heart', temporary: false },
  { id: 'coeliac', icon: 'wheat', temporary: false },
  { id: 'ibs', icon: 'stomach', temporary: false },
  { id: 'gout', icon: 'pulse', temporary: false },
  { id: 'pku', icon: 'flask', temporary: false },
];

export const conditionDef = (id: HealthConditionId): HealthConditionDef =>
  HEALTH_CONDITIONS.find((item) => item.id === id) ?? { id, icon: 'pulse', temporary: false };
