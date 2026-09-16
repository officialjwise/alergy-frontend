import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SCAN_MODES } from '../modes';
import { Button, Icon, IconChip, Sheet, Text, type SheetRef } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const TIPS = ['scan.helpTip1', 'scan.helpTip2', 'scan.helpTip3'] as const;

/** Explains the four scanner modes and how to take a clear photo. */
export const ScannerHelpSheet = forwardRef<SheetRef>(function ScannerHelpSheet(_, ref) {
  const { t } = useTranslation();
  const close = () => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  };
  return (
    <Sheet ref={ref} title={t('scan.help')} closeLabel={t('common.close')}>
      <View style={styles.list}>
        {SCAN_MODES.map((mode) => (
          <View key={mode.key} style={styles.row}>
            <IconChip icon={mode.icon} size={44} iconSize={22} outline />
            <View style={styles.text}>
              <Text variant="label" color="text">
                {t(mode.labelKey)}
              </Text>
              <Text variant="small" color="textMuted">
                {t(mode.helpKey)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text variant="label" color="text" style={styles.tipsTitle} accessibilityRole="header">
        {t('scan.helpTipsTitle')}
      </Text>
      <View style={styles.tips}>
        {TIPS.map((tip) => (
          <View key={tip} style={styles.tip}>
            <Icon name="checkCircle" size={rs(18)} color="successBright" />
            <Text variant="small" color="textBody" style={styles.tipText}>
              {t(tip)}
            </Text>
          </View>
        ))}
      </View>
      <Button title={t('scan.helpGotIt')} size="md" onPress={close} style={styles.button} />
    </Sheet>
  );
});

const styles = StyleSheet.create({
  list: { gap: rs(spacing.sm), paddingTop: rs(spacing.xs) },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  text: { flex: 1, gap: 2 },
  tipsTitle: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.xs) },
  tips: { gap: rs(spacing.xs) },
  tip: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  tipText: { flex: 1 },
  button: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.sm) },
});
