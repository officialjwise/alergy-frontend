import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, NavHeader, Screen, showToast, Text, TextField } from '@/components/ui';
import { useReportPost } from '@/features/groups/useGroups';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { PostReportReason } from '@/types';

const REASONS: PostReportReason[] = ['spam', 'harmful', 'offensive', 'other'];

/** Report a group post: one reason plus optional notes. */
export default function ReportPostScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState<PostReportReason | null>(null);
  const [notes, setNotes] = useState('');
  const report = useReportPost();

  const send = () => {
    if (!id || !reason) return;
    report.mutate(
      { postId: id, reason, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          showToast({ message: t('groups.reportSent'), icon: 'checkCircle' });
          router.back();
        },
        onError: () => showToast({ message: t('report.failed'), icon: 'alert' }),
      },
    );
  };

  return (
    <Screen
      header={<NavHeader title={t('groups.reportTitle')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('groups.reportSend')}
          onPress={send}
          disabled={!reason}
          loading={report.isPending}
          haptic="medium"
          testID="post-report-send"
        />
      }
      testID="post-report"
    >
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('groups.reportSubtitle')}
      </Text>
      <Text variant="label" color="text" style={styles.label} accessibilityRole="header">
        {t('groups.reason')}
      </Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {REASONS.map((item) => (
          <Chip
            key={item}
            label={t(`groups.reason_${item}`)}
            selected={reason === item}
            onPress={() => setReason(item)}
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
