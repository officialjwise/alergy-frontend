import { reviewFoods } from '../summary';
import { emptyAnswers } from '@/store/onboardingStore';
import type { QuestionnaireAnswers } from '@/types';

const t = ((key: string) => key) as unknown as Parameters<typeof reviewFoods>[1];

const answers: QuestionnaireAnswers = {
  ...emptyAnswers,
  hasAllergies: 'yes',
  pickedFoods: ['peanuts'],
  typedFoods: [{ text: 'dragon fruit', resolution: { kind: 'custom', id: 'custom_dragon-fruit' } }],
  perFood: {
    peanuts: { kind: 'allergy', kindUnsure: false, worst: 'mild', strictness: null, doctorConfirmed: null },
  },
};

describe('reviewFoods', () => {
  it('lists every food with its level and flags incomplete answers', () => {
    const rows = reviewFoods(answers, t);
    expect(rows).toEqual([
      { id: 'peanuts', name: 'Peanuts', level: 'warning', kindLabel: 'q5.allergy', byNameOnly: false, incomplete: false },
      { id: 'custom_dragon-fruit', name: 'dragon fruit', level: null, kindLabel: 'review.incomplete', byNameOnly: true, incomplete: true },
    ]);
    expect(reviewFoods({ ...answers, hasAllergies: 'no' }, t)).toEqual([]);
  });
});
