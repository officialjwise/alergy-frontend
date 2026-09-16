import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, sizes, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface SpinnerProps {
  size?: number;
  color?: ColorToken;
  thickness?: number;
  accessibilityLabel?: string;
}

/** Thin rotating ring (blue in the PDF's setup checklist), animated on the UI thread. */
export function Spinner({
  size = sizes.spinner,
  color = 'info',
  thickness = 3,
  accessibilityLabel,
}: SpinnerProps) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);
  const animated = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const dimension = rs(size);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={{ width: dimension, height: dimension }}
    >
      <Animated.View
        style={[
          styles.ring,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth: thickness,
            borderColor: colors[color],
            borderTopColor: 'transparent',
          },
          animated,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({ ring: { position: 'absolute' } });
