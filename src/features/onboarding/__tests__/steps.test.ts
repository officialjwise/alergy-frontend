import { activeSteps, stepPosition } from '../steps';
import { emptyAnswers } from '@/store/onboardingStore';
import type { QuestionnaireAnswers } from '@/types';

const withFoods: QuestionnaireAnswers = {
  ...emptyAnswers,
  target: 'me',
  hasAllergies: 'yes',
  pickedFoods: ['peanuts', 'milk'],
  perFood: {
    peanuts: { kind: 'allergy', kindUnsure: false, worst: null, strictness: null, doctorConfirmed: null },
    milk: { kind: 'choice', kindUnsure: false, worst: null, strictness: null, doctorConfirmed: null },
  },
  hasConditions: true,
  conditions: ['pregnancy', 'diabetes'],
};

describe('questionnaire steps', () => {
  it('hides the food questions until the person has foods to avoid', () => {
    const keys = activeSteps({ ...emptyAnswers, hasAllergies: 'no' }).map((s) => s.key);
    expect(keys).not.toContain('foods');
    expect(keys.filter((key) => key.startsWith('food-'))).toEqual([]);
    expect(keys).toContain('conditions');
  });

  it('repeats questions 5 to 8 per food and 7 only for foods avoided by choice', () => {
    const keys = activeSteps(withFoods).map((s) => s.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'food-reaction:peanuts',
        'food-worst:peanuts',
        'food-doctor:peanuts',
        'food-reaction:milk',
        'food-strictness:milk',
      ]),
    );
    expect(keys).not.toContain('food-worst:milk');
    expect(keys).not.toContain('food-doctor:milk');
  });

  it('asks the end date only for temporary conditions', () => {
    const keys = activeSteps(withFoods).map((s) => s.key);
    expect(keys).toContain('condition-end:pregnancy');
    expect(keys).not.toContain('condition-end:diabetes');
  });

  it('carries the id as a route param and keeps progress increasing', () => {
    const step = activeSteps(withFoods).find((s) => s.key === 'food-worst:peanuts');
    expect(step).toMatchObject({ route: 'food-worst', params: { id: 'peanuts' } });
    const before = stepPosition('food-reaction:peanuts', withFoods).progress;
    const after = stepPosition('food-worst:peanuts', withFoods).progress;
    expect(after).toBeGreaterThan(before);
    expect(stepPosition('note', withFoods).previous?.key).toBe('condition-end:pregnancy');
  });
});
