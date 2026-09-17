import { useRef, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { haptic } from '@/hooks/useHaptics';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface SwipeRowProps {
  children: ReactNode;
  /** Label of the action revealed on the right (Delete, Remove). */
  actionLabel: string;
  onAction: () => void;
  icon?: IconName;
  color?: ColorToken;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ACTION_WIDTH = 96;

/** Swipe a row to the left to reveal a destructive action; a full swipe triggers it. */
export function SwipeRow({
  children,
  actionLabel,
  onAction,
  icon = 'trash',
  color = 'danger',
  enabled = true,
  style,
  testID,
}: SwipeRowProps) {
  const ref = useRef<SwipeableMethods>(null);
  const trigger = () => {
    ref.current?.close();
    haptic('warning');
    onAction();
  };
  return (
    <ReanimatedSwipeable
      ref={ref}
      enabled={enabled}
      friction={2}
      rightThreshold={ACTION_WIDTH * 0.6}
      overshootRight={false}
      containerStyle={style}
      renderRightActions={(progress) => (
        <RightAction
          progress={progress}
          label={actionLabel}
          icon={icon}
          color={color}
          onPress={trigger}
        />
      )}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') trigger();
      }}
      testID={testID}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

function RightAction({
  progress,
  label,
  icon,
  color,
  onPress,
}: {
  progress: SharedValue<number>;
  label: string;
  icon: IconName;
  color: ColorToken;
  onPress: () => void;
}) {
  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.5),
    transform: [{ scale: 0.8 + Math.min(1, progress.value) * 0.2 }],
  }));
  return (
    <View style={styles.actionWrap}>
      <Animated.View style={[styles.action, { backgroundColor: colors[color] }, animated]}>
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={styles.actionPress}
        >
          <Icon name={icon} size={rs(22)} color="onPrimary" outline />
          <Text variant="small" color="onPrimary">
            {label}
          </Text>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionWrap: { width: ACTION_WIDTH, paddingLeft: rs(spacing.xs) },
  action: { flex: 1, borderRadius: radii.card, overflow: 'hidden' },
  actionPress: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
