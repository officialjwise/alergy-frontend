import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { Text } from './Text';
import { colors, spacing } from '@/theme/tokens';

export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return unsubscribe;
  }, []);
  return offline;
}

/** Slides down from the status bar when the device loses connectivity. */
export function OfflineBanner({ message, force = false }: { message: string; force?: boolean }) {
  const offline = useIsOffline();
  const insets = useSafeAreaInsets();
  if (!offline && !force) return null;
  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View style={styles.row}>
        <Icon name="wifiOff" size={18} color="onPrimary" />
        <Text variant="small" color="onPrimary" style={styles.text}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: colors.primary,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center' },
  text: { flexShrink: 1 },
});
