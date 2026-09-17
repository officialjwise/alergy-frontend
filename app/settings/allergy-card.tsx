import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, HeaderButton, Icon, NavHeader, Screen, Text } from '@/components/ui';
import { LANGUAGES } from '@/i18n/languages';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { LanguageCode } from '@/types';

/** Card to show restaurant staff: restrictions in the chosen language, share and full screen. */
export default function AllergyCardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(selectActiveProfile);
  const [language, setLanguage] = useState<LanguageCode>(i18n.language as LanguageCode);
  const [fullScreen, setFullScreen] = useState(false);
  const fixed = useMemo(() => i18n.getFixedT(language), [i18n, language]);

  const restrictions = profile?.foods ?? [];
  const severe = restrictions.filter((item) => item.level === 'high');
  const lines = [
    fixed('settingsScreens.allergyCard.intro'),
    restrictions.map((item) => item.name).join(', ') || fixed('settingsScreens.allergyCard.none'),
    ...severe.map((item) => fixed('settingsScreens.allergyCard.severe', { name: item.name })),
    fixed('settingsScreens.allergyCard.ask'),
    fixed('settingsScreens.allergyCard.thanks'),
  ];

  const share = () => void Share.share({ message: lines.join('\n') });

  const card = (
    <View
      style={[styles.card, fullScreen ? styles.cardFull : null]}
      accessible
      accessibilityLabel={lines.join('. ')}
    >
      <View style={styles.cardHeader}>
        <Icon name="alert" size={rs(fullScreen ? 32 : 24)} color="danger" />
        <Text variant={fullScreen ? 'title' : 'cardTitle'} color="text">
          {fixed('settingsScreens.allergyCard.intro')}
        </Text>
      </View>
      <Text variant={fullScreen ? 'display' : 'sectionTitle'} color="danger">
        {restrictions.map((item) => item.name).join(', ') ||
          fixed('settingsScreens.allergyCard.none')}
      </Text>
      {severe.map((item) => (
        <Text key={item.id} variant={fullScreen ? 'subtitle' : 'body'} color="text">
          {fixed('settingsScreens.allergyCard.severe', { name: item.name })}
        </Text>
      ))}
      <Text variant={fullScreen ? 'subtitle' : 'body'} color="textBody">
        {fixed('settingsScreens.allergyCard.ask')}
      </Text>
      <Text variant={fullScreen ? 'subtitle' : 'body'} color="textMuted">
        {fixed('settingsScreens.allergyCard.thanks')}
      </Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.full,
          {
            paddingTop: insets.top + rs(layout.headerTop),
            paddingBottom: insets.bottom + rs(spacing.md),
          },
        ]}
        testID="allergy-card-full"
      >
        <View style={styles.fullHeader}>
          <HeaderButton
            icon="close"
            label={t('settingsScreens.allergyCard.exitFullScreen')}
            onPress={() => setFullScreen(false)}
            testID="allergy-card-exit"
          />
        </View>
        <ScrollView contentContainerStyle={styles.fullContent}>{card}</ScrollView>
      </View>
    );
  }

  return (
    <Screen
      header={
        <NavHeader
          title={t('settingsScreens.allergyCard.title')}
          onLeftPress={() => router.back()}
        />
      }
      footer={
        <View style={styles.actions}>
          <Button
            title={t('settingsScreens.allergyCard.fullScreen')}
            leading={<Icon name="zoom" size={rs(20)} color="onPrimary" />}
            onPress={() => setFullScreen(true)}
            testID="allergy-card-fullscreen"
          />
          <Button
            title={t('settingsScreens.allergyCard.share')}
            variant="secondary"
            onPress={share}
            testID="allergy-card-share"
          />
        </View>
      }
      testID="settings-allergy-card"
    >
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('settingsScreens.allergyCard.subtitle')}
      </Text>
      <Text variant="sectionLabel" color="textMuted" style={styles.label}>
        {t('settingsScreens.allergyCard.language')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.languages}
      >
        {LANGUAGES.map((item) => (
          <Chip
            key={item.code}
            label={`${item.flag} ${item.nativeName}`}
            selected={language === item.code}
            onPress={() => setLanguage(item.code)}
          />
        ))}
      </ScrollView>
      <View style={styles.cardWrap}>{card}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rs(spacing.md) },
  label: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.xs) },
  languages: { gap: rs(spacing.xs) },
  cardWrap: { marginTop: rs(spacing.lg) },
  card: {
    gap: rs(spacing.sm),
    padding: rs(spacing.lg),
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.background,
  },
  cardFull: { borderWidth: 0, gap: rs(spacing.lg), padding: rs(spacing.xl) },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  full: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: rs(layout.screenPaddingH),
  },
  fullHeader: { flexDirection: 'row', justifyContent: 'flex-end' },
  fullContent: { flexGrow: 1, justifyContent: 'center' },
  actions: { gap: rs(spacing.sm) },
});
