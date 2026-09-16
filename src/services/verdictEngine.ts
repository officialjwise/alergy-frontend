import { INGREDIENTS } from '@/mocks/ingredients';
import type {
  Diet,
  Ingredient,
  Product,
  Restriction,
  Severity,
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
 * results ("why is this unsafe") while the API is being built.
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

const UNCLEAR_TERMS = [
  'natural flavor',
  'natural flavour',
  'spices',
  'seasoning',
  'vegetable fat',
  'flavoring',
  'flavouring',
  '...',
];

const DIET_RULES: Partial<
  Record<Diet, { name: string; ingredientIds: string[]; aliases: string[] }>
> = {
  halal: {
    name: 'Halal',
    ingredientIds: ['pork', 'alcohol', 'gelatin'],
    aliases: [
      'pork',
      'bacon',
      'ham',
      'lard',
      'gelatin',
      'gelatine',
      'alcohol',
      'wine',
      'beer',
      'rum',
      'ethanol',
    ],
  },
  kosher: {
    name: 'Kosher',
    ingredientIds: ['pork', 'shellfish', 'molluscs', 'gelatin'],
    aliases: [
      'pork',
      'bacon',
      'ham',
      'lard',
      'shrimp',
      'prawn',
      'crab',
      'lobster',
      'gelatin',
      'gelatine',
      'oyster',
      'clam',
      'squid',
    ],
  },
  vegetarian: {
    name: 'Vegetarian',
    ingredientIds: ['pork', 'beef', 'chicken', 'fish', 'shellfish', 'molluscs', 'gelatin'],
    aliases: [
      'pork',
      'bacon',
      'ham',
      'lard',
      'beef',
      'chicken',
      'chicken stock',
      'chicken bones',
      'fish',
      'anchovy',
      'anchovies',
      'fish sauce',
      'shrimp',
      'prawn',
      'crab',
      'lobster',
      'gelatin',
      'gelatine',
      'tallow',
      'suet',
      'shrimp paste',
    ],
  },
  vegan: {
    name: 'Vegan',
    ingredientIds: [
      'pork',
      'beef',
      'chicken',
      'fish',
      'shellfish',
      'molluscs',
      'gelatin',
      'milk',
      'eggs',
      'honey',
    ],
    aliases: [
      'pork',
      'bacon',
      'ham',
      'lard',
      'beef',
      'chicken',
      'chicken stock',
      'chicken bones',
      'fish',
      'anchovy',
      'anchovies',
      'fish sauce',
      'shrimp',
      'prawn',
      'crab',
      'lobster',
      'gelatin',
      'gelatine',
      'tallow',
      'milk',
      'whey',
      'casein',
      'butter',
      'cream',
      'cheese',
      'yogurt',
      'egg',
      'albumin',
      'honey',
      'milk protein',
      'shrimp paste',
    ],
  },
  pescatarian: {
    name: 'Pescatarian',
    ingredientIds: ['pork', 'beef', 'chicken', 'gelatin'],
    aliases: [
      'pork',
      'bacon',
      'ham',
      'lard',
      'beef',
      'chicken',
      'chicken stock',
      'chicken bones',
      'gelatin',
      'gelatine',
      'tallow',
    ],
  },
  gluten_free: {
    name: 'Gluten-free',
    ingredientIds: ['gluten', 'wheat', 'barley', 'rye'],
    aliases: [
      'wheat',
      'wheat flour',
      'flour',
      'barley',
      'rye',
      'malt',
      'spelt',
      'wheat gluten',
      'semolina',
      'seitan',
    ],
  },
  dairy_free: {
    name: 'Dairy-free',
    ingredientIds: ['milk', 'lactose'],
    aliases: [
      'milk',
      'whey',
      'casein',
      'butter',
      'cream',
      'cheese',
      'yogurt',
      'lactose',
      'milk protein',
      'milk powder',
    ],
  },
};

const SEVERITY_RANK: Record<Severity, number> = { mild: 0, moderate: 1, severe: 2, anaphylaxis: 3 };

interface Term {
  ingredientId: string;
  ingredientName: string;
  severity: Severity;
  terms: string[];
}

function termsForProfile(profile: UserProfile): Term[] {
  const catalogue = new Map<string, Ingredient>(INGREDIENTS.map((i) => [i.id, i]));
  Object.values(profile.customIngredients).forEach((custom) => catalogue.set(custom.id, custom));

  const list: Term[] = profile.restrictions.map((restriction: Restriction) => {
    const ingredient = catalogue.get(restriction.ingredientId);
    const words = ingredient ? [ingredient.name, ...ingredient.aliases] : [restriction.name];
    return {
      ingredientId: restriction.ingredientId,
      ingredientName: restriction.name,
      severity: restriction.severity,
      terms: words.map(normalize).filter(Boolean),
    };
  });

  const dietRule = DIET_RULES[profile.diet];
  if (dietRule) {
    list.push({
      ingredientId: `diet:${profile.diet}`,
      ingredientName: dietRule.name,
      severity: 'moderate',
      terms: dietRule.aliases.map(normalize),
    });
  }
  return list;
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

export function evaluateProduct(product: Product, profile: UserProfile): Verdict {
  const ingredientsText = normalize(product.ingredientsText);
  const allergenText = normalize(product.allergenStatement ?? '');
  const mayContainText = normalize(product.mayContain.join(', '));
  const combinedStatement = `${allergenText} ${mayContainText}`;

  const containsStatement = allergenText.split(/\bmay contain\b/)[0] ?? '';
  const mayContainStatement = `${allergenText.split(/\bmay contain\b/)[1] ?? ''} ${mayContainText}`;
  const crossContact = CROSS_CONTACT_PHRASES.some((p) => allergenText.includes(p));

  const triggers: VerdictTrigger[] = [];
  const cleared: string[] = [];
  const incomplete =
    product.ingredientsText.includes('...') || product.ingredientsText.trim().length < 12;

  for (const term of termsForProfile(profile)) {
    let best: VerdictTrigger | null = null;
    const consider = (kind: TriggerKind, matchedText: string) => {
      if (!best || kindRank(kind) > kindRank(best.kind)) {
        best = {
          ingredientId: term.ingredientId,
          ingredientName: term.ingredientName,
          matchedText,
          kind,
          severity: term.severity,
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
    else cleared.push(term.ingredientId);
  }

  // Caution level decides which trigger kinds count.
  const level = profile.cautionLevel;
  const counts = (kind: TriggerKind): boolean => {
    if (kind === 'contains') return true;
    if (kind === 'may_contain') return level !== 'ingredient';
    if (kind === 'cross_contact') return level === 'cross_contact' || level === 'uncertain';
    return level === 'uncertain';
  };
  const relevant = triggers.filter((t) => counts(t.kind));

  let kind: VerdictKind = 'safe';
  if (relevant.some((t) => t.kind === 'contains')) kind = 'unsafe';
  else if (
    relevant.some(
      (t) => t.kind !== 'contains' && SEVERITY_RANK[t.severity] >= SEVERITY_RANK.anaphylaxis,
    )
  )
    kind = 'unsafe';
  else if (relevant.length > 0) kind = 'caution';

  const hasUnclear = UNCLEAR_TERMS.some((term) => ingredientsText.includes(term));
  if (kind === 'safe' && (incomplete || (level === 'uncertain' && hasUnclear))) {
    kind = incomplete ? 'unknown' : 'caution';
    if (!incomplete && profile.restrictions[0]) {
      relevant.push({
        ingredientId: 'unclear',
        ingredientName: profile.restrictions[0].name,
        matchedText: UNCLEAR_TERMS.find((term) => ingredientsText.includes(term)) ?? '',
        kind: 'unclear',
        severity: 'mild',
      });
    }
  }

  return { kind, triggers: relevant, clearedIngredientIds: cleared, incomplete };
}
