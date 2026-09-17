import type {
  BirthDate,
  BmiCategory,
  BodyMetrics,
  Gender,
  Nutrition,
  NutritionGoals,
  RingStatus,
} from '@/types';
import { addDays, ageFromBirthDate, dayKey } from '@/utils/date';

/**
 * Pure nutrition maths shared by the mock services, the Home dashboard and
 * Insights. Nothing here touches storage so every rule is unit tested.
 */

export const EMPTY_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

/** Goals shown until the user generates their own from their body metrics. */
export const DEFAULT_GOALS: NutritionGoals = {
  calories: 2773,
  protein: 173,
  carbs: 346,
  fat: 77,
  fiber: 38,
  sugar: 103,
  sodium: 2300,
};

export const EMPTY_BODY: BodyMetrics = {
  currentWeightLbs: null,
  goalWeightLbs: null,
  heightInches: null,
  gender: null,
  dailyStepGoal: 10000,
};

/** Body metrics for the "active user" mock data set. */
export const DEMO_BODY: BodyMetrics = {
  currentWeightLbs: 120,
  goalWeightLbs: 160,
  heightInches: 66,
  gender: 'male',
  dailyStepGoal: 10000,
};

export const NUTRIENT_KEYS = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'] as const;
export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

export function sumNutrition(items: (Nutrition | undefined)[]): Nutrition {
  const total = { ...EMPTY_NUTRITION };
  for (const item of items) {
    if (!item) continue;
    for (const key of NUTRIENT_KEYS) total[key] += item[key] ?? 0;
  }
  for (const key of NUTRIENT_KEYS) total[key] = Math.round(total[key]);
  return total;
}

/** Calories provided by each macro (4 / 4 / 9 kcal per gram). */
export function macroCalories(n: Nutrition): { protein: number; carbs: number; fat: number } {
  return { protein: n.protein * 4, carbs: n.carbs * 4, fat: n.fat * 9 };
}

/**
 * Ring colour for one day, as explained on "Ring Colors Explained":
 * green when 100 calories or fewer are left (or slightly over), yellow within
 * 200 calories, red with more than 200 left, dotted when nothing was logged.
 */
