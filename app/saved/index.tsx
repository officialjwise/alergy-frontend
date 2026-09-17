import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ScanRow } from '@/components/app/ScanRow';
import {
  Chip,
  EmptyState,
  ErrorState,
  NavHeader,
  Screen,
  showToast,
  Skeleton,
  SwipeRow,
  Text,
} from '@/components/ui';
import { useHistory, useToggleSaved } from '@/features/history/useHistory';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult, VerdictKind } from '@/types';

type Filter = VerdictKind | 'all';

const FILTERS: { key: Filter; labelKey: string }[] = [
  { key: 'all', labelKey: 'saved.filterAll' },
  { key: 'safe', labelKey: 'history.filterSafe' },
  { key: 'caution', labelKey: 'history.filterCaution' },
  { key: 'unsafe', labelKey: 'history.filterUnsafe' },
  { key: 'unknown', labelKey: 'history.filterUnknown' },
];

/** Saved foods: bookmarked scans with verdict filters and swipe to remove (with undo). */
export default function SavedFoodsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const [filter, setFilter] = useState<Filter>('all');
  const saved = useHistory(profile?.id ?? null, { savedOnly: true, verdict: filter });
  const toggleSaved = useToggleSaved();

  const open = useCallback(
    (scan: ScanResult) =>
      router.push({ pathname: '/scan/result/[id]', params: { id: scan.id, from: 'saved' } }),
    [router],
  );

  const remove = useCallback(
    (scan: ScanResult) => {
      toggleSaved.mutate({ id: scan.id, saved: false });
      showToast({
        message: t('saved.removed'),
        icon: 'bookmark',
        action: {
          label: t('common.undo'),
          onPress: () => toggleSaved.mutate({ id: scan.id, saved: true }),
        },
      });
    },
    [t, toggleSaved],
  );

  const filters = (
    <View style={styles.filters}>
      {FILTERS.map((item) => (
        <Chip
          key={item.key}
          label={t(item.labelKey)}
          selected={filter === item.key}
          onPress={() => setFilter(item.key)}
        />
      ))}
    </View>
  );

  return (
    <Screen header={<NavHeader title={t('saved.title')} />} scroll={false} testID="saved-foods">
      <FlashList
        data={saved.data ?? []}
        keyExtractor={(scan) => scan.id}
        renderItem={({ item }) => (
          <SwipeRow
            actionLabel={t('saved.remove')}
            icon="bookmark"
            onAction={() => remove(item)}
            style={styles.rowGap}
          >
            <ScanRow scan={item} onPress={open} showTime={false} showTriggers />
          </SwipeRow>
        )}
        ListHeaderComponent={
          <View>
            {filters}
            {saved.data ? (
              <Text variant="small" color="textMuted" style={styles.count}>
                {t('saved.count', { count: saved.data.length })}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          saved.isLoading ? (
            <View style={styles.list}>
              <Skeleton height={rs(92)} radius={radii.card} />
              <Skeleton height={rs(92)} radius={radii.card} />
            </View>
          ) : saved.isError ? (
            <ErrorState
              title={t('states.errorTitle')}
              body={t('states.errorBody')}
              actionLabel={t('common.retry')}
              onAction={() => void saved.refetch()}
              compact
            />
          ) : filter !== 'all' ? (
            <EmptyState
              icon="bookmark"
              title={t('saved.noMatchTitle')}
              body={t('saved.noMatchBody')}
              actionLabel={t('common.clear')}
              onAction={() => setFilter('all')}
              compact
            />
          ) : (
            <EmptyState
              icon="bookmark"
              title={t('saved.emptyTitle')}
              body={t('saved.emptyBody')}
              actionLabel={t('saved.scan')}
              onAction={() => router.push({ pathname: '/scan', params: { from: 'saved' } })}
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(spacing.xs),
    marginTop: rs(spacing.md),
  },
  count: { marginTop: rs(spacing.sm), marginBottom: rs(spacing.sm) },
  list: { gap: rs(spacing.sm), paddingTop: rs(spacing.sm) },
  listContent: { paddingBottom: rs(spacing.xl) },
  rowGap: { marginBottom: rs(spacing.sm) },
});
