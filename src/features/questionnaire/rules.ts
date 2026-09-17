import { CONDITION_CHECK_DAYS, conditionDef, QUESTIONNAIRE_VERSION } from './definition';
import { GENERIC_LABEL_WORDS, INGREDIENTS, ingredientById } from '@/mocks/ingredients';
import type {
  AvoidedFood,
  FoodAnswers,
  HealthCondition,
  HealthConditionId,
  Ingredient,
  QuestionnaireAnswers,
  ReactionKind,
  RiskLevel,
  Strictness,
  TypedFoodResolution,
  UserProfile,
  WorstReaction,
} from '@/types';
import { addDays, dayKey, fromDayKey } from '@/utils/date';
import { normalize } from '@/utils/text';

/**
 * The safety decisions from section 4 of the questionnaire, as pure
 * functions. Each one leans towards warning people too much rather than too
 * little. These are clinical judgements awaiting review (section 7).
 */

/** How a product containing the food is shown (questions 6 and 7). */
export function riskLevel(
  kind: ReactionKind,
  worst: WorstReaction | null,
  strictness: Strictness | null,
): RiskLevel {
  if (kind === 'choice') return strictness === 'prefers' ? 'warning' : 'high';
  // Severe, needed treatment, and "not sure / hasn't happened yet" are all high risk.
  return worst === 'mild' ? 'warning' : 'high';
}

export interface ResolvedFoodAnswers {
  kind: ReactionKind;
  kindAssumed: boolean;
  worst: WorstReaction | null;
  severityAssumed: boolean;
  strictness: Strictness | null;
  doctorConfirmed: AvoidedFood['doctorConfirmed'];
  level: RiskLevel;
}

/** Applies the "not sure" rules; null while the answers for the food are incomplete. */
export function resolveFoodAnswers(answers: FoodAnswers | undefined): ResolvedFoodAnswers | null {
  if (!answers || !answers.kind) return null;
  const kind = answers.kind;
  if (kind === 'choice') {
    if (!answers.strictness) return null;
    return {
      kind,
      kindAssumed: false,
      worst: null,
      severityAssumed: false,
      strictness: answers.strictness,
      doctorConfirmed: null,
      level: riskLevel(kind, null, answers.strictness),
    };
  }
  if (!answers.worst) return null;
  const severityAssumed = answers.worst === 'unsure';
  return {
    kind,
    kindAssumed: answers.kindUnsure,
    worst: answers.worst,
    severityAssumed,
    strictness: null,
    doctorConfirmed: answers.doctorConfirmed,
    level: riskLevel(kind, answers.worst, null),
  };
}

const slug = (text: string): string =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function isGenericWord(text: string): boolean {
  const value = normalize(text);
  return (GENERIC_LABEL_WORDS as readonly string[]).includes(value);
}

/**
 * Question 4: a typed-in food. Names the catalogue knows ("prawns",
 * "celeriac") become that allergen; words on almost every label are refused;
 * anything else is kept as typed and checked by name only.
 */
export function resolveTypedFood(
  text: string,
  catalogue: readonly Ingredient[] = INGREDIENTS,
): TypedFoodResolution {
  const value = normalize(text);
  if (value.length < 2 || isGenericWord(value)) return { kind: 'refused' };
  const singular = value.endsWith('es') ? value.slice(0, -2) : value.endsWith('s') ? value.slice(0, -1) : value;
  const known = catalogue.find((item) => {
    const names = [item.name, ...item.aliases].map(normalize);
    return names.includes(value) || names.includes(singular) || names.includes(`${value}s`);
  });
  if (known) return { kind: 'known', allergenId: known.id };
  return { kind: 'custom', id: `custom_${slug(text)}` };
}

/** Food ids in questionnaire order: picked allergens, then typed foods (known or kept as typed). */
export function foodIds(answers: QuestionnaireAnswers): string[] {
  const ids: string[] = [...answers.pickedFoods];
  for (const typed of answers.typedFoods) {
    if (typed.resolution.kind === 'known') ids.push(typed.resolution.allergenId);
    else if (typed.resolution.kind === 'custom') ids.push(typed.resolution.id);
  }
  return Array.from(new Set(ids));
}

/** Display name for a food id in the answers (catalogue name or the typed text). */
export function foodName(answers: QuestionnaireAnswers, id: string): string {
  const catalogue = ingredientById(id);
  if (catalogue) return catalogue.name;
  const typed = answers.typedFoods.find(
    (item) => item.resolution.kind === 'custom' && item.resolution.id === id,
  );
  return typed?.text.trim() ?? id;
}

export type ValidationIssue =
  | { code: 'target' }
  | { code: 'person_name' }
  | { code: 'has_allergies' }
  | { code: 'food_kind'; foodId: string }
  | { code: 'food_worst'; foodId: string }
  | { code: 'food_strictness'; foodId: string }
  | { code: 'has_conditions' }
  | { code: 'plan_limit' };

/** "Nothing is saved halfway": every missing or contradictory answer, so the user can be told what to fix. */
export function validateAnswers(
  answers: QuestionnaireAnswers,
  options: { canAddPerson: boolean },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!answers.target) issues.push({ code: 'target' });
  if (answers.target === 'other' && !answers.personName.trim()) issues.push({ code: 'person_name' });
  if (answers.target === 'other' && !options.canAddPerson) issues.push({ code: 'plan_limit' });
  if (!answers.hasAllergies) issues.push({ code: 'has_allergies' });
  if (answers.hasAllergies && answers.hasAllergies !== 'no') {
    for (const id of foodIds(answers)) {
      const food = answers.perFood[id];
      if (!food?.kind) issues.push({ code: 'food_kind', foodId: id });
      else if (food.kind === 'choice' && !food.strictness)
        issues.push({ code: 'food_strictness', foodId: id });
      else if (food.kind !== 'choice' && !food.worst) issues.push({ code: 'food_worst', foodId: id });
    }
  }
  if (answers.hasConditions === null) issues.push({ code: 'has_conditions' });
  return issues;
}

