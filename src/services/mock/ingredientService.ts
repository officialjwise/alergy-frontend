import { simulate } from './support';
import type { IngredientService } from '../types';
import { INGREDIENTS, SUGGESTED_INGREDIENT_IDS, ingredientById } from '@/mocks/ingredients';
import type { Ingredient } from '@/types';
import { normalize } from '@/utils/text';

function score(ingredient: Ingredient, query: string): number {
  const name = normalize(ingredient.name);
  if (name === query) return 100;
  if (name.startsWith(query)) return 80;
  if (name.includes(query)) return 60;
  const alias = ingredient.aliases.map(normalize);
  if (alias.some((a) => a === query)) return 50;
  if (alias.some((a) => a.startsWith(query))) return 40;
  if (alias.some((a) => a.includes(query))) return 20;
  return 0;
}

export function searchIngredientsSync(query: string, limit = 20): Ingredient[] {
  const q = normalize(query);
  if (!q) return SUGGESTED_INGREDIENT_IDS.map(ingredientById).filter((i): i is Ingredient => !!i);
  return INGREDIENTS.map((ingredient) => ({ ingredient, s: score(ingredient, q) }))
    .filter((entry) => entry.s > 0)
    .sort((a, b) => b.s - a.s || a.ingredient.name.localeCompare(b.ingredient.name))
    .slice(0, limit)
    .map((entry) => entry.ingredient);
}

export const mockIngredientService: IngredientService = {
  async search(query, limit = 20) {
    await simulate(0.4);
    return searchIngredientsSync(query, limit);
  },
  async getById(id) {
    await simulate(0.2);
    return ingredientById(id) ?? null;
  },
  async getByIds(ids) {
    await simulate(0.2);
    return ids.map(ingredientById).filter((i): i is Ingredient => !!i);
  },
  async suggested() {
    await simulate(0.3);
    return searchIngredientsSync('');
  },
};
