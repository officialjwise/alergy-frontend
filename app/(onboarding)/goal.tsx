import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { goalQuestion } from '@/features/onboarding/questions';

export default function UgoalScreen() {
  return <QuestionScreen route="goal" config={goalQuestion} />;
}
