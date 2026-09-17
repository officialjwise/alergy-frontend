import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { RiskPill } from '@/components/app/RiskPill';
import {
  Button,
  Chip,
  confirm,
  EmptyState,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  Sheet,
  showToast,
  Text,
  useSheetRef,
} from '@/components/ui';
import { stepHref } from '@/features/onboarding/navigation';
import {
  DOCTOR_OPTIONS,
  REACTION_KINDS,
  STRICTNESS_OPTIONS,
  WORST_REACTIONS,
} from '@/features/questionnaire/definition';
import { questionnaireOutdated, resolveFoodAnswers } from '@/features/questionnaire/rules';
import { useOnboardingStore } from '@/store/onboardingStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { AvoidedFood, FoodAnswers, ReactionKind } from '@/types';

/**
 * The allergies screen: every food the person avoids with how it is shown.
 * Foods are only ever removed here, deliberately. Levels can be changed in
 * place; adding foods goes through the questionnaire again, which never
 * removes anything.
 */
export default function AllergiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const profiles = useProfileStore((state) => state.profiles);
  const active = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const startFor = useOnboardingStore((state) => state.startFor);
  const profile = (profileId ? profiles.find((p) => p.id === profileId) : null) ?? active;
  const editRef = useSheetRef();
  const [editing, setEditing] = useState<AvoidedFood | null>(null);
  const [draft, setDraft] = useState<FoodAnswers | null>(null);

  const answerAgain = useCallback(() => {
    if (!profile) return;
    if (profile.isAccountHolder) startFor('me');
    else startFor('existing', profile.id);
    router.push(stepHref('allergies'));
  }, [profile, router, startFor]);

  const remove = useCallback(
    async (food: AvoidedFood) => {
      if (!profile) return;
      const ok = await confirm({
        title: t('allergies.removeTitle', { name: food.name }),
        message: t('allergies.removeBody'),
        confirmLabel: t('common.remove'),
        cancelLabel: t('common.cancel'),
        destructive: true,
        icon: 'trash',
      });
      if (!ok) return;
      updateProfile(profile.id, { foods: profile.foods.filter((item) => item.id !== food.id) });
      showToast({ message: t('allergies.removed', { name: food.name }), icon: 'trash' });
    },
    [profile, t, updateProfile],
  );

  const openEdit = (food: AvoidedFood) => {
    setEditing(food);
    setDraft({
      kind: food.kind,
      kindUnsure: food.kindAssumed,
      worst: food.worst,
      strictness: food.strictness,
      doctorConfirmed: food.doctorConfirmed,
    });
    editRef.current?.present();
  };

  const saveEdit = () => {
    if (!profile || !editing || !draft) return;
    const resolved = resolveFoodAnswers(draft);
    if (!resolved) return;
    const now = new Date().toISOString();
    updateProfile(profile.id, {
      foods: profile.foods.map((item) =>
        item.id === editing.id ? { ...item, ...resolved, updatedAt: now } : item,
      ),
    });
    editRef.current?.dismiss();
    showToast({ message: t('allergies.saved'), icon: 'checkCircle' });
  };

  if (!profile) {
    return <Screen header={<NavHeader title={t('allergies.title')} />}>{null}</Screen>;
  }

  const draftKindValue = draft ? (draft.kindUnsure ? 'unsure' : draft.kind) : null;
  const draftValid = draft ? resolveFoodAnswers(draft) !== null : false;

  return (
    <Screen
      header={<NavHeader title={t('allergies.title')} />}
      footer={
        <Button
          title={t('allergies.answerAgain')}
          leading={<Icon name="plus" size={rs(20)} color="onPrimary" />}
          onPress={answerAgain}
          haptic="medium"
          testID="allergies-answer-again"
        />
      }
      testID="settings-allergies"
    >
      {!profile.isAccountHolder ? (
        <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
          {t('allergies.forName', { name: profile.name })}
        </Text>
      ) : null}
      {questionnaireOutdated(profile) ? (
        <View style={styles.notice}>
          <Icon name="refresh" size={rs(20)} color="text" outline />
          <Text variant="small" color="textBody" style={styles.noticeText}>
            {t('allergies.outdated')}
          </Text>
        </View>
      ) : null}
      {profile.foods.length === 0 ? (
        <EmptyState icon="ban" title={t('allergies.emptyTitle')} body={t('allergies.emptyBody')} />
      ) : (
        <View style={styles.list}>
          {profile.foods.map((food) => (
            <PressableScale
              key={food.id}
              onPress={() => openEdit(food)}
              haptic="light"
              pressedScale={0.99}
              accessibilityRole="button"
              accessibilityLabel={`${food.name}, ${t(`q5.${food.kind}`)}, ${t(`risk.${food.level}`)}`}
              style={styles.row}
              testID={`allergy-${food.id}`}
            >
              <View style={styles.rowText}>
                <Text variant="label" color="text">
                  {food.name}
                </Text>
                <Text variant="small" color="textMuted">
                  {[
                    t(`q5.${food.kind}`),
                    food.byNameOnly ? t('review.byNameOnly') : null,
                    food.severityAssumed ? t('allergies.assumedSevere') : null,
                    food.doctorConfirmed === 'yes' ? t('allergies.doctorConfirmed') : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
              <RiskPill level={food.level} />
              <PressableScale
                onPress={() => void remove(food)}
                haptic="light"
                accessibilityRole="button"
                accessibilityLabel={t('allergies.removeTitle', { name: food.name })}
                hitSlop={8}
                style={styles.remove}
              >
                <Icon name="trash" size={rs(18)} color="danger" outline />
              </PressableScale>
            </PressableScale>
          ))}
        </View>
      )}
      <Text variant="small" color="textMuted" style={styles.hint}>
        {t('allergies.hint')}
      </Text>

      <Sheet ref={editRef} title={editing?.name ?? ''} closeLabel={t('common.close')}>
        {draft ? (
          <View style={styles.sheet}>
            <Text variant="small" color="textMuted">
              {t('q5.short')}
            </Text>
            <View style={styles.chips}>
              {REACTION_KINDS.map((option) => (
                <Chip
                  key={option.value}
                  label={t(option.labelKey)}
                  selected={draftKindValue === option.value}
                  onPress={() =>
                    setDraft({
                      ...draft,
                      kind: (option.value === 'unsure' ? 'allergy' : option.value) as ReactionKind,
                      kindUnsure: option.value === 'unsure',
                    })
                  }
                />
              ))}
            </View>
            {draft.kind === 'choice' ? (
              <>
                <Text variant="small" color="textMuted">
                  {t('q7.short')}
                </Text>
                <View style={styles.chips}>
                  {STRICTNESS_OPTIONS.map((option) => (
                    <Chip key={option.value} label={t(option.labelKey)} selected={draft.strictness === option.value} onPress={() => setDraft({ ...draft, strictness: option.value })} />
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text variant="small" color="textMuted">
                  {t('q6.short')}
                </Text>
                <View style={styles.chips}>
                  {WORST_REACTIONS.map((option) => (
                    <Chip key={option.value} label={t(option.labelKey)} selected={draft.worst === option.value} onPress={() => setDraft({ ...draft, worst: option.value })} />
                  ))}
                </View>
                <Text variant="small" color="textMuted">
                  {t('q8.short')}
                </Text>
                <View style={styles.chips}>
                  {DOCTOR_OPTIONS.map((option) => (
                    <Chip key={option.value} label={t(option.labelKey)} selected={draft.doctorConfirmed === option.value} onPress={() => setDraft({ ...draft, doctorConfirmed: option.value })} />
                  ))}
                </View>
              </>
            )}
            {draftValid ? (
              <View style={styles.preview}>
                <Text variant="small" color="textMuted">
                  {t('allergies.shownAs')}
                </Text>
                <RiskPill level={resolveFoodAnswers(draft)?.level ?? 'high'} size="md" />
              </View>
            ) : null}
            <Button title={t('common.save')} size="md" onPress={saveEdit} disabled={!draftValid} style={styles.save} />
          </View>
        ) : null}
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
    backgroundColor: colors.surfaceTint,
  },
  noticeText: { flex: 1 },
  list: { gap: rs(spacing.sm), marginTop: rs(spacing.md) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    minHeight: rs(72),
    paddingHorizontal: rs(spacing.md),
    paddingVertical: rs(spacing.sm),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowText: { flex: 1, gap: 2 },
  remove: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: rs(spacing.md) },
  sheet: { gap: rs(spacing.xs), paddingBottom: rs(spacing.sm) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs), marginBottom: rs(spacing.xs) },
  preview: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), marginTop: rs(spacing.xs) },
  save: { marginTop: rs(spacing.md) },
});
