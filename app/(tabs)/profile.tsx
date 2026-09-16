import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  Icon,
  ListRow,
  PressableScale,
  Text,
} from '@/components/ui';
import { LANGUAGES } from '@/i18n/languages';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Profile tab: the active profile's restrictions, caution level, diet, goal and language. */
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(selectActiveProfile);
  const profiles = useProfileStore((state) => state.profiles);
  const language = useAppStore((state) => state.language) ?? i18n.language;
  const languageName = LANGUAGES.find((l) => l.code === language)?.nativeName ?? language;

  if (!profile) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
        <EmptyState
          icon="person"
          title={t('profile.noRestrictions')}
          actionLabel={t('profile.addProfile')}
          onAction={() => router.push('/profiles' as Href)}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text variant="titleLg" color="text" accessibilityRole="header">
            {t('profile.title')}
          </Text>
          <PressableScale
            onPress={() => router.push('/settings' as Href)}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            style={styles.settingsButton}
          >
            <Icon name="settings" size={rs(24)} color="text" outline />
          </PressableScale>
        </View>

        <PressableScale
          onPress={() => router.push('/profiles' as Href)}
          haptic="light"
          pressedScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${profile.name}, ${t('profile.manageProfiles')}`}
          style={styles.profileCard}
        >
          <Avatar name={profile.name} color={profile.color} size={56} bordered={false} />
          <View style={styles.profileText}>
            <Text variant="sectionTitle" color="text" numberOfLines={1}>
              {profile.name}
            </Text>
            <Text variant="small" color="textMuted">
              {t(`profile.for_${profile.profileFor}`)}
              {profiles.length > 1 ? ` · ${t('profile.profiles')}: ${profiles.length}` : ''}
            </Text>
          </View>
          <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
        </PressableScale>

        <Card title={t('profile.restrictions')} style={styles.card}>
          {profile.restrictions.length === 0 ? (
            <Text variant="body" color="textMuted">
              {t('profile.noRestrictions')}
            </Text>
          ) : (
            <View style={styles.chips}>
              {profile.restrictions.map((restriction) => (
                <Chip
                  key={restriction.ingredientId}
                  label={`${restriction.name} · ${t(`severity.${restriction.severity}`)}`}
                />
              ))}
            </View>
          )}
          <Button
            title={t('profile.editRestrictions')}
            variant="secondary"
            size="md"
            onPress={() => router.push('/profiles/edit/restrictions' as Href)}
            style={styles.editButton}
          />
        </Card>

        <Card style={styles.card}>
          <ListRow
            label={t('profile.cautionLevel')}
            value={t(`caution.${profile.cautionLevel}`)}
            icon="shieldCheck"
            chevron
            onPress={() => router.push('/profiles/edit/caution' as Href)}
          />
          <Divider />
          <ListRow
            label={t('profile.diet')}
            value={t(`diet.${profile.diet}`)}
            icon="restaurant"
            chevron
            onPress={() => router.push('/profiles/edit/diet' as Href)}
          />
          <Divider />
          <ListRow
            label={t('profile.goal')}
            value={profile.goal ? t(`goal.summary_${profile.goal}`) : '—'}
            icon="target"
            chevron
            onPress={() => router.push('/profiles/edit/goal' as Href)}
          />
          <Divider />
          <ListRow
            label={t('profile.language')}
            value={languageName}
            icon="globe"
            chevron
            onPress={() => router.push('/settings' as Href)}
          />
        </Card>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: rs(layout.screenPaddingH) },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    marginTop: rs(spacing.xl),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileText: { flex: 1 },
  card: { marginTop: rs(spacing.md) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  editButton: { marginTop: rs(spacing.md) },
});
