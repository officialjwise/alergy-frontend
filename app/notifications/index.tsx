import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Divider,
  EmptyState,
  ErrorState,
  IconChip,
  ListRow,
  NavHeader,
  Screen,
  Sheet,
  showToast,
  Skeleton,
  Text,
  useSheetRef,
  type IconName,
} from '@/components/ui';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from '@/features/notifications/useNotifications';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { AppNotification, NotificationKind } from '@/types';
import { formatRelativeDay, formatTime } from '@/utils/date';

const KIND_ICON: Record<NotificationKind, IconName> = {
  product: 'bookmark',
  reply: 'chat',
  reaction: 'reaction',
  group: 'people',
  reminder: 'bell',
};

/** Notifications grouped into Today and Earlier with unread dots; tapping opens the right screen. */
export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const moreRef = useSheetRef();

  const groups = useMemo(() => {
    const items = notifications.data ?? [];
    const today = new Date().toDateString();
    const isToday = (item: AppNotification) => new Date(item.createdAt).toDateString() === today;
    return [
      { key: 'today', title: t('notifications.today'), items: items.filter(isToday) },
      {
        key: 'earlier',
        title: t('notifications.earlier'),
        items: items.filter((item) => !isToday(item)),
      },
    ].filter((group) => group.items.length > 0);
  }, [notifications.data, t]);

  const open = useCallback(
    (item: AppNotification) => {
      if (!item.read) markRead.mutate(item.id);
      if (item.target) router.push(item.target as Href);
    },
    [markRead, router],
  );

  return (
    <Screen
      header={
        <NavHeader
          title={t('notifications.title')}
          rightIcon="more"
          rightLabel={t('notifications.more')}
          onRightPress={() => moreRef.current?.present()}
        />
      }
      testID="notifications"
    >
      {notifications.isLoading && !notifications.data ? (
        <View style={styles.list}>
          <Skeleton height={rs(72)} radius={radii.card} />
          <Skeleton height={rs(72)} radius={radii.card} />
          <Skeleton height={rs(72)} radius={radii.card} />
        </View>
      ) : notifications.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void notifications.refetch()}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon="bell"
          title={t('notifications.emptyTitle')}
          body={t('notifications.emptyBody')}
          style={styles.empty}
        />
      ) : (
        groups.map((group) => (
          <View key={group.key} style={styles.group}>
            <Text
              variant="sectionLabel"
              color="textMuted"
              style={styles.groupTitle}
              accessibilityRole="header"
            >
              {group.title}
            </Text>
            <View style={styles.card}>
              {group.items.map((item, index) => (
                <View key={item.id}>
                  <ListRow
                    label={item.title}
                    description={`${item.body}\n${formatRelativeDay(item.createdAt, i18n.language, { today: t('history.today'), yesterday: t('history.yesterday') })} · ${formatTime(item.createdAt, i18n.language)}`}
                    leading={
                      <View>
                        <IconChip
                          icon={KIND_ICON[item.kind]}
                          size={44}
                          iconSize={20}
                          outline
                          background={item.read ? 'surface' : 'surfaceTint'}
                        />
                        {!item.read ? (
                          <View style={styles.dot} accessibilityLabel={t('notifications.unread')} />
                        ) : null}
                      </View>
                    }
                    chevron
                    onPress={() => open(item)}
                    accessibilityLabel={`${item.read ? '' : `${t('notifications.unread')}. `}${t(`notifications.kind_${item.kind}`)}: ${item.title}. ${item.body}`}
                    style={styles.row}
                    testID={`notification-${item.id}`}
                  />
                  {index < group.items.length - 1 ? (
                    <Divider inset={rs(spacing.sm + 44 + spacing.md)} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))
      )}
      <Sheet ref={moreRef} title={t('notifications.more')} closeLabel={t('common.close')}>
        <View style={styles.sheet}>
          <ListRow
            label={t('notifications.markAllRead')}
            icon="checkCircle"
            chevron
            onPress={() => {
              moreRef.current?.dismiss();
              markAllRead.mutate(undefined, {
                onSuccess: () =>
                  showToast({ message: t('notifications.allRead'), icon: 'checkCircle' }),
              });
            }}
          />
          <Divider />
          <ListRow
            label={t('notifications.settings')}
            icon="settings"
            chevron
            onPress={() => {
              moreRef.current?.dismiss();
              router.push('/notifications/settings');
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: rs(spacing.sm), marginTop: rs(spacing.md) },
  empty: { flex: 1, justifyContent: 'center' },
  group: { marginTop: rs(spacing.lg) },
  groupTitle: { marginBottom: rs(spacing.xs) },
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: rs(spacing.sm),
  },
  row: { alignItems: 'flex-start', paddingVertical: rs(spacing.sm) },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.background,
  },
  sheet: { paddingBottom: rs(spacing.sm) },
});
