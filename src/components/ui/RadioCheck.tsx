import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from './Icon';
import { borders, colors, motion, sizes } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface RadioCheckProps {
  selected: boolean;
  size?: number;
}

/**
 * The 32pt indicator on the right of option cards: a thin gray ring when
 * unselected, a filled near-black circle with a white check when selected.
 * The PDF uses the same indicator for single and multi select.
 */
export function RadioCheck({ selected, size = sizes.radio }: RadioCheckProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: motion.select });
  }, [progress, selected]);

  const filledStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  const dimension = rs(size);
  return (
    <View style={[styles.wrapper, { width: dimension, height: dimension }]}>
      <View
        style={[styles.ring, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      />
      <Animated.View
        style={[
          styles.filled,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          filledStyle,
        ]}
      >
        <Icon name="check" size={Math.round(dimension * 0.56)} color="onPrimary" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: borders.selected,
    borderColor: colors.ring,
    backgroundColor: colors.background,
  },
  filled: {
    position: 'absolute',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
