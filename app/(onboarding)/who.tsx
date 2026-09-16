import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { whoQuestion } from '@/features/onboarding/questions';

export default function UwhoScreen() {
  return <QuestionScreen route="who" config={whoQuestion} />;
}
