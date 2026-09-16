import type { Tabs } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Avatar, Icon, PressableScale, Text, type IconName } from '@/components/ui';
import { haptic } from '@/hooks/useHaptics';
import { usePlusMenuStore } from '@/store/plusMenuStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, shadows, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Props expo-router passes to a custom tab bar (react-navigation's BottomTabBarProps). */
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAB_ICONS: Record<string, IconName> = {
  home: 'home',
  insights: 'insights',
  groups: 'people',
  profile: 'person',
};

/**
 * Floating pill tab bar with a light grey pill behind the active tab, the
 * user's avatar as the Profile icon, and a separate round dark + button that
 * turns into an X while the plus menu is open.
 */
export function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { t } = useTranslation();
  const profile = useProfileStore(selectActiveProfile);
  const open = usePlusMenuStore((store) => store.open);
  const toggle = usePlusMenuStore((store) => store.toggle);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(open ? 45 : 0, { damping: 14, stiffness: 180 });
  }, [open, rotation]);

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const bottom = Math.max(insets.bottom, spacing.sm) + rs(layout.tabBarBottom);

  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <View style={styles.pill} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] ?? {};
          const label = options?.title ?? route.name;
          const focused = state.index === index;
          const name = route.name.split('/')[0] ?? route.name;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptic('selection');
              navigation.navigate(route.name);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={[styles.tab, focused ? styles.tabActive : null]}
              testID={`tab-${name}`}
            >
              {name === 'profile' && profile ? (
                <Avatar
                  name={profile.name}
                  color={profile.color}
                  size={sizes.tabAvatar}
                  bordered={false}
                />
              ) : name === 'profile' ? (
                <View style={styles.emptyAvatar} />
              ) : (
                <Icon
                  name={TAB_ICONS[name] ?? 'home'}
                  size={rs(24)}
                  color={focused ? 'text' : 'textMuted'}
                  outline={!focused}
                />
              )}
              <Text variant="tabLabel" color={focused ? 'text' : 'textMuted'} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <PressableScale
        onPress={() => {
          haptic('medium');
          toggle();
        }}
        pressedScale={0.92}
        accessibilityRole="button"
        accessibilityLabel={open ? t('plus.close') : t('plus.open')}
        accessibilityState={{ expanded: open }}
        style={styles.plus}
        testID="tab-plus"
      >
        <Animated.View style={plusStyle}>
          <Icon name="plus" size={rs(30)} color="onPrimary" />
        </Animated.View>
      </PressableScale>
    </View>
  );
}

const plus = rs(sizes.plusButton);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: rs(layout.screenPaddingH),
    right: rs(layout.screenPaddingH),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: rs(layout.tabBarHeight),
    padding: rs(6),
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    ...shadows.sheet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radii.pill,
  },
  tabActive: { backgroundColor: colors.surfaceStrong },
  emptyAvatar: {
    width: rs(sizes.tabAvatar),
    height: rs(sizes.tabAvatar),
    borderRadius: rs(sizes.tabAvatar) / 2,
    backgroundColor: colors.track,
  },
  plus: {
    width: plus,
    height: plus,
    borderRadius: plus / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sheet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
  },
});
