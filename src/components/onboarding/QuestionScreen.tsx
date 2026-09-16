import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from './OnboardingScreen';
import { Button, OptionCard } from '@/components/ui';
import type { AnyQuestionConfig } from '@/features/onboarding/questions';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { OnboardingAnswers } from '@/types';

export interface QuestionScreenProps {
  route: string;
  config: AnyQuestionConfig;
}

/**
 * One template for every survey screen in the PDF: progress header, title,
 * optional subtitle, a stack of OptionCards, and a pinned Continue button
 * that stays disabled until the answer is valid.
 */
export function QuestionScreen({ route, config }: QuestionScreenProps) {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const answers = useOnboardingStore((state) => state.answers);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const toggleMulti = useOnboardingStore((state) => state.toggleMulti);

  const options = useMemo(() => {
    if (config.kind === 'boolean') {
      return [
        { key: 'yes', label: t(config.yes.labelKey), icon: config.yes.icon, value: true as const },
        { key: 'no', label: t(config.no.labelKey), icon: config.no.icon, value: false as const },
      ];
    }
    return config.options.map((option) => ({
      key: option.value,
      label: t(option.labelKey),
      icon: option.icon,
      value: option.value,
    }));
  }, [config, t]);

  const currentValue = answers[config.answerKey as keyof OnboardingAnswers];
  const isSelected = (value: string | boolean): boolean => {
    if (config.kind === 'multi') return (currentValue as string[]).includes(value as string);
    return currentValue === value;
  };
  const isValid =
    config.kind === 'multi'
      ? (currentValue as string[]).length > 0
      : currentValue !== null && currentValue !== undefined;

  const onSelect = (value: string | boolean) => {
    if (config.kind === 'multi') toggleMulti(config.answerKey, value as never);
    else setAnswer(config.answerKey, value as never);
  };

  const compact = config.kind !== 'boolean' && config.compact === true;
  const subtitle = config.subtitleKey ? copy(config.subtitleKey) : undefined;

  return (
    <OnboardingScreen
      route={route}
      title={copy(config.titleKey)}
      subtitle={subtitle}
      footer={(nav) => (
        <Button
          title={t('common.continue')}
          onPress={nav.goNext}
          disabled={!isValid}
          haptic="medium"
        />
      )}
      testID={`question-${route}`}
    >
      <View
        style={[
          styles.list,
          {
            marginTop: rv(subtitle ? layout.subtitleToContent : layout.titleToContent),
            gap: rs(compact ? spacing.sm : layout.cardGap),
          },
        ]}
      >
        {options.map((option) => (
          <OptionCard
            key={option.key}
            label={option.label}
            icon={option.icon}
            selected={isSelected(option.value)}
            onPress={() => onSelect(option.value)}
            role={config.kind === 'multi' ? 'checkbox' : 'radio'}
            density={compact ? 'compact' : 'regular'}
            testID={`option-${option.key}`}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ list: {} });
