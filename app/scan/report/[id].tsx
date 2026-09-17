import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, NavHeader, Screen, showToast, Text, TextField } from '@/components/ui';
import { useReportProblem } from '@/features/scan/useAnalyze';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { ReportReason } from '@/types';

const REASONS: ReportReason[] = ['ingredients', 'verdict', 'product', 'other'];

/** "Report a problem" form for a result: one reason plus optional notes. */
export default function ReportProblemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [notes, setNotes] = useState('');
  const report = useReportProblem();

  const send = () => {
    if (!reason || !id) return;
    report.mutate(
      { scanId: id, reason, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          showToast({ message: t('report.sent'), icon: 'checkCircle' });
          router.back();
        },
        onError: () => showToast({ message: t('report.failed'), icon: 'alert' }),
      },
    );
  };

  return (
    <Screen
      header={<NavHeader title={t('report.title')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('report.send')}
          onPress={send}
          disabled={!reason}
          loading={report.isPending}
          haptic="medium"
          testID="report-send"
        />
      }
      testID="scan-report"
    >
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('report.subtitle')}
      </Text>
      <Text variant="label" color="text" style={styles.label} accessibilityRole="header">
        {t('report.reason')}
      </Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {REASONS.map((item) => (
          <Chip
            key={item}
            label={t(`report.reason_${item}`)}
            selected={reason === item}
            onPress={() => setReason(item)}
            testID={`report-reason-${item}`}
          />
        ))}
      </View>
      <TextField
        label={t('report.notes')}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('report.notesPlaceholder')}
        multiline
        style={styles.notes}
        testID="report-notes"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rv(layout.titleTop / 2) },
  label: { marginTop: rv(spacing.xl), marginBottom: rs(spacing.xs) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  notes: { marginTop: rv(spacing.xl) },
});
