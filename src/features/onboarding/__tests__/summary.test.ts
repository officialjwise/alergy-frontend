import { buildProfileFromAnswers } from '../buildProfile';
import { summaryRows } from '../summary';
import { emptyAnswers } from '@/store/onboardingStore';
import type { OnboardingAnswers } from '@/types';

const t = ((key: string) => key) as unknown as Parameters<typeof summaryRows>[1];

const answers: OnboardingAnswers = {
  ...emptyAnswers,
  profileFor: 'child',
  profileName: 'Ada',
  ingredients: ['peanuts', 'milk', 'custom_1'],
  customIngredients: {
    custom_1: {
      id: 'custom_1',
      name: 'Quinoa',
      aliases: ['quinoa'],
      category: 'grains',
      icon: 'wheat',
      isCustom: true,
    },
  },
  severities: { peanuts: 'anaphylaxis' },
  cautionLevel: 'cross_contact',
  diet: 'halal',
  goal: 'know_instantly',
};

describe('summaryRows', () => {
  it('uses the real answers and hides empty rows', () => {
    const rows = summaryRows(answers, t);
    expect(rows.map((r) => r.key)).toEqual(['avoid', 'protection', 'diet', 'goal']);
    expect(rows[0]?.value).toBe('Peanuts, Milk, Quinoa');
    expect(rows[1]?.value).toBe('ready.protection_cross_contact');
    expect(summaryRows({ ...emptyAnswers, diet: 'none' }, t)).toEqual([]);
  });
});

describe('buildProfileFromAnswers', () => {
  it('maps answers to a profile with default severities and the chosen name', () => {
    const profile = buildProfileFromAnswers(answers, 1, 'Me');
    expect(profile.name).toBe('Ada');
    expect(profile.profileFor).toBe('child');
    expect(profile.restrictions).toEqual([
      { ingredientId: 'peanuts', name: 'Peanuts', severity: 'anaphylaxis' },
      { ingredientId: 'milk', name: 'Milk', severity: 'moderate' },
      { ingredientId: 'custom_1', name: 'Quinoa', severity: 'moderate' },
    ]);
    expect(profile.diet).toBe('halal');
    expect(profile.cautionLevel).toBe('cross_contact');
  });

  it('falls back to the default name and caution level', () => {
    const profile = buildProfileFromAnswers({ ...emptyAnswers, profileFor: 'myself' }, 0, 'Me');
    expect(profile.name).toBe('Me');
    expect(profile.cautionLevel).toBe('may_contain');
    expect(profile.diet).toBe('none');
  });
});
