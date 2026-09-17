import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Ring, Text } from '@/components/ui';
import { FlameArt } from '@/features/badges/components/FlameArt';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { HomeDashboard } from '@/types';

export interface WidgetPreviewsProps {
  dashboard: HomeDashboard | undefined;
  onLogFood: () => void;
  onScan: () => void;
  onBarcode: () => void;
}

/** Home-screen widget previews: calories left, streak flame, and the medium calories + macros widget. */
export function WidgetPreviews({ dashboard, onLogFood, onScan, onBarcode }: WidgetPreviewsProps) {
  const { t } = useTranslation();
  const day = dashboard?.day;
  const left = day ? Math.max(0, day.budget - day.eaten.calories) : 0;
  const progress = day && day.budget > 0 ? Math.min(1, day.eaten.calories / day.budget) : 0;
  const macros = day
    ? [
        { key: 'protein', icon: 'drumstick', color: 'protein', left: Math.max(0, day.goals.protein - day.eaten.protein) },
        { key: 'carbs', icon: 'grain', color: 'carbs', left: Math.max(0, day.goals.carbs - day.eaten.carbs) },
        { key: 'fat', icon: 'drop', color: 'fat', left: Math.max(0, day.goals.fat - day.eaten.fat) },
      ] as const
    : [];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <View style={[styles.widget, styles.small]} accessible accessibilityLabel={t('profileTab.widgetCaloriesA11y', { count: left })}>
        <Ring size={rs(78)} thickness={6} progress={progress} color="primary" trackColor="track">
          <Text variant="stat" color="text" style={styles.ringValue}>
            {left}
          </Text>
          <Text variant="small" color="textMuted" style={styles.ringLabel}>
            {t('profileTab.widgetCaloriesLeft')}
          </Text>
        </Ring>
        <PressableScale
          onPress={onLogFood}
          haptic="light"
          pressedScale={0.96}
          accessibilityRole="button"
          accessibilityLabel={t('profileTab.widgetLogFood')}
          style={styles.logFood}
        >
          <View style={styles.plus}>
            <Icon name="plus" size={rs(12)} color="text" />
          </View>
          <Text variant="small" color="onPrimary">
            {t('profileTab.widgetLogFood')}
          </Text>
        </PressableScale>
      </View>
      <View style={[styles.widget, styles.small]} accessible accessibilityLabel={t('profileTab.widgetStreakA11y', { count: dashboard?.streak ?? 0 })}>
        <View style={styles.sparkle}>
          <Icon name="starFour" size={rs(14)} color="gold" />
        </View>
        <FlameArt size={rs(92)} count={dashboard?.streak ?? 0} />
        <View style={styles.appMark}>
          <Icon name="leaf" size={rs(14)} color="text" />
        </View>
      </View>
      <View style={[styles.widget, styles.medium]} accessible accessibilityLabel={t('profileTab.widgetMediumA11y')}>
        <Ring size={rs(78)} thickness={6} progress={progress} color="primary" trackColor="track">
          <Text variant="stat" color="text" style={styles.ringValue}>
            {left}
          </Text>
          <Text variant="small" color="textMuted" style={styles.ringLabel}>
            {t('profileTab.widgetCaloriesLeft')}
          </Text>
        </Ring>
        <View style={styles.macros}>
          {macros.map((macro) => (
            <View key={macro.key} style={styles.macro}>
              <Icon name={macro.icon} size={rs(12)} color={macro.color} />
              <View>
                <Text variant="small" color="text">
                  {macro.left}g
                </Text>
                <Text variant="small" color="textMuted" style={styles.macroLabel}>
                  {t('home.nutrientLeft', { name: t(`home.nutrient_${macro.key}`) })}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <PressableScale onPress={onScan} haptic="light" accessibilityRole="button" accessibilityLabel={t('profileTab.widgetScanFood')} style={styles.action}>
            <Icon name="scan" size={rs(16)} color="text" />
            <Text variant="small" color="textBody">
              {t('profileTab.widgetScanFood')}
            </Text>
          </PressableScale>
          <PressableScale onPress={onBarcode} haptic="light" accessibilityRole="button" accessibilityLabel={t('profileTab.widgetBarcode')} style={styles.action}>
            <Icon name="barcode" size={rs(16)} color="text" />
            <Text variant="small" color="textBody">
              {t('profileTab.widgetBarcode')}
            </Text>
          </PressableScale>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: rs(spacing.sm), paddingVertical: rs(6), paddingRight: rs(spacing.lg) },
  widget: {
    height: rs(150),
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  small: { width: rs(150), gap: rs(spacing.xs) },
  medium: { width: rs(300), flexDirection: 'row', paddingHorizontal: rs(spacing.md), gap: rs(spacing.sm) },
  ringValue: { fontSize: rs(20), lineHeight: rs(24) },
  ringLabel: { fontSize: rs(9), lineHeight: rs(11) },
  logFood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: rs(spacing.sm),
    minHeight: rs(30),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  plus: {
    width: rs(22),
    height: rs(22),
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: { position: 'absolute', top: rs(14), left: rs(20) },
  appMark: {
    position: 'absolute',
    left: rs(18),
    bottom: rs(18),
    width: rs(26),
    height: rs(26),
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macros: { flex: 1, gap: 4 },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macroLabel: { fontSize: rs(10), lineHeight: rs(12) },
  actions: { gap: rs(spacing.xs) },
  action: {
    alignItems: 'center',
    gap: 2,
    width: rs(64),
    paddingVertical: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
});
