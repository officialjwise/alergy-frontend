import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button, Card, Chip, Text } from '@/components/ui';
import { ingredientById } from '@/mocks/ingredients';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { Severity } from '@/types';

const LEVELS: Severity[] = ['mild', 'moderate', 'severe', 'anaphylaxis'];

/** Per-ingredient severity (not in the PDF). Same cards, chips and copy style as the survey. */
export default function SeverityScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const ingredients = useOnboardingStore((state) => state.answers.ingredients);
  const custom = useOnboardingStore((state) => state.answers.customIngredients);
  const severities = useOnboardingStore((state) => state.answers.severities);
  const setSeverity = useOnboardingStore((state) => state.setSeverity);
  const setAllSeverities = useOnboardingStore((state) => state.setAllSeverities);

  const items = useMemo(
    () => ingredients.map((id) => ({ id, name: (custom[id] ?? ingredientById(id))?.name ?? id })),
    [custom, ingredients],
  );
  const allSet = items.every((item) => severities[item.id] !== undefined);
  const first = items[0] ? severities[items[0].id] : undefined;

  return (
    <OnboardingScreen
      route="severity"
      title={copy('severity.title')}
      subtitle={t('severity.subtitle')}
      footer={(nav) => (
        <Button
          title={t('common.continue')}
          onPress={nav.goNext}
          disabled={!allSet}
          haptic="medium"
        />
      )}
    >
      <View style={styles.list}>
        {items.map((item, index) => (
          <Card key={item.id} variant="outlined" padding={spacing.lg}>
            <View style={styles.cardHeader}>
              <Text variant="label" color="text" style={styles.name}>
                {item.name}
              </Text>
              {index === 0 && items.length > 1 && first ? (
                <Button
                  title={t('severity.applyAll')}
                  variant="text"
                  onPress={() => setAllSeverities(first)}
                  style={styles.applyAll}
                />
              ) : null}
            </View>
            <View style={styles.chips}>
              {LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={t(`severity.${level}`)}
                  selected={severities[item.id] === level}
                  onPress={() => setSeverity(item.id, level)}
                  testID={`severity-${item.id}-${level}`}
                />
              ))}
            </View>
            <Text variant="small" color="textMuted" style={styles.hint}>
              {severities[item.id] ? t(`severity.${severities[item.id]}Hint`) : ' '}
            </Text>
          </Card>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: rv(layout.subtitleToContent), gap: rs(layout.cardGap) },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: { flex: 1 },
  applyAll: { minHeight: 32, paddingVertical: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs), marginTop: rs(spacing.sm) },
  hint: { marginTop: rs(spacing.xs) },
});
