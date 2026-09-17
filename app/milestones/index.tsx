import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import {
  ErrorState,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { BadgeEmblem, GROUP_COLOR, badgeIcon } from '@/features/badges/components/BadgeEmblem';
import { FlameArt } from '@/features/badges/components/FlameArt';
import { useBadges } from '@/features/badges/useBadges';
import { useTrackingOverview } from '@/features/tracking/useTracking';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Badge } from '@/types';

/**
 * Milestones: the day streak and badge count tiles, the longest streak and
 * badge progress pills, then every badge in a three-column grid.
 */
export default function MilestonesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const overview = useTrackingOverview(profile?.id ?? null);
  const badges = useBadges(profile?.id ?? null);

  const earned = badges.data?.filter((badge) => badge.earnedAt).length ?? 0;
  const total = badges.data?.length ?? 0;
  const streak = overview.data?.streak ?? 0;
  const longest = overview.data?.longestStreak ?? 0;

  const share = useCallback(() => {
    void Share.share({
      message: t('milestones.shareMessage', { streak, earned, total, app: t('home.appName') }),
    });
  }, [earned, streak, t, total]);

  return (
    <Screen
      header={<NavHeader rightIcon="share" rightLabel={t('milestones.share')} onRightPress={share} />}
      testID="milestones"
    >
      <Text variant="largeTitle" color="text" style={styles.title} accessibilityRole="header">
        {t('milestones.title')}
      </Text>

      <View style={styles.tiles}>
        <View style={styles.tile} accessible accessibilityLabel={t('milestones.streakA11y', { count: streak })}>
          <FlameArt size={rs(96)} count={streak} />
          <Text variant="label" color="text">
            {t('milestones.dayStreak')}
          </Text>
        </View>
        <View style={styles.tile} accessible accessibilityLabel={t('milestones.badgesA11y', { count: earned })}>
          <BadgeEmblem size={rs(96)} color="badgeDark" label={String(earned)} />
          <Text variant="label" color="text">
            {t('milestones.badgesEarned')}
          </Text>
        </View>
      </View>

      <View style={styles.pills}>
        <View style={styles.pill}>
          <Icon name="flame" size={rs(20)} color="flame" />
          <View style={styles.pillText}>
            <Text variant="label" color="text">
              {t('milestones.longestStreak', { count: longest })}
            </Text>
            <Text variant="small" color="textMuted">
              {t('milestones.longestStreakLabel')}
            </Text>
          </View>
        </View>
        <View style={styles.pill}>
          <BadgeEmblem size={rs(22)} color="badgeDark" />
          <View style={styles.pillText}>
            <Text variant="label" color="text">
              {t('milestones.badgesCount', { earned, total })}
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${total ? (earned / total) * 100 : 0}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {badges.isLoading && !badges.data ? (
        <View style={styles.grid}>
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} height={rs(120)} radius={radii.md} style={styles.cell} />
          ))}
        </View>
      ) : badges.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void badges.refetch()}
        />
      ) : (
        <View style={styles.grid}>
          {(badges.data ?? []).map((badge) => (
            <BadgeCell
              key={badge.id}
              badge={badge}
              onPress={() => router.push({ pathname: '/badges/[id]', params: { id: badge.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function BadgeCell({ badge, onPress }: { badge: Badge; onPress: () => void }) {
  const { t } = useTranslation();
  const locked = !badge.earnedAt;
  const name = t(`badges.${badge.id}.name`);
  const description = t(`badges.${badge.id}.description`);
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.96}
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${description}. ${locked ? t('badges.locked') : t('badges.earnedShort')}`}
      style={styles.cell}
      testID={`badge-${badge.id}`}
    >
      <BadgeEmblem
        size={rs(64)}
        color={GROUP_COLOR[badge.group]}
        icon={badgeIcon(badge)}
        locked={locked}
      />
      <Text variant="label" color={locked ? 'textBody' : 'text'} align="center" numberOfLines={2}>
        {name}
      </Text>
      <Text variant="small" color="textMuted" align="center" numberOfLines={2}>
        {description}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rs(spacing.sm), marginBottom: rs(spacing.lg) },
  tiles: { flexDirection: 'row', justifyContent: 'space-around' },
  tile: { alignItems: 'center', gap: rs(spacing.xs), width: '48%' },
  pills: { flexDirection: 'row', gap: rs(spacing.sm), marginTop: rs(spacing.md) },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.xs),
    padding: rs(spacing.sm),
    borderRadius: radii.card,
    backgroundColor: colors.background,
    ...shadows.card,
  },
  pillText: { flex: 1, gap: 2 },
  track: { height: 4, borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.badgeDark },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: rs(spacing.lg),
    marginTop: rs(spacing.xxl),
  },
  cell: { width: '33.33%', alignItems: 'center', gap: rs(6), paddingHorizontal: rs(4) },
});
