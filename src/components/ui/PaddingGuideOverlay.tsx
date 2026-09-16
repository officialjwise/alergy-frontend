import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';
import { useDevStore } from '@/store/devStore';
import { layout } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/**
 * Developer overlay: draws the page padding, header top and tab bar bounds so
 * misaligned content is easy to spot. Toggled from the hidden gallery.
 */
export function PaddingGuideOverlay() {
  const enabled = useDevStore((state) => state.showGuides);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  if (!enabled) return null;
  const pad = rs(layout.screenPaddingH);
  const headerTop = insets.top + rs(layout.headerTop);
  const tabTop = height - insets.bottom - rs(layout.tabBarBottom) - rs(layout.tabBarHeight);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <View style={[styles.vertical, { left: pad }]} />
      <View style={[styles.vertical, { left: width - pad }]} />
      <View style={[styles.horizontal, { top: headerTop }]} />
      <View style={[styles.horizontal, { top: headerTop + rs(layout.headerHeight) }]} />
      <View style={[styles.horizontal, styles.tab, { top: tabTop }]} />
      <View style={[styles.label, { top: insets.top + 2, left: pad + 4 }]}>
        <Text variant="small" color="danger">
          {`pad ${pad} · header ${headerTop}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(245, 67, 58, 0.6)',
  },
  horizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(59, 159, 216, 0.6)',
  },
  tab: { backgroundColor: 'rgba(28, 151, 80, 0.6)' },
  label: { position: 'absolute' },
});
