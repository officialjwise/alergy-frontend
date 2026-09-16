import { useCameraPermissions } from 'expo-camera';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, IconChip, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/**
 * Camera permission explainer (not in the PDF). Shown only when the user said
 * yes to scanning. Handles the denied state with a link to Settings.
 */
export default function CameraPermissionScreen() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const denied = permission?.status === 'denied' && !permission.canAskAgain;

  const request = useCallback(
    async (goNext: () => void) => {
      const result = await requestPermission();
      if (result.granted || !result.canAskAgain) goNext();
    },
    [requestPermission],
  );

  return (
    <OnboardingScreen
      route="camera-permission"
      title={denied ? t('permissions.cameraDeniedTitle') : t('permissions.cameraTitle')}
      subtitle={denied ? t('permissions.cameraDeniedSubtitle') : t('permissions.cameraSubtitle')}
      footer={(nav) => (
        <View style={styles.footer}>
          {denied ? (
            <Button
              title={t('common.openSettings')}
              onPress={() => void Linking.openSettings()}
              haptic="medium"
            />
          ) : (
            <Button
              title={t('common.allow')}
              onPress={() => void request(nav.goNext)}
              haptic="medium"
            />
          )}
          <Button title={t('common.notNow')} variant="text" onPress={nav.goNext} />
        </View>
      )}
    >
      <View style={styles.illustration}>
        <IconChip
          icon={denied ? 'eyeOff' : 'camera'}
          size={120}
          iconSize={52}
          outline
          background="surfaceTint"
        />
        {permission?.granted ? (
          <Text variant="body" color="successBright" align="center" style={styles.granted}>
            {t('common.done')}
          </Text>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  illustration: { alignItems: 'center', marginTop: rv(spacing.massive) },
  granted: { marginTop: rs(spacing.md) },
  footer: { gap: spacing.xs },
});
