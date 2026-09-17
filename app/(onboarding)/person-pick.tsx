import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Avatar, Button, PressableScale, RadioCheck, Text } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { borders, colors, layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/** Question 1, "Someone I've already added": pick the person and update their profile. */
export default function PersonPickScreen() {
  const { t } = useTranslation();
  const profiles = useProfileStore((state) => state.profiles).filter((p) => !p.isAccountHolder);
  const chosen = useOnboardingStore((state) => state.answers.existingProfileId);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  return (
    <OnboardingScreen
      route="person-pick"
      title={t('q1.pickTitle')}
      subtitle={t('q1.pickSubtitle')}
      footer={(nav) => (
        <Button title={t('common.continue')} onPress={nav.goNext} disabled={!chosen} haptic="medium" />
      )}
    >
      <View style={styles.list}>
        {profiles.map((profile) => {
          const selected = profile.id === chosen;
          return (
            <PressableScale
              key={profile.id}
              onPress={() => setAnswer('existingProfileId', profile.id)}
              haptic="selection"
              pressedScale={0.99}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={profile.name}
              style={[styles.row, selected ? styles.rowSelected : null]}
              testID={`person-${profile.id}`}
            >
              <Avatar name={profile.name} color={profile.color} size={44} bordered={false} />
              <View style={styles.text}>
                <Text variant="label" color="text">
                  {profile.name}
                </Text>
                <Text variant="small" color="textMuted">
                  {t('profile.foodCount', { count: profile.foods.length })}
                </Text>
              </View>
              <RadioCheck selected={selected} />
            </PressableScale>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: rv(layout.subtitleToContent), gap: rs(spacing.sm) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    minHeight: rs(72),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  rowSelected: { borderColor: colors.primary, borderWidth: borders.selected },
  text: { flex: 1, gap: 2 },
});
