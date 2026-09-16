import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { rememberQuestion } from '@/features/onboarding/questions';

export default function UrememberScreen() {
  return <QuestionScreen route="remember" config={rememberQuestion} />;
}
