import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FloatingTabBar } from '@/components/app/FloatingTabBar';
import { PlusMenu } from '@/components/app/PlusMenu';
import { OfflineBanner } from '@/components/ui';
import { colors } from '@/theme/tokens';

/** Main tabs: Home, Insights, Groups, Profile with the floating pill bar and + button. */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <OfflineBanner message={t('states.offline')} />
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
          lazy: true,
        }}
      >
        <Tabs.Screen name="home/index" options={{ title: t('tabs.home') }} />
        <Tabs.Screen name="insights/index" options={{ title: t('tabs.insights') }} />
        <Tabs.Screen name="groups/index" options={{ title: t('tabs.groups') }} />
        <Tabs.Screen name="profile/index" options={{ title: t('tabs.profile') }} />
      </Tabs>
      <PlusMenu />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background } });
