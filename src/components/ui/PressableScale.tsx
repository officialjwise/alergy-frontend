import { forwardRef, useCallback } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { haptic, type HapticKind } from '@/hooks/useHaptics';
import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends PressableProps {
  /** Scale applied while pressed. */
  pressedScale?: number;
  /** Opacity applied while pressed. */
  pressedOpacity?: number;
  haptic?: HapticKind;
}

/**
 * Press feedback on the UI thread (scale + opacity) plus optional haptics.
 * Every tappable element in the app is built on this.
 */
export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  {
    pressedScale = motion.pressScale,
    pressedOpacity = 0.92,
    haptic: hapticKind = 'none',
    onPressIn,
    onPressOut,
    onPress,
    disabled,
    style,
    ...rest
  },
  ref,
) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - pressedScale) }],
    opacity: 1 - pressed.value * (1 - pressedOpacity),
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      pressed.value = withTiming(1, { duration: motion.press });
      onPressIn?.(event);
    },
    [onPressIn, pressed],
  );
  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      pressed.value = withTiming(0, { duration: motion.press });
      onPressOut?.(event);
    },
    [onPressOut, pressed],
  );
  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      haptic(hapticKind);
      onPress?.(event);
    },
    [hapticKind, onPress],
  );

  return (
    <AnimatedPressable
      ref={ref}
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      // Pressable accepts a style function; we only support static styles here.
      style={[animatedStyle, typeof style === 'function' ? undefined : style]}
    />
  );
});
