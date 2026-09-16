import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SCAN_MODES, ZOOM_LEVELS, type ZoomLevel } from '../modes';
import { Icon, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanMode } from '@/types';

export interface ModeTilesProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}

/** Food / Barcode / Label / Menu tiles; the selected one is white with dark text. */
export function ModeTiles({ mode, onChange }: ModeTilesProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tiles}
      accessibilityRole="tablist"
      accessibilityLabel={t('scan.modesA11y')}
    >
      {SCAN_MODES.map((item) => {
        const selected = item.key === mode;
        return (
          <PressableScale
            key={item.key}
            onPress={() => onChange(item.key)}
            haptic="selection"
            pressedScale={0.95}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t(item.labelKey)}
            style={[styles.tile, selected ? styles.tileSelected : null]}
            testID={`mode-${item.key}`}
          >
            <Icon name={item.icon} size={rs(22)} color={selected ? 'text' : 'textOnDark'} outline />
            <Text variant="small" color={selected ? 'text' : 'textOnDark'} numberOfLines={1}>
              {t(item.labelKey)}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

export interface ZoomPillsProps {
  value: ZoomLevel;
  onChange: (value: ZoomLevel) => void;
  /** Whether the device exposes an ultra wide lens (shows the .5x pill). */
  hasUltraWide: boolean;
}

export function ZoomPills({ value, onChange, hasUltraWide }: ZoomPillsProps) {
  const { t } = useTranslation();
  const levels = ZOOM_LEVELS.filter((level) => level.key !== '0.5' || hasUltraWide);
  return (
    <View
      style={styles.zoomRow}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('scan.zoomLabel')}
    >
      {levels.map((level) => {
        const selected = level.key === value;
        return (
          <PressableScale
            key={level.key}
            onPress={() => onChange(level.key)}
            haptic="selection"
            pressedScale={0.92}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t('scan.zoomA11y', { level: level.label })}
            style={[styles.zoomPill, selected ? styles.zoomPillSelected : null]}
            testID={`zoom-${level.key}`}
          >
            <Text variant="small" color={selected ? 'text' : 'textOnDark'}>
              {level.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const TRANSLUCENT = 'rgba(255, 255, 255, 0.16)';

const styles = StyleSheet.create({
  tiles: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: rs(spacing.xs),
    paddingHorizontal: rs(spacing.lg),
  },
  tile: {
    minWidth: rs(84),
    height: rs(64),
    paddingHorizontal: rs(spacing.sm),
    borderRadius: radii.card,
    backgroundColor: TRANSLUCENT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(4),
  },
  tileSelected: { backgroundColor: colors.background },
  zoomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(spacing.xs),
  },
  zoomPill: {
    minWidth: rs(40),
    height: rs(30),
    paddingHorizontal: rs(spacing.sm),
    borderRadius: radii.pill,
    backgroundColor: TRANSLUCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPillSelected: { backgroundColor: colors.background },
});
