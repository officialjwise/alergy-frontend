import { Redirect } from 'expo-router';

/** "My allergens and ingredients" reuses the onboarding restrictions editor. */
export default function RestrictionsSettingsScreen() {
  return (
    <Redirect
      href={{ pathname: '/profiles/edit/[section]', params: { section: 'restrictions' } }}
    />
  );
}
