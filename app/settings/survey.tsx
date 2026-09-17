import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  NavHeader,
  OptionCard,
  Screen,
  SettingsRow,
  SettingsSection,
  Sheet,
  showToast,
  useSheetRef,
} from '@/components/ui';
import {
  challengesQuestion,
  frequencyQuestion,
  goalQuestion,
  reasonsQuestion,
  watchForQuestion,
  type AnyQuestionConfig,
} from '@/features/onboarding/questions';
import { useOnboardingStore } from '@/store/onboardingStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { AvoidReason, Goal, OnboardingAnswers } from '@/types';

type Editable = 'frequency' | 'watchFor' | 'reasons' | 'challenges' | 'goal';

/** The yes/no question has no options; only choice questions are edited here. */
type ChoiceQuestion = Exclude<AnyQuestionConfig, { kind: 'boolean' }>;

const QUESTIONS: Record<Editable, ChoiceQuestion> = {
  frequency: frequencyQuestion,
  watchFor: watchForQuestion,
  reasons: reasonsQuestion,
  challenges: challengesQuestion,
  goal: goalQuestion,
};

/** The onboarding answers that are not restrictions, caution or diet, each editable in a sheet. */
export default function SurveyAnswersScreen() {
  const { t } = useTranslation();
  const answers = useOnboardingStore((state) => state.answers);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const toggleMulti = useOnboardingStore((state) => state.toggleMulti);
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const sheetRef = useSheetRef();
  const [editing, setEditing] = useState<Editable>('frequency');

  const config = QUESTIONS[editing];
  const current = answers[config.answerKey as keyof OnboardingAnswers];

  const valueLabel = (key: Editable): string => {
    const question = QUESTIONS[key];
    const value = answers[question.answerKey as keyof OnboardingAnswers];
    if (question.kind === 'multi') {
      const list = (value as string[]) ?? [];
      return list.length
        ? list
            .map((item) => t(question.options.find((o) => o.value === item)?.labelKey ?? ''))
            .join(', ')
        : t('settingsScreens.survey.notSet');
    }
    const option = question.options.find((o) => o.value === value);
    return option ? t(option.labelKey) : t('settingsScreens.survey.notSet');
  };

  const isSelected = (value: string | boolean) =>
    config.kind === 'multi'
      ? ((current as string[]) ?? []).includes(value as string)
      : current === value;

  const select = (value: string | boolean) => {
    if (config.kind === 'multi') toggleMulti(config.answerKey, value as never);
    else setAnswer(config.answerKey, value as never);
    if (profile && editing === 'goal') updateProfile(profile.id, { goal: value as Goal });
  };

  const done = () => {
    if (profile && editing === 'reasons')
      updateProfile(profile.id, { reasons: (current as AvoidReason[]) ?? [] });
    sheetRef.current?.dismiss();
    showToast({ message: t('settingsScreens.survey.saved'), icon: 'checkCircle' });
  };

  const open = (key: Editable) => {
    setEditing(key);
    sheetRef.current?.present();
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.survey.title')} />}
      testID="settings-survey"
    >
      <SettingsSection style={styles.section}>
        <SettingsRow
          label={t('settingsScreens.survey.frequency')}
          icon="calendar"
          value={valueLabel('frequency')}
          onPress={() => open('frequency')}
        />
        <SettingsRow
          label={t('settingsScreens.survey.watchFor')}
          icon="eyeOff"
          value={valueLabel('watchFor')}
          onPress={() => open('watchFor')}
        />
        <SettingsRow
          label={t('settingsScreens.survey.reasons')}
          icon="helpCircle"
          value={valueLabel('reasons')}
          onPress={() => open('reasons')}
        />
        <SettingsRow
          label={t('settingsScreens.survey.challenges')}
          icon="warning"
          value={valueLabel('challenges')}
          onPress={() => open('challenges')}
        />
        <SettingsRow
          label={t('settingsScreens.survey.goal')}
          icon="target"
          value={valueLabel('goal')}
          onPress={() => open('goal')}
        />
        <SettingsRow
          label={t('settingsScreens.survey.triedApps')}
          icon="phone"
          toggle={{
            value: answers.triedOtherApps === true,
            onChange: (value) => setAnswer('triedOtherApps', value as never),
          }}
        />
      </SettingsSection>
      <Sheet ref={sheetRef} title={t(config.titleKey)} closeLabel={t('common.close')}>
        <View style={styles.options}>
          {config.options.map((option) => (
            <OptionCard
              key={String(option.value)}
              label={t(option.labelKey)}
              icon={option.icon}
              density="compact"
              role={config.kind === 'multi' ? 'checkbox' : 'radio'}
              selected={isSelected(option.value)}
              onPress={() => select(option.value)}
            />
          ))}
        </View>
        <Button
          title={t('settingsScreens.survey.done')}
          size="md"
          onPress={done}
          style={styles.done}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: rs(spacing.md) },
  options: { gap: rs(spacing.xs) },
  done: { marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
});
