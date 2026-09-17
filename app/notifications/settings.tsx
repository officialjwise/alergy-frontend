import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import {
  Button,
  Icon,
  NavHeader,
  Screen,
  SettingsRow,
  SettingsSection,
  Text,
} from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Per-kind notification switches, with a banner when the system permission is off. */
export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const prefs = useAppStore((state) => state.notificationPrefs);
  const setPrefs = useAppStore((state) => state.setNotificationPrefs);
  const [systemGranted, setSystemGranted] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    Notifications.getPermissionsAsync()
      .then((result) => {
        if (active) setSystemGranted(result.granted);
      })
      .catch(() => {
        if (active) setSystemGranted(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen
      header={<NavHeader title={t('notifications.settingsTitle')} />}
      testID="notification-settings"
    >
      {systemGranted === false ? (
        <View style={styles.banner}>
          <Icon name="alert" size={rs(20)} color="warning" />
          <Text variant="small" color="textBody" style={styles.bannerText}>
            {t('notifications.systemOff')}
          </Text>
          <Button
            title={t('notifications.openSettings')}
            size="sm"
            variant="secondary"
            onPress={() => void Linking.openSettings()}
          />
        </View>
      ) : null}
      <SettingsSection style={styles.section}>
        <SettingsRow
          label={t('notifications.productAlerts')}
          description={t('notifications.productAlertsHint')}
          icon="bookmark"
          toggle={{
            value: prefs.productAlerts,
            onChange: (value) => setPrefs({ productAlerts: value }),
          }}
        />
        <SettingsRow
          label={t('notifications.groupActivity')}
          description={t('notifications.groupActivityHint')}
          icon="people"
          toggle={{
            value: prefs.groupActivity,
            onChange: (value) => setPrefs({ groupActivity: value }),
          }}
        />
        <SettingsRow
          label={t('notifications.replies')}
          description={t('notifications.repliesHint')}
          icon="chat"
          toggle={{ value: prefs.replies, onChange: (value) => setPrefs({ replies: value }) }}
        />
        <SettingsRow
          label={t('notifications.reminders')}
          description={t('notifications.remindersHint')}
          icon="bell"
          toggle={{ value: prefs.reminders, onChange: (value) => setPrefs({ reminders: value }) }}
        />
      </SettingsSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.warningTint,
  },
  bannerText: { flex: 1 },
  section: { marginTop: rs(spacing.md) },
});
