import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { Avatar, Button, Icon, NavHeader, PressableScale, Screen, showToast, Text } from '@/components/ui';
import { appConfig } from '@/config/app';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const FRIENDS: { initial: string; color: string; x: number; y: number; size: number }[] = [
  { initial: 'J', color: '#3B9FD8', x: 0.04, y: 0.36, size: 40 },
  { initial: 'M', color: '#1C9750', x: 0.22, y: 0.1, size: 44 },
  { initial: 'A', color: '#F5433A', x: 0.2, y: 0.62, size: 40 },
  { initial: 'S', color: '#7C5CBF', x: 0.6, y: 0.08, size: 44 },
  { initial: 'K', color: '#E8A317', x: 0.64, y: 0.6, size: 40 },
  { initial: 'R', color: '#E86AA6', x: 0.82, y: 0.3, size: 40 },
];

/** "Refer your friend": friend avatars around the app mark, the promo code, Share, and how to earn. */
export default function ReferFriendScreen() {
  const { t } = useTranslation();
  const share = () =>
    void Share.share({
      message: t('settingsScreens.invite.shareMessage', {
        code: appConfig.referral.code,
        link: appConfig.referral.link,
        app: t('home.appName'),
      }),
    });
  // No clipboard module in this build: the copy button shares the code instead.
  const copy = async () => {
    await Share.share({ message: appConfig.referral.code });
    showToast({ message: t('settingsScreens.invite.copied'), icon: 'copy' });
  };

  return (
    <Screen header={<NavHeader title={t('settingsScreens.invite.title')} />} testID="settings-invite">
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('settingsScreens.invite.title')}
      </Text>
      <View style={styles.cluster} accessible accessibilityLabel={t('settingsScreens.invite.clusterA11y')}>
        {FRIENDS.map((friend) => (
          <View
            key={friend.initial}
            style={[styles.friend, { left: `${friend.x * 100}%`, top: `${friend.y * 100}%` }]}
          >
            <Avatar name={friend.initial} color={friend.color} size={friend.size} bordered={false} />
          </View>
        ))}
        <View style={styles.appMark}>
          <Icon name="leaf" size={rs(22)} color="onPrimary" />
        </View>
      </View>
      <Text variant="sectionTitle" color="text" align="center">
        {t('settingsScreens.invite.headline')}
      </Text>
      <Text variant="body" color="textBody" align="center">
        {t('settingsScreens.invite.subline')}
      </Text>

      <View style={styles.codeCard}>
        <View style={styles.codeText}>
          <Text variant="small" color="textMuted">
            {t('settingsScreens.invite.code')}
          </Text>
          <Text variant="cardTitle" color="text" selectable>
            {appConfig.referral.code}
          </Text>
        </View>
        <PressableScale
          onPress={() => void copy()}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={t('settingsScreens.invite.copy')}
          hitSlop={8}
          style={styles.copy}
        >
          <Icon name="copy" size={rs(20)} color="text" outline />
        </PressableScale>
      </View>
      <Button title={t('settingsScreens.invite.share')} onPress={share} haptic="medium" style={styles.share} testID="invite-share" />

      <View style={styles.earn}>
        <View style={styles.earnHead}>
          <Text variant="label" color="text">
            {t('settingsScreens.invite.howToEarn')}
          </Text>
          <View style={styles.coin}>
            <Icon name="coin" size={rs(12)} color="onPrimary" />
          </View>
        </View>
        {[t('settingsScreens.invite.step1'), appConfig.referral.earnLine].map((line) => (
          <View key={line} style={styles.earnRow}>
            <Icon name="asterisk" size={rs(12)} color="text" />
            <Text variant="body" color="textBody" style={styles.earnText}>
              {line}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rs(spacing.sm) },
  cluster: { height: rs(150), marginTop: rs(spacing.md), marginBottom: rs(spacing.sm) },
  friend: { position: 'absolute' },
  appMark: {
    position: 'absolute',
    left: '50%',
    top: '38%',
    marginLeft: -rs(22),
    width: rs(44),
    height: rs(44),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.xl),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  codeText: { flex: 1, gap: 2 },
  copy: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  share: { marginTop: rs(spacing.md) },
  earn: {
    marginTop: rs(spacing.lg),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTint,
    gap: rs(spacing.xs),
  },
  earnHead: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), marginBottom: 2 },
  coin: {
    width: rs(20),
    height: rs(20),
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnRow: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.xs), width: '100%' },
  earnText: { flex: 1, flexShrink: 1 },
});
