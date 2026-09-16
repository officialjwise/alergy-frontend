import { Stack } from 'expo-router';

import { colors, motion } from '@/theme/tokens';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: motion.screen,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
