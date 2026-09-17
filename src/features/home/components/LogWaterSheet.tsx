import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, PressableScale, Sheet, Text, type SheetRef } from '@/components/ui';
import { ouncesToCups } from '@/features/tracking/nutrition';
import { colors, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const OUNCES_PER_CUP = 8;

export interface LogWaterSheetProps {
  ounces: number;
  saving: boolean;
  onSave: (ounces: number) => void;
}

/** Cup stepper for the day's water. Saves the total, not an increment. */
export const LogWaterSheet = forwardRef<SheetRef, LogWaterSheetProps>(function LogWaterSheet(
  { ounces, saving, onSave },
  ref,
) {
  const { t } = useTranslation();
  const [value, setValue] = useState(ounces);
  useEffect(() => setValue(ounces), [ounces]);
  const cups = ouncesToCups(value);
  return (
    <Sheet ref={ref} title={t('water.title')} closeLabel={t('common.close')}>
      <View style={styles.wrap}>
        <Icon name="cup" size={rs(40)} color="water" />
        <Text variant="statLg" color="text">
          {t('water.cups', { count: cups })}
        </Text>
        <Text variant="body" color="textMuted">
          {t('water.ounces', { count: value })}
        </Text>
        <View style={styles.stepper}>
          <PressableScale
            onPress={() => setValue((current) => Math.max(0, current - OUNCES_PER_CUP))}
            haptic="selection"
            pressedScale={0.94}
            accessibilityRole="button"
            accessibilityLabel={t('water.removeCup')}
            style={styles.step}
          >
            <Icon name="minus" size={rs(24)} color="text" />
          </PressableScale>
          <PressableScale
            onPress={() => setValue((current) => current + OUNCES_PER_CUP)}
            haptic="selection"
            pressedScale={0.94}
            accessibilityRole="button"
            accessibilityLabel={t('water.addCup')}
            style={[styles.step, styles.stepPrimary]}
          >
            <Icon name="plus" size={rs(24)} color="onPrimary" />
          </PressableScale>
        </View>
        <Button
          title={t('common.save')}
          onPress={() => onSave(value)}
          loading={saving}
          haptic="medium"
          style={styles.save}
        />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: rs(spacing.xs), paddingTop: rs(spacing.sm) },
  stepper: { flexDirection: 'row', gap: rs(spacing.lg), marginTop: rs(spacing.md) },
  step: {
    width: rs(sizes.button),
    height: rs(sizes.button),
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPrimary: { backgroundColor: colors.primary },
  save: { alignSelf: 'stretch', marginTop: rs(spacing.lg) },
});
