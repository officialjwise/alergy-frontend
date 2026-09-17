import * as Notifications from 'expo-notifications';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import {
  Button,
  Chip,
  NavHeader,
  Screen,
  SettingsRow,
  SettingsSection,
  Sheet,
  showToast,
  Text,
  useSheetRef,
  WheelPicker,
} from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const REMINDER_ID = 'daily-scan-reminder';
const DAYS = [1, 2, 3, 4, 5, 6, 0];

/** Daily scan reminder with time and days; schedules a local notification when possible. */
export default function ScanRemindersScreen() {
  const { t, i18n } = useTranslation();
  const reminders = useAppStore((state) => state.reminders);
  const setReminders = useAppStore((state) => state.setReminders);
  const timeRef = useSheetRef();
  const [hour, setHour] = useState(reminders.hour);
  const [minute, setMinute] = useState(reminders.minute);

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, h) => ({ value: h, label: String(h).padStart(2, '0') })),
    [],
  );
  const minutes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i * 5,
        label: String(i * 5).padStart(2, '0'),
      })),
    [],
  );
  const timeLabel = new Date(2000, 0, 1, reminders.hour, reminders.minute).toLocaleTimeString(
    i18n.language,
    { hour: 'numeric', minute: '2-digit' },
  );

  const schedule = async (next: typeof reminders) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
      if (!next.enabled) return;
      await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: {
          title: t('settingsScreens.reminders.notificationTitle'),
          body: t('settingsScreens.reminders.notificationBody'),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: next.hour,
          minute: next.minute,
        },
      });
    } catch {
      // Scheduling is best effort on the simulator; the preference is still saved.
    }
  };

  const toggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        showToast({
          message: t('settingsScreens.reminders.permissionDenied'),
          icon: 'alert',
          action: { label: t('common.openSettings'), onPress: () => void Linking.openSettings() },
        });
        return;
      }
    }
    const next = { ...reminders, enabled };
    setReminders({ enabled });
    await schedule(next);
    showToast({
      message: enabled ? t('settingsScreens.reminders.saved') : t('settingsScreens.reminders.off'),
      icon: 'bell',
    });
  };

  const saveTime = async () => {
    const next = { ...reminders, hour, minute };
    setReminders({ hour, minute });
    timeRef.current?.dismiss();
    await schedule(next);
    showToast({ message: t('settingsScreens.reminders.saved'), icon: 'bell' });
  };

  const toggleDay = (day: number) => {
    const days = reminders.days.includes(day)
      ? reminders.days.filter((d) => d !== day)
      : [...reminders.days, day];
    setReminders({ days });
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.reminders.title')} />}
      testID="settings-reminders"
    >
      <SettingsSection style={styles.section}>
        <SettingsRow
          label={t('settingsScreens.reminders.enable')}
          description={t('settingsScreens.reminders.enableHint')}
          icon="bell"
          toggle={{ value: reminders.enabled, onChange: (value) => void toggle(value) }}
          testID="reminder-toggle"
        />
        <SettingsRow
          label={t('settingsScreens.reminders.time')}
          icon="clock"
          value={timeLabel}
          disabled={!reminders.enabled}
          onPress={() => timeRef.current?.present()}
          testID="reminder-time"
        />
      </SettingsSection>
      <Text
        variant="sectionLabel"
        color="textMuted"
        style={styles.label}
        accessibilityRole="header"
      >
        {t('settingsScreens.reminders.days')}
      </Text>
      <View style={styles.chips}>
        {DAYS.map((day) => (
          <Chip
            key={day}
            label={t(`settingsScreens.reminders.day_${day}`)}
            selected={reminders.days.includes(day)}
            onPress={() => toggleDay(day)}
          />
        ))}
      </View>
      <Sheet
        ref={timeRef}
        title={t('settingsScreens.reminders.timeSheetTitle')}
        closeLabel={t('common.close')}
      >
        <WheelPicker
          visibleRows={5}
          columns={[
            {
              accessibilityLabel: t('settingsScreens.reminders.hour'),
              value: hour,
              onChange: setHour,
              items: hours,
            },
            {
              accessibilityLabel: t('settingsScreens.reminders.minute'),
              value: minute,
              onChange: setMinute,
              items: minutes,
            },
          ]}
        />
        <Button
          title={t('settingsScreens.reminders.done')}
          size="md"
          onPress={() => void saveTime()}
          style={styles.done}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: rs(spacing.md) },
  label: { marginBottom: rs(spacing.xs) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  done: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
