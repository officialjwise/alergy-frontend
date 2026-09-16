import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Button, NavHeader, Screen, Text, WorksForYouBadge } from '@/components/ui';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const cameraScan = require('@/assets/images/camera-scan.jpg');

export interface CameraPermissionViewProps {
  /** `ask` explains before the native prompt; `denied` sends the user to Settings. */
  variant: 'ask' | 'denied';
  onAllow: () => void;
  onOpenSettings: () => void;
  onTypeInstead: () => void;
  onClose: () => void;
  busy?: boolean;
}

/** Pre-permission explainer (our design) shown inside the scanner before the native camera prompt. */
export function CameraPermissionView({
  variant,
  onAllow,
  onOpenSettings,
  onTypeInstead,
  onClose,
  busy = false,
}: CameraPermissionViewProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - rs(layout.screenPaddingH) * 2 - rs(16), 420);
  const cardHeight = Math.round(cardWidth * (450 / 590));
  const denied = variant === 'denied';

  return (
    <Screen
      header={<NavHeader leftIcon="close" leftLabel={t('scan.close')} onLeftPress={onClose} />}
      footer={
        <View style={styles.footer}>
          <Button
            title={denied ? t('common.openSettings') : t('permissions.cameraAllow')}
            onPress={denied ? onOpenSettings : onAllow}
            loading={busy}
            haptic="medium"
            testID="camera-permission-primary"
          />
          <Button
            title={t('permissions.cameraTypeInstead')}
            variant="text"
            onPress={onTypeInstead}
          />
        </View>
      }
      testID={`camera-permission-${variant}`}
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {denied ? t('permissions.cameraDeniedTitle') : t('permissions.cameraTitle')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {denied ? t('permissions.cameraDeniedSubtitle') : t('permissions.cameraBody')}
      </Text>
      <View
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('camera.imageA11y')}
      >
        <Image
          source={cameraScan}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <WorksForYouBadge
          label={t('welcome.badge')}
          style={[
            styles.badge,
            { right: Math.round(cardWidth * 0.04), top: Math.round(cardHeight * 0.16) },
          ]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  card: {
    alignSelf: 'center',
    marginTop: rv(spacing.xl),
    borderRadius: radii.xl,
    overflow: 'visible',
    backgroundColor: colors.surfaceTint,
  },
  badge: { position: 'absolute' },
  footer: { gap: spacing.xs },
});