export function ringStatus(eatenCalories: number, goalCalories: number, mealsLogged: number): RingStatus {
  if (mealsLogged <= 0) return 'none';
  const left = goalCalories - eatenCalories;
  if (left > 200) return 'red';
  if (left > 100) return 'yellow';
  if (left >= -200) return 'green';
  return 'red';
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

export function kgToLbs(kg: number): number {
  return kg / 0.45359237;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function computeBmi(weightLbs: number | null, heightInches: number | null): number | null {
  if (!weightLbs || !heightInches || weightLbs <= 0 || heightInches <= 0) return null;
  const metres = inchesToCm(heightInches) / 100;
  return Math.round((lbsToKg(weightLbs) / (metres * metres)) * 10) / 10;
}

export function bmiCategory(value: number | null): BmiCategory | null {
  if (value === null) return null;
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'healthy';
  if (value < 30) return 'overweight';
  return 'obese';
}

/** Position of a BMI value on the 4-band scale bar, 0..1 (bands: <18.5, 18.5-25, 25-30, >30). */
export function bmiScalePosition(value: number): number {
  const clamped = Math.min(40, Math.max(10, value));
  const bands: [number, number][] = [
    [10, 18.5],
    [18.5, 25],
    [25, 30],
    [30, 40],
  ];
  for (let index = 0; index < bands.length; index += 1) {
    const [start, end] = bands[index]!;
    if (clamped <= end) return (index + (clamped - start) / (end - start)) / bands.length;
  }
  return 1;
}

const ACTIVITY_FACTOR = 1.375; // light activity
const CALORIES_PER_LB_PER_WEEK = 500; // ~1 lb a week

/**
 * Daily goals from body metrics (Mifflin-St Jeor resting energy, light
 * activity, then +/- 500 kcal a day towards a weight goal). Macros split
 * 25% protein / 50% carbs / 25% fat; fibre 14 g per 1000 kcal; sugar 15% of
 * calories; sodium 2300 mg. Returns null when the metrics are incomplete.
 */
export function generateGoals(
  body: BodyMetrics,
  birthDate: BirthDate | null,
  now = new Date(),
): NutritionGoals | null {
  const { currentWeightLbs, goalWeightLbs, heightInches, gender } = body;
  if (!currentWeightLbs || !heightInches) return null;
  const age = birthDate ? ageFromBirthDate(birthDate, now) : 30;
  const kg = lbsToKg(currentWeightLbs);
  const cm = inchesToCm(heightInches);
  const base = 10 * kg + 6.25 * cm - 5 * age;
  const resting = base + genderOffset(gender);
  const maintenance = resting * ACTIVITY_FACTOR;
  const delta =
    goalWeightLbs === null || goalWeightLbs === currentWeightLbs
      ? 0
      : goalWeightLbs > currentWeightLbs
        ? CALORIES_PER_LB_PER_WEEK
        : -CALORIES_PER_LB_PER_WEEK;
  const calories = Math.max(1200, Math.round(maintenance + delta));
  return {
    calories,
    protein: Math.round((calories * 0.25) / 4),
    carbs: Math.round((calories * 0.5) / 4),
    fat: Math.round((calories * 0.25) / 9),
    fiber: Math.round((calories / 1000) * 14),
    sugar: Math.round((calories * 0.15) / 4),
    sodium: 2300,
  };
}

function genderOffset(gender: Gender | null): number {
  if (gender === 'female') return -161;
  if (gender === 'male') return 5;
  return -78;
}

/** Keeps calories in step with the macros when "auto adjust macros" is on. */
export function caloriesFromMacros(goals: NutritionGoals): number {
  const { protein, carbs, fat } = macroCalories(goals);
  return Math.round(protein + carbs + fat);
}

/**
 * Re-balances the other macros when one of them changes so the calorie goal
 * stays the same (auto adjust). Returns the goals unchanged when it cannot.
 */
export function rebalanceMacros(
  goals: NutritionGoals,
  changed: 'protein' | 'carbs' | 'fat',
  value: number,
): NutritionGoals {
  const next = { ...goals, [changed]: Math.max(0, Math.round(value)) };
  const perGram = { protein: 4, carbs: 4, fat: 9 } as const;
  const others = (['protein', 'carbs', 'fat'] as const).filter((key) => key !== changed);
  const remaining = goals.calories - next[changed] * perGram[changed];
  const current = others.reduce((sum, key) => sum + goals[key] * perGram[key], 0);
  if (remaining <= 0 || current <= 0) return next;
  const scale = remaining / current;
  for (const key of others) next[key] = Math.max(0, Math.round(goals[key] * scale));
  return next;
}

/** Date the goal weight is reached at about one pound a week, or null without a goal. */
export function goalDate(
  currentLbs: number | null,
  goalLbs: number | null,
  now = new Date(),
): string | null {
  if (currentLbs === null || goalLbs === null) return null;
  const weeks = Math.abs(goalLbs - currentLbs);
  if (weeks === 0) return dayKey(now);
  return dayKey(addDays(now, Math.ceil(weeks * 7)));
}

/** Share of the way from the start weight to the goal, 0..1. */
export function goalPercent(startLbs: number, currentLbs: number, goalLbs: number): number {
  const span = goalLbs - startLbs;
  if (span === 0) return currentLbs === goalLbs ? 1 : 0;
  return Math.min(1, Math.max(0, (currentLbs - startLbs) / span));
}

/** Calories credited for steps (only the part above a sedentary baseline counts). */
export function stepCalories(steps: number): number {
  return Math.max(0, Math.round((steps - 4000) * 0.0095));
}

/** Health score 1..10 for a day: the average of what was logged, null with no logs. */
export function dayHealthScore(scores: (number | undefined)[]): number | null {
  const known = scores.filter((score): score is number => typeof score === 'number');
  if (known.length === 0) return null;
  const mean = known.reduce((sum, score) => sum + score, 0) / known.length;
  return Math.round(Math.min(10, Math.max(1, mean)));
}

export function formatHeight(inches: number | null): string | null {
  if (inches === null) return null;
  const feet = Math.floor(inches / 12);
  const rest = Math.round(inches - feet * 12);
  return `${feet} ft ${rest} in`;
}

export function ouncesToCups(ounces: number): number {
  return Math.round((ounces / 8) * 10) / 10;
}
