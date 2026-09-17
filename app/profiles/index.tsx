import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BackButton,
  Button,
  Icon,
  ListRow,
  PressableScale,
  Screen,
  Text,
} from '@/components/ui';
import { stepHref } from '@/features/onboarding/navigation';
import { canAddPerson, peopleAllowed } from '@/features/questionnaire/plans';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import { formatLongDate } from '@/utils/date';

/** Manage profiles: switch, add (re-runs the survey), delete. */
export default function ProfilesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => state.activeProfileId);
  const setActive = useProfileStore((state) => state.setActiveProfile);
  const removeProfile = useProfileStore((state) => state.removeProfile);
  const startFor = useOnboardingStore((state) => state.startFor);
  const plan = useAppStore((state) => state.account.plan);
  const room = canAddPerson(plan, profiles.length);

  const addProfile = useCallback(() => {
    if (!room) {
      router.push('/settings/family-plan');
      return;
    }
    startFor('other');
    router.push(stepHref('person-name'));
  }, [room, router, startFor]);

  const confirmDelete = useCallback(
    (id: string, name: string) => {
      if (profiles.length <= 1) {
        Alert.alert(t('profile.cantDeleteLast'));
        return;
      }
      Alert.alert(t('profile.deleteProfile'), t('profile.deleteProfileConfirm', { name }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => removeProfile(id) },
      ]);
    },
    [profiles.length, removeProfile, t],
  );

  return (
    <Screen
      header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}
      footer={
        <Button
          title={room ? t('profile.addProfile') : t('profileTab.familyPlan')}
          onPress={addProfile}
          leading={<Icon name={room ? 'plus' : 'people'} size={rs(22)} color="onPrimary" />}
          haptic="medium"
        />
      }
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('profile.profiles')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('profile.peopleOnPlan', { count: profiles.length, max: peopleAllowed(plan), plan: t(`plans.${plan}`) })}
      </Text>
      <View style={styles.list}>
        {profiles.map((profile) => {
          const active = profile.id === activeId;
          return (
            <View key={profile.id} style={[styles.card, active ? styles.cardActive : null]}>
              <View style={styles.cardRow}>
                <Avatar name={profile.name} color={profile.color} size={48} bordered={false} />
                <View style={styles.cardText}>
                  <Text variant="label" color="text" numberOfLines={1}>
                    {profile.name}
                  </Text>
                  <Text variant="small" color="textMuted">
                    {t(`profile.for_${profile.profileFor}`)} ·{' '}
                    {t('profile.foodCount', { count: profile.foods.length })}
                  </Text>
                  <Text variant="small" color="textMuted">
                    {t('profile.created', {
                      date: formatLongDate(profile.createdAt, i18n.language),
                    })}
                  </Text>
                </View>
                {active ? (
                  <View style={styles.activePill}>
                    <Text variant="small" color="onPrimary">
                      {t('profile.active')}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.actions}>
                {!active ? (
                  <Button
                    title={t('profile.makeActive')}
                    variant="secondary"
                    size="md"
                    onPress={() => setActive(profile.id)}
                    style={styles.action}
                  />
                ) : null}
                <PressableScale
                  onPress={() => confirmDelete(profile.id, profile.name)}
                  haptic="light"
                  accessibilityRole="button"
                  accessibilityLabel={`${t('profile.deleteProfile')} ${profile.name}`}
                  style={styles.deleteButton}
                >
                  <Icon name="trash" size={rs(20)} color="danger" outline />
                </PressableScale>
              </View>
            </View>
          );
        })}
        <ListRow
          label={room ? t('profile.addProfile') : t('profileTab.familyPlan')}
          description={
            room
              ? t('profile.addProfileHint')
              : t('profile.planFull', { count: peopleAllowed(plan), plan: t(`plans.${plan}`) })
          }
          icon={room ? 'plus' : 'people'}
          chevron
          onPress={addProfile}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  list: { marginTop: rv(layout.subtitleToContent), gap: rs(spacing.md) },
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: rs(spacing.md),
    gap: rs(spacing.sm),
  },
  cardActive: { borderColor: colors.primary, borderWidth: 1.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.md) },
  cardText: { flex: 1, gap: 2 },
  activePill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: 4,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  action: { flex: 1 },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerTint,
  },
});
