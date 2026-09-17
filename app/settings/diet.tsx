import { Redirect } from 'expo-router';

/** "Diet" reuses the onboarding diet editor. */
export default function DietSettingsScreen() {
  return <Redirect href={{ pathname: '/profiles/edit/[section]', params: { section: 'diet' } }} />;
}
