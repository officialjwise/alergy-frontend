import type { ConditionNote, HealthConditionId } from '@/types';

/**
 * Ingredients to limit or avoid for each health condition (question 10).
 * Matched against label text when a product is scanned. Clinical review of
 * these lists is outstanding (questionnaire, section 7).
 */
export interface ConditionRule {
  terms: string[];
  advice: ConditionNote['advice'];
}

export const CONDITION_RULES: Record<HealthConditionId, ConditionRule[]> = {
  diabetes: [
    {
      terms: ['sugar', 'glucose syrup', 'high fructose corn syrup', 'dextrose', 'honey', 'maltodextrin', 'corn syrup', 'invert sugar'],
      advice: 'limit',
    },
  ],
  kidney_disease: [
    { terms: ['salt', 'sodium', 'potassium chloride', 'phosphate', 'phosphoric acid', 'potassium'], advice: 'limit' },
  ],
  pregnancy: [
    { terms: ['alcohol', 'wine', 'beer', 'rum', 'brandy', 'liqueur', 'unpasteurised', 'unpasteurized', 'raw milk', 'liver', 'swordfish', 'marlin', 'shark'], advice: 'avoid' },
    { terms: ['caffeine', 'coffee', 'guarana', 'tuna'], advice: 'limit' },
  ],
  breastfeeding: [{ terms: ['alcohol', 'wine', 'beer', 'rum', 'caffeine', 'coffee', 'guarana'], advice: 'limit' }],
  high_blood_pressure: [{ terms: ['salt', 'sodium', 'monosodium glutamate', 'e621', 'brine'], advice: 'limit' }],
  heart_disease: [{ terms: ['salt', 'sodium', 'palm oil', 'butter', 'lard', 'hydrogenated', 'shortening', 'coconut oil'], advice: 'limit' }],
  coeliac: [{ terms: ['wheat', 'gluten', 'barley', 'rye', 'malt', 'spelt', 'semolina', 'seitan', 'couscous'], advice: 'avoid' }],
  ibs: [{ terms: ['onion', 'garlic', 'high fructose corn syrup', 'sorbitol', 'mannitol', 'xylitol', 'inulin', 'chicory'], advice: 'limit' }],
  gout: [{ terms: ['anchovy', 'anchovies', 'sardine', 'sardines', 'liver', 'yeast extract', 'beer', 'shellfish', 'shrimp', 'prawn'], advice: 'limit' }],
  pku: [{ terms: ['aspartame', 'phenylalanine', 'e951', 'milk protein', 'whey', 'casein', 'egg'], advice: 'avoid' }],
};
