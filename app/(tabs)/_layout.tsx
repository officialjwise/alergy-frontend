import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfflineBanner, Icon, type IconName } from '@/components/ui';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';

const TAB_ICONS: Record<'home' | 'scan' | 'history' | 'profile', IconName> = {
  home: 'home',
  scan: 'scan',
  history: 'history',
  profile: 'person',
};

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? spacing.xs : 0);

  return (
    <>
      <OfflineBanner message={t('states.offline')} />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: [styles.bar, { height: 56 + bottomInset, paddingBottom: bottomInset }],
          tabBarLabelStyle: styles.label,
          tabBarItemStyle: styles.item,
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              name={TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? 'home'}
              size={size}
              color={String(color)}
              outline={!focused}
            />
          ),
          sceneStyle: { backgroundColor: colors.background },
        })}
      >
        <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
        <Tabs.Screen name="scan" options={{ title: t('tabs.scan') }} />
        <Tabs.Screen name="history" options={{ title: t('tabs.history') }} />
        <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    elevation: 0,
    paddingTop: 6,
  },
  label: { fontFamily: fontFamily.medium, fontSize: 12, marginTop: 2 },
  item: { paddingVertical: 2 },
});
