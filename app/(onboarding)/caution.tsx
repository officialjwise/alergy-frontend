import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { cautionQuestion } from '@/features/onboarding/questions';

export default function UcautionScreen() {
  return <QuestionScreen route="caution" config={cautionQuestion} />;
}
