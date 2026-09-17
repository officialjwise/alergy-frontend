import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Sheet, Text, type SheetRef } from '@/components/ui';
import { colors, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const STEPS = [
  'profileTab.widgetsStep1',
  'profileTab.widgetsStep2',
  'profileTab.widgetsStep3',
] as const;

/** Steps to add a home screen widget (previews only in this build). */
export const WidgetsHowToSheet = forwardRef<SheetRef>(function WidgetsHowToSheet(_, ref) {
  const { t } = useTranslation();
  const close = () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };
  return (
    <Sheet ref={ref} title={t('profileTab.widgetsSheetTitle')} closeLabel={t('common.close')}>
      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.number}>
              <Text variant="label" color="onPrimary">
                {index + 1}
              </Text>
            </View>
            <Text variant="body" color="textBody" style={styles.stepText}>
              {t(step)}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="small" color="textMuted" style={styles.note}>
        {t('profileTab.widgetsNote')}
      </Text>
      <Button title={t('common.done')} size="md" onPress={close} style={styles.button} />
    </Sheet>
  );
});

const styles = StyleSheet.create({
  steps: { gap: rs(spacing.md), marginTop: rs(spacing.xs) },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.sm) },
  number: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  note: { marginTop: rs(spacing.md) },
  button: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.sm) },
});
