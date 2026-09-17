import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  Chip,
  confirm,
  ErrorState,
  NavHeader,
  Screen,
  SettingsRow,
  SettingsSection,
  showToast,
  Skeleton,
  Text,
} from '@/components/ui';
import { SeverityBadge } from '@/features/reactions/components/SeverityBadge';
import { useReaction, useRemoveReaction } from '@/features/reactions/useReactions';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatLongDate, formatTime } from '@/utils/date';

/** One logged reaction with its linked scan, symptoms, notes and photo. */
export default function ReactionDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reaction = useReaction(id);
  const remove = useRemoveReaction();

  const deleteReaction = async () => {
    if (!reaction.data) return;
    const ok = await confirm({
      title: t('reactions.deleteTitle'),
      message: t('reactions.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'trash',
    });
    if (!ok) return;
    remove.mutate(reaction.data.id, {
      onSuccess: () => {
        showToast({ message: t('reactions.deleted'), icon: 'trash' });
        router.back();
      },
    });
  };

  if (reaction.isLoading || (!reaction.data && !reaction.isError)) {
    return (
      <Screen header={<NavHeader title={t('reactions.detailTitle')} />}>
        <Skeleton height={rs(120)} radius={radii.lg} style={styles.gap} />
        <Skeleton height={rs(200)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (reaction.isError || !reaction.data) {
    return (
      <Screen header={<NavHeader title={t('reactions.detailTitle')} />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void reaction.refetch()}
        />
      </Screen>
    );
  }

  const item = reaction.data;
  return (
    <Screen
      header={<NavHeader title={t('reactions.detailTitle')} />}
      footer={
        <Button
          title={t('reactions.delete')}
          variant="danger"
          size="md"
          onPress={() => void deleteReaction()}
          loading={remove.isPending}
          testID="reaction-delete"
        />
      }
      testID="reaction-detail"
    >
      <View style={styles.hero}>
        <Text variant="small" color="textMuted">
          {formatLongDate(item.occurredAt, i18n.language)} ·{' '}
          {formatTime(item.occurredAt, i18n.language)}
        </Text>
        <Text variant="title" color="text" accessibilityRole="header">
          {item.foodName}
        </Text>
        <SeverityBadge severity={item.severity} />
      </View>

      <Card variant="outlined" padding={spacing.lg} style={styles.card}>
        <Text variant="label" color="text">
          {t('reactions.symptoms')}
        </Text>
        <View style={styles.chips}>
          {item.symptoms.map((symptom) => (
            <Chip key={symptom} label={t(`reactions.symptom_${symptom}`)} />
          ))}
        </View>
        {item.notes ? (
          <>
            <Text variant="label" color="text" style={styles.notesTitle}>
              {t('reactions.notes')}
            </Text>
            <Text variant="body" color="textBody">
              {item.notes}
            </Text>
          </>
        ) : null}
      </Card>

      {item.photoUri ? (
        <Image
          source={{ uri: item.photoUri }}
          style={styles.photo}
          contentFit="cover"
          accessibilityLabel={t('reactions.photo')}
        />
      ) : null}

      {item.scanId ? (
        <SettingsSection style={styles.section}>
          <SettingsRow
            label={t('reactions.linkedScan')}
            icon="scan"
            onPress={() =>
              router.push({
                pathname: '/scan/result/[id]',
                params: { id: item.scanId ?? '', from: 'reaction' },
              })
            }
          />
        </SettingsSection>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  hero: { gap: rs(spacing.xs), marginTop: rs(spacing.lg) },
  card: { marginTop: rs(spacing.xl), gap: rs(spacing.xs) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  notesTitle: { marginTop: rs(spacing.md) },
  photo: {
    marginTop: rs(spacing.md),
    height: rs(220),
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceStrong,
  },
  section: { marginTop: rs(spacing.xl) },
});
