import { ingredientById } from '@/mocks/ingredients';
import type { OnboardingAnswers, ProfileFor, Restriction, UserProfile } from '@/types';
import { createId } from '@/utils/id';

const AVATAR_COLORS = ['#1C1A20', '#1C9750', '#3B9FD8', '#E8A317', '#F5433A', '#7C5CBF'];

export function defaultProfileName(profileFor: ProfileFor, fallback: string): string {
  return fallback;
}

/** Turns the onboarding answers into a UserProfile. Used by the summary screen and when saving. */
export function buildProfileFromAnswers(
  answers: OnboardingAnswers,
  existingCount = 0,
  nameFallback = 'Me',
): UserProfile {
  const restrictions: Restriction[] = answers.ingredients.map((id) => {
    const ingredient = answers.customIngredients[id] ?? ingredientById(id);
    return {
      ingredientId: id,
      name: ingredient?.name ?? id,
      severity: answers.severities[id] ?? 'moderate',
    };
  });
  const now = new Date().toISOString();
  return {
    id: createId('profile'),
    name: answers.profileName.trim() || nameFallback,
    profileFor: answers.profileFor ?? 'myself',
    birthDate: answers.birthDate,
    restrictions,
    customIngredients: answers.customIngredients,
    reasons: answers.reasons,
    cautionLevel: answers.cautionLevel ?? 'may_contain',
    diet: answers.diet ?? 'none',
    goal: answers.goal,
    rememberFoods: answers.rememberFoods ?? true,
    color: AVATAR_COLORS[existingCount % AVATAR_COLORS.length] ?? '#1C1A20',
    createdAt: now,
    updatedAt: now,
  };
}
