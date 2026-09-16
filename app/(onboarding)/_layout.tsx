import { Stack } from 'expo-router';

import { colors, motion } from '@/theme/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: motion.screen,
        gestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
      <Stack.Screen name="ready" options={{ gestureEnabled: false, animation: 'fade' }} />
    </Stack>
  );
}
