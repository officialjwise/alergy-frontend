import { Image } from 'expo-image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { VerdictBadge } from './VerdictBadge';
import { Icon, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';
import { formatTime } from '@/utils/date';

export interface ScanRowProps {
  scan: ScanResult;
  onPress: (scan: ScanResult) => void;
  showTime?: boolean;
  /** Show the flagged ingredients as small chips under the verdict (Home). */
  showTriggers?: boolean;
}

const MAX_TRIGGER_CHIPS = 3;

/** A history / recent-scan row: product thumbnail, name, brand, verdict badge. */
function ScanRowComponent({ scan, onPress, showTime = true, showTriggers = false }: ScanRowProps) {
  const { i18n } = useTranslation();
  const triggerNames = showTriggers
    ? Array.from(new Set(scan.verdict.triggers.map((trigger) => trigger.ingredientName)))
    : [];
  const extraTriggers = Math.max(0, triggerNames.length - MAX_TRIGGER_CHIPS);
  return (
    <PressableScale
      onPress={() => onPress(scan)}
      haptic="light"
      pressedScale={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${scan.product.name}${scan.product.brand ? `, ${scan.product.brand}` : ''}`}
      style={styles.row}
      testID={`scan-row-${scan.id}`}
    >
      <View style={styles.thumb}>
        {scan.product.imageUri ? (
          <Image
            source={{ uri: scan.product.imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            placeholder={{ blurhash: scan.product.blurhash }}
            transition={150}
          />
        ) : scan.product.blurhash ? (
          <Image
            source={{ blurhash: scan.product.blurhash }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <Icon name="barcode" size={rs(22)} color="textMuted" outline />
        )}
      </View>
      <View style={styles.text}>
        <Text variant="label" color="text" numberOfLines={1}>
          {scan.product.name}
        </Text>
        <Text variant="small" color="textMuted" numberOfLines={1}>
          {[scan.product.brand, showTime ? formatTime(scan.scannedAt, i18n.language) : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <View style={styles.badge}>
          <VerdictBadge kind={scan.verdict.kind} />
        </View>
        {triggerNames.length ? (
          <View style={styles.chips} accessibilityLabel={triggerNames.join(', ')}>
            {triggerNames.slice(0, MAX_TRIGGER_CHIPS).map((name) => (
              <View key={name} style={styles.chip}>
                <Text variant="small" color="textBody" numberOfLines={1}>
                  {name}
                </Text>
              </View>
            ))}
            {extraTriggers > 0 ? (
              <View style={styles.chip}>
                <Text variant="small" color="textMuted">
                  +{extraTriggers}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.trailing}>
        {scan.saved ? <Icon name="bookmark" size={rs(18)} color="primary" /> : null}
        <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
      </View>
    </PressableScale>
  );
}

export const ScanRow = memo(ScanRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    paddingVertical: rs(spacing.sm),
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: rs(spacing.md),
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6), marginTop: rs(6) },
  chip: {
    paddingHorizontal: rs(spacing.xs),
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceStrong,
  },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
});
