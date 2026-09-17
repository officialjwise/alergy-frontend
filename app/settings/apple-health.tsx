import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, NavHeader, Screen, showToast, Text } from '@/components/ui';
import { useConnectHealth, useHealthConnection } from '@/features/tracking/useTracking';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatShortDate } from '@/utils/date';


/** "Sync to Apple Health": the illustration, the promise, and Connect / Disconnect. */
export default function AppleHealthScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const health = useHealthConnection();
  const connect = useConnectHealth();
  const connected = health.data?.connected ?? false;

  const toggle = useCallback(async () => {
    try {
      const next = await connect.mutateAsync(!connected);
      showToast({
        message: t(next.connected ? 'appleHealth.connected' : 'appleHealth.disconnected'),
        icon: 'heart',
      });
      if (next.connected) router.back();
    } catch {
      showToast({ message: t('appleHealth.failed'), icon: 'alert' });
    }
  }, [connect, connected, router, t]);

  return (
    <Screen
      header={<NavHeader />}
      footer={
        <Button
          title={connected ? t('appleHealth.disconnect') : t('appleHealth.connect')}
          variant={connected ? 'secondary' : 'primary'}
          onPress={() => void toggle()}
          loading={connect.isPending}
          haptic="medium"
        />
      }
      testID="apple-health"
    >
      <View style={styles.art} accessible accessibilityLabel={t('appleHealth.artA11y')}>
        <View style={styles.leftLabels}>
          <Text variant="label" color="text">
            {t('appleHealth.walking')}
          </Text>
          <Text variant="label" color="text">
            {t('appleHealth.running')}
          </Text>
        </View>
        <View style={styles.heartTile}>
          <Icon name="heart" size={rs(40)} color="health" />
        </View>
        <View style={styles.link}>
          <View style={styles.check}>
            <Icon name="check" size={rs(14)} color="onPrimary" />
          </View>
        </View>
        <View style={styles.appTile}>
          <Icon name="scan" size={rs(56)} color="onPrimary" />
          <View style={styles.appLogo}>
            <Icon name="leaf" size={rs(22)} color="onPrimary" />
          </View>
        </View>
        <View style={styles.rightLabels}>
          <Text variant="label" color="text">
            {t('appleHealth.yoga')}
          </Text>
          <Text variant="label" color="text">
            {t('appleHealth.sleep')}
          </Text>
        </View>
      </View>
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('appleHealth.title')}
      </Text>
      <Text variant="subtitle" color="textMuted">
        {t('appleHealth.subtitle', { app: t('home.appName') })}
      </Text>
      {connected && health.data?.connectedAt ? (
        <Text variant="body" color="success" style={styles.status}>
          {t('appleHealth.connectedSince', {
            date: formatShortDate(health.data.connectedAt, i18n.language),
          })}
        </Text>
      ) : null}
    </Screen>
  );
}


const styles = StyleSheet.create({
  art: {
    height: rs(240),
    marginTop: rs(spacing.lg),
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceTint,
    overflow: 'hidden',
  },
  leftLabels: { position: 'absolute', left: rs(24), top: rs(64), gap: rs(spacing.md) },
  rightLabels: { position: 'absolute', right: rs(24), top: rs(120), gap: rs(spacing.md) },
  heartTile: {
    position: 'absolute',
    left: rs(70),
    top: rs(140),
    width: rs(72),
    height: rs(72),
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.badge,
  },
  link: {
    position: 'absolute',
    left: rs(150),
    top: rs(112),
    width: rs(40),
    height: rs(60),
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.text,
    borderTopLeftRadius: rs(20),
  },
  check: {
    position: 'absolute',
    left: -rs(13),
    top: rs(34),
    width: rs(24),
    height: rs(24),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTile: {
    position: 'absolute',
    right: rs(64),
    top: rs(36),
    width: rs(84),
    height: rs(84),
    borderRadius: radii.card,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogo: { position: 'absolute' },
  title: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.sm) },
  status: { marginTop: rs(spacing.md) },
});