export type ReviewMessage =
  | 'severe_assumed'
  | 'see_doctor'
  | 'confirm_email'
  | 'known_food'
  | 'by_name_only'
  | 'earlier_entries';

export interface MergeContext {
  now: string;
  /** Id and colour for a new profile. */
  newId: string;
  color: string;
  emailConfirmed: boolean;
}

/**
 * Turns the answers into the person's profile. Answering again adds to or
 * updates the profile and never removes anything (section 4). Returns the
 * messages from section 5 that apply.
 */
export function mergeProfile(
  answers: QuestionnaireAnswers,
  existing: UserProfile | null,
  ctx: MergeContext,
): { profile: UserProfile; messages: ReviewMessage[] } {
  const messages = new Set<ReviewMessage>();
  const ids = answers.hasAllergies === 'no' ? [] : foodIds(answers);
  const foods: AvoidedFood[] = [];
  for (const id of ids) {
    const resolved = resolveFoodAnswers(answers.perFood[id]);
    if (!resolved) continue;
    const catalogue = ingredientById(id);
    const previous = existing?.foods.find((food) => food.id === id);
    if (resolved.severityAssumed) messages.add('severe_assumed');
    foods.push({
      id,
      name: catalogue?.name ?? foodName(answers, id),
      allergenId: catalogue ? catalogue.id : null,
      byNameOnly: !catalogue,
      kind: resolved.kind,
      kindAssumed: resolved.kindAssumed,
      worst: resolved.worst,
      severityAssumed: resolved.severityAssumed,
      strictness: resolved.strictness,
      doctorConfirmed: resolved.doctorConfirmed,
      level: resolved.level,
      addedAt: previous?.addedAt ?? ctx.now,
      updatedAt: ctx.now,
    });
  }
  if (answers.typedFoods.some((item) => item.resolution.kind === 'known')) messages.add('known_food');
  if (foods.some((food) => food.byNameOnly)) messages.add('by_name_only');
  if (answers.hasAllergies === 'unsure') messages.add('see_doctor');

  // Earlier entries stay: foods left out this time are kept, and the user is told.
  const kept = (existing?.foods ?? []).filter((food) => !foods.some((item) => item.id === food.id));
  if (kept.length > 0) messages.add('earlier_entries');

  const conditions: HealthCondition[] = (answers.hasConditions ? answers.conditions : []).map(
    (id) => {
      const previous = existing?.conditions.find((condition) => condition.id === id);
      const endsAt = answers.conditionEnds[id] ?? previous?.endsAt ?? null;
      return {
        id,
        temporary: conditionDef(id).temporary,
        endsAt,
        confirmedAt: previous?.confirmedAt ?? null,
        addedAt: previous?.addedAt ?? ctx.now,
      };
    },
  );
  const keptConditions = (existing?.conditions ?? []).filter(
    (condition) => !conditions.some((item) => item.id === condition.id),
  );
  if (conditions.length > 0 && !ctx.emailConfirmed) messages.add('confirm_email');

  const name =
    answers.target === 'other'
      ? answers.personName.trim()
      : existing?.name ?? answers.personName.trim();
  const profile: UserProfile = {
    id: existing?.id ?? ctx.newId,
    name,
    profileFor: existing?.profileFor ?? (answers.target === 'other' ? 'other' : 'myself'),
    isAccountHolder: existing?.isAccountHolder ?? answers.target !== 'other',
    birthDate: existing?.birthDate ?? null,
    hasAllergies: answers.hasAllergies ?? existing?.hasAllergies ?? 'no',
    foods: [...foods, ...kept],
    conditions: [...conditions, ...keptConditions],
    note: answers.note.trim() || existing?.note || '',
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    answers: { ...answers, version: QUESTIONNAIRE_VERSION },
    emergencyContact: existing?.emergencyContact ?? null,
    doctor: existing?.doctor ?? '',
    reactionFreeGoalDays: existing?.reactionFreeGoalDays ?? 30,
    color: existing?.color ?? ctx.color,
    body: existing?.body,
    nutritionGoals: existing?.nutritionGoals,
    createdAt: existing?.createdAt ?? ctx.now,
    updatedAt: ctx.now,
  };
  return { profile, messages: [...messages] };
}

/** Conditions only take effect once the email address is confirmed (section 4). */
export function activeConditionIds(
  profile: Pick<UserProfile, 'conditions'>,
  emailConfirmed: boolean,
): HealthConditionId[] {
  return emailConfirmed ? profile.conditions.map((condition) => condition.id) : [];
}

/**
 * Two weeks after a temporary condition's end date the app asks whether it
 * still applies; the advice never switches off by itself.
 */
export function conditionNeedsCheck(condition: HealthCondition, today: string): boolean {
  if (!condition.temporary || !condition.endsAt) return false;
  const askFrom = dayKey(addDays(fromDayKey(condition.endsAt), CONDITION_CHECK_DAYS));
  if (today < askFrom) return false;
  return condition.confirmedAt === null || condition.confirmedAt < askFrom;
}

/** True when the profile answered an older questionnaire and should be invited to answer again. */
export function questionnaireOutdated(profile: Pick<UserProfile, 'questionnaireVersion'>): boolean {
  return profile.questionnaireVersion < QUESTIONNAIRE_VERSION;
}
