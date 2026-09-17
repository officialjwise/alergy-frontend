import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { VerdictBadge } from '@/components/app/VerdictBadge';
import { Icon, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Product, VerdictKind } from '@/types';

export interface ProductRowProps {
  product: Product;
  /** Verdict for the active profile, computed by the caller. */
  kind: VerdictKind;
  onPress: (product: Product) => void;
}

/** Search result row: thumbnail, name, brand and the verdict pill for the active profile. */
function ProductRowComponent({ product, kind, onPress }: ProductRowProps) {
  return (
    <PressableScale
      onPress={() => onPress(product)}
      haptic="light"
      pressedScale={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}${product.brand ? `, ${product.brand}` : ''}`}
      style={styles.row}
      testID={`product-row-${product.id}`}
    >
      <View style={styles.thumb}>
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
          <Icon name="barcode" size={rs(22)} color="textMuted" outline />
        )}
      </View>
      <View style={styles.text}>
        <Text variant="label" color="text" numberOfLines={1}>
          {product.name}
        </Text>
        {product.brand ? (
          <Text variant="small" color="textMuted" numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}
        <View style={styles.badge}>
          <VerdictBadge kind={kind} />
        </View>
      </View>
      <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
    </PressableScale>
  );
}

export const ProductRow = memo(ProductRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    paddingVertical: rs(spacing.sm),
    paddingHorizontal: rs(spacing.md),
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: rs(56),
    height: rs(56),
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  badge: { marginTop: 4 },
});
