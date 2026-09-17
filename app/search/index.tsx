import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Chip,
  EmptyState,
  ErrorState,
  NavHeader,
  Screen,
  SearchInput,
  SectionHeader,
  Skeleton,
  Text,
} from '@/components/ui';
import { ProductRow } from '@/features/foods/components/ProductRow';
import { useDebounced } from '@/features/onboarding/useIngredientSearch';
import { useProductSearch } from '@/features/scan/useAnalyze';
import { evaluateProduct } from '@/services';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { useSearchStore } from '@/store/searchStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Product, VerdictKind } from '@/types';

/** Food search: recent searches, results with verdict pills, empty and no-results states. */
export default function FoodSearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const recent = useSearchStore((state) => state.recent);
  const addRecent = useSearchStore((state) => state.addRecent);
  const removeRecent = useSearchStore((state) => state.removeRecent);
  const clearRecent = useSearchStore((state) => state.clearRecent);
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 200);
  const trimmed = debounced.trim();
  const results = useProductSearch(trimmed);

  const rows = useMemo(
    () =>
      (results.data ?? []).map((product) => ({
        product,
        kind: (profile ? evaluateProduct(product, profile).kind : 'unknown') as VerdictKind,
      })),
    [profile, results.data],
  );

  const open = useCallback(
    (product: Product) => {
      addRecent(query);
      router.push({ pathname: '/product/[id]', params: { id: product.id } });
    },
    [addRecent, query, router],
  );

  const searching = trimmed.length >= 2;

  return (
    <Screen
      header={<NavHeader title={t('search.title')} />}
      scroll={false}
      keyboardAvoiding
      testID="food-search"
    >
      <View style={styles.search}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          clearLabel={t('a11y.clearSearch')}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => addRecent(query)}
          testID="search-input"
        />
      </View>
      {!searching ? (
        recent.length ? (
          <View>
            <SectionHeader
              title={t('search.recent')}
              variant="label"
              actionLabel={t('search.clear')}
              onAction={clearRecent}
            />
            <View style={styles.chips}>
              {recent.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onPress={() => setQuery(item)}
                  onRemove={() => removeRecent(item)}
                  removeLabel={t('search.removeRecent', { query: item })}
                />
              ))}
            </View>
          </View>
        ) : (
          <EmptyState icon="search" title={t('search.hintTitle')} body={t('search.hintBody')} />
        )
      ) : (
        <FlashList
          data={rows}
          keyExtractor={(row) => row.product.id}
          renderItem={({ item }) => (
            <View style={styles.rowGap}>
              <ProductRow product={item.product} kind={item.kind} onPress={open} />
            </View>
          )}
          ListHeaderComponent={
            results.data ? (
              <Text variant="small" color="textMuted" style={styles.count}>
                {t('search.resultsCount', { count: results.data.length })}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            results.isLoading ? (
              <View style={styles.list}>
                <Skeleton height={rs(84)} radius={radii.card} />
                <Skeleton height={rs(84)} radius={radii.card} />
                <Skeleton height={rs(84)} radius={radii.card} />
              </View>
            ) : results.isError ? (
              <ErrorState
                title={t('states.errorTitle')}
                body={t('states.errorBody')}
                actionLabel={t('common.retry')}
                onAction={() => void results.refetch()}
                compact
              />
            ) : (
              <EmptyState
                icon="search"
                title={t('search.noResultsTitle')}
                body={t('search.noResultsBody')}
                actionLabel={t('search.addManually')}
                onAction={() =>
                  router.push({ pathname: '/scan/manual', params: { query: trimmed } })
                }
                compact
              />
            )
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { marginTop: rs(spacing.md), marginBottom: rs(spacing.lg) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  list: { gap: rs(spacing.sm), paddingTop: rs(spacing.xs) },
  listContent: { paddingBottom: rs(spacing.xl) },
  rowGap: { marginBottom: rs(spacing.sm) },
  count: { marginBottom: rs(spacing.sm) },
});
