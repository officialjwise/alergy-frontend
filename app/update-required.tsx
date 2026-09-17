import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { Button, IconChip, NavHeader, Screen, Text } from '@/components/ui';
import { appConfig } from '@/config/app';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** App update required (placeholder approved by the brief): blocks use until the store update is installed. */
export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Screen
      header={<NavHeader leftIcon="none" />}
      footer={
        <Button
          title={t('updateRequired.update')}
          onPress={() => void Linking.openURL(appConfig.storeUrl)}
          haptic="medium"
          testID="update-now"
        />
      }
      testID="update-required"
    >
      <View style={styles.hero}>
        <IconChip icon="download" size={88} iconSize={40} background="surfaceTint" outline />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {t('updateRequired.title')}
        </Text>
        <Text variant="subtitle" color="textMuted" align="center">
          {t('updateRequired.body')}
        </Text>
        <Text variant="small" color="textPlaceholder">
          {t('updateRequired.version', { version })}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: rs(spacing.md) },
});
