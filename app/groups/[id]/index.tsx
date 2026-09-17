import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Button,
  confirm,
  EmptyState,
  ErrorState,
  HeaderButton,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  showToast,
  Skeleton,
  Text,
  useSheetRef,
} from '@/components/ui';
import { PostCard } from '@/features/groups/components/PostCard';
import {
  FeedFilterSheet,
  GroupMoreSheet,
  GroupSwitcherSheet,
} from '@/features/groups/components/GroupSheets';
import {
  useGroup,
  useGroupMembers,
  useGroups,
  useJoinGroup,
  usePosts,
  useReact,
} from '@/features/groups/useGroups';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Post, PostFilter } from '@/types';

/** Group feed: switcher in the title, filter and more buttons, member avatars with streaks, posts. */
export default function GroupDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroup(id);
  const groups = useGroups();
  const members = useGroupMembers(id);
  const [filter, setFilter] = useState<PostFilter>('all');
  const posts = usePosts(id, filter);
  const react = useReact();
  const joinGroup = useJoinGroup();
  const switcherRef = useSheetRef();
  const filterRef = useSheetRef();
  const moreRef = useSheetRef();

  const mine = useMemo(() => (groups.data ?? []).filter((item) => item.joined), [groups.data]);

  const openPost = useCallback(
    (post: Post) => router.push({ pathname: '/groups/posts/[id]', params: { id: post.id } }),
    [router],
  );
  const openMember = useCallback(
    (memberId: string) => router.push({ pathname: '/members/[id]', params: { id: memberId } }),
    [router],
  );

  const leave = useCallback(async () => {
    if (!group.data) return;
    const ok = await confirm({
      title: t('groups.leaveTitle', { name: group.data.name }),
      message: t('groups.leaveBody'),
      confirmLabel: t('groups.leave'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'exit',
    });
    if (!ok) return;
    joinGroup.mutate(
      { id: group.data.id, join: false },
      {
        onSuccess: () => {
          showToast({
            message: t('groups.leftToast', { name: group.data?.name ?? '' }),
            icon: 'people',
          });
          router.back();
        },
      },
    );
  }, [group.data, joinGroup, router, t]);

  if (group.isError || (!group.isLoading && !group.data)) {
    return (
      <Screen header={<NavHeader />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void group.refetch()}
        />
      </Screen>
    );
  }

  const membersRow = (
    <View style={styles.membersRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.avatars}
      >
        {(members.data ?? []).map((member) => (
          <PressableScale
            key={member.id}
            onPress={() => openMember(member.id)}
            haptic="light"
            pressedScale={0.94}
            accessibilityRole="button"
            accessibilityLabel={`${member.name}${member.isOwner ? `, ${t('groups.owner')}` : ''}, ${t('groups.streak', { count: member.streak })}`}
            style={styles.member}
            testID={`member-${member.id}`}
          >
            <View>
              <Avatar name={member.name} color={member.color} size={48} bordered={false} />
              {member.isOwner ? (
                <View style={styles.crown}>
                  <Icon name="crown" size={rs(12)} color="gold" />
                </View>
              ) : null}
              <View style={styles.streakBadge}>
                <Icon name="shieldCheck" size={rs(10)} color="success" />
                <Text variant="small" color="text">
                  {member.streak}
                </Text>
              </View>
            </View>
            <Text variant="small" color="textMuted" numberOfLines={1}>
              {member.isMe ? t('groups.youLabel') : member.name}
            </Text>
          </PressableScale>
        ))}
        <PressableScale
          onPress={() =>
            router.push({ pathname: '/groups/[id]/members', params: { id: id ?? '' } })
          }
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={t('groups.seeAll')}
          style={styles.member}
        >
          <View style={styles.seeAll}>
            <Icon name="people" size={rs(22)} color="text" outline />
          </View>
          <Text variant="small" color="textMuted">
            {t('groups.seeAll')}
          </Text>
        </PressableScale>
      </ScrollView>
    </View>
  );

  return (
    <Screen
      header={
        <NavHeader
          right={
            <View style={styles.headerRight}>
              <HeaderButton
                icon="filter"
                label={t('groups.filter')}
                onPress={() => filterRef.current?.present()}
                testID="group-filter"
              />
              <HeaderButton
                icon="more"
                label={t('groups.more')}
                onPress={() => moreRef.current?.present()}
                testID="group-more"
              />
            </View>
          }
        />
      }
      scroll={false}
      footer={
        <Button
          title={t('groups.newPost')}
          leading={<Icon name="plus" size={rs(20)} color="onPrimary" />}
          onPress={() =>
            router.push({ pathname: '/groups/posts/new', params: { groupId: id ?? '' } })
          }
          haptic="medium"
          testID="group-new-post"
        />
      }
      testID="group-detail"
    >
      <PressableScale
        onPress={() => switcherRef.current?.present()}
        haptic="light"
        pressedScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${group.data?.name ?? ''}. ${t('groups.switch')}`}
        style={styles.title}
        testID="group-switcher"
      >
        <Text variant="sectionTitle" color="text" numberOfLines={1} accessibilityRole="header">
          {group.data?.name ?? ''}
        </Text>
        <Icon name="chevronDown" size={rs(18)} color="textMuted" />
      </PressableScale>
      <FlashList
        data={posts.data ?? []}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <View style={styles.postGap}>
            <PostCard
              post={item}
              onPress={openPost}
              onReact={(post, emoji) => react.mutate({ postId: post.id, emoji })}
              onAuthorPress={(post) => openMember(post.author.id)}
            />
          </View>
        )}
        ListHeaderComponent={membersRow}
        ListEmptyComponent={
          posts.isLoading && !posts.data ? (
            <View style={styles.list}>
              <Skeleton height={rs(200)} radius={radii.lg} />
              <Skeleton height={rs(200)} radius={radii.lg} />
            </View>
          ) : posts.isError ? (
            <ErrorState
              title={t('states.errorTitle')}
              body={t('states.errorBody')}
              actionLabel={t('common.retry')}
              onAction={() => void posts.refetch()}
              compact
            />
          ) : filter !== 'all' ? (
            <EmptyState
              icon="filter"
              title={t('groups.feedFilteredEmpty')}
              actionLabel={t('common.clear')}
              onAction={() => setFilter('all')}
              compact
            />
          ) : (
            <EmptyState
              icon="chat"
              title={t('groups.feedEmptyTitle')}
              body={t('groups.feedEmptyBody')}
              compact
            />
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {group.data ? (
        <>
          <GroupSwitcherSheet
            ref={switcherRef}
            groups={mine.length ? mine : [group.data]}
            currentId={group.data.id}
            onSelect={(next) => {
              if (next.id !== group.data?.id)
                router.replace({ pathname: '/groups/[id]', params: { id: next.id } });
            }}
          />
          <FeedFilterSheet ref={filterRef} value={filter} onChange={setFilter} />
          <GroupMoreSheet
            ref={moreRef}
            group={group.data}
            onInvite={() =>
              router.push({ pathname: '/groups/[id]/invite', params: { id: group.data?.id ?? '' } })
            }
            onLeave={() => void leave()}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', gap: rs(spacing.xs) },
  title: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginTop: rs(spacing.sm) },
  membersRow: { marginTop: rs(spacing.md), marginBottom: rs(spacing.md) },
  avatars: { gap: rs(spacing.md), paddingVertical: rs(4) },
  member: { alignItems: 'center', gap: rs(4), width: rs(56) },
  crown: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seeAll: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: rs(spacing.sm) },
  listContent: { paddingBottom: rs(spacing.xl) },
  postGap: { marginBottom: rs(spacing.sm) },
});
