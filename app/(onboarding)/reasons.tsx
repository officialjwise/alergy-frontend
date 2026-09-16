import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { reasonsQuestion } from '@/features/onboarding/questions';

export default function UreasonsScreen() {
  return <QuestionScreen route="reasons" config={reasonsQuestion} />;
}
