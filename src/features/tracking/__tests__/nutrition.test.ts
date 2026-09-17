import {
  bmiCategory,
  bmiScalePosition,
  computeBmi,
  dayHealthScore,
  formatHeight,
  generateGoals,
  goalDate,
  goalPercent,
  rebalanceMacros,
  ringStatus,
  stepCalories,
  sumNutrition,
} from '../nutrition';

describe('ringStatus', () => {
  it('is dotted when nothing was logged', () => {
    expect(ringStatus(0, 2773, 0)).toBe('none');
  });
  it('is green within 100 calories of the goal or slightly over', () => {
    expect(ringStatus(2700, 2773, 2)).toBe('green');
    expect(ringStatus(2850, 2773, 2)).toBe('green');
  });
  it('is yellow within 200 calories and red beyond', () => {
    expect(ringStatus(2600, 2773, 1)).toBe('yellow');
    expect(ringStatus(500, 2773, 1)).toBe('red');
    expect(ringStatus(3500, 2773, 1)).toBe('red');
  });
});

describe('bmi', () => {
  it('matches the reference (120 lbs, 5 ft 6 in -> 19.4 healthy)', () => {
    const value = computeBmi(120, 66);
    expect(value).toBe(19.4);
    expect(bmiCategory(value)).toBe('healthy');
  });
  it('returns null without metrics', () => {
    expect(computeBmi(null, 66)).toBeNull();
    expect(bmiCategory(null)).toBeNull();
  });
  it('places the marker inside the right band', () => {
    expect(bmiScalePosition(18.5)).toBeCloseTo(0.25);
    expect(bmiScalePosition(30)).toBeCloseTo(0.75);
    expect(bmiScalePosition(45)).toBe(1);
  });
});

describe('generateGoals', () => {
  const body = { currentWeightLbs: 120, goalWeightLbs: 160, heightInches: 66, gender: 'male' as const, dailyStepGoal: 10000 };
  it('builds a surplus for a gain goal and splits the macros', () => {
    const goals = generateGoals(body, { year: 2000, month: 1, day: 1 }, new Date(2026, 8, 17));
    expect(goals).not.toBeNull();
    expect(goals!.calories).toBeGreaterThan(2400);
    expect(goals!.protein * 4 + goals!.carbs * 4 + goals!.fat * 9).toBeCloseTo(goals!.calories, -2);
    expect(goals!.sodium).toBe(2300);
  });
  it('needs a weight and a height', () => {
    expect(generateGoals({ ...body, heightInches: null }, null)).toBeNull();
  });
});

describe('rebalanceMacros', () => {
  it('keeps the calorie goal when one macro changes', () => {
    const goals = { calories: 2000, protein: 125, carbs: 250, fat: 56, fiber: 28, sugar: 75, sodium: 2300 };
    const next = rebalanceMacros(goals, 'protein', 200);
    expect(next.protein).toBe(200);
    expect(next.protein * 4 + next.carbs * 4 + next.fat * 9).toBeCloseTo(2000, -1);
  });
});

describe('weight goal helpers', () => {
  it('reaches the goal at one pound a week', () => {
    expect(goalDate(120, 160, new Date(2026, 8, 16))).toBe('2027-06-23');
    expect(goalDate(120, null)).toBeNull();
  });
  it('reports progress as a share of the span', () => {
    expect(goalPercent(120, 120, 160)).toBe(0);
    expect(goalPercent(120, 140, 160)).toBe(0.5);
    expect(goalPercent(120, 170, 160)).toBe(1);
  });
});

describe('misc', () => {
  it('sums nutrition and ignores missing items', () => {
    const a = { calories: 100, protein: 5, carbs: 10, fat: 2, fiber: 1, sugar: 3, sodium: 50 };
    expect(sumNutrition([a, undefined, a]).calories).toBe(200);
  });
  it('credits steps above the baseline', () => {
    expect(stepCalories(12430)).toBe(80);
    expect(stepCalories(1000)).toBe(0);
  });
  it('averages health scores and formats heights', () => {
    expect(dayHealthScore([7, 9, undefined])).toBe(8);
    expect(dayHealthScore([])).toBeNull();
    expect(formatHeight(66)).toBe('5 ft 6 in');
  });
});
