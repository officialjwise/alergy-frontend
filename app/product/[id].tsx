import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SafetyNotice } from '@/components/app/SafetyNotice';
import { VerdictBadge } from '@/components/app/VerdictBadge';
import {
  BackButton,
  Card,
  ErrorState,
  Icon,
  ListRow,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { useScan } from '@/features/history/useHistory';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import { formatLongDate } from '@/utils/date';

/** Product / meal detail for a scanned item. */
export default function ProductScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useScan(id);

  if (scan.isLoading) {
    return (
      <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
        <Skeleton height={rs(220)} radius={radii.lg} style={styles.gap} />
        <Skeleton height={rs(160)} radius={radii.lg} style={styles.gap} />
      </Screen>
    );
  }
  if (scan.isError || !scan.data) {
    return (
      <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void scan.refetch()}
        />
      </Screen>
    );
  }
  const { product, verdict, scannedAt, source } = scan.data;

  return (
    <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
      <View style={styles.image}>
        {product.imageUri ? (
          <Image
            source={{ uri: product.imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : product.blurhash ? (
          <Image
            source={{ blurhash: product.blurhash }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <Icon name="barcode" size={rs(40)} color="textMuted" outline />
        )}
      </View>
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {product.name}
      </Text>
      <View style={styles.badge}>
        <VerdictBadge kind={verdict.kind} size="md" />
      </View>
      <Card style={styles.card}>
        {product.brand ? (
          <ListRow label={t('product.brand')} value={product.brand} icon="storefront" />
        ) : null}
        {product.barcode ? (
          <ListRow label={t('product.barcode')} value={product.barcode} icon="barcode" />
        ) : null}
        {product.category ? (
          <ListRow label={t('product.category')} value={product.category} icon="filter" />
        ) : null}
        <ListRow
          label={t('product.scannedOn', { date: formatLongDate(scannedAt, i18n.language) })}
          value={t(`product.source_${source}`)}
          icon="clock"
        />
      </Card>
      <Card title={t('verdict.ingredientsList')} style={styles.card}>
        <Text variant="body" color="textBody">
          {product.ingredientsText}
        </Text>
        {product.allergenStatement ? (
          <>
            <Text variant="bodyStrong" color="text" style={styles.sub}>
              {t('verdict.allergenStatement')}
            </Text>
            <Text variant="body" color="textBody">
              {product.allergenStatement}
            </Text>
          </>
        ) : null}
        {product.mayContain.length > 0 ? (
          <>
            <Text variant="bodyStrong" color="text" style={styles.sub}>
              {t('verdict.mayContain')}
            </Text>
            <Text variant="body" color="textBody">
              {product.mayContain.join(', ')}
            </Text>
          </>
        ) : null}
      </Card>
      <View style={styles.card}>
        <SafetyNotice compact />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: rs(spacing.md) },
  image: {
    height: rs(200),
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rv(spacing.md),
  },
  title: { marginTop: rv(spacing.lg) },
  badge: { marginTop: rs(spacing.sm) },
  card: { marginTop: rv(spacing.md) },
  sub: { marginTop: rs(spacing.md), marginBottom: 4 },
});
