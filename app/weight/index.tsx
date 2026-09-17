import { Image } from 'expo-image';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  NavHeader,
  Screen,
  showToast,
  Skeleton,
  SwipeRow,
  Text,
  useSheetRef,
} from '@/components/ui';
import { LogWeightSheet } from '@/features/insights/components/LogWeightSheet';
import { useLogWeight, useRemoveWeight, useWeights } from '@/features/tracking/useTracking';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatLongDate, formatShortDate } from '@/utils/date';

/** Weight History: last weigh-in, change since the first entry, every entry, and Log Weight. */
export default function WeightHistoryScreen() {
  const { t, i18n } = useTranslation();
  const profile = useProfileStore(selectActiveProfile);
  const pid = profile?.id ?? null;
  const weights = useWeights(pid);
  const logWeight = useLogWeight();
  const remove = useRemoveWeight();
  const sheetRef = useSheetRef();

  const entries = [...(weights.data ?? [])].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  const latest = entries[0] ?? null;
  const first = entries[entries.length - 1] ?? null;
  const delta = latest && first ? Math.round((latest.weightLbs - first.weightLbs) * 10) / 10 : 0;

  const save = useCallback(
    async (weightLbs: number, photoUri?: string) => {
      if (!pid) return;
      try {
        await logWeight.mutateAsync({ profileId: pid, weightLbs, photoUri });
        sheetRef.current?.dismiss();
        showToast({ message: t('weight.saved'), icon: 'scale' });
      } catch {
        showToast({ message: t('states.errorTitle'), icon: 'alert' });
      }
    },
    [logWeight, pid, sheetRef, t],
  );

  return (
    <Screen
      header={<NavHeader title={t('weight.title')} />}
      footer={
        <Button title={t('weight.logWeight')} onPress={() => sheetRef.current?.present()} haptic="medium" />
      }
      testID="weight-history"
    >
      {weights.isLoading && !weights.data ? (
        <Skeleton height={rs(120)} radius={radii.lg} style={styles.top} />
      ) : weights.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void weights.refetch()}
        />
      ) : latest ? (
        <>
          <View style={styles.top}>
            <Text variant="small" color="textMuted">
              {t('weight.lastWeighIn', { date: formatShortDate(latest.loggedAt, i18n.language) })}
            </Text>
            <View style={styles.figure}>
              <Text variant="statLg" color="text">
                {latest.weightLbs.toFixed(1)}
              </Text>
              <Text variant="label" color="textMuted">
                lbs
              </Text>
            </View>
            <View style={styles.delta}>
              <Icon name="arrowForward" size={rs(14)} color="textMuted" />
              <Text variant="small" color="textMuted">
                {t('weight.sinceStart', {
                  delta: delta > 0 ? `+${delta}` : delta,
                  date: first
                    ? new Date(first.loggedAt).toLocaleDateString(i18n.language, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '',
                })}
              </Text>
            </View>
          </View>
          <Text variant="cardTitle" color="text" style={styles.historyTitle} accessibilityRole="header">
            {t('weight.history')}
          </Text>
          <View style={styles.list}>
            {entries.map((entry) => (
              <SwipeRow
                key={entry.id}
                actionLabel={t('weight.delete')}
                icon="trash"
                onAction={() =>
                  remove.mutate(entry.id, {
                    onSuccess: () => showToast({ message: t('weight.deleted'), icon: 'trash' }),
                  })
                }
                style={styles.row}
                testID={`weight-${entry.id}`}
              >
                <View style={styles.rowInner}>
                  <View style={styles.thumb}>
                    {entry.photoUri ? (
                      <Image source={{ uri: entry.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    ) : (
                      <Icon name="camera" size={rs(20)} color="textMuted" outline />
                    )}
                  </View>
                  <View style={styles.rowText}>
                    <Text variant="label" color="text">
                      {t('insights.lbs', { value: entry.weightLbs.toFixed(1) })}
                    </Text>
                    <Text variant="small" color="textMuted">
                      {formatLongDate(entry.loggedAt, i18n.language)}
                    </Text>
                  </View>
                </View>
              </SwipeRow>
            ))}
          </View>
        </>
      ) : (
        <EmptyState icon="scale" title={t('weight.empty')} body={t('weight.emptyBody')} />
      )}
      <LogWeightSheet
        ref={sheetRef}
        initialLbs={latest?.weightLbs ?? null}
        saving={logWeight.isPending}
        onSave={(value, photo) => void save(value, photo)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: rs(4), marginTop: rs(spacing.lg) },
  figure: { flexDirection: 'row', alignItems: 'baseline', gap: rs(6) },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyTitle: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.sm) },
  list: { gap: rs(spacing.xs) },
  row: { borderRadius: radii.card },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    padding: rs(spacing.sm),
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: rs(48),
    height: rs(48),
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
});
