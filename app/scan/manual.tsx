import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  BackButton,
  EmptyState,
  ListRow,
  Screen,
  SearchInput,
  Skeleton,
  Text,
} from '@/components/ui';
import { useDebounced } from '@/features/onboarding/useIngredientSearch';
import { useAnalyze, useProductSearch } from '@/features/scan/useAnalyze';
import { haptic } from '@/hooks/useHaptics';
import { layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { Product } from '@/types';

/** Manual barcode / product search fallback for the scanner. */
export default function ManualSearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query ?? '');
  const debounced = useDebounced(query, 200);
  const search = useProductSearch(debounced);
  const analyze = useAnalyze();

  const choose = useCallback(
    async (product: Product) => {
      haptic('light');
      const result = await analyze.mutateAsync({ source: 'manual', product });
      router.replace(`/scan/result/${result.id}` as Href);
    },
    [analyze, router],
  );

  return (
    <Screen
      header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}
      scroll={false}
      keyboardAvoiding
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('scan.manualTitle')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('scan.manualSubtitle')}
      </Text>
      <View style={styles.search}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('scan.manualPlaceholder')}
          clearLabel={t('a11y.clearSearch')}
          autoFocus
          keyboardType="default"
          returnKeyType="search"
        />
      </View>
      <FlashList
        data={search.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow
            label={item.name}
            description={[item.brand, item.barcode].filter(Boolean).join(' · ')}
            icon="barcode"
            chevron
            onPress={() => void choose(item)}
            style={styles.row}
          />
        )}
        ListEmptyComponent={
          search.isLoading ? (
            <View style={styles.list}>
              <Skeleton height={rs(56)} radius={radii.sm} />
              <Skeleton height={rs(56)} radius={radii.sm} />
            </View>
          ) : debounced.trim().length >= 2 ? (
            <EmptyState
              icon="search"
              title={t('scan.notFound')}
              body={t('scan.manualEmpty')}
              compact
            />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  search: { marginTop: rv(layout.subtitleToContent), marginBottom: rs(spacing.sm) },
  list: { gap: rs(spacing.sm), paddingTop: spacing.sm },
  listContent: { paddingBottom: spacing.xl },
  row: { paddingHorizontal: rs(spacing.xs) },
});
