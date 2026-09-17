import { Redirect } from 'expo-router';

/** The badge grid lives on Milestones now; old links still land there. */
export default function BadgesScreen() {
  return <Redirect href="/milestones" />;
}
