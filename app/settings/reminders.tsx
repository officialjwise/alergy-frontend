import * as Notifications from 'expo-notifications';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { Button, Icon, NavHeader, PressableScale, Screen, SettingsRow, SettingsSection, Sheet, showToast, Text, useSheetRef, WheelPicker } from '@/components/ui';
import { useAppStore, type MealReminderKey } from '@/store/appStore';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const MEALS: MealReminderKey[] = ['breakfast', 'lunch', 'snack', 'dinner'];

/** Tracking Reminders: a reminder per meal with its time, plus the End of Day reminder. */
export default function TrackingRemindersScreen() {
  const { t, i18n } = useTranslation();
  const reminders = useAppStore((state) => state.mealReminders);
  const setMealReminder = useAppStore((state) => state.setMealReminder);
  const timeRef = useSheetRef();
  const [editing, setEditing] = useState<MealReminderKey>('breakfast');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    Notifications.getPermissionsAsync()
      .then((permission) => {
        if (active) setGranted(permission.granted);
      })
      .catch(() => {
        if (active) setGranted(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => ({ value: h, label: String(h).padStart(2, '0') })), []);
  const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: String(i * 5).padStart(2, '0') })), []);
  const timeLabel = (key: MealReminderKey) =>
    new Date(2000, 0, 1, reminders[key].hour, reminders[key].minute).toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' });

  const schedule = async (key: MealReminderKey) => {
    const reminder = useAppStore.getState().mealReminders[key];
    const identifier = `meal-reminder-${key}`;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
      if (!reminder.enabled) return;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: t(`settingsScreens.reminders.notify_${key}`),
          body: t('settingsScreens.reminders.notifyBody'),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: reminder.hour, minute: reminder.minute },
      });
    } catch {
      // Best effort on the simulator; the preference is saved either way.
    }
  };

  const toggle = async (key: MealReminderKey, enabled: boolean) => {
    if (enabled && granted === false) {
      const permission = await Notifications.requestPermissionsAsync();
      setGranted(permission.granted);
      if (!permission.granted) {
        showToast({ message: t('settingsScreens.reminders.permissionDenied'), icon: 'alert', action: { label: t('common.openSettings'), onPress: () => void Linking.openSettings() } });
        return;
      }
    }
    setMealReminder(key, { enabled });
    await schedule(key);
  };

  const openTime = (key: MealReminderKey) => {
    setEditing(key);
    setHour(reminders[key].hour);
    setMinute(reminders[key].minute);
    timeRef.current?.present();
  };
  const saveTime = async () => {
    setMealReminder(editing, { hour, minute });
    timeRef.current?.dismiss();
    await schedule(editing);
    showToast({ message: t('settingsScreens.reminders.saved'), icon: 'bell' });
  };

  return (
    <Screen header={<NavHeader />} testID="settings-reminders">
      {granted === false ? (
        <View style={styles.notice}>
          <Text variant="small" color="textBody">
            {t('settingsScreens.reminders.disabledNotice', { app: t('home.appName') })}
          </Text>
          <PressableScale onPress={() => void Linking.openSettings()} haptic="light" accessibilityRole="button" accessibilityLabel={t('common.openSettings')} style={styles.noticeLink}>
            <Text variant="label" color="text">
              {t('common.openSettings')}
            </Text>
            <Icon name="chevronRight" size={rs(14)} color="text" />
          </PressableScale>
        </View>
      ) : null}
      <Text variant="largeTitle" color="text" style={styles.title} accessibilityRole="header">
        {t('settingsScreens.reminders.title')}
      </Text>
      <SettingsSection>
        {MEALS.map((key) => (
          <SettingsRow
            key={key}
            label={t(`settingsScreens.reminders.${key}`)}
            trailing={
              <TimePill
                label={t(`settingsScreens.reminders.${key}`)}
                time={timeLabel(key)}
                onPress={() => openTime(key)}
                testID={`reminder-time-${key}`}
              />
            }
            toggle={{ value: reminders[key].enabled, onChange: (value) => void toggle(key, value) }}
            testID={`reminder-${key}`}
          />
        ))}
      </SettingsSection>
      <SettingsSection style={styles.endOfDay}>
        <SettingsRow
          label={t('settingsScreens.reminders.endOfDay')}
          trailing={
            <TimePill
              label={t('settingsScreens.reminders.endOfDay')}
              time={timeLabel('endOfDay')}
              onPress={() => openTime('endOfDay')}
              testID="reminder-time-endOfDay"
            />
          }
          toggle={{ value: reminders.endOfDay.enabled, onChange: (value) => void toggle('endOfDay', value) }}
          testID="reminder-endOfDay"
        />
      </SettingsSection>
      <Text variant="small" color="textMuted" style={styles.note}>
        {t('settingsScreens.reminders.endOfDayHint')}
      </Text>

      <Sheet ref={timeRef} title={t(`settingsScreens.reminders.${editing}`)} closeLabel={t('common.close')}>
        <WheelPicker
          visibleRows={5}
          columns={[
            { accessibilityLabel: t('settingsScreens.reminders.hour'), value: hour, onChange: setHour, items: hours },
            { accessibilityLabel: t('settingsScreens.reminders.minute'), value: minute, onChange: setMinute, items: minutes },
          ]}
        />
        <Button title={t('settingsScreens.reminders.done')} size="md" onPress={() => void saveTime()} style={styles.done} />
      </Sheet>
    </Screen>
  );
}

function TimePill({ label, time, onPress, testID }: { label: string; time: string; onPress: () => void; testID?: string }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.96}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${time}`}
      style={styles.timePill}
      testID={testID}
    >
      <Text variant="small" color="text">
        {time}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: rs(6),
  },
  noticeLink: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 32 },
  title: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.lg) },
  timePill: { minHeight: rs(30), paddingHorizontal: rs(spacing.sm), borderRadius: radii.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: rs(spacing.xs) },
  endOfDay: { marginTop: rs(spacing.md) },
  note: { marginTop: -rs(spacing.md), paddingHorizontal: rs(spacing.md) },
  done: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
