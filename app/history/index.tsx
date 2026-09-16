import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanRow } from '@/components/app/ScanRow';
import { Chip, EmptyState, ErrorState, SearchInput, Skeleton, Text } from '@/components/ui';
import { useHistory } from '@/features/history/useHistory';
import { useDebounced } from '@/features/onboarding/useIngredientSearch';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
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

/** Personal food library: search, verdict / saved filters, grouped by day. */
export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ saved?: string; verdict?: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const [query, setQuery] = useState('');
  const paramFilter = filterFromParams(params);
  const [filter, setFilter] = useState<Filter>(paramFilter);
  const [lastParamFilter, setLastParamFilter] = useState(paramFilter);
  const debounced = useDebounced(query, 180);

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
    const items = history.data ?? [];
    const groups = new Map<string, ScanResult[]>();
    items.forEach((scan) => {
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

  const openScan = useCallback(
    (scan: ScanResult) => router.push(`/scan/result/${scan.id}` as Href),
    [router],
  );
  const hasFilters = query.trim().length > 0 || filter !== 'all';

  const header = (
    <View style={styles.header}>
      <Text variant="titleLg" color="text" accessibilityRole="header">
        {t('history.title')}
      </Text>
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
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      {history.isLoading ? (
        <View style={styles.padded}>
          {header}
          <Skeleton height={rs(80)} radius={radii.card} style={styles.skeleton} />
          <Skeleton height={rs(80)} radius={radii.card} style={styles.skeleton} />
          <Skeleton height={rs(80)} radius={radii.card} style={styles.skeleton} />
        </View>
      ) : history.isError ? (
        <View style={styles.padded}>
          {header}
          <ErrorState
            title={t('states.errorTitle')}
            body={t('states.errorBody')}
            actionLabel={t('common.retry')}
            onAction={() => void history.refetch()}
          />
        </View>
      ) : (
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
              <View style={styles.rowGap}>
                <ScanRow scan={item.scan} onPress={openScan} />
              </View>
            )
          }
          ListHeaderComponent={header}
          ListEmptyComponent={
            hasFilters ? (
              <EmptyState
                icon="search"
                title={t('history.noMatchTitle')}
                body={t('history.noMatchBody')}
                actionLabel={t('common.clear')}
                onAction={() => {
                  setQuery('');
                  setFilter('all');
                }}
              />
            ) : (
              <EmptyState
                icon="history"
                title={t('history.emptyTitle')}
                body={t('history.emptyBody')}
                actionLabel={t('home.quickScan')}
                onAction={() => router.push('/scan' as Href)}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          refreshing={history.isRefetching}
          onRefresh={() => void history.refetch()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: rs(layout.screenPaddingH) },
  listContent: { paddingHorizontal: rs(layout.screenPaddingH), paddingBottom: spacing.xl },
  header: { paddingBottom: spacing.xs },
  search: { marginTop: rs(spacing.md) },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(spacing.xs),
    marginTop: rs(spacing.md),
  },
  count: { marginTop: rs(spacing.sm) },
  groupTitle: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.sm) },
  rowGap: { marginBottom: rs(spacing.sm) },
  skeleton: { marginTop: rs(spacing.sm) },
});
