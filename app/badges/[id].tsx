import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, ErrorState, NavHeader, Screen, Skeleton, Text } from '@/components/ui';
import { BadgeEmblem, GROUP_COLOR, badgeIcon } from '@/features/badges/components/BadgeEmblem';
import { useBadges } from '@/features/badges/useBadges';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatLongDate } from '@/utils/date';

/** One badge: artwork, name, description and either the earned date or the progress. */
export default function BadgeDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const badges = useBadges(profile?.id ?? null);
  const badge = badges.data?.find((item) => item.id === id) ?? null;

  if (badges.isLoading && !badges.data) {
    return (
      <Screen header={<NavHeader />}>
        <Skeleton height={rs(260)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (!badge) {
    return (
      <Screen header={<NavHeader />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.back')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const earned = !!badge.earnedAt;
  return (
    <Screen
      header={<NavHeader />}
      footer={<Button title={t('common.done')} onPress={() => router.back()} />}
      testID={`badge-detail-${badge.id}`}
    >
      <View style={styles.hero}>
        <BadgeEmblem
          size={rs(150)}
          color={GROUP_COLOR[badge.group]}
          icon={badgeIcon(badge)}
          locked={!earned}
        />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {t(`badges.${badge.id}.name`)}
        </Text>
        <Text variant="subtitle" color="textMuted" align="center">
          {t(`badges.${badge.id}.description`)}
        </Text>
        <Text variant="label" color={earned ? 'success' : 'textBody'} align="center">
          {earned
            ? t('badges.earnedOn', { date: formatLongDate(badge.earnedAt ?? '', i18n.language) })
            : `${t('badges.locked')} · ${t('badges.progress', { current: badge.current, target: badge.target })}`}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  hero: { alignItems: 'center', gap: rs(spacing.md), marginTop: rs(spacing.huge) },
});
