import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, ErrorState, Icon, NavHeader, Screen, showToast, Skeleton } from '@/components/ui';
import { useProduct, useSaveProduct } from '@/features/foods/useProduct';
import { useHistory, useToggleSaved } from '@/features/history/useHistory';
import { ResultView } from '@/features/scan/components/ResultView';
import { evaluateProduct } from '@/services';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';

/**
 * Product detail for a catalogue product (search results, notifications).
 * Reuses the result layout; the verdict is computed for the active profile and
 * saving creates a scan record so the product joins saved foods and history.
 */
export default function ProductScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);
  const profile = useProfileStore(selectActiveProfile);
  const history = useHistory(profile?.id ?? null);
  const saveProduct = useSaveProduct();
  const toggleSaved = useToggleSaved();

  const existing = useMemo(
    () => (history.data ?? []).find((scan) => scan.product.id === id && scan.saved) ?? null,
    [history.data, id],
  );

  const back = useCallback(
    () => (router.canGoBack() ? router.back() : router.replace('/search')),
    [router],
  );

  const scan = useMemo<ScanResult | null>(() => {
    if (!product.data) return null;
    if (existing) return { ...existing, product: product.data };
    return {
      id: `product:${product.data.id}`,
      profileId: profile?.id ?? '',
      product: product.data,
      verdict: profile
        ? evaluateProduct(product.data, profile)
        : { kind: 'unknown', triggers: [], clearedIngredientIds: [], incomplete: true },
      source: 'manual',
      scannedAt: new Date().toISOString(),
      saved: false,
    };
  }, [existing, product.data, profile]);

  const toggleSave = useCallback(() => {
    if (!product.data) return;
    if (existing) {
      toggleSaved.mutate(
        { id: existing.id, saved: false },
        { onSuccess: () => showToast({ message: t('product.unsavedToast'), icon: 'bookmark' }) },
      );
      return;
    }
    saveProduct.mutate(product.data, {
      onSuccess: () => showToast({ message: t('product.savedToast'), icon: 'bookmark' }),
    });
  }, [existing, product.data, saveProduct, t, toggleSaved]);

  if (product.isLoading || (!product.data && !product.isError)) {
    return (
      <Screen header={<NavHeader onLeftPress={back} />} testID="product-loading">
        <Skeleton height={rs(260)} radius={radii.xl} style={styles.gap} />
        <Skeleton height={rs(88)} radius={radii.card} style={styles.gap} />
      </Screen>
    );
  }
  if (product.isError || !scan) {
    return (
      <Screen header={<NavHeader onLeftPress={back} />} testID="product-error">
        <ErrorState
          title={product.isError ? t('states.errorTitle') : t('product.notFound')}
          body={product.isError ? t('states.errorBody') : undefined}
          actionLabel={product.isError ? t('common.retry') : t('product.back')}
          onAction={() => (product.isError ? void product.refetch() : back())}
        />
      </Screen>
    );
  }

  const saved = !!existing;
  return (
    <ResultView
      scan={scan}
      profile={profile}
      variant={scan.product.barcode ? 'barcode' : 'food'}
      onBack={back}
      onToggleSave={toggleSave}
      timeLabel={existing ? undefined : t('product.checkedNow')}
      footer={
        <View style={styles.footer}>
          <Button
            title={saved ? t('product.saved') : t('product.save')}
            variant="secondary"
            size="md"
            leading={<Icon name="bookmark" size={rs(20)} color="text" outline={!saved} />}
            onPress={toggleSave}
            loading={saveProduct.isPending || toggleSaved.isPending}
            style={styles.button}
            testID="product-save"
          />
          <Button
            title={t('result.done')}
            size="md"
            onPress={back}
            style={styles.button}
            testID="product-done"
          />
        </View>
      }
      testID="product-detail"
    />
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  footer: { flexDirection: 'row', gap: rs(spacing.sm) },
  button: { flex: 1 },
});
