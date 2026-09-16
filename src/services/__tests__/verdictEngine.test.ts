import { evaluateProduct } from '../verdictEngine';
import { productById } from '@/mocks/products';
import type { UserProfile } from '@/types';

const baseProfile: UserProfile = {
  id: 'p1',
  name: 'Me',
  profileFor: 'myself',
  birthDate: null,
  restrictions: [{ ingredientId: 'peanuts', name: 'Peanuts', severity: 'severe' }],
  customIngredients: {},
  reasons: ['allergy'],
  cautionLevel: 'ingredient',
  diet: 'none',
  goal: null,
  rememberFoods: true,
  color: '#000',
  createdAt: '',
  updatedAt: '',
};

const product = (id: string) => {
  const p = productById(id);
  if (!p) throw new Error(`missing product ${id}`);
  return p;
};

describe('verdict engine', () => {
  it('flags a direct ingredient match as unsafe', () => {
    const verdict = evaluateProduct(product('p-granola-bar'), baseProfile);
    expect(verdict.kind).toBe('unsafe');
    expect(verdict.triggers[0]).toMatchObject({ ingredientId: 'peanuts', kind: 'contains' });
  });

  it('ignores may-contain at the lowest caution level and flags it when cautious', () => {
    const relaxed = evaluateProduct(product('p-dark-chocolate'), baseProfile);
    expect(relaxed.kind).toBe('safe');
    const cautious = evaluateProduct(product('p-dark-chocolate'), {
      ...baseProfile,
      cautionLevel: 'may_contain',
    });
    expect(cautious.kind).toBe('caution');
  });

  it('treats may-contain as unsafe for anaphylaxis', () => {
    const verdict = evaluateProduct(product('p-dark-chocolate'), {
      ...baseProfile,
      cautionLevel: 'may_contain',
      restrictions: [{ ingredientId: 'peanuts', name: 'Peanuts', severity: 'anaphylaxis' }],
    });
    expect(verdict.kind).toBe('unsafe');
  });

  it('applies diet rules', () => {
    const verdict = evaluateProduct(product('p-gummy-bears'), { ...baseProfile, diet: 'halal' });
    expect(verdict.kind).toBe('unsafe');
    expect(verdict.triggers.some((t) => t.ingredientName === 'Halal')).toBe(true);
  });

  it('returns unknown for unreadable labels', () => {
    expect(evaluateProduct(product('p-mystery-label'), baseProfile).kind).toBe('unknown');
  });

  it('clears a clean product', () => {
    const verdict = evaluateProduct(product('p-rice-cakes'), baseProfile);
    expect(verdict.kind).toBe('safe');
    expect(verdict.clearedIngredientIds).toEqual(['peanuts']);
  });
});
