import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { watchForQuestion } from '@/features/onboarding/questions';

export default function UwatchUforScreen() {
  return <QuestionScreen route="watch-for" config={watchForQuestion} />;
}
