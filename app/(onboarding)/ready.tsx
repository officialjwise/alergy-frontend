import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, Card, Icon, PressableScale, Text, type IconName } from '@/components/ui';
import { RiskPill } from '@/components/app/RiskPill';
import { stepHref } from '@/features/onboarding/navigation';
import { activeSteps } from '@/features/onboarding/steps';
import { reviewFoods } from '@/features/onboarding/summary';
import { canAddPerson } from '@/features/questionnaire/plans';
import { mergeProfile, validateAnswers, type ReviewMessage, type ValidationIssue } from '@/features/questionnaire/rules';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const MESSAGE_ICON: Record<ReviewMessage, { icon: IconName; color: ColorToken }> = {
  severe_assumed: { icon: 'alert', color: 'danger' },
  see_doctor: { icon: 'medal', color: 'info' },
  confirm_email: { icon: 'mail', color: 'warning' },
  known_food: { icon: 'checkCircle', color: 'success' },
  by_name_only: { icon: 'label', color: 'textBody' },
  earlier_entries: { icon: 'history', color: 'textBody' },
};

/**
 * Section 5: after the answers, the resulting list of foods and conditions so
 * the user can check and correct it, plus every message that applies. Nothing
 * is saved halfway: missing answers are listed with a link back to the question.
 */
