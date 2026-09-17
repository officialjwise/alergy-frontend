import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ScanRow } from '@/components/app/ScanRow';
import {
  Chip,
  EmptyState,
  ErrorState,
  NavHeader,
  Screen,
  SearchInput,
  showToast,
  Skeleton,
  SwipeRow,
  Text,
} from '@/components/ui';
import { useHistory, useRemoveScan, useRestoreScan } from '@/features/history/useHistory';
import { useDebounced } from '@/features/onboarding/useIngredientSearch';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult, VerdictKind } from '@/types';
import { formatRelativeDay } from '@/utils/date';

type Filter = VerdictKind | 'all' | 'saved';
type Row = { kind: 'header'; title: string } | { kind: 'scan'; scan: ScanResult };

const FILTERS: { key: Filter; labelKey: string }[] = [
  { key: 'all', labelKey: 'history.filterAll' },
  { key: 'safe', labelKey: 'history.filterSafe' },
  { key: 'caution', labelKey: 'history.filterCaution' },
  { key: 'unsafe', labelKey: 'history.filterUnsafe' },
  { key: 'unknown', labelKey: 'history.filterUnknown' },
  { key: 'saved', labelKey: 'history.filterSaved' },
];

function filterFromParams(params: { saved?: string; verdict?: string }): Filter {
  if (params.saved === '1') return 'saved';
  const match = FILTERS.find((item) => item.key === params.verdict);
  return match ? match.key : 'all';
}

/** Scan history grouped by day with search, verdict filters and swipe to delete (with undo). */
export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ saved?: string; verdict?: string; range?: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const [query, setQuery] = useState('');
  const paramFilter = filterFromParams(params);
  const [filter, setFilter] = useState<Filter>(paramFilter);
  const [lastParamFilter, setLastParamFilter] = useState(paramFilter);
  const debounced = useDebounced(query, 180);
  const removeScan = useRemoveScan();
  const restoreScan = useRestoreScan();

  // Home passes ?saved=1 or ?verdict= while this screen may already be mounted: derive, don't effect.
  if (paramFilter !== lastParamFilter) {
    setLastParamFilter(paramFilter);
    setFilter(paramFilter);
  }

  const history = useHistory(profile?.id ?? null, {
    query: debounced,
    verdict: filter === 'saved' || filter === 'all' ? 'all' : filter,
    savedOnly: filter === 'saved',
  });

  const rows = useMemo<Row[]>(() => {
    const groups = new Map<string, ScanResult[]>();
    (history.data ?? []).forEach((scan) => {
      const label = formatRelativeDay(scan.scannedAt, i18n.language, {
        today: t('history.today'),
        yesterday: t('history.yesterday'),
      });
      groups.set(label, [...(groups.get(label) ?? []), scan]);
    });
    const out: Row[] = [];
    groups.forEach((scans, title) => {
      out.push({ kind: 'header', title });
      scans.forEach((scan) => out.push({ kind: 'scan', scan }));
    });
    return out;
  }, [history.data, i18n.language, t]);

  const open = useCallback(
    (scan: ScanResult) =>
      router.push({ pathname: '/scan/result/[id]', params: { id: scan.id, from: 'history' } }),
    [router],
  );

  const remove = useCallback(
    (scan: ScanResult) => {
      removeScan.mutate(scan.id);
      showToast({
        message: t('history.deleted'),
        icon: 'trash',
        action: { label: t('common.undo'), onPress: () => restoreScan.mutate(scan) },
      });
    },
    [removeScan, restoreScan, t],
  );

  const hasFilters = query.trim().length > 0 || filter !== 'all';

  const header = (
    <View>
      <View style={styles.search}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('history.searchPlaceholder')}
          clearLabel={t('a11y.clearSearch')}
          returnKeyType="search"
        />
      </View>
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
      {history.data ? (
        <Text variant="small" color="textMuted" style={styles.count}>
          {t('history.count', { count: history.data.length })}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen
      header={
        <NavHeader
          title={t('history.title')}
          rightIcon="compare"
          rightLabel={t('history.compare')}
          onRightPress={() => router.push('/compare')}
        />
      }
      scroll={false}
      testID="history"
    >
      <FlashList
        data={rows}
        keyExtractor={(row) => (row.kind === 'header' ? `h-${row.title}` : row.scan.id)}
        getItemType={(row) => row.kind}
        renderItem={({ item }) =>
          item.kind === 'header' ? (
            <Text
              variant="sectionLabel"
              color="textMuted"
              style={styles.groupTitle}
              accessibilityRole="header"
            >
              {item.title}
            </Text>
          ) : (
            <SwipeRow
              actionLabel={t('history.delete')}
              onAction={() => remove(item.scan)}
              style={styles.rowGap}
            >
              <ScanRow scan={item.scan} onPress={open} showTriggers />
            </SwipeRow>
          )
        }
        ListHeaderComponent={header}
        ListEmptyComponent={
          history.isLoading ? (
            <View style={styles.list}>
              <Skeleton height={rs(92)} radius={radii.card} />
              <Skeleton height={rs(92)} radius={radii.card} />
              <Skeleton height={rs(92)} radius={radii.card} />
            </View>
          ) : history.isError ? (
            <ErrorState
              title={t('states.errorTitle')}
              body={t('states.errorBody')}
              actionLabel={t('common.retry')}
              onAction={() => void history.refetch()}
              compact
            />
          ) : hasFilters ? (
            <EmptyState
              icon="search"
              title={t('history.noMatchTitle')}
              body={t('history.noMatchBody')}
              actionLabel={t('common.clear')}
              onAction={() => {
                setQuery('');
                setFilter('all');
              }}
              compact
            />
          ) : (
            <EmptyState
              icon="history"
              title={t('history.emptyTitle')}
              body={t('history.emptyBody')}
              actionLabel={t('home.quickScan')}
              onAction={() => router.push({ pathname: '/scan', params: { from: 'history' } })}
            />
          )
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { marginTop: rs(spacing.md) },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(spacing.xs),
    marginTop: rs(spacing.md),
  },
  count: { marginTop: rs(spacing.sm) },
  groupTitle: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.sm) },
  list: { gap: rs(spacing.sm), paddingTop: rs(spacing.lg) },
  listContent: { paddingBottom: rs(spacing.xl) },
  rowGap: { marginBottom: rs(spacing.sm) },
});
