import { Image } from 'expo-image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { VerdictBadge } from '@/components/app/VerdictBadge';
import { Icon, Text, type IconName } from '@/components/ui';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';
import { formatTime } from '@/utils/date';

export interface FoodRowProps {
  scan: ScanResult;
  onPress: (scan: ScanResult) => void;
}

const MACROS: { key: 'protein' | 'carbs' | 'fat'; icon: IconName; color: ColorToken }[] = [
  { key: 'protein', icon: 'drumstick', color: 'protein' },
  { key: 'carbs', icon: 'grain', color: 'carbs' },
  { key: 'fat', icon: 'drop', color: 'fat' },
];

/** "Recently uploaded" row: photo, name and time, calories with the flame, macro grams, verdict. */
function FoodRowComponent({ scan, onPress }: FoodRowProps) {
  const { t, i18n } = useTranslation();
  const nutrition = scan.product.nutrition;
  const time = formatTime(scan.scannedAt, i18n.language);
  const calories = nutrition ? t('home.caloriesCount', { count: nutrition.calories }) : null;
  const macroText = nutrition
    ? MACROS.map((macro) => `${nutrition[macro.key]}g`).join(', ')
    : t('home.noFacts');
  return (
    <DashboardCard
      onPress={() => onPress(scan)}
      accessibilityLabel={`${scan.product.name}, ${time}${calories ? `, ${calories}` : ''}, ${macroText}`}
      padding={spacing.sm}
      testID={`food-row-${scan.id}`}
    >
      <View style={styles.row}>
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
            <Icon name="restaurant" size={rs(22)} color="textMuted" outline />
          )}
        </View>
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text variant="label" color="text" numberOfLines={1} style={styles.title}>
              {scan.product.name}
            </Text>
            <Text variant="small" color="textMuted">
              {time}
            </Text>
          </View>
          {nutrition ? (
            <>
              <View style={styles.calories}>
                <Icon name="flame" size={rs(15)} color="text" />
                <Text variant="label" color="text">
                  {calories}
                </Text>
              </View>
              <View style={styles.macros}>
                {MACROS.map((macro) => (
                  <View key={macro.key} style={styles.macro}>
                    <Icon name={macro.icon} size={rs(13)} color={macro.color} />
                    <Text variant="small" color="textBody">
                      {nutrition[macro.key]}g
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text variant="small" color="textMuted">
              {macroText}
            </Text>
          )}
          <View style={styles.badge}>
            <VerdictBadge kind={scan.verdict.kind} />
          </View>
        </View>
      </View>
    </DashboardCard>
  );
}

export const FoodRow = memo(FoodRowComponent);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  thumb: {
    width: rs(72),
    height: rs(72),
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: rs(3) },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  title: { flex: 1 },
  calories: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  macros: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  macro: { flexDirection: 'row', alignItems: 'center', gap: rs(3) },
  badge: { marginTop: rs(2), alignSelf: 'flex-start' },
});