export default function ReadyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const answers = useOnboardingStore((state) => state.answers);
  const profiles = useProfileStore((state) => state.profiles);
  const plan = useAppStore((state) => state.account.plan);
  const emailConfirmed = useAppStore((state) => state.session?.user.emailConfirmed ?? false);

  const existing = useMemo(() => {
    if (answers.target === 'existing') return profiles.find((p) => p.id === answers.existingProfileId) ?? null;
    if (answers.target === 'me') return profiles.find((p) => p.isAccountHolder) ?? null;
    return null;
  }, [answers.existingProfileId, answers.target, profiles]);
  const issues = useMemo(
    () => validateAnswers(answers, { canAddPerson: canAddPerson(plan, profiles.length) }),
    [answers, plan, profiles.length],
  );
  const foods = useMemo(() => reviewFoods(answers, t), [answers, t]);
  const messages = useMemo(
    () =>
      issues.length === 0
        ? mergeProfile(answers, existing, { now: new Date(0).toISOString(), newId: 'preview', color: '#000', emailConfirmed }).messages
        : [],
    [answers, emailConfirmed, existing, issues.length],
  );
  const personName =
    answers.target === 'other' ? answers.personName.trim() : existing && !existing.isAccountHolder ? existing.name : '';

  const fixIssue = (issue: ValidationIssue) => {
    const steps = activeSteps(answers);
    const key =
      issue.code === 'target' || issue.code === 'plan_limit'
        ? 'who'
        : issue.code === 'person_name'
          ? 'person-name'
          : issue.code === 'has_allergies'
            ? 'allergies'
            : issue.code === 'has_conditions'
              ? 'conditions'
              : issue.code === 'food_kind'
                ? `food-reaction:${issue.foodId}`
                : issue.code === 'food_worst'
                  ? `food-worst:${issue.foodId}`
                  : `food-strictness:${issue.foodId}`;
    const step = steps.find((item) => item.key === key) ?? steps.find((item) => item.key === 'who');
    if (step) router.push(stepHref(step));
  };

  return (
    <OnboardingScreen
      route="ready"
      header={false}
      footer={(nav) => (
        <Button
          title={t('review.continue')}
          onPress={nav.goNext}
          disabled={issues.length > 0}
          haptic="medium"
          testID="review-continue"
        />
      )}
    >
      <View style={[styles.check, { marginTop: Math.max(insets.top * 0.1, spacing.xs) }]}>
        <Icon name="check" size={rs(22)} color="onPrimary" />
      </View>
      <Text variant="titleLg" color="text" style={styles.title} accessibilityRole="header">
        {personName ? t('review.titleFor', { name: personName }) : t('review.title')}
      </Text>
      <Text variant="subtitle" color="textMuted">
        {t('review.subtitle')}
      </Text>

      {issues.length > 0 ? (
        <Card variant="outlined" padding={spacing.md} style={[styles.card, styles.issues]}>
          <Text variant="label" color="danger">
            {t('review.issuesTitle')}
          </Text>
          {issues.map((issue, index) => (
            <PressableScale
              key={`${issue.code}-${index}`}
              onPress={() => fixIssue(issue)}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={t(`review.issue_${issue.code}`, { food: 'foodId' in issue ? foodLabel(foods, issue.foodId) : '' })}
              style={styles.issueRow}
            >
              <Icon name="alert" size={rs(18)} color="danger" />
              <Text variant="body" color="textBody" style={styles.issueText}>
                {t(`review.issue_${issue.code}`, { food: 'foodId' in issue ? foodLabel(foods, issue.foodId) : '' })}
              </Text>
              <Text variant="label" color="text">
                {t('review.fix')}
              </Text>
            </PressableScale>
          ))}
        </Card>
      ) : null}

      <Card title={t('review.foodsTitle')} style={styles.card}>
        {foods.length === 0 ? (
          <Text variant="body" color="textMuted">
            {answers.hasAllergies === 'no' ? t('review.noFoods') : t('review.nothingPicked')}
          </Text>
        ) : (
          foods.map((food) => (
            <View key={food.id} style={styles.foodRow}>
              <View style={styles.foodText}>
                <Text variant="label" color="text">
                  {food.name}
                </Text>
                <Text variant="small" color="textMuted">
                  {[food.kindLabel, food.byNameOnly ? t('review.byNameOnly') : null].filter(Boolean).join(' · ')}
                </Text>
              </View>
              {food.level ? <RiskPill level={food.level} /> : null}
            </View>
          ))
        )}
      </Card>

      {answers.hasConditions && answers.conditions.length > 0 ? (
        <Card title={t('review.conditionsTitle')} style={styles.card}>
          {answers.conditions.map((id) => (
            <View key={id} style={styles.foodRow}>
              <View style={styles.foodText}>
                <Text variant="label" color="text">
                  {t(`conditions.${id}`)}
                </Text>
                {answers.conditionEnds[id] ? (
                  <Text variant="small" color="textMuted">
                    {t('review.endsOn', { date: answers.conditionEnds[id] })}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {answers.note.trim() ? (
        <Card title={t('review.noteTitle')} style={styles.card}>
          <Text variant="body" color="textBody">
            {answers.note.trim()}
          </Text>
        </Card>
      ) : null}

      {messages.length > 0 ? (
        <View style={styles.messages}>
          {messages.map((message) => (
            <View key={message} style={styles.message} accessible accessibilityLabel={`${t(`review.msg_${message}_title`)}. ${t(`review.msg_${message}_body`)}`}>
              <Icon name={MESSAGE_ICON[message].icon} size={rs(22)} color={MESSAGE_ICON[message].color} />
              <View style={styles.messageText}>
                <Text variant="label" color="text">
                  {t(`review.msg_${message}_title`)}
                </Text>
                <Text variant="small" color="textMuted">
                  {t(`review.msg_${message}_body`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </OnboardingScreen>
  );
}

function foodLabel(foods: { id: string; name: string }[], id: string): string {
  return foods.find((food) => food.id === id)?.name ?? id;
}

const styles = StyleSheet.create({
  check: {
    alignSelf: 'center',
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: rv(spacing.md) },
  card: { marginTop: rv(spacing.lg) },
  issues: { gap: rs(spacing.xs), borderColor: colors.danger },
  issueRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), minHeight: 44 },
  issueText: { flex: 1 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), paddingVertical: rs(spacing.xs) },
  foodText: { flex: 1, gap: 2 },
  messages: { marginTop: rv(spacing.lg), gap: rs(spacing.sm) },
  message: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(spacing.sm),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  messageText: { flex: 1, gap: 2 },
});
