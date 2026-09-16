import type { IconName } from '@/components/ui/iconNames';
import type {
  AvoidReason,
  CautionLevel,
  Challenge,
  Diet,
  Frequency,
  Goal,
  OnboardingAnswers,
  WatchCategory,
} from '@/types';

/**
 * Every survey screen in the PDF is an instance of QuestionScreen driven by
 * one of these configs. `titleKey` supports i18next context (`_child`,
 * `_family`, `_care`) so copy adapts to who the profile is for.
 */
export interface QuestionOption<V extends string = string> {
  value: V;
  labelKey: string;
  icon: IconName;
}

export interface SingleQuestionConfig<K extends keyof OnboardingAnswers, V extends string> {
  kind: 'single';
  answerKey: K;
  titleKey: string;
  subtitleKey?: string;
  options: readonly QuestionOption<V>[];
  /** Long lists use the compact card density seen on the diet screen of the PDF. */
  compact?: boolean;
}

export interface MultiQuestionConfig<
  K extends 'watchFor' | 'reasons' | 'challenges',
  V extends string,
> {
  kind: 'multi';
  answerKey: K;
  titleKey: string;
  subtitleKey?: string;
  options: readonly QuestionOption<V>[];
  compact?: boolean;
}

export type QuestionConfig =
  | SingleQuestionConfig<'frequency', Frequency>
  | SingleQuestionConfig<'cautionLevel', CautionLevel>
  | SingleQuestionConfig<'diet', Diet>
  | SingleQuestionConfig<'goal', Goal>
  | MultiQuestionConfig<'watchFor', WatchCategory>
  | MultiQuestionConfig<'reasons', AvoidReason>
  | MultiQuestionConfig<'challenges', Challenge>;

export const frequencyQuestion: SingleQuestionConfig<'frequency', Frequency> = {
  kind: 'single',
  answerKey: 'frequency',
  titleKey: 'frequency.title',
  options: [
    { value: 'few_month', labelKey: 'frequency.few_month', icon: 'calendar' },
    { value: 'few_week', labelKey: 'frequency.few_week', icon: 'calendar' },
    { value: 'daily', labelKey: 'frequency.daily', icon: 'calendar' },
    { value: 'every_meal', labelKey: 'frequency.every_meal', icon: 'clock' },
  ],
};

export const watchForQuestion: MultiQuestionConfig<'watchFor', WatchCategory> = {
  kind: 'multi',
  answerKey: 'watchFor',
  titleKey: 'watchFor.title',
  subtitleKey: 'watchFor.subtitle',
  options: [
    { value: 'allergies', labelKey: 'watchFor.allergies', icon: 'peanut' },
    { value: 'intolerances', labelKey: 'watchFor.intolerances', icon: 'stomach' },
    { value: 'gluten', labelKey: 'watchFor.gluten', icon: 'wheat' },
    { value: 'religious', labelKey: 'watchFor.religious', icon: 'moon' },
    { value: 'vegetarian', labelKey: 'watchFor.vegetarian', icon: 'leaf' },
  ],
};

export const reasonsQuestion: MultiQuestionConfig<'reasons', AvoidReason> = {
  kind: 'multi',
  answerKey: 'reasons',
  titleKey: 'reasons.title',
  options: [
    { value: 'allergy', labelKey: 'reasons.allergy', icon: 'shield' },
    { value: 'intolerance', labelKey: 'reasons.intolerance', icon: 'stomach' },
    { value: 'religious', labelKey: 'reasons.religious', icon: 'pray' },
    { value: 'lifestyle', labelKey: 'reasons.lifestyle', icon: 'leaf' },
    { value: 'preference', labelKey: 'reasons.preference', icon: 'heart' },
  ],
};

export const cautionQuestion: SingleQuestionConfig<'cautionLevel', CautionLevel> = {
  kind: 'single',
  answerKey: 'cautionLevel',
  titleKey: 'caution.title',
  options: [
    { value: 'ingredient', labelKey: 'caution.ingredient', icon: 'eyeOff' },
    { value: 'may_contain', labelKey: 'caution.may_contain', icon: 'warning' },
    { value: 'cross_contact', labelKey: 'caution.cross_contact', icon: 'shieldCheck' },
    { value: 'uncertain', labelKey: 'caution.uncertain', icon: 'question' },
  ],
};

export const challengesQuestion: MultiQuestionConfig<'challenges', Challenge> = {
  kind: 'multi',
  answerKey: 'challenges',
  titleKey: 'challenges.title',
  options: [
    { value: 'labels', labelKey: 'challenges.labels', icon: 'document' },
    { value: 'hidden', labelKey: 'challenges.hidden', icon: 'search' },
    { value: 'cross_contact', labelKey: 'challenges.cross_contact', icon: 'link' },
    { value: 'restaurants', labelKey: 'challenges.restaurants', icon: 'restaurant' },
    { value: 'alternatives', labelKey: 'challenges.alternatives', icon: 'bulb' },
  ],
};

export const dietQuestion: SingleQuestionConfig<'diet', Diet> = {
  kind: 'single',
  answerKey: 'diet',
  titleKey: 'diet.title',
  compact: true,
  options: [
    { value: 'none', labelKey: 'diet.none', icon: 'ban' },
    { value: 'halal', labelKey: 'diet.halal', icon: 'moon' },
    { value: 'vegetarian', labelKey: 'diet.vegetarian', icon: 'leaf' },
    { value: 'vegan', labelKey: 'diet.vegan', icon: 'sprout' },
    { value: 'gluten_free', labelKey: 'diet.gluten_free', icon: 'wheat' },
    { value: 'dairy_free', labelKey: 'diet.dairy_free', icon: 'milk' },
    { value: 'low_fodmap', labelKey: 'diet.low_fodmap', icon: 'stomach' },
    { value: 'keto', labelKey: 'diet.keto', icon: 'avocado' },
    { value: 'kosher', labelKey: 'diet.kosher', icon: 'star' },
    { value: 'pescatarian', labelKey: 'diet.pescatarian', icon: 'fish' },
    { value: 'paleo', labelKey: 'diet.paleo', icon: 'meat' },
  ],
};

export const goalQuestion: SingleQuestionConfig<'goal', Goal> = {
  kind: 'single',
  answerKey: 'goal',
  titleKey: 'goal.title',
  options: [
    { value: 'know_instantly', labelKey: 'goal.know_instantly', icon: 'restaurant' },
    { value: 'avoid_exposure', labelKey: 'goal.avoid_exposure', icon: 'shield' },
    { value: 'shop_faster', labelKey: 'goal.shop_faster', icon: 'cart' },
    { value: 'eat_out', labelKey: 'goal.eat_out', icon: 'storefront' },
  ],
};

export const questions = {
  frequency: frequencyQuestion,
  watchFor: watchForQuestion,
  reasons: reasonsQuestion,
  caution: cautionQuestion,
  challenges: challengesQuestion,
  diet: dietQuestion,
  goal: goalQuestion,
} as const;
