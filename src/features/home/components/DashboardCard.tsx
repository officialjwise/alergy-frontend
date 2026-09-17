import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface DashboardCardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** White 24pt-radius card with a soft lift, the surface every dashboard block sits on. */
export function DashboardCard({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  padding = spacing.md,
  style,
  testID,
}: DashboardCardProps) {
  const base = [styles.card, { padding: rs(padding) }, style];
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="light"
        pressedScale={0.985}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={base}
        testID={testID}
      >
        {children}
      </PressableScale>
    );
  }
  return (
    <View
      style={base}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    ...shadows.card,
  },
});
