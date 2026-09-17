import { Redirect } from 'expo-router';

/** "Caution level" reuses the onboarding caution editor. */
export default function CautionSettingsScreen() {
  return (
    <Redirect href={{ pathname: '/profiles/edit/[section]', params: { section: 'caution' } }} />
  );
}
