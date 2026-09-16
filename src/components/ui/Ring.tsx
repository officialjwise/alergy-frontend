import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors, motion, type ColorToken } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface RingProps {
  size: number;
  /** Stroke width in points. */
  thickness?: number;
  /** 0..1. Animated on change. */
  progress: number;
  color?: ColorToken;
  trackColor?: ColorToken;
  /** Dashed track for "no data" days. */
  dashed?: boolean;
  /** Node drawn in the centre (icon, number). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Circular progress ring drawn with SVG; the arc animates on the UI thread. */
export function Ring({
  size,
  thickness = 6,
  progress,
  color = 'success',
  trackColor = 'track',
  dashed = false,
  children,
  style,
  accessibilityLabel,
}: RingProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = useSharedValue(Math.min(1, Math.max(0, progress)));

  useEffect(() => {
    value.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: motion.progress,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - value.value),
  }));

  return (
    <View
      style={[{ width: size, height: size }, styles.wrap, style]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[trackColor]}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={dashed ? [thickness * 0.9, thickness * 0.9] : undefined}
          strokeLinecap="round"
        />
        {progress > 0 ? (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors[color]}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[circumference, circumference]}
            animatedProps={animatedProps}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        ) : null}
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
