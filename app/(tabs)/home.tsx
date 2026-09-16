import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileSwitcherSheet } from '@/components/app/ProfileSwitcherSheet';
import { ScanRow } from '@/components/app/ScanRow';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  IconChip,
  PressableScale,
  Skeleton,
  Text,
  useSheetRef,
} from '@/components/ui';
import { useHistory } from '@/features/history/useHistory';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(selectActiveProfile);
  const profileCount = useProfileStore((state) => state.profiles.length);
  const switcherRef = useSheetRef();
  const recent = useHistory(profile?.id ?? null);
  const saved = useHistory(profile?.id ?? null, { savedOnly: true });

  const recentItems = useMemo(() => (recent.data ?? []).slice(0, 4), [recent.data]);
  const savedItems = useMemo(() => (saved.data ?? []).slice(0, 4), [saved.data]);
  const openScan = useCallback(
    (scan: ScanResult) => router.push(`/scan/result/${scan.id}` as Href),
    [router],
  );
  const greetingName =
    profile && profile.profileFor === 'myself' ? '' : profile ? `, ${profile.name}` : '';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="titleLg" color="text" accessibilityRole="header">
              {t('home.greeting', { name: greetingName })}
            </Text>
            <Text variant="subtitle" color="textMuted">
              {t('home.subtitle')}
            </Text>
          </View>
        </View>

        {profile ? (
          <PressableScale
            onPress={() => switcherRef.current?.present()}
            haptic="light"
            pressedScale={0.99}
            accessibilityRole="button"
            accessibilityLabel={`${t('home.activeProfile')} ${profile.name}. ${t('home.switchProfile')}`}
            style={styles.profileCard}
          >
            <Avatar name={profile.name} color={profile.color} size={44} bordered={false} />
            <View style={styles.profileText}>
              <Text variant="small" color="textMuted">
                {t('home.activeProfile')}
              </Text>
              <Text variant="label" color="text" numberOfLines={1}>
                {profile.name}
                {profileCount > 1 ? '' : ''}
              </Text>
              <Text variant="small" color="textMuted">
                {t('home.watching', { count: profile.restrictions.length })}
              </Text>
            </View>
            <Icon name="swap" size={rs(22)} color="textBody" />
          </PressableScale>
        ) : null}

        <PressableScale
          onPress={() => router.push('/(tabs)/scan' as Href)}
          haptic="medium"
          accessibilityRole="button"
          accessibilityLabel={t('home.quickScan')}
          accessibilityHint={t('home.quickScanHint')}
          style={styles.scanCard}
        >
          <IconChip
            icon="scan"
            size={56}
            iconSize={28}
            background="background"
            color="text"
            outline
          />
          <View style={styles.scanText}>
            <Text variant="sectionTitle" color="onPrimary">
              {t('home.quickScan')}
            </Text>
            <Text variant="small" color="onPrimary" style={styles.scanHint}>
              {t('home.quickScanHint')}
            </Text>
          </View>
          <Icon name="arrowForward" size={rs(24)} color="onPrimary" />
        </PressableScale>

        <Section
          title={t('home.recent')}
          onSeeAll={() => router.push('/(tabs)/history' as Href)}
          seeAllLabel={t('common.seeAll')}
          showSeeAll={(recent.data?.length ?? 0) > 4}
        >
          {recent.isLoading ? (
            <View style={styles.list}>
              <Skeleton height={rs(80)} radius={radii.card} />
              <Skeleton height={rs(80)} radius={radii.card} />
            </View>
          ) : recent.isError ? (
            <ErrorState
              title={t('states.errorTitle')}
              body={t('states.errorBody')}
              actionLabel={t('common.retry')}
              onAction={() => void recent.refetch()}
              compact
            />
          ) : recentItems.length === 0 ? (
            <EmptyState
              icon="history"
              title={t('home.emptyRecentTitle')}
              body={t('home.emptyRecentBody')}
              compact
            />
          ) : (
            <View style={styles.list}>
              {recentItems.map((scan) => (
                <ScanRow key={scan.id} scan={scan} onPress={openScan} />
              ))}
            </View>
          )}
        </Section>

        <Section
          title={t('home.saved')}
          onSeeAll={() =>
            router.push({ pathname: '/(tabs)/history', params: { saved: '1' } } as Href)
          }
          seeAllLabel={t('common.seeAll')}
          showSeeAll={(saved.data?.length ?? 0) > 4}
        >
          {saved.isLoading ? (
            <Skeleton height={rs(80)} radius={radii.card} />
          ) : savedItems.length === 0 ? (
            <EmptyState
              icon="bookmark"
              title={t('home.emptySavedTitle')}
              body={t('home.emptySavedBody')}
              compact
            />
          ) : (
            <View style={styles.list}>
              {savedItems.map((scan) => (
                <ScanRow key={scan.id} scan={scan} onPress={openScan} showTime={false} />
              ))}
            </View>
          )}
        </Section>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
      <ProfileSwitcherSheet ref={switcherRef} />
    </View>
  );
}

function Section({
  title,
  children,
  onSeeAll,
  seeAllLabel,
  showSeeAll,
}: {
  title: string;
  children: ReactNode;
  onSeeAll: () => void;
  seeAllLabel: string;
  showSeeAll: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="sectionTitle" color="text" accessibilityRole="header">
          {title}
        </Text>
        {showSeeAll ? (
          <Button title={seeAllLabel} variant="text" onPress={onSeeAll} style={styles.seeAll} />
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: rs(layout.screenPaddingH) },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerText: { flex: 1, gap: 4 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    marginTop: rs(spacing.xl),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  profileText: { flex: 1 },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    marginTop: rs(spacing.md),
    padding: rs(spacing.lg),
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  scanText: { flex: 1 },
  scanHint: { opacity: 0.8 },
  section: { marginTop: rs(spacing.xxxl) },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(spacing.sm),
  },
  seeAll: { minHeight: 32, paddingVertical: 0 },
  list: { gap: rs(spacing.sm) },
});
