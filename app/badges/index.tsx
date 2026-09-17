import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  IconChip,
  NavHeader,
  PressableScale,
  Ring,
  Screen,
  Skeleton,
  Text,
  type IconName,
} from '@/components/ui';
import { ICONS } from '@/components/ui/iconNames';
import { useBadges } from '@/features/badges/useBadges';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Badge } from '@/types';
import { formatShortDate } from '@/utils/date';

/** All badges as a grid: earned ones in gold, locked ones with a progress ring. */
export default function BadgesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const badges = useBadges(profile?.id ?? null);
  const earned = badges.data?.filter((badge) => badge.earnedAt).length ?? 0;

  return (
    <Screen header={<NavHeader title={t('badges.title')} />} testID="badges">
      {badges.data ? (
        <Text variant="body" color="textMuted" style={styles.count}>
          {t('badges.earned', { count: earned, total: badges.data.length })}
        </Text>
      ) : null}
      {badges.isLoading && !badges.data ? (
        <View style={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={rs(150)} radius={radii.lg} style={styles.tile} />
          ))}
        </View>
      ) : badges.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void badges.refetch()}
        />
      ) : badges.data?.length ? (
        <View style={styles.grid}>
          {badges.data.map((badge) => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              onPress={() => router.push({ pathname: '/badges/[id]', params: { id: badge.id } })}
              earnedLabel={
                badge.earnedAt
                  ? t('badges.earnedOn', { date: formatShortDate(badge.earnedAt, i18n.language) })
                  : t('badges.progress', { current: badge.current, target: badge.target })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState icon="medal" title={t('badges.emptyTitle')} body={t('badges.emptyBody')} />
      )}
    </Screen>
  );
}

export function badgeIcon(badge: Badge): IconName {
  return badge.icon in ICONS ? (badge.icon as IconName) : 'medal';
}

function BadgeTile({
  badge,
  onPress,
  earnedLabel,
}: {
  badge: Badge;
  onPress: () => void;
  earnedLabel: string;
}) {
  const { t } = useTranslation();
  const earned = !!badge.earnedAt;
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${t(`badges.${badge.id}.name`)}, ${earned ? earnedLabel : `${t('badges.locked')}, ${earnedLabel}`}`}
      style={[styles.tile, earned ? null : styles.locked]}
      testID={`badge-${badge.id}`}
    >
      <Ring
        size={rs(64)}
        thickness={4}
        progress={earned ? 1 : badge.current / badge.target}
        color={earned ? 'gold' : 'info'}
        trackColor="ring"
      >
        <IconChip
          icon={badgeIcon(badge)}
          size={50}
          iconSize={24}
          background={earned ? 'warningTint' : 'surface'}
          color={earned ? 'gold' : 'textMuted'}
          outline={!earned}
        />
      </Ring>
      <Text variant="label" color="text" align="center" numberOfLines={2}>
        {t(`badges.${badge.id}.name`)}
      </Text>
      <Text variant="small" color="textMuted" align="center" numberOfLines={1}>
        {earnedLabel}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  count: { marginTop: rs(spacing.sm), marginBottom: rs(spacing.md) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.sm) },
  tile: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    gap: rs(spacing.xs),
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  locked: { opacity: 0.7 },
});
