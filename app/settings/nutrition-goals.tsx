import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Icon, NavHeader, PressableScale, Ring, Screen, showToast, Text, type IconName } from '@/components/ui';
import { caloriesFromMacros, generateGoals, rebalanceMacros } from '@/features/tracking/nutrition';
import { useBodyMetrics, useNutritionGoals, useUpdateGoals } from '@/features/tracking/useTracking';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { typography } from '@/theme/typography';
import type { NutritionGoals } from '@/types';

type GoalKey = keyof NutritionGoals;
const MACROS: { key: GoalKey; icon: IconName; color: ColorToken }[] = [
  { key: 'calories', icon: 'flame', color: 'text' },
  { key: 'protein', icon: 'drumstick', color: 'protein' },
  { key: 'carbs', icon: 'grain', color: 'carbs' },
  { key: 'fat', icon: 'drop', color: 'fat' },
];
const MICROS: { key: GoalKey; icon: IconName; color: ColorToken }[] = [
  { key: 'fiber', icon: 'fiberLeaf', color: 'fiber' },
  { key: 'sugar', icon: 'candy', color: 'sugar' },
  { key: 'sodium', icon: 'salt', color: 'sodium' },
];

/** Edit nutrition goals: a ring and field per goal, the micronutrients fold, and Auto Generate Goals. */
export default function NutritionGoalsScreen() {
  const { t } = useTranslation();
  const goals = useNutritionGoals();
  const updateGoals = useUpdateGoals();
  const body = useBodyMetrics();
  const profile = useProfileStore(selectActiveProfile);
  const autoAdjust = useAppStore((state) => state.preferences.autoAdjustMacros);
  const [draft, setDraft] = useState<Record<GoalKey, string>>(toDraft(goals));
  const [showMicros, setShowMicros] = useState(false);
  // Re-seed the fields when the stored goals change (auto generate, another screen).
  const [seenGoals, setSeenGoals] = useState(goals);
  if (seenGoals !== goals) {
    setSeenGoals(goals);
    setDraft(toDraft(goals));
  }

  const commit = useCallback(
    (key: GoalKey) => {
      const value = Math.max(0, Math.round(Number(draft[key])));
      if (!Number.isFinite(value) || value === goals[key]) {
        setDraft(toDraft(goals));
        return;
      }
      let next: NutritionGoals = { ...goals, [key]: value };
      if (autoAdjust && (key === 'protein' || key === 'carbs' || key === 'fat')) {
        next = rebalanceMacros(goals, key, value);
      } else if (autoAdjust && key === 'calories' && goals.calories > 0) {
        const scale = value / goals.calories;
        next = { ...next, protein: Math.round(goals.protein * scale), carbs: Math.round(goals.carbs * scale), fat: Math.round(goals.fat * scale) };
      } else if (!autoAdjust && key !== 'calories' && key !== 'fiber' && key !== 'sugar' && key !== 'sodium') {
        next = { ...next, calories: caloriesFromMacros(next) };
      }
      updateGoals(next);
      showToast({ message: t('settingsScreens.nutritionGoals.saved'), icon: 'checkCircle' });
    },
    [autoAdjust, draft, goals, t, updateGoals],
  );

  const autoGenerate = () => {
    const generated = generateGoals(body, profile?.birthDate ?? null);
    if (!generated) {
      showToast({ message: t('settingsScreens.nutritionGoals.needDetails'), icon: 'alert' });
      return;
    }
    updateGoals(generated);
    showToast({ message: t('settingsScreens.nutritionGoals.generated'), icon: 'sparkles' });
  };

  const row = (item: { key: GoalKey; icon: IconName; color: ColorToken }) => (
    <View key={item.key} style={styles.row}>
      <Ring size={rs(56)} thickness={6} progress={item.key === 'calories' ? 1 : Math.min(1, goals[item.key] / Math.max(1, goals[item.key]))} color={item.color} trackColor="track">
        <Icon name={item.icon} size={rs(18)} color={item.color} />
      </Ring>
      <View style={styles.field}>
        <Text variant="small" color="textMuted">
          {t(`settingsScreens.nutritionGoals.${item.key}`)}
        </Text>
        <TextInput
          value={draft[item.key]}
          onChangeText={(value) => setDraft((current) => ({ ...current, [item.key]: value.replace(/[^0-9]/g, '') }))}
          onEndEditing={() => commit(item.key)}
          keyboardType="number-pad"
          returnKeyType="done"
          style={styles.input}
          accessibilityLabel={t(`settingsScreens.nutritionGoals.${item.key}`)}
          testID={`goal-${item.key}`}
        />
      </View>
    </View>
  );

  return (
    <Screen
      header={<NavHeader />}
      keyboardAvoiding
      footer={
        <Button
          title={t('settingsScreens.nutritionGoals.autoGenerate')}
          variant="secondary"
          leading={<Icon name="starFour" size={rs(18)} color="text" />}
          onPress={autoGenerate}
          haptic="medium"
          testID="goals-auto"
        />
      }
      testID="settings-nutrition-goals"
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('settingsScreens.nutritionGoals.title')}
      </Text>
      <View style={styles.list}>{MACROS.map(row)}</View>
      <PressableScale
        onPress={() => setShowMicros((current) => !current)}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={t(showMicros ? 'settingsScreens.nutritionGoals.hideMicros' : 'settingsScreens.nutritionGoals.viewMicros')}
        style={styles.toggle}
      >
        <Text variant="small" color="textMuted">
          {t(showMicros ? 'settingsScreens.nutritionGoals.hideMicros' : 'settingsScreens.nutritionGoals.viewMicros')}
        </Text>
        <Icon name="chevronDown" size={rs(14)} color="textMuted" style={showMicros ? styles.flip : undefined} />
      </PressableScale>
      {showMicros ? <View style={styles.list}>{MICROS.map(row)}</View> : null}
    </Screen>
  );
}

function toDraft(goals: NutritionGoals): Record<GoalKey, string> {
  return {
    calories: String(goals.calories),
    protein: String(goals.protein),
    carbs: String(goals.carbs),
    fat: String(goals.fat),
    fiber: String(goals.fiber),
    sugar: String(goals.sugar),
    sodium: String(goals.sodium),
  };
}

const styles = StyleSheet.create({
  title: { marginTop: rs(spacing.md), marginBottom: rs(spacing.lg) },
  list: { gap: rs(spacing.sm) },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  field: {
    flex: 1,
    minHeight: rs(56),
    justifyContent: 'center',
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  input: { ...typography.label, color: colors.text, paddingVertical: 0, marginTop: 2 },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 44, marginVertical: rs(spacing.xs) },
  flip: { transform: [{ rotate: '180deg' }] },
});
