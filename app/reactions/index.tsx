import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  showToast,
  Skeleton,
  SwipeRow,
  Text,
} from '@/components/ui';
import { SeverityBadge } from '@/features/reactions/components/SeverityBadge';
import {
  useReactions,
  useRemoveReaction,
  useRestoreReaction,
} from '@/features/reactions/useReactions';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Reaction } from '@/types';
import { formatRelativeDay, formatTime } from '@/utils/date';

/** Reaction history: newest first, swipe to delete with undo. */
export default function ReactionHistoryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const reactions = useReactions(profile?.id ?? null);
  const remove = useRemoveReaction();
  const restore = useRestoreReaction();

  const open = useCallback(
    (reaction: Reaction) =>
      router.push({ pathname: '/reactions/[id]', params: { id: reaction.id } }),
    [router],
  );

  const deleteReaction = useCallback(
    (reaction: Reaction) => {
      remove.mutate(reaction.id);
      showToast({
        message: t('reactions.deleted'),
        icon: 'trash',
        action: { label: t('common.undo'), onPress: () => restore.mutate(reaction) },
      });
    },
    [remove, restore, t],
  );

  return (
    <Screen
      header={
        <NavHeader
          title={t('reactions.title')}
          rightIcon="plus"
          rightLabel={t('reactions.log')}
          onRightPress={() => router.push('/reactions/new')}
        />
      }
      scroll={false}
      testID="reactions"
    >
      <FlashList
        data={reactions.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeRow
            actionLabel={t('common.delete')}
            onAction={() => deleteReaction(item)}
            style={styles.rowGap}
          >
            <PressableScale
              onPress={() => open(item)}
              haptic="light"
              pressedScale={0.985}
              accessibilityRole="button"
              accessibilityLabel={`${item.foodName}, ${t(`reactions.severity_${item.severity}`)}`}
              style={styles.row}
              testID={`reaction-row-${item.id}`}
            >
              <View style={styles.text}>
                <Text variant="small" color="textMuted">
                  {formatRelativeDay(item.occurredAt, i18n.language, {
                    today: t('history.today'),
                    yesterday: t('history.yesterday'),
                  })}{' '}
                  · {formatTime(item.occurredAt, i18n.language)}
                </Text>
                <Text variant="label" color="text" numberOfLines={1}>
                  {item.foodName}
                </Text>
                <Text variant="small" color="textMuted" numberOfLines={1}>
                  {item.symptoms.map((symptom) => t(`reactions.symptom_${symptom}`)).join(', ')}
                </Text>
                <View style={styles.badge}>
                  <SeverityBadge severity={item.severity} />
                </View>
              </View>
              <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
            </PressableScale>
          </SwipeRow>
        )}
        ListHeaderComponent={
          reactions.data ? (
            <Text variant="small" color="textMuted" style={styles.count}>
              {t('reactions.count', { count: reactions.data.length })}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          reactions.isLoading ? (
            <View style={styles.list}>
              <Skeleton height={rs(104)} radius={radii.card} />
              <Skeleton height={rs(104)} radius={radii.card} />
            </View>
          ) : reactions.isError ? (
            <ErrorState
              title={t('states.errorTitle')}
              body={t('states.errorBody')}
              actionLabel={t('common.retry')}
              onAction={() => void reactions.refetch()}
              compact
            />
          ) : (
            <EmptyState
              icon="reaction"
              title={t('reactions.emptyTitle')}
              body={t('reactions.emptyBody')}
              actionLabel={t('reactions.log')}
              onAction={() => router.push('/reactions/new')}
            />
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
  list: { gap: rs(spacing.sm), paddingTop: rs(spacing.md) },
  listContent: { paddingBottom: rs(spacing.xl) },
  rowGap: { marginBottom: rs(spacing.sm) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  text: { flex: 1, gap: 2 },
  badge: { marginTop: 4 },
});
