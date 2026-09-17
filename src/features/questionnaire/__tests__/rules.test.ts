import { QUESTIONNAIRE_VERSION } from '../definition';
import {
  conditionNeedsCheck,
  foodIds,
  mergeProfile,
  resolveFoodAnswers,
  resolveTypedFood,
  riskLevel,
  validateAnswers,
} from '../rules';
import { emptyAnswers } from '@/store/onboardingStore';
import type { QuestionnaireAnswers, UserProfile } from '@/types';

const ctx = { now: '2026-09-17T10:00:00.000Z', newId: 'p_new', color: '#000', emailConfirmed: true };

describe('riskLevel', () => {
  it('shows severe, treated and unsure reactions as high risk and mild as a warning', () => {
    expect(riskLevel('allergy', 'severe', null)).toBe('high');
    expect(riskLevel('allergy', 'treatment', null)).toBe('high');
    expect(riskLevel('intolerance', 'unsure', null)).toBe('high');
    expect(riskLevel('sensitivity', 'mild', null)).toBe('warning');
  });
  it('uses strictness for foods avoided by choice', () => {
    expect(riskLevel('choice', null, 'strict')).toBe('high');
    expect(riskLevel('choice', null, 'prefers')).toBe('warning');
  });
});

describe('resolveFoodAnswers', () => {
  it('treats not sure as an allergy and as severe', () => {
    const resolved = resolveFoodAnswers({ kind: 'allergy', kindUnsure: true, worst: 'unsure', strictness: null, doctorConfirmed: null });
    expect(resolved).toMatchObject({ kind: 'allergy', kindAssumed: true, severityAssumed: true, level: 'high' });
  });
  it('is null while answers are missing', () => {
    expect(resolveFoodAnswers({ kind: 'allergy', kindUnsure: false, worst: null, strictness: null, doctorConfirmed: null })).toBeNull();
    expect(resolveFoodAnswers({ kind: 'choice', kindUnsure: false, worst: null, strictness: null, doctorConfirmed: null })).toBeNull();
  });
});

describe('resolveTypedFood', () => {
  it('switches names the catalogue knows to the allergen', () => {
    expect(resolveTypedFood('prawns')).toEqual({ kind: 'known', allergenId: 'shellfish' });
    expect(resolveTypedFood('Celeriac')).toEqual({ kind: 'known', allergenId: 'celery' });
    expect(resolveTypedFood('egg')).toEqual({ kind: 'known', allergenId: 'eggs' });
  });
  it('keeps unknown foods as typed and refuses words on every label', () => {
    expect(resolveTypedFood('plantain')).toEqual({ kind: 'known', allergenId: 'banana' });
    expect(resolveTypedFood('dragon fruit')).toEqual({ kind: 'custom', id: 'custom_dragon-fruit' });
    expect(resolveTypedFood('water')).toEqual({ kind: 'refused' });
    expect(resolveTypedFood('Natural flavouring')).toEqual({ kind: 'refused' });
  });
});

const answers: QuestionnaireAnswers = {
  ...emptyAnswers,
  target: 'me',
  hasAllergies: 'unsure',
  pickedFoods: ['peanuts'],
  typedFoods: [
    { text: 'prawns', resolution: { kind: 'known', allergenId: 'shellfish' } },
    { text: 'dragon fruit', resolution: { kind: 'custom', id: 'custom_dragon-fruit' } },
  ],
  perFood: {
    peanuts: { kind: 'allergy', kindUnsure: false, worst: 'severe', strictness: null, doctorConfirmed: 'yes' },
    shellfish: { kind: 'allergy', kindUnsure: true, worst: 'unsure', strictness: null, doctorConfirmed: null },
    'custom_dragon-fruit': { kind: 'choice', kindUnsure: false, worst: null, strictness: 'prefers', doctorConfirmed: null },
  },
  hasConditions: true,
  conditions: ['pregnancy'],
  conditionEnds: { pregnancy: '2027-01-10' },
  note: 'carries an EpiPen',
};

describe('mergeProfile', () => {
  it('builds foods with levels and the section 5 messages', () => {
    expect(foodIds(answers)).toEqual(['peanuts', 'shellfish', 'custom_dragon-fruit']);
    const { profile, messages } = mergeProfile(answers, null, { ...ctx, emailConfirmed: false });
    expect(profile.foods.map((food) => [food.id, food.level, food.byNameOnly])).toEqual([
      ['peanuts', 'high', false],
      ['shellfish', 'high', false],
      ['custom_dragon-fruit', 'warning', true],
    ]);
    expect(profile.foods[1]).toMatchObject({ name: 'Crustaceans', kindAssumed: true, severityAssumed: true });
    expect(profile.conditions[0]).toMatchObject({ id: 'pregnancy', temporary: true, endsAt: '2027-01-10' });
    expect(profile.questionnaireVersion).toBe(QUESTIONNAIRE_VERSION);
    expect(profile.note).toBe('carries an EpiPen');
    expect(messages.sort()).toEqual(['by_name_only', 'confirm_email', 'known_food', 'see_doctor', 'severe_assumed']);
  });

  it('never removes earlier entries when answering again', () => {
    const first = mergeProfile(answers, null, ctx).profile;
    const again: QuestionnaireAnswers = { ...answers, hasAllergies: 'yes', pickedFoods: ['milk'], typedFoods: [], perFood: { milk: { kind: 'intolerance', kindUnsure: false, worst: 'mild', strictness: null, doctorConfirmed: null } } };
    const { profile, messages } = mergeProfile(again, first, ctx);
    expect(profile.id).toBe(first.id);
    expect(profile.foods.map((food) => food.id).sort()).toEqual(['custom_dragon-fruit', 'milk', 'peanuts', 'shellfish']);
    expect(messages).toContain('earlier_entries');
  });
});

describe('validateAnswers', () => {
  it('lists what is missing so nothing is saved halfway', () => {
    const issues = validateAnswers({ ...answers, perFood: { peanuts: { kind: 'allergy', kindUnsure: false, worst: null, strictness: null, doctorConfirmed: null } } }, { canAddPerson: true });
    expect(issues).toEqual(expect.arrayContaining([{ code: 'food_worst', foodId: 'peanuts' }, { code: 'food_kind', foodId: 'shellfish' }]));
    expect(validateAnswers({ ...answers, target: 'other', personName: 'Ada' }, { canAddPerson: false })).toContainEqual({ code: 'plan_limit' });
    expect(validateAnswers(answers, { canAddPerson: true })).toEqual([]);
  });
});

describe('conditionNeedsCheck', () => {
  const condition: UserProfile['conditions'][number] = { id: 'pregnancy', temporary: true, endsAt: '2026-09-01', confirmedAt: null, addedAt: '2026-01-01' };
  it('asks two weeks after the end date and not before', () => {
    expect(conditionNeedsCheck(condition, '2026-09-10')).toBe(false);
    expect(conditionNeedsCheck(condition, '2026-09-15')).toBe(true);
    expect(conditionNeedsCheck({ ...condition, confirmedAt: '2026-09-16' }, '2026-09-20')).toBe(false);
    expect(conditionNeedsCheck({ ...condition, temporary: false }, '2026-12-01')).toBe(false);
  });
});
