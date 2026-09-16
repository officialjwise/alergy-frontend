import type { TFunction } from 'i18next';

import { ingredientById } from '@/mocks/ingredients';
import type { OnboardingAnswers } from '@/types';
import { joinNames } from '@/utils/text';

export interface SummaryRow {
  key: 'avoid' | 'protection' | 'diet' | 'goal';
  labelKey: string;
  value: string;
}

/** Builds the "Your profile" rows from the user's real answers (never the PDF sample values). */
export function summaryRows(answers: OnboardingAnswers, t: TFunction): SummaryRow[] {
  const rows: SummaryRow[] = [];
  const names = answers.ingredients.map(
    (id) => (answers.customIngredients[id] ?? ingredientById(id))?.name ?? id,
  );
  if (names.length > 0)
    rows.push({ key: 'avoid', labelKey: 'ready.avoid', value: joinNames(names) });
  if (answers.cautionLevel) {
    rows.push({
      key: 'protection',
      labelKey: 'ready.protection',
      value: t(`ready.protection_${answers.cautionLevel}`),
    });
  }
  if (answers.diet && answers.diet !== 'none')
    rows.push({ key: 'diet', labelKey: 'ready.diet', value: t(`diet.${answers.diet}`) });
  if (answers.goal)
    rows.push({ key: 'goal', labelKey: 'ready.goal', value: t(`goal.summary_${answers.goal}`) });
  return rows;
}
