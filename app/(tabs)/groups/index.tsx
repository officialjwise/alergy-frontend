import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  HeaderButton,
  LargeTitleHeader,
  PressableScale,
  Screen,
  SectionHeader,
  showToast,
  Skeleton,
  Text,
} from '@/components/ui';
import { GroupArtwork, GroupCard } from '@/features/groups/components/GroupCard';
import { useGroups, useJoinGroup } from '@/features/groups/useGroups';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Group } from '@/types';

/** Groups tab: my groups row, discover list with Join pills, bell to notifications. */
export default function GroupsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const groups = useGroups();
  const joinGroup = useJoinGroup();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const mine = useMemo(() => (groups.data ?? []).filter((group) => group.joined), [groups.data]);
  const discover = useMemo(
    () => (groups.data ?? []).filter((group) => group.kind === 'community'),
    [groups.data],
  );

  const open = useCallback(
    (group: Group) => router.push({ pathname: '/groups/[id]', params: { id: group.id } }),
    [router],
  );

  const toggleJoin = useCallback(
    (group: Group) => {
      setJoiningId(group.id);
      joinGroup.mutate(
        { id: group.id, join: !group.joined },
        {
          onSuccess: () =>
            showToast({
              message: group.joined
                ? t('groups.leftToast', { name: group.name })
                : t('groups.joinedToast', { name: group.name }),
              icon: 'people',
            }),
          onSettled: () => setJoiningId(null),
        },
      );
    },
    [joinGroup, t],
  );

  return (
    <Screen
      tabBar
      header={
        <LargeTitleHeader
          title={t('groups.title')}
          right={
            <HeaderButton
              icon="bell"
              label={t('groups.notifications')}
              onPress={() => router.push('/notifications')}
              testID="groups-bell"
            />
          }
        />
      }
      testID="groups"
    >
      {groups.isLoading && !groups.data ? (
        <View style={styles.list}>
          <Skeleton height={rs(96)} radius={radii.lg} />
          <Skeleton height={rs(96)} radius={radii.lg} />
          <Skeleton height={rs(96)} radius={radii.lg} />
        </View>
      ) : groups.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void groups.refetch()}
        />
      ) : (
        <>
          {mine.length ? (
            <View style={styles.mine}>
              <SectionHeader title={t('groups.mine')} variant="label" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mineRow}
              >
                {mine.map((group) => (
                  <PressableScale
                    key={group.id}
                    onPress={() => open(group)}
                    haptic="light"
                    pressedScale={0.96}
                    accessibilityRole="button"
                    accessibilityLabel={group.name}
                    style={styles.mineCard}
                    testID={`mine-${group.id}`}
                  >
                    <GroupArtwork group={group} size={48} />
                    <Text variant="small" color="text" numberOfLines={2} align="center">
                      {group.name}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>
          ) : null}
          <SectionHeader
            title={t('groups.discover')}
            actionLabel={t('groups.privateGroup')}
            actionIcon="plus"
            onAction={() => router.push('/groups/new')}
          />
          {discover.length === 0 ? (
            <EmptyState
              icon="people"
              title={t('groups.emptyTitle')}
              body={t('groups.emptyBody')}
              compact
            />
          ) : (
            <View style={styles.list}>
              {discover.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={open}
                  onToggleJoin={toggleJoin}
                  joining={joiningId === group.id}
                />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: rs(spacing.sm) },
  mine: { marginBottom: rs(spacing.lg) },
  mineRow: { gap: rs(spacing.sm) },
  mineCard: { width: rs(88), alignItems: 'center', gap: rs(6) },
});
