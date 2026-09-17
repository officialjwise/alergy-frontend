import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  SettingsRow,
  SettingsSection,
  Sheet,
  showToast,
  Text,
  useSheetRef,
  WheelPicker,
} from '@/components/ui';
import { HEALTH_CONDITIONS, conditionDef } from '@/features/questionnaire/definition';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { HealthConditionId } from '@/types';
import { daysInMonth } from '@/utils/date';

/**
 * Health conditions (questions 9 to 11): toggle each condition, set the end
 * date of temporary ones. They only take effect once the email is confirmed.
 */
export default function ConditionsScreen() {
  const { t, i18n } = useTranslation();
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const emailConfirmed = useAppStore((state) => state.session?.user.emailConfirmed ?? false);
  const dateRef = useSheetRef();
  const [editing, setEditing] = useState<HealthConditionId>('pregnancy');
  // Read the clock once per mount so the memoised year list stays stable.
  const [today] = useState(() => new Date());
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: 'long' }) })),
    [i18n.language],
  );
  const days = useMemo(() => Array.from({ length: daysInMonth(year, month) }, (_, index) => ({ value: index + 1, label: String(index + 1) })), [month, year]);
  const years = useMemo(() => Array.from({ length: 3 }, (_, index) => ({ value: today.getFullYear() + index, label: String(today.getFullYear() + index) })), [today]);

  if (!profile) return <Screen header={<NavHeader title={t('conditionsScreen.title')} />}>{null}</Screen>;

  const has = (id: HealthConditionId) => profile.conditions.some((item) => item.id === id);
  const toggle = (id: HealthConditionId, on: boolean) => {
    const now = new Date().toISOString();
    updateProfile(profile.id, {
      conditions: on
        ? [...profile.conditions, { id, temporary: conditionDef(id).temporary, endsAt: null, confirmedAt: null, addedAt: now }]
        : profile.conditions.filter((item) => item.id !== id),
    });
  };
  const openDate = (id: HealthConditionId) => {
    const current = profile.conditions.find((item) => item.id === id)?.endsAt;
    if (current) {
      const [y = today.getFullYear(), m = 1, d = 1] = current.split('-').map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    }
    setEditing(id);
    dateRef.current?.present();
  };
  const saveDate = () => {
    const clamped = Math.min(day, daysInMonth(year, month));
    const endsAt = `${year}-${String(month).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`;
    updateProfile(profile.id, {
      conditions: profile.conditions.map((item) => (item.id === editing ? { ...item, endsAt } : item)),
    });
    dateRef.current?.dismiss();
    showToast({ message: t('conditionsScreen.saved'), icon: 'checkCircle' });
  };

  return (
    <Screen header={<NavHeader title={t('conditionsScreen.title')} />} testID="settings-conditions">
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('conditionsScreen.subtitle')}
      </Text>
      {profile.conditions.length > 0 && !emailConfirmed ? (
        <View style={styles.notice}>
          <Icon name="mail" size={rs(20)} color="warning" />
          <Text variant="small" color="textBody" style={styles.noticeText}>
            {t('review.msg_confirm_email_body')}
          </Text>
        </View>
      ) : null}
      <SettingsSection style={styles.section}>
        {HEALTH_CONDITIONS.map((item) => {
          const on = has(item.id);
          const endsAt = profile.conditions.find((condition) => condition.id === item.id)?.endsAt;
          return (
            <SettingsRow
              key={item.id}
              label={t(`conditions.${item.id}`)}
              icon={item.icon}
              description={
                on && item.temporary
                  ? endsAt
                    ? t('conditionsScreen.endsOn', { date: endsAt })
                    : t('conditionsScreen.noEndDate')
                  : undefined
              }
              trailing={
                on && item.temporary ? (
                  <PressableScale onPress={() => openDate(item.id)} haptic="light" accessibilityRole="button" accessibilityLabel={t('conditionsScreen.setEnd')} style={styles.datePill}>
                    <Text variant="small" color="text">
                      {t('conditionsScreen.setEnd')}
                    </Text>
                  </PressableScale>
                ) : undefined
              }
              toggle={{ value: on, onChange: (value) => toggle(item.id, value) }}
              testID={`condition-${item.id}`}
            />
          );
        })}
      </SettingsSection>
      <Text variant="small" color="textMuted" style={styles.hint}>
        {t('q11.note')}
      </Text>

      <Sheet ref={dateRef} title={t(`conditions.${editing}`)} closeLabel={t('common.close')}>
        <WheelPicker
          visibleRows={5}
          columns={[
            { accessibilityLabel: t('birth.month'), align: 'left', flex: 1.55, items: months, value: month, onChange: setMonth },
            { accessibilityLabel: t('birth.day'), flex: 0.85, items: days, value: day, onChange: setDay },
            { accessibilityLabel: t('birth.year'), flex: 1.1, items: years, value: year, onChange: setYear },
          ]}
        />
        <Button title={t('common.done')} size="md" onPress={saveDate} style={styles.done} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rs(spacing.md) },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.warningTint,
  },
  noticeText: { flex: 1 },
  section: { marginTop: rs(spacing.lg) },
  datePill: { minHeight: rs(30), paddingHorizontal: rs(spacing.sm), borderRadius: radii.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: rs(spacing.xs) },
  hint: { marginTop: rs(spacing.xs) },
  done: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
