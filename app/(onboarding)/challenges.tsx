import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { challengesQuestion } from '@/features/onboarding/questions';

export default function UchallengesScreen() {
  return <QuestionScreen route="challenges" config={challengesQuestion} />;
}
