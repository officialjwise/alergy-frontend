import type { TFunction } from 'i18next';

import { foodIds, foodName, resolveFoodAnswers } from '@/features/questionnaire/rules';
import type { QuestionnaireAnswers, RiskLevel } from '@/types';

export interface ReviewFoodRow {
  id: string;
  name: string;
  level: RiskLevel | null;
  kindLabel: string;
  byNameOnly: boolean;
  /** The answers for this food are incomplete. */
  incomplete: boolean;
}

/** The resulting list of foods for the review screen, built from the real answers. */
export function reviewFoods(answers: QuestionnaireAnswers, t: TFunction): ReviewFoodRow[] {
  if (answers.hasAllergies === 'no') return [];
  return foodIds(answers).map((id) => {
    const resolved = resolveFoodAnswers(answers.perFood[id]);
    const typed = answers.typedFoods.find(
      (item) => item.resolution.kind === 'custom' && item.resolution.id === id,
    );
    return {
      id,
      name: foodName(answers, id),
      level: resolved?.level ?? null,
      kindLabel: resolved ? t(`q5.${resolved.kind}`) : t('review.incomplete'),
      byNameOnly: !!typed,
      incomplete: !resolved,
    };
  });
}
