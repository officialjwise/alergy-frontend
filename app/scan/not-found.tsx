import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, EmptyState, NavHeader, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Barcode not found: scan the label instead or add the product manually. */
export default function NotFoundScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ barcode?: string; from?: string }>();
  const from = params.from ?? 'home';
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));

  return (
    <Screen
      header={<NavHeader onLeftPress={back} />}
      footer={
        <View style={styles.footer}>
          <Button
            title={t('notFound.scanLabel')}
            haptic="medium"
            onPress={() => router.replace({ pathname: '/scan', params: { mode: 'label', from } })}
            testID="not-found-label"
          />
          <Button
            title={t('notFound.addManually')}
            variant="secondary"
            onPress={() =>
              router.replace({ pathname: '/scan/manual', params: { query: params.barcode ?? '' } })
            }
            testID="not-found-manual"
          />
        </View>
      }
      testID="scan-not-found"
    >
      <EmptyState
        icon="barcode"
        title={t('notFound.title')}
        body={
          params.barcode ? t('notFound.body', { code: params.barcode }) : t('notFound.bodyNoCode')
        }
        style={styles.state}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  state: { flex: 1, justifyContent: 'center' },
  footer: { gap: rs(spacing.sm) },
});
