import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, PressableScale, Text, type IconName } from '@/components/ui';
import { haptic } from '@/hooks/useHaptics';
import { usePlusMenuStore } from '@/store/plusMenuStore';
import { colors, layout, radii, shadows, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

interface Tile {
  key: string;
  labelKey: string;
  icon: IconName;
  href: Href;
}

const TILES: Tile[] = [
  { key: 'reaction', labelKey: 'plus.logReaction', icon: 'reaction', href: '/reactions/new' },
  { key: 'saved', labelKey: 'plus.savedFoods', icon: 'bookmark', href: '/saved' },
  { key: 'search', labelKey: 'plus.foodSearch', icon: 'search', href: '/search' },
  { key: 'scan', labelKey: 'plus.scanFood', icon: 'scan', href: '/scan' },
];

/**
 * 2x2 grid of white tiles above the tab bar with a dimmed backdrop.
 * The tab bar stays visible so the + button (now an X) can close it.
 */
export function PlusMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const open = usePlusMenuStore((store) => store.open);
  const setOpen = usePlusMenuStore((store) => store.setOpen);

  useEffect(() => {
    if (!open) return;
    haptic('light');
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [open, setOpen]);

  if (!open) return null;

  const tabBarTop =
    Math.max(insets.bottom, spacing.sm) + rs(layout.tabBarBottom) + rs(layout.tabBarHeight);

  const go = (href: Href) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(140)}
      style={[styles.backdrop, { bottom: tabBarTop }]}
      accessibilityViewIsModal
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setOpen(false)}
        accessibilityRole="button"
        accessibilityLabel={t('plus.close')}
      />
      <View style={styles.grid} pointerEvents="box-none">
        {TILES.map((tile, index) => (
          <Animated.View
            key={tile.key}
            entering={ZoomIn.duration(200).delay(index * 40)}
            exiting={ZoomOut.duration(120)}
            style={styles.tileWrap}
          >
            <PressableScale
              onPress={() => go(tile.href)}
              haptic="light"
              pressedScale={0.96}
              accessibilityRole="button"
              accessibilityLabel={t(tile.labelKey)}
              style={styles.tile}
              testID={`plus-${tile.key}`}
            >
              <Icon name={tile.icon} size={rs(sizes.plusTileIcon)} color="text" outline />
              <Text variant="label" color="text">
                {t(tile.labelKey)}
              </Text>
            </PressableScale>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: rs(layout.screenPaddingH),
    paddingBottom: rs(spacing.md),
    gap: rs(spacing.sm),
  },
  tileWrap: { width: '48%', flexGrow: 1 },
  tile: {
    height: rs(96),
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(spacing.xs),
    ...shadows.badge,
  },
});
