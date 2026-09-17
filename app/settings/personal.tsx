import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Divider,
  Icon,
  ListRow,
  NavHeader,
  PressableScale,
  RadioCheck,
  Screen,
  SettingsRow,
  SettingsSection,
  Sheet,
  showToast,
  Text,
  useSheetRef,
  WheelPicker,
} from '@/components/ui';
import { formatHeight } from '@/features/tracking/nutrition';
import { useBodyMetrics, useUpdateBody } from '@/features/tracking/useTracking';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Gender, ProfileFor } from '@/types';
import { daysInMonth } from '@/utils/date';

const PROFILE_FOR: ProfileFor[] = ['myself', 'child', 'family', 'care'];
const GENDERS: Gender[] = ['male', 'female', 'other'];
type NumberField = 'goal' | 'weight' | 'steps';

/** Personal Details: goal weight with Change Goal, current weight, height, date of birth, gender and step goal. */
export default function PersonalDetailsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const session = useAppStore((state) => state.session);
  const body = useBodyMetrics();
  const updateBody = useUpdateBody();
  const numberRef = useSheetRef();
  const heightRef = useSheetRef();
  const birthRef = useSheetRef();
  const genderRef = useSheetRef();
  const forRef = useSheetRef();
  const [field, setField] = useState<NumberField>('weight');
  const [numberValue, setNumberValue] = useState(0);
  const [feet, setFeet] = useState(Math.floor((body.heightInches ?? 66) / 12));
  const [inches, setInches] = useState(Math.round((body.heightInches ?? 66) % 12));
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(profile?.birthDate?.year ?? 2000);
  const [month, setMonth] = useState(profile?.birthDate?.month ?? 1);
  const [day, setDay] = useState(profile?.birthDate?.day ?? 1);

  const numberItems = useMemo(() => {
    if (field === 'steps') {
      return Array.from({ length: 40 }, (_, index) => ({ value: (index + 1) * 500, label: String((index + 1) * 500) }));
    }
    return Array.from({ length: 351 }, (_, index) => ({ value: index + 50, label: String(index + 50) }));
  }, [field]);
  const feetItems = useMemo(() => Array.from({ length: 6 }, (_, index) => ({ value: index + 3, label: `${index + 3} ft` })), []);
  const inchItems = useMemo(() => Array.from({ length: 12 }, (_, index) => ({ value: index, label: `${index} in` })), []);
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: 'long' }) })),
    [i18n.language],
  );
  const days = useMemo(() => Array.from({ length: daysInMonth(year, month) }, (_, index) => ({ value: index + 1, label: String(index + 1) })), [month, year]);
  const years = useMemo(() => Array.from({ length: 110 }, (_, index) => ({ value: currentYear - index, label: String(currentYear - index) })), [currentYear]);

  if (!profile) {
    return <Screen header={<NavHeader title={t('settingsScreens.personal.title')} />}>{null}</Screen>;
  }

  const openNumber = (next: NumberField) => {
    setField(next);
    setNumberValue(
      next === 'goal' ? (body.goalWeightLbs ?? body.currentWeightLbs ?? 150) : next === 'weight' ? (body.currentWeightLbs ?? 150) : body.dailyStepGoal,
    );
    numberRef.current?.present();
  };
  const saved = () => showToast({ message: t('settingsScreens.personal.saved'), icon: 'checkCircle' });
  const saveNumber = () => {
    if (field === 'goal') updateBody({ goalWeightLbs: numberValue });
    else if (field === 'weight') updateBody({ currentWeightLbs: numberValue });
    else updateBody({ dailyStepGoal: numberValue });
    numberRef.current?.dismiss();
    saved();
  };
  const saveHeight = () => {
    updateBody({ heightInches: feet * 12 + inches });
    heightRef.current?.dismiss();
    saved();
  };
  const saveBirth = () => {
    updateProfile(profile.id, { birthDate: { year, month, day: Math.min(day, daysInMonth(year, month)) } });
    birthRef.current?.dismiss();
    saved();
  };
  const birthLabel = profile.birthDate
    ? `${String(profile.birthDate.month).padStart(2, '0')}/${String(profile.birthDate.day).padStart(2, '0')}/${profile.birthDate.year}`
    : t('settingsScreens.personal.notSet');
  const notSet = t('settingsScreens.personal.notSet');

  return (
    <Screen header={<NavHeader title={t('settingsScreens.personal.title')} />} testID="settings-personal">
      <View style={styles.goalCard}>
        <View style={styles.goalText}>
          <Text variant="small" color="textMuted">
            {t('settingsScreens.personal.goalWeight')}
          </Text>
          <Text variant="cardTitle" color="text">
            {body.goalWeightLbs === null ? notSet : t('insights.lbs', { value: body.goalWeightLbs })}
          </Text>
        </View>
        <PressableScale
          onPress={() => openNumber('goal')}
          haptic="light"
          pressedScale={0.96}
          accessibilityRole="button"
          accessibilityLabel={t('settingsScreens.personal.changeGoal')}
          style={styles.changeGoal}
          testID="personal-change-goal"
        >
          <Text variant="small" color="onPrimary">
            {t('settingsScreens.personal.changeGoal')}
          </Text>
        </PressableScale>
      </View>

      <View style={styles.rows}>
        <DetailRow label={t('settingsScreens.personal.currentWeight')} value={body.currentWeightLbs === null ? notSet : t('insights.lbs', { value: body.currentWeightLbs })} onPress={() => openNumber('weight')} testID="personal-weight" />
        <DetailRow label={t('settingsScreens.personal.height')} value={formatHeight(body.heightInches) ?? notSet} onPress={() => heightRef.current?.present()} testID="personal-height" />
        <DetailRow label={t('settingsScreens.personal.birthDate')} value={birthLabel} onPress={() => birthRef.current?.present()} testID="personal-birth" />
        <DetailRow label={t('settingsScreens.personal.gender')} value={body.gender ? t(`settingsScreens.personal.gender_${body.gender}`) : notSet} onPress={() => genderRef.current?.present()} testID="personal-gender" />
        <DetailRow label={t('settingsScreens.personal.stepGoal')} value={t('settingsScreens.personal.steps', { count: body.dailyStepGoal })} onPress={() => openNumber('steps')} testID="personal-steps" last />
      </View>

      <SettingsSection title={t('settingsScreens.personal.accountSection')} style={styles.account}>
        <SettingsRow label={t('settingsScreens.personal.profileFor')} icon="people" value={t(`profile.for_${profile.profileFor}`)} onPress={() => forRef.current?.present()} testID="personal-for" />
        <SettingsRow label={t('settingsScreens.personal.email')} icon="mail" value={session?.user.email ?? t('settingsScreens.personal.noEmail')} onPress={() => router.push('/settings/change-email')} testID="personal-email" />
      </SettingsSection>

      <Sheet ref={numberRef} title={t(`settingsScreens.personal.sheet_${field}`)} closeLabel={t('common.close')}>
        <WheelPicker
          visibleRows={5}
          columns={[
            {
              accessibilityLabel: t(`settingsScreens.personal.sheet_${field}`),
              value: numberValue,
              onChange: setNumberValue,
              items: numberItems,
            },
          ]}
        />
        <Text variant="small" color="textMuted" align="center">
          {field === 'steps' ? t('settingsScreens.personal.stepsUnit') : 'lbs'}
        </Text>
        <Button title={t('settingsScreens.personal.done')} size="md" onPress={saveNumber} style={styles.sheetButton} testID="number-done" />
      </Sheet>

      <Sheet ref={heightRef} title={t('settingsScreens.personal.height')} closeLabel={t('common.close')}>
        <WheelPicker
          visibleRows={5}
          columns={[
            { accessibilityLabel: t('settingsScreens.personal.feet'), value: feet, onChange: setFeet, items: feetItems },
            { accessibilityLabel: t('settingsScreens.personal.inches'), value: inches, onChange: setInches, items: inchItems },
          ]}
        />
        <Button title={t('settingsScreens.personal.done')} size="md" onPress={saveHeight} style={styles.sheetButton} testID="height-done" />
      </Sheet>

      <Sheet ref={birthRef} title={t('settingsScreens.personal.birthDate')} closeLabel={t('common.close')}>
        <WheelPicker
          visibleRows={5}
          columns={[
            { accessibilityLabel: t('birth.month'), align: 'left', flex: 1.6, value: month, onChange: setMonth, items: months },
            { accessibilityLabel: t('birth.day'), flex: 0.9, value: day, onChange: setDay, items: days },
            { accessibilityLabel: t('birth.year'), flex: 1.2, value: year, onChange: setYear, items: years },
          ]}
        />
        <Button title={t('settingsScreens.personal.done')} size="md" onPress={saveBirth} style={styles.sheetButton} testID="birth-done" />
      </Sheet>

      <Sheet ref={genderRef} title={t('settingsScreens.personal.gender')} closeLabel={t('common.close')}>
        <View style={styles.sheetList}>
          {GENDERS.map((option, index) => (
            <View key={option}>
              <ListRow
                label={t(`settingsScreens.personal.gender_${option}`)}
                trailing={<RadioCheck selected={body.gender === option} />}
                onPress={() => {
                  updateBody({ gender: option });
                  genderRef.current?.dismiss();
                  saved();
                }}
                accessibilityLabel={t(`settingsScreens.personal.gender_${option}`)}
              />
              {index < GENDERS.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      </Sheet>

      <Sheet ref={forRef} title={t('settingsScreens.personal.forSheetTitle')} closeLabel={t('common.close')}>
        <View style={styles.sheetList}>
          {PROFILE_FOR.map((option, index) => (
            <View key={option}>
              <ListRow
                label={t(`profile.for_${option}`)}
                trailing={<RadioCheck selected={profile.profileFor === option} />}
                onPress={() => {
                  updateProfile(profile.id, { profileFor: option });
                  forRef.current?.dismiss();
                  saved();
                }}
                accessibilityLabel={t(`profile.for_${option}`)}
              />
              {index < PROFILE_FOR.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}

function DetailRow({ label, value, onPress, last = false, testID }: { label: string; value: string; onPress: () => void; last?: boolean; testID?: string }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      pressedScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.row, last ? styles.rowLast : null]}
      testID={testID}
    >
      <Text variant="body" color="textBody" style={styles.rowLabel}>
        {label}
      </Text>
      <Text variant="label" color="text">
        {value}
      </Text>
      <Icon name="edit" size={rs(16)} color="textMuted" outline />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.lg),
    paddingVertical: rs(spacing.md),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.background,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  goalText: { flex: 1, gap: 2 },
  changeGoal: { minHeight: rs(32), paddingHorizontal: rs(spacing.sm), borderRadius: radii.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  rows: { marginTop: rs(spacing.lg), paddingHorizontal: rs(spacing.md) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    minHeight: rs(52),
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { flex: 1 },
  account: { marginTop: rs(spacing.xl) },
  sheetList: { paddingBottom: rs(spacing.sm) },
  sheetButton: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
