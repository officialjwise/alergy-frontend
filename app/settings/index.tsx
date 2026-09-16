import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { LanguageSheet } from '@/features/onboarding/components/LanguageSheet';
import {
  BackButton,
  Card,
  Divider,
  ListRow,
  PressableScale,
  Screen,
  Text,
  useSheetRef,
} from '@/components/ui';
import { LANGUAGES } from '@/i18n/languages';
import { getServices } from '@/services';
import { queryClient } from '@/services/queryClient';
import { clearAllStorage } from '@/store/storage';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { colors, layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const sheetRef = useSheetRef();
  const session = useAppStore((state) => state.session);
  const setSession = useAppStore((state) => state.setSession);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const language = useAppStore((state) => state.language) ?? i18n.language;
  const clearApp = useAppStore((state) => state.clear);
  const clearProfiles = useProfileStore((state) => state.clear);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [busy, setBusy] = useState(false);
  const tapCount = useRef(0);

  const languageName = LANGUAGES.find((l) => l.code === language)?.nativeName ?? language;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const signOut = useCallback(() => {
    Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: () => {
          void getServices().auth.signOut();
          setSession(null);
        },
      },
    ]);
  }, [setSession, t]);

  const deleteAccount = useCallback(() => {
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteAccountConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await getServices().auth.deleteAccount();
          } finally {
            queryClient.clear();
            clearProfiles();
            clearApp();
            resetOnboarding();
            clearAllStorage();
            setBusy(false);
            router.replace('/(onboarding)/welcome');
          }
        },
      },
    ]);
  }, [clearApp, clearProfiles, resetOnboarding, router, t]);

  const redoOnboarding = useCallback(() => {
    resetOnboarding();
    router.replace('/(onboarding)/welcome');
  }, [resetOnboarding, router]);

  const onVersionPress = useCallback(() => {
    tapCount.current += 1;
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      router.push('/dev/components');
    }
  }, [router]);

  return (
    <Screen header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}>
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('settings.title')}
      </Text>

      <Text variant="sectionLabel" color="textMuted" style={styles.sectionLabel}>
        {t('settings.account')}
      </Text>
      <Card variant="outlined" padding={spacing.md}>
        {session ? (
          <>
            <ListRow
              label={session.user.name ?? session.user.email ?? ''}
              description={t('settings.signedInAs', {
                email: session.user.email ?? session.user.provider,
              })}
              icon="person"
            />
            <Divider />
            <ListRow label={t('settings.signOut')} icon="logout" onPress={signOut} />
          </>
        ) : (
          <ListRow
            label={t('settings.signIn')}
            description={t('settings.notSignedIn')}
            icon="person"
            chevron
            onPress={() => router.push('/(onboarding)/save-profile')}
          />
        )}
      </Card>

      <Text variant="sectionLabel" color="textMuted" style={styles.sectionLabel}>
        {t('settings.language')}
      </Text>
      <Card variant="outlined" padding={spacing.md}>
        <ListRow
          label={t('settings.language')}
          value={languageName}
          icon="globe"
          chevron
          onPress={() => sheetRef.current?.present()}
        />
        <Divider />
        <ListRow
          label={t('settings.notifications')}
          description={t('settings.notificationsHint')}
          icon="bell"
          trailing={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: colors.primary, false: colors.track }}
              thumbColor={colors.background}
              accessibilityLabel={t('settings.notifications')}
            />
          }
        />
      </Card>

      <Text variant="sectionLabel" color="textMuted" style={styles.sectionLabel}>
        {t('settings.privacy')}
      </Text>
      <Card variant="outlined" padding={spacing.md}>
        <ListRow
          label={t('settings.privacyPolicy')}
          icon="lock"
          chevron
          onPress={() => router.push('/legal/privacy' as Href)}
        />
        <Divider />
        <ListRow
          label={t('settings.terms')}
          icon="document"
          chevron
          onPress={() => router.push('/legal/terms' as Href)}
        />
        <Divider />
        <ListRow
          label={t('settings.restartOnboarding')}
          icon="refresh"
          chevron
          onPress={redoOnboarding}
        />
      </Card>

      <Text variant="sectionLabel" color="textMuted" style={styles.sectionLabel}>
        {t('settings.dangerZone')}
      </Text>
      <Card variant="outlined" padding={spacing.md}>
        <ListRow
          label={t('settings.deleteAccount')}
          description={t('settings.deleteAccountBody')}
          icon="trash"
          destructive
          onPress={busy ? undefined : deleteAccount}
        />
      </Card>

      <PressableScale
        onPress={onVersionPress}
        pressedScale={1}
        pressedOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={t('settings.version', { version })}
        style={styles.version}
      >
        <Text variant="small" color="textMuted" align="center">
          {t('settings.version', { version })}
        </Text>
      </PressableScale>
      <View style={{ height: spacing.xl }} />
      <LanguageSheet ref={sheetRef} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  sectionLabel: { marginTop: rv(spacing.xl), marginBottom: rs(spacing.sm) },
  version: { marginTop: rv(spacing.xxxl), paddingVertical: spacing.sm },
});
