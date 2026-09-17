import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import {
  Avatar,
  confirm,
  EmptyState,
  Icon,
  LargeTitleHeader,
  PressableScale,
  Screen,
  SectionHeader,
  SettingsRow,
  SettingsSection,
  showToast,
  Text,
  useSheetRef,
} from '@/components/ui';
import { appConfig } from '@/config/app';
import { LanguageSheet } from '@/features/onboarding/components/LanguageSheet';
import { WidgetPreviews } from '@/features/profile/components/WidgetPreviews';
import { WidgetsHowToSheet } from '@/features/profile/components/WidgetsHowToSheet';
import { useHomeDashboard } from '@/features/tracking/useTracking';
import { LANGUAGES } from '@/i18n/languages';
import { getServices } from '@/services';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { dayKey, formatTime } from '@/utils/date';

/**
 * Profile: header card, Invite Friends, Account, Goals & Tracking, Allergies &
 * diet, Widgets, Support & Legal, Follow Us and Account Actions.
 */
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const account = useAppStore((state) => state.account);
  const setAccount = useAppStore((state) => state.setAccount);
  const session = useAppStore((state) => state.session);
  const setSession = useAppStore((state) => state.setSession);
  const language = useAppStore((state) => state.language) ?? i18n.language;
  const dashboard = useHomeDashboard(profile?.id ?? null, dayKey(new Date()));
  const widgetsRef = useSheetRef();
  const languageRef = useSheetRef();
  const [syncing, setSyncing] = useState(false);
  const versionTaps = useRef(0);

  const languageName = LANGUAGES.find((item) => item.code === language)?.nativeName ?? language;
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const displayName = account.name || session?.user.name || '';

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await getServices().profiles.list();
      setAccount({ lastSyncedAt: new Date().toISOString() });
      showToast({ message: t('profileTab.synced'), icon: 'sync' });
    } finally {
      setSyncing(false);
    }
  }, [setAccount, t]);

  const logout = useCallback(async () => {
    const ok = await confirm({
      title: t('profileTab.logoutTitle'),
      message: t('profileTab.logoutBody'),
      confirmLabel: t('profileTab.logout'),
      cancelLabel: t('common.cancel'),
      icon: 'logout',
    });
    if (!ok) return;
    void getServices().auth.signOut();
    setSession(null);
    showToast({ message: t('profileTab.loggedOut'), icon: 'logout' });
    router.replace('/(onboarding)/welcome');
  }, [router, setSession, t]);

  const onVersionPress = () => {
    versionTaps.current += 1;
    if (versionTaps.current >= 5) {
      versionTaps.current = 0;
      router.push('/dev/components');
    }
  };

  if (!profile) {
    return (
      <Screen tabBar header={<LargeTitleHeader title={t('tabs.profile')} />}>
        <EmptyState
          icon="person"
          title={t('profileTab.noProfileTitle')}
          body={t('profileTab.noProfileBody')}
          actionLabel={t('profile.addProfile')}
          onAction={() => router.push('/(onboarding)/who')}
        />
      </Screen>
    );
  }

  return (
    <Screen tabBar header={<LargeTitleHeader title={t('tabs.profile')} />} testID="profile-tab">
      {/* Header card */}
      <PressableScale
        onPress={() => router.push('/settings/name')}
        haptic="light"
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${displayName || t('profileTab.setName')}. ${t(`profileTab.plan_${account.plan}`)}`}
        style={styles.headerCard}
        testID="profile-header"
      >
        <Avatar name={displayName || profile.name} color={profile.color} size={56} bordered={false} />
        <View style={styles.headerText}>
          <View style={styles.planRow}>
            <Icon name="crown" size={rs(14)} color="gold" />
            <Text variant="small" color="textMuted">
              {t(`profileTab.plan_${account.plan}`)}
            </Text>
          </View>
          <Text variant="sectionTitle" color="text" numberOfLines={1}>
            {displayName || t('profileTab.setName')}
          </Text>
          <Text variant="small" color="textMuted">
            {account.username
              ? t('profileTab.username', { username: account.username })
              : t('profileTab.andUsername')}
          </Text>
        </View>
        <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
      </PressableScale>

      {/* Invite Friends */}
      <SettingsSection title={t('profileTab.inviteSection')}>
        <SettingsRow
          label={appConfig.referral.title}
          description={appConfig.referral.body}
          icon="personAdd"
          onPress={() => router.push('/settings/invite')}
          testID="profile-invite"
        />
      </SettingsSection>

      {/* Account */}
      <SettingsSection title={t('profileTab.account')}>
        <SettingsRow label={t('profileTab.personal')} icon="card" onPress={() => router.push('/settings/personal')} />
        <SettingsRow label={t('profileTab.preferences')} icon="settings" onPress={() => router.push('/settings/preferences')} />
        <SettingsRow
          label={t('profileTab.language')}
          icon="translate"
          value={languageName}
          onPress={() => languageRef.current?.present()}
          testID="profile-language"
        />
        <SettingsRow label={t('profileTab.familyPlan')} icon="people" onPress={() => router.push('/settings/family-plan')} />
      </SettingsSection>

      {/* Goals & Tracking */}
      <SettingsSection title={t('profileTab.goalsTracking')}>
        <SettingsRow label={t('profileTab.appleHealth')} icon="heart" onPress={() => router.push('/settings/apple-health')} />
        <SettingsRow label={t('profileTab.nutritionGoals')} icon="crosshairs" onPress={() => router.push('/settings/nutrition-goals')} />
        <SettingsRow label={t('profileTab.goalsWeight')} icon="flag" onPress={() => router.push('/settings/personal')} />
        <SettingsRow label={t('profileTab.reminders')} icon="bell" onPress={() => router.push('/settings/reminders')} />
        <SettingsRow label={t('profileTab.weightHistory')} icon="history" onPress={() => router.push('/weight')} />
        <SettingsRow label={t('profileTab.ringColors')} icon="rings" onPress={() => router.push('/settings/ring-colors')} />
      </SettingsSection>

      {/* Allergies & diet (this app's own section) */}
      <SettingsSection title={t('profileTab.safety')}>
        <SettingsRow
          label={t('profileTab.allergens')}
          icon="ban"
          value={t('profile.foodCount', { count: profile.foods.length })}
          onPress={() => router.push('/settings/allergies')}
        />
        <SettingsRow
          label={t('profileTab.conditions')}
          icon="heart"
          value={profile.conditions.length ? String(profile.conditions.length) : undefined}
          onPress={() => router.push('/settings/conditions')}
        />
        <SettingsRow label={t('profileTab.note')} icon="edit" value={profile.note ? undefined : undefined} onPress={() => router.push('/settings/note')} />
        <SettingsRow label={t('profileTab.allergyCard')} icon="card" onPress={() => router.push('/settings/allergy-card')} />
        <SettingsRow label={t('profileTab.reactions')} icon="reaction" onPress={() => router.push('/reactions')} />
        <SettingsRow label={t('profileTab.verdictColors')} icon="target" onPress={() => router.push('/settings/verdict-colors')} />
      </SettingsSection>

      {/* Widgets */}
      <SectionHeader
        title={t('profileTab.widgets')}
        variant="label"
        actionLabel={t('profileTab.howToAdd')}
        onAction={() => widgetsRef.current?.present()}
      />
      <WidgetPreviews
        dashboard={dashboard.data}
        onLogFood={() => router.push('/scan')}
        onScan={() => router.push({ pathname: '/scan', params: { from: 'profile' } })}
        onBarcode={() => router.push({ pathname: '/scan', params: { mode: 'barcode' } })}
      />

      {/* Support & Legal */}
      <SettingsSection title={t('profileTab.support')} style={styles.afterWidgets}>
        <SettingsRow label={t('profileTab.requestFeature')} icon="megaphone" onPress={() => router.push('/settings/request-feature')} />
        <SettingsRow label={t('profileTab.supportEmail')} icon="mail" onPress={() => void Linking.openURL(`mailto:${appConfig.supportEmail}`)} />
        <SettingsRow label={t('profileTab.exportReport')} icon="share" onPress={() => router.push('/settings/export')} />
        <SettingsRow
          label={t('profileTab.sync')}
          icon="sync"
          value={
            syncing
              ? t('profileTab.syncing')
              : account.lastSyncedAt
                ? t('profileTab.lastSynced', { time: formatTime(account.lastSyncedAt, i18n.language) })
                : t('profileTab.neverSynced')
          }
          chevron={false}
          disabled={syncing}
          onPress={() => void sync()}
          testID="profile-sync"
        />
        <SettingsRow label={t('profileTab.terms')} icon="document" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })} />
        <SettingsRow label={t('profileTab.privacy')} icon="shield" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })} />
      </SettingsSection>

      {/* Follow Us */}
      <SettingsSection title={t('profileTab.follow')}>
        <SettingsRow label={t('profileTab.instagram')} icon="instagram" onPress={() => void Linking.openURL(appConfig.social.instagram)} />
        <SettingsRow label={t('profileTab.tiktok')} icon="tiktok" onPress={() => void Linking.openURL(appConfig.social.tiktok)} />
        <SettingsRow label={t('profileTab.x')} icon="x" onPress={() => void Linking.openURL(appConfig.social.x)} />
      </SettingsSection>

      {/* Account Actions */}
      <SettingsSection title={t('profileTab.actions')}>
        <SettingsRow label={t('profileTab.logout')} icon="logout" onPress={() => void logout()} testID="profile-logout" />
        <SettingsRow label={t('profileTab.deleteAccount')} icon="personRemove" onPress={() => router.push('/settings/delete-account')} testID="profile-delete" />
      </SettingsSection>

      <PressableScale onPress={onVersionPress} accessibilityRole="text" style={styles.version}>
        <Text variant="small" color="textPlaceholder" align="center">
          {t('profileTab.version', { version })}
        </Text>
      </PressableScale>

      <WidgetsHowToSheet ref={widgetsRef} />
      <LanguageSheet
        ref={languageRef}
        onSelect={() => showToast({ message: t('settingsScreens.language.changed'), icon: 'globe' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    marginBottom: rs(spacing.xl),
    ...shadows.card,
  },
  headerText: { flex: 1, gap: 2 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  afterWidgets: { marginTop: rs(spacing.xl) },
  version: { alignItems: 'center', paddingVertical: rs(spacing.md), minHeight: 44 },
});
