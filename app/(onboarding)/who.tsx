import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ChoiceScreen, type Choice } from '@/components/onboarding/ChoiceScreen';
import { Icon, PressableScale, Text } from '@/components/ui';
import { canAddPerson } from '@/features/questionnaire/plans';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { QuestionnaireTarget } from '@/types';

/**
 * Question 1: who are you setting up? "Me" on every plan; "Someone else" on
 * Plus and Family while there is room; "Someone I've already added" once
 * someone was added. On Free, adding family is offered as a reason to upgrade.
 */
export default function WhoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const plan = useAppStore((state) => state.account.plan);
  const profiles = useProfileStore((state) => state.profiles);
  const target = useOnboardingStore((state) => state.answers.target);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  const others = profiles.filter((profile) => !profile.isAccountHolder);
  const roomForAnother = canAddPerson(plan, profiles.length);
  const choices = useMemo<Choice<QuestionnaireTarget>[]>(() => {
    const list: Choice<QuestionnaireTarget>[] = [
      { value: 'me', label: t('q1.me'), icon: 'person' },
    ];
    if (plan !== 'free' && roomForAnother) {
      list.push({ value: 'other', label: t('q1.other'), hint: t('q1.otherHint'), icon: 'people' });
    }
    if (others.length > 0) {
      list.push({ value: 'existing', label: t('q1.existing'), hint: t('q1.existingHint'), icon: 'people' });
    }
    return list;
  }, [others.length, plan, roomForAnother, t]);

  return (
    <ChoiceScreen
      stepKey="who"
      title={t('q1.title')}
      choices={choices}
      selected={target ? [target] : []}
      onSelect={(value) => {
        setAnswer('target', value);
        if (value !== 'existing') setAnswer('existingProfileId', null);
        if (value !== 'other') setAnswer('personName', '');
      }}
      after={
        plan === 'free' ? (
          <PressableScale
            onPress={() => router.push('/settings/family-plan')}
            haptic="light"
            pressedScale={0.99}
            accessibilityRole="button"
            accessibilityLabel={t('q1.upsellTitle')}
            style={styles.upsell}
            testID="who-upsell"
          >
            <Icon name="people" size={rs(24)} color="text" outline />
            <View style={styles.upsellText}>
              <Text variant="label" color="text">
                {t('q1.upsellTitle')}
              </Text>
              <Text variant="small" color="textMuted">
                {t('q1.upsellBody')}
              </Text>
            </View>
            <Icon name="chevronRight" size={rs(18)} color="textMuted" />
          </PressableScale>
        ) : !roomForAnother ? (
          <Text variant="small" color="textMuted">
            {t('q1.noRoom', { plan: t(`plans.${plan}`) })}
          </Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTint,
  },
  upsellText: { flex: 1, gap: 2 },
});
