import { evaluateProduct } from '../verdictEngine';
import { productById } from '@/mocks/products';
import type { AvoidedFood, UserProfile } from '@/types';

const food = (patch: Partial<AvoidedFood>): AvoidedFood => ({
  id: 'peanuts',
  name: 'Peanuts',
  allergenId: 'peanuts',
  byNameOnly: false,
  kind: 'allergy',
  kindAssumed: false,
  worst: 'severe',
  severityAssumed: false,
  strictness: null,
  doctorConfirmed: null,
  level: 'high',
  addedAt: '',
  updatedAt: '',
  ...patch,
});

const baseProfile: UserProfile = {
  id: 'p1',
  name: 'Me',
  profileFor: 'myself',
  isAccountHolder: true,
  birthDate: null,
  hasAllergies: 'yes',
  foods: [food({})],
  conditions: [],
  note: '',
  questionnaireVersion: 2,
  answers: null,
  emergencyContact: null,
  doctor: '',
  reactionFreeGoalDays: 30,
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
  it('shows a product containing a high risk food as High risk', () => {
    const verdict = evaluateProduct(product('p-granola-bar'), baseProfile);
    expect(verdict.kind).toBe('unsafe');
    expect(verdict.triggers[0]).toMatchObject({ ingredientId: 'peanuts', kind: 'contains', level: 'high' });
  });

  it('shows a product containing a warning-level food as a Warning', () => {
    const verdict = evaluateProduct(product('p-granola-bar'), {
      ...baseProfile,
      foods: [food({ worst: 'mild', level: 'warning' })],
    });
    expect(verdict.kind).toBe('caution');
  });

  it('treats may-contain as high risk for a high risk food and as a warning otherwise', () => {
    expect(evaluateProduct(product('p-dark-chocolate'), baseProfile).kind).toBe('unsafe');
    const mild = evaluateProduct(product('p-dark-chocolate'), {
      ...baseProfile,
      foods: [food({ worst: 'mild', level: 'warning' })],
    });
    expect(mild.kind).toBe('caution');
    expect(mild.triggers[0]?.kind).toBe('may_contain');
  });

  it('checks typed-in foods by name only', () => {
    const verdict = evaluateProduct(product('p-hummus'), {
      ...baseProfile,
      foods: [food({ id: 'custom_tahini', name: 'tahini', allergenId: null, byNameOnly: true, kind: 'choice', worst: null, strictness: 'strict' })],
    });
    expect(verdict.kind).toBe('unsafe');
    expect(verdict.triggers[0]).toMatchObject({ ingredientName: 'tahini', byNameOnly: true });
  });

  it('adds condition notes and turns a safe result into a warning for "avoid" advice', () => {
    const profile: UserProfile = {
      ...baseProfile,
      foods: [],
      conditions: [{ id: 'coeliac', temporary: false, endsAt: null, confirmedAt: null, addedAt: '' }],
    };
    const verdict = evaluateProduct(product('p-sourdough'), profile);
    expect(verdict.kind).toBe('caution');
    expect(verdict.conditionNotes[0]).toMatchObject({ conditionId: 'coeliac', advice: 'avoid' });
    // Conditions that are not active (email not confirmed) add nothing.
    expect(evaluateProduct(product('p-sourdough'), profile, []).kind).toBe('safe');
  });

  it('returns unknown for unreadable labels', () => {
    const verdict = evaluateProduct(product('p-mystery-label'), baseProfile);
    expect(verdict.kind).toBe('unknown');
    expect(verdict.incomplete).toBe(true);
  });
});
