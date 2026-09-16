import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors, layout, motion, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ProgressHeaderProps {
  /** 0..1 */
  progress: number;
  onBack?: () => void;
  showProgress?: boolean;
  backLabel: string;
  progressLabel?: string;
}

/** Back circle (46pt, light gray) + 8pt animated progress bar, as on every survey screen. */
export function ProgressHeader({
  progress,
  onBack,
  showProgress = true,
  backLabel,
  progressLabel,
}: ProgressHeaderProps) {
  const width = useSharedValue(progress);
  useEffect(() => {
    width.value = withTiming(progress, { duration: motion.progress });
  }, [progress, width]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, width.value)) * 100}%`,
  }));

  return (
    <View style={styles.row}>
      {onBack ? (
        <BackButton onPress={onBack} label={backLabel} />
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      {showProgress ? (
        <View
          style={styles.track}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={progressLabel}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
        >
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      ) : null}
    </View>
  );
}

export function BackButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={styles.back}
    >
      <Icon name="arrowBack" size={rs(24)} color="text" />
    </PressableScale>
  );
}

const back = rs(sizes.backButton);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: back },
  back: {
    width: back,
    height: back,
    borderRadius: back / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: { width: 0, height: back },
  track: {
    flex: 1,
    height: sizes.progressBar,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    marginLeft: rs(layout.progressGapLeft),
    marginRight: rs(layout.progressInsetRight),
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.primary },
  spacer: { width: spacing.md },
});
