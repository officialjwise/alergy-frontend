import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, ErrorState, NavHeader, Screen, Skeleton } from '@/components/ui';
import { useScan } from '@/features/history/useHistory';
import { isResultVariant, ResultView } from '@/features/scan/components/ResultView';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/**
 * Scan result. Four verdict states plus the barcode and label variants, all
 * rendered by ResultView. "Done" returns to wherever the scan started because
 * the scanner and analyzing screens replaced themselves in the stack.
 */
export default function ScanResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; from?: string; variant?: string }>();
  const scan = useScan(params.id);
  const profile = useProfileStore(selectActiveProfile);

  const back = useCallback(
    () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')),
    [router],
  );

  if (scan.isLoading || (!scan.data && !scan.isError)) {
    return (
      <Screen header={<NavHeader onLeftPress={back} />} testID="result-loading">
        <Skeleton height={rs(260)} radius={radii.xl} style={styles.gap} />
        <Skeleton height={rs(88)} radius={radii.card} style={styles.gap} />
        <Skeleton height={rs(200)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (scan.isError || !scan.data) {
    return (
      <Screen header={<NavHeader onLeftPress={back} />} testID="result-error">
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void scan.refetch()}
          secondaryLabel={t('common.back')}
          onSecondary={back}
        />
      </Screen>
    );
  }

  const result = scan.data;
  const variant = isResultVariant(params.variant)
    ? params.variant
    : result.source === 'barcode'
      ? 'barcode'
      : result.mode === 'label' || result.mode === 'menu'
        ? 'label'
        : 'food';

  return (
    <ResultView
      scan={result}
      profile={profile}
      variant={variant}
      onBack={back}
      footer={
        <View style={styles.footer}>
          <Button
            title={t('result.fixResults')}
            variant="secondary"
            size="md"
            leading={undefined}
            onPress={() => router.push({ pathname: '/scan/fix/[id]', params: { id: result.id } })}
            style={styles.button}
            testID="result-fix"
          />
          <Button
            title={t('result.done')}
            size="md"
            haptic="medium"
            onPress={back}
            style={styles.button}
            testID="result-done"
          />
        </View>
      }
      testID={`result-${result.verdict.kind}`}
    />
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  footer: { flexDirection: 'row', gap: rs(spacing.sm) },
  button: { flex: 1 },
});
