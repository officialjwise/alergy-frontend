import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { triedAppsQuestion } from '@/features/onboarding/questions';

export default function UtriedUappsScreen() {
  return <QuestionScreen route="tried-apps" config={triedAppsQuestion} />;
}
