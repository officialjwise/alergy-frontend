import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Sheet, Text, type SheetRef } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** What BMI is and is not; opened from the help icon on the BMI card. */
export const BmiSheet = forwardRef<SheetRef, object>(function BmiSheet(_props, ref) {
  const { t } = useTranslation();
  return (
    <Sheet ref={ref} title={t('insights.bmiHelp')} closeLabel={t('common.close')}>
      <View style={styles.wrap}>
        <Text variant="body" color="textBody">
          {t('insights.bmiHelpBody1')}
        </Text>
        <Text variant="body" color="textMuted">
          {t('insights.bmiHelpBody2')}
        </Text>
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: rs(spacing.sm), paddingBottom: rs(spacing.md) },
});
