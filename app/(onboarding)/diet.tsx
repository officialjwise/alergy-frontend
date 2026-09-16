import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { dietQuestion } from '@/features/onboarding/questions';

export default function UdietScreen() {
  return <QuestionScreen route="diet" config={dietQuestion} />;
}
