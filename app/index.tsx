import { Redirect, type Href } from 'expo-router';

import { stepHref } from '@/features/onboarding/navigation';
import { ONBOARDING_STEPS } from '@/features/onboarding/steps';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';

/**
 * Entry point: resumes onboarding at the persisted step, or goes to the main
 * app once a profile exists. Rendering a Redirect keeps the splash seamless.
 */
export default function Index() {
  const completed = useOnboardingStore((state) => state.completed);
  const hasStarted = useOnboardingStore((state) => state.hasStarted);
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const hasProfile = useProfileStore((state) => state.profiles.length > 0);

  if (completed && hasProfile) {
    // The tabs group lands in milestone 7; typed routes cannot see it yet.
    return <Redirect href={'/(tabs)/home' as Href} />;
  }
  if (hasStarted && currentStep && ONBOARDING_STEPS.some((step) => step.route === currentStep)) {
    return <Redirect href={stepHref(currentStep)} />;
  }
  return <Redirect href="/(onboarding)/welcome" />;
}
