import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { haptic } from '@/hooks/useHaptics';
import { borders, colors, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface WheelItem {
  value: number;
  label: string;
}

export interface WheelColumnProps {
  items: readonly WheelItem[];
  value: number;
  onChange: (value: number) => void;
  align?: 'left' | 'center';
  flex?: number;
  accessibilityLabel: string;
  rowHeight: number;
  visibleRows: number;
}

const WheelColumn = memo(function WheelColumn({
  items,
  value,
  onChange,
  align = 'center',
  flex = 1,
  accessibilityLabel,
  rowHeight,
  visibleRows,
}: WheelColumnProps) {
  // A plain ScrollView (not a virtualized list) so the wheel can live inside a scrolling screen.
  const listRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const padding = rowHeight * Math.floor(visibleRows / 2);
  const lastReported = useRef(value);

  // Keep the wheel in sync when the value changes from outside (day clamped after a month change).
  useEffect(() => {
    if (value !== lastReported.current) {
      lastReported.current = value;
      setActiveIndex(selectedIndex);
      listRef.current?.scrollTo({ y: selectedIndex * rowHeight, animated: true });
    }
  }, [rowHeight, selectedIndex, value]);

  const commit = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      const item = items[clamped];
      if (!item) return;
      setActiveIndex(clamped);
      if (item.value !== lastReported.current) {
        lastReported.current = item.value;
        haptic('selection');
        onChange(item.value);
      }
    },
    [items, onChange],
  );

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      commit(Math.round(event.nativeEvent.contentOffset.y / rowHeight));
    },
    [commit, rowHeight],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / rowHeight);
      if (index !== activeIndex && index >= 0 && index < items.length) setActiveIndex(index);
    },
    [activeIndex, items.length, rowHeight],
  );

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const delta =
        event.nativeEvent.actionName === 'increment'
          ? 1
          : event.nativeEvent.actionName === 'decrement'
            ? -1
            : 0;
      if (!delta) return;
      const next = Math.max(0, Math.min(items.length - 1, selectedIndex + delta));
      listRef.current?.scrollTo({ y: next * rowHeight, animated: true });
      commit(next);
    },
    [commit, items.length, rowHeight, selectedIndex],
  );

  return (
    <View
      style={[styles.column, { flex }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[selectedIndex]?.label ?? '' }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
    >
      <ScrollView
        ref={listRef}
        contentOffset={{ x: 0, y: selectedIndex * rowHeight }}
        onLayout={() =>
          listRef.current?.scrollTo({ y: selectedIndex * rowHeight, animated: false })
        }
        snapToInterval={rowHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: padding }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        onScroll={onScroll}
        scrollEventThrottle={32}
        nestedScrollEnabled
        importantForAccessibility="no-hide-descendants"
      >
        {items.map((item, index) => (
          <View
            key={item.value}
            style={[
              styles.row,
              { height: rowHeight },
              align === 'left' ? styles.left : styles.center,
            ]}
          >
            <Text
              variant="wheel"
              color={index === activeIndex ? 'text' : 'textFaded'}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export interface WheelPickerProps {
  columns: Omit<WheelColumnProps, 'rowHeight' | 'visibleRows'>[];
  rowHeight?: number;
  visibleRows?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Three-column wheel from the "When were you born?" screen: 50pt rows, a
 * 52pt lavender highlight pill, faded neighbours and thin column separators.
 */
export function WheelPicker({
  columns,
  rowHeight = rs(sizes.wheelRow),
  visibleRows = 7,
  style,
}: WheelPickerProps) {
  const height = rowHeight * visibleRows;
  const highlight = rs(sizes.wheelHighlight);
  return (
    <View style={[styles.wrap, { height }, style]}>
      <View
        pointerEvents="none"
        style={[styles.highlight, { height: highlight, top: (height - highlight) / 2 }]}
      />
      <View style={styles.columns}>
        {columns.map((column, index) => (
          <View
            key={column.accessibilityLabel}
            style={[styles.columnWrap, { flex: column.flex ?? 1 }]}
          >
            {index > 0 ? (
              <View
                style={[
                  styles.separator,
                  { top: (height - highlight) / 2 + 4, height: highlight - 8 },
                ]}
              />
            ) : null}
            <WheelColumn {...column} rowHeight={rowHeight} visibleRows={visibleRows} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  columns: { flexDirection: 'row', flex: 1 },
  columnWrap: { flexDirection: 'row' },
  column: { flex: 1 },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceStrong,
  },
  separator: {
    position: 'absolute',
    left: 0,
    width: borders.hairline,
    backgroundColor: colors.track,
  },
  row: { justifyContent: 'center', paddingHorizontal: rs(spacing.lg) },
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
});
