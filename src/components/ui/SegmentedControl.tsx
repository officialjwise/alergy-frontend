import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from './Text';
import { haptic } from '@/hooks/useHaptics';
import { colors, motion, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface SegmentedOption<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `pill` is the grey track with a white sliding thumb (week selector); `chips` the plain range selector. */
  variant?: 'pill' | 'chips';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Equal-width segments with a thumb that slides on the UI thread. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'pill',
  style,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.key === value),
  );
  const segment = options.length ? width / options.length : 0;
  const x = useSharedValue(index * segment);

  useEffect(() => {
    x.value = withTiming(index * segment, { duration: motion.select });
  }, [index, segment, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[styles.track, variant === 'chips' ? styles.chipsTrack : null, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width - PAD * 2)}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {segment > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            variant === 'chips' ? styles.chipsThumb : null,
            { width: segment },
            thumbStyle,
          ]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => {
              if (!selected) {
                haptic('selection');
                onChange(option.key);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={styles.segment}
          >
            <Text
              variant="small"
              color={selected ? 'text' : 'textMuted'}
              numberOfLines={1}
              style={selected ? styles.selectedLabel : null}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PAD = 4;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.pill,
    padding: PAD,
    alignSelf: 'stretch',
  },
  chipsTrack: { backgroundColor: 'transparent' },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    ...shadows.badge,
  },
  chipsThumb: { backgroundColor: colors.surfaceStrong, shadowOpacity: 0, elevation: 0 },
  segment: {
    flex: 1,
    minHeight: rs(36),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(spacing.xs),
  },
  selectedLabel: { fontFamily: 'Inter_600SemiBold' },
});
