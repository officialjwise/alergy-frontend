import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Divider,
  ListRow,
  NavHeader,
  RadioCheck,
  Screen,
  SettingsRow,
  SettingsSection,
  Sheet,
  showToast,
  useSheetRef,
  WheelPicker,
} from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ProfileFor } from '@/types';
import { daysInMonth, formatBirthDate } from '@/utils/date';

const PROFILE_FOR: ProfileFor[] = ['myself', 'child', 'family', 'care'];

/** Name, who the profile is for, birth date and email (with change email). */
export default function PersonalDetailsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const session = useAppStore((state) => state.session);
  const forRef = useSheetRef();
  const birthRef = useSheetRef();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(profile?.birthDate?.year ?? 2000);
  const [month, setMonth] = useState(profile?.birthDate?.month ?? 6);
  const [day, setDay] = useState(profile?.birthDate?.day ?? 15);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: 'long' }),
      })),
    [i18n.language],
  );
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth(year, month) }, (_, index) => ({
        value: index + 1,
        label: String(index + 1),
      })),
    [month, year],
  );
  const years = useMemo(
    () =>
      Array.from({ length: 110 }, (_, index) => ({
        value: currentYear - index,
        label: String(currentYear - index),
      })),
    [currentYear],
  );

  if (!profile) {
    return (
      <Screen header={<NavHeader title={t('settingsScreens.personal.title')} />}>{null}</Screen>
    );
  }

  const saveBirth = () => {
    const clampedDay = Math.min(day, daysInMonth(year, month));
    updateProfile(profile.id, { birthDate: { year, month, day: clampedDay } });
    birthRef.current?.dismiss();
    showToast({ message: t('settingsScreens.personal.saved'), icon: 'checkCircle' });
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.personal.title')} />}
      testID="settings-personal"
    >
      <SettingsSection style={styles.section}>
        <SettingsRow
          label={t('settingsScreens.personal.name')}
          icon="person"
          value={profile.name}
          onPress={() => router.push('/settings/name')}
        />
        <SettingsRow
          label={t('settingsScreens.personal.profileFor')}
          icon="people"
          value={t(`profile.for_${profile.profileFor}`)}
          onPress={() => forRef.current?.present()}
          testID="personal-for"
        />
        <SettingsRow
          label={t('settingsScreens.personal.birthDate')}
          icon="calendar"
          value={
            profile.birthDate
              ? formatBirthDate(profile.birthDate, i18n.language)
              : t('settingsScreens.personal.notSet')
          }
          onPress={() => birthRef.current?.present()}
          testID="personal-birth"
        />
        <SettingsRow
          label={t('settingsScreens.personal.email')}
          icon="mail"
          value={session?.user.email ?? t('settingsScreens.personal.noEmail')}
          onPress={() => router.push('/settings/change-email')}
          testID="personal-email"
        />
      </SettingsSection>

      <Sheet
        ref={forRef}
        title={t('settingsScreens.personal.forSheetTitle')}
        closeLabel={t('common.close')}
      >
        <View style={styles.sheetList}>
          {PROFILE_FOR.map((option, index) => (
            <View key={option}>
              <ListRow
                label={t(`profile.for_${option}`)}
                trailing={<RadioCheck selected={profile.profileFor === option} />}
                onPress={() => {
                  updateProfile(profile.id, { profileFor: option });
                  forRef.current?.dismiss();
                  showToast({ message: t('settingsScreens.personal.saved'), icon: 'checkCircle' });
                }}
                accessibilityLabel={t(`profile.for_${option}`)}
              />
              {index < PROFILE_FOR.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      </Sheet>

      <Sheet
        ref={birthRef}
        title={t('settingsScreens.personal.birthSheetTitle')}
        closeLabel={t('common.close')}
      >
        <WheelPicker
          visibleRows={5}
          columns={[
            {
              accessibilityLabel: t('birth.month'),
              align: 'left',
              flex: 1.6,
              value: month,
              onChange: setMonth,
              items: months,
            },
            {
              accessibilityLabel: t('birth.day'),
              flex: 0.9,
              value: day,
              onChange: setDay,
              items: days,
            },
            {
              accessibilityLabel: t('birth.year'),
              flex: 1.2,
              value: year,
              onChange: setYear,
              items: years,
            },
          ]}
        />
        <Button
          title={t('settingsScreens.personal.done')}
          size="md"
          onPress={saveBirth}
          style={styles.sheetButton}
          testID="birth-done"
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: rs(spacing.md) },
  sheetList: { paddingBottom: rs(spacing.sm) },
  sheetButton: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
