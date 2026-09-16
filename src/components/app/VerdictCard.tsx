import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { VERDICT_THEME } from '@/features/scan/verdictTheme';
import { borders, colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { VerdictKind } from '@/types';

export interface VerdictCardProps {
  kind: VerdictKind;
  /** One line reason under the title ("Contains peanuts"). */
  reason?: string;
  /** Floating card with a shadow (result screen) or flat bordered card (lists). */
  floating?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Verdict highlight card: icon circle in the verdict colour, title and reason.
 * Icon + text always accompany the colour so the state is never colour alone.
 */
export function VerdictCard({
  kind,
  reason,
  floating = false,
  onPress,
  style,
  testID,
}: VerdictCardProps) {
  const { t } = useTranslation();
  const theme = VERDICT_THEME[kind];
  const title = t(theme.titleKey);
  const body = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: colors[theme.tint] }]}>
        <Icon
          name={theme.icon}
          size={rs(28)}
          color={theme.color}
          accessibilityLabel={t(theme.a11yKey)}
        />
      </View>
      <View style={styles.text}>
        <Text variant="cardTitle" color="text">
          {title}
        </Text>
        <Text variant="captionSm" color="textMuted" numberOfLines={2}>
          {reason ?? t(theme.bodyKey)}
        </Text>
      </View>
    </>
  );
  const cardStyle = [styles.card, floating ? styles.floating : styles.flat, style];
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="light"
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${reason ?? t(theme.bodyKey)}`}
        style={cardStyle}
        testID={testID}
      >
        {body}
      </PressableScale>
    );
  }
  return (
    <View
      style={cardStyle}
      accessible
      accessibilityLabel={`${title}. ${reason ?? t(theme.bodyKey)}`}
      testID={testID}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.background,
  },
  floating: { ...shadows.sheet, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14 },
  flat: { borderWidth: borders.hairline, borderColor: colors.border },
  iconWrap: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
