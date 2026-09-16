import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface EmptyRecentCardProps {
  onPress: () => void;
  /** Copy differs for "no scans yet" and "nothing on this day". */
  variant?: 'first' | 'day';
}

/** Soft grey card with a stacked placeholder row (thumbnail + grey lines) and a prompt to scan. */
export function EmptyRecentCard({ onPress, variant = 'first' }: EmptyRecentCardProps) {
  const { t } = useTranslation();
  const message = variant === 'first' ? t('home.emptyFirst') : t('home.emptyDay');
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={message}
      accessibilityHint={t('home.emptyHint')}
      style={styles.card}
      testID="home-empty"
    >
      <View style={styles.stack}>
        <View style={[styles.ghost, styles.ghostBack]} />
        <View style={styles.ghost}>
          <View style={styles.thumb}>
            <Icon name="restaurant" size={rs(20)} color="textMuted" outline />
          </View>
          <View style={styles.lines}>
            <View style={[styles.line, styles.lineLong]} />
            <View style={[styles.line, styles.lineShort]} />
          </View>
        </View>
      </View>
      <Text variant="body" color="textMuted" align="center">
        {message}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.lg,
    padding: rs(spacing.lg),
    alignItems: 'center',
    gap: rs(spacing.md),
  },
  stack: { width: '82%', alignItems: 'center' },
  ghost: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    padding: rs(spacing.sm),
    borderRadius: radii.card,
    backgroundColor: colors.background,
  },
  ghostBack: {
    position: 'absolute',
    top: -8,
    width: '90%',
    height: '100%',
    opacity: 0.6,
  },
  thumb: {
    width: rs(40),
    height: rs(40),
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lines: { flex: 1, gap: rs(6) },
  line: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceStrong },
  lineLong: { width: '70%' },
  lineShort: { width: '45%' },
});
