import { useRouter } from 'expo-router';

import { Button, Screen, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';

// Placeholder entry until the welcome screen lands in milestone 3.
export default function Index() {
  const router = useRouter();
  return (
    <Screen
      footer={
        <Button title="Open component gallery" onPress={() => router.push('/dev/components')} />
      }
    >
      <Text variant="title" style={{ marginTop: spacing.huge }}>
        Allergy App
      </Text>
      <Text variant="subtitle" color="textMuted" style={{ marginTop: spacing.sm }}>
        Milestone 2: UI kit. Onboarding screens arrive in milestone 3.
      </Text>
    </Screen>
  );
}
