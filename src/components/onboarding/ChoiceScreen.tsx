import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen } from './OnboardingScreen';
import { Button, OptionCard, Text, type IconName } from '@/components/ui';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

export interface Choice<V extends string> {
  value: V;
  label: string;
  hint?: string;
  icon: IconName;
}

export interface ChoiceScreenProps<V extends string> {
  /** Step key (route, or `route:id`). */
  stepKey: string;
  title: string;
  subtitle?: string;
  choices: readonly Choice<V>[];
  selected: readonly V[];
  onSelect: (value: V) => void;
  multi?: boolean;
  /** Continue stays disabled until this is true (defaults to "something selected"). */
  valid?: boolean;
  /** Optional skip link under Continue (optional questions). */
  onSkip?: () => void;
  skipLabel?: string;
  /** Extra content under the title (a note such as "We'll treat it as an allergy"). */
  note?: ReactNode;
  /** Extra content under the choices (an upsell card). */
  after?: ReactNode;
  compact?: boolean;
  testID?: string;
}

/**
 * One template for every choice question in the questionnaire: progress
 * header, title, optional subtitle, a stack of OptionCards with hints, and a
 * pinned Continue button that stays disabled until the answer is valid.
 */
export function ChoiceScreen<V extends string>({
  stepKey,
  title,
  subtitle,
  choices,
  selected,
  onSelect,
  multi = false,
  valid,
  onSkip,
  skipLabel,
  note,
  after,
  compact = false,
  testID,
}: ChoiceScreenProps<V>) {
  const { t } = useTranslation();
  const isValid = valid ?? selected.length > 0;
  return (
    <OnboardingScreen
      route={stepKey}
      title={title}
      subtitle={subtitle}
      footer={(nav) => (
        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={nav.goNext}
            disabled={!isValid}
            haptic="medium"
          />
          {onSkip && skipLabel ? (
            <Button
              title={skipLabel}
              variant="text"
              onPress={() => {
                onSkip();
                nav.goNext();
              }}
            />
          ) : null}
        </View>
      )}
      testID={testID ?? `question-${stepKey}`}
    >
      {note ? <View style={styles.note}>{note}</View> : null}
      <View
        style={[
          styles.list,
          {
            marginTop: rv(subtitle || note ? layout.subtitleToContent : layout.titleToContent),
            gap: rs(compact ? spacing.sm : layout.cardGap),
          },
        ]}
      >
        {choices.map((choice) => (
          <OptionCard
            key={choice.value}
            label={choice.label}
            description={choice.hint}
            icon={choice.icon}
            selected={selected.includes(choice.value)}
            onPress={() => onSelect(choice.value)}
            role={multi ? 'checkbox' : 'radio'}
            density={compact ? 'compact' : 'regular'}
            testID={`option-${choice.value}`}
          />
        ))}
      </View>
      {after ? <View style={styles.after}>{after}</View> : null}
    </OnboardingScreen>
  );
}

/** Small muted paragraph under a question (the "treated as" explanations). */
export function QuestionNote({ children }: { children: string }) {
  return (
    <Text variant="body" color="textMuted">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  footer: { gap: spacing.xs },
  list: {},
  note: { marginTop: rs(layout.titleToSubtitle) },
  after: { marginTop: rs(spacing.lg) },
});
