import { CONDITION_RULES } from './conditionRules';
import { INGREDIENTS } from '@/mocks/ingredients';
import type {
  AvoidedFood,
  ConditionNote,
  HealthConditionId,
  Ingredient,
  Product,
  RiskLevel,
  TriggerKind,
  UserProfile,
  Verdict,
  VerdictKind,
  VerdictTrigger,
} from '@/types';
import { normalize } from '@/utils/text';

/**
 * Local verdict engine. It is deliberately simple and readable: the backend
 * will own the real one. It exists so the UI has realistic, explainable
 * results ("why is this high risk") while the API is being built.
 *
 * Rules (questionnaire sections 2 and 4, awaiting clinical review):
 * - A product that contains a food is shown at the food's level: High risk
 *   or Warning.
 * - "May contain" and shared-equipment statements count too. For a High risk
 *   food any trace matters, so they are shown as High risk; for a Warning
 *   food they stay a Warning.
 * - A typed-in food is checked by its name only and can only make a result
 *   more cautious.
 * - Labels that could not be read fully come back as "Not sure".
 * - Active health conditions add notes about ingredients to limit or avoid;
 *   an "avoid" note turns a safe result into a Warning.
 */

const CROSS_CONTACT_PHRASES = [
  'produced in a facility',
  'made in a facility',
  'facility that also',
  'shared equipment',
  'equipment that also',
  'packed on equipment',
  'bakery that uses',
  'may contain traces',
];

interface Term {
  foodId: string;
  foodName: string;
  level: RiskLevel;
  byNameOnly: boolean;
  terms: string[];
}

function termsForProfile(profile: UserProfile): Term[] {
  const catalogue = new Map<string, Ingredient>(INGREDIENTS.map((item) => [item.id, item]));
  return profile.foods.map((food: AvoidedFood) => {
    const ingredient = food.allergenId ? catalogue.get(food.allergenId) : undefined;
    const words = ingredient && !food.byNameOnly ? [ingredient.name, ...ingredient.aliases] : [food.name];
    return {
      foodId: food.id,
      foodName: food.name,
      level: food.level,
      byNameOnly: food.byNameOnly,
      terms: words.map(normalize).filter(Boolean),
    };
  });
}

/** Finds the first term occurrence as a whole word and returns the matched label text. */
function findTerm(haystack: string, term: string): string | null {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^a-z])(${escaped})(s|es)?(?=$|[^a-z])`, 'i');
  const match = re.exec(haystack);
  return match ? match[2] + (match[3] ?? '') : null;
}

function kindRank(kind: TriggerKind): number {
  return { contains: 3, may_contain: 2, cross_contact: 1, unclear: 0 }[kind];
}

/** The verdict kind one trigger produces on its own. */
export function triggerVerdict(trigger: Pick<VerdictTrigger, 'kind' | 'level'>): VerdictKind {
  if (trigger.kind === 'unclear') return 'caution';
  return trigger.level === 'high' ? 'unsafe' : 'caution';
}

const KIND_RANK: Record<VerdictKind, number> = { safe: 0, unknown: 1, caution: 2, unsafe: 3 };

export function evaluateProduct(
  product: Product,
  profile: UserProfile,
  activeConditions: HealthConditionId[] = profile.conditions.map((condition) => condition.id),
): Verdict {
  const ingredientsText = normalize(product.ingredientsText);
  const allergenText = normalize(product.allergenStatement ?? '');
  const mayContainText = normalize(product.mayContain.join(', '));
  const combinedStatement = `${allergenText} ${mayContainText}`;

  const containsStatement = allergenText.split(/\bmay contain\b/)[0] ?? '';
  const mayContainStatement = `${allergenText.split(/\bmay contain\b/)[1] ?? ''} ${mayContainText}`;
  const crossContact = CROSS_CONTACT_PHRASES.some((phrase) => allergenText.includes(phrase));

  const triggers: VerdictTrigger[] = [];
  const cleared: string[] = [];
  const incomplete =
    product.ingredientsText.includes('...') || product.ingredientsText.trim().length < 12;

  for (const term of termsForProfile(profile)) {
    let best: VerdictTrigger | null = null;
    const consider = (kind: TriggerKind, matchedText: string) => {
      if (!best || kindRank(kind) > kindRank(best.kind)) {
        best = {
          ingredientId: term.foodId,
          ingredientName: term.foodName,
          matchedText,
          kind,
          level: term.level,
          byNameOnly: term.byNameOnly,
        };
      }
    };
    for (const word of term.terms) {
      const inIngredients = findTerm(ingredientsText, word);
      if (inIngredients) consider('contains', inIngredients);
      const inContains = findTerm(containsStatement, word);
      if (inContains) consider('contains', inContains);
      const inMayContain = findTerm(mayContainStatement, word);
      if (inMayContain) consider('may_contain', inMayContain);
      if (crossContact && findTerm(combinedStatement, word)) consider('cross_contact', word);
    }
    if (best) triggers.push(best);
    else cleared.push(term.foodId);
  }

  let kind: VerdictKind = 'safe';
  for (const trigger of triggers) {
    const own = triggerVerdict(trigger);
    if (KIND_RANK[own] > KIND_RANK[kind]) kind = own;
  }

  const conditionNotes: ConditionNote[] = [];
  const labelText = `${ingredientsText} ${allergenText}`;
  for (const conditionId of activeConditions) {
    for (const rule of CONDITION_RULES[conditionId] ?? []) {
      for (const word of rule.terms) {
        const matched = findTerm(labelText, normalize(word));
        if (matched && !conditionNotes.some((note) => note.conditionId === conditionId && note.matchedText === matched)) {
          conditionNotes.push({ conditionId, matchedText: matched, advice: rule.advice });
        }
      }
    }
  }
  if (kind === 'safe' && conditionNotes.some((note) => note.advice === 'avoid')) kind = 'caution';
  if (kind === 'safe' && incomplete) kind = 'unknown';

  return { kind, triggers, clearedIngredientIds: cleared, conditionNotes, incomplete };
}
