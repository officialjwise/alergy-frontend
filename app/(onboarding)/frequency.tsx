import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { frequencyQuestion } from '@/features/onboarding/questions';

export default function UfrequencyScreen() {
  return <QuestionScreen route="frequency" config={frequencyQuestion} />;
}
