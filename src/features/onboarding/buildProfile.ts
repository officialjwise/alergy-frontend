import { mergeProfile, type ReviewMessage } from '@/features/questionnaire/rules';
import { useAppStore } from '@/store/appStore';
import type { QuestionnaireAnswers, UserProfile } from '@/types';
import { createId } from '@/utils/id';

const AVATAR_COLORS = ['#1C1A20', '#1C9750', '#3B9FD8', '#E8A317', '#F5433A', '#7C5CBF'];

/**
 * Turns the questionnaire answers into a profile: a new one for "Me" or
 * "Someone else", or an update of the person picked at question 1. Never
 * removes anything from an existing profile.
 */
export function buildProfileFromAnswers(
  answers: QuestionnaireAnswers,
  existing: UserProfile | null,
  existingCount = 0,
): { profile: UserProfile; messages: ReviewMessage[] } {
  const session = useAppStore.getState().session;
  return mergeProfile(answers, existing, {
    now: new Date().toISOString(),
    newId: createId('profile'),
    color: AVATAR_COLORS[existingCount % AVATAR_COLORS.length] ?? '#1C1A20',
    emailConfirmed: session?.user.emailConfirmed ?? false,
  });
}
