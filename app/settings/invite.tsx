import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, IconChip, NavHeader, Screen, Text } from '@/components/ui';
import { appConfig } from '@/config/app';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/** Referral code with a share button; the reward text comes from config. */
export default function InviteFriendsScreen() {
  const { t } = useTranslation();
  const share = () =>
    void Share.share({
      message: t('settingsScreens.invite.shareMessage', {
        code: appConfig.referral.code,
        link: appConfig.referral.link,
      }),
    });
  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.invite.title')} />}
      footer={
        <Button
          title={t('settingsScreens.invite.share')}
          leading={<Icon name="share" size={rs(20)} color="onPrimary" />}
          onPress={share}
          haptic="medium"
          testID="invite-share"
        />
      }
      testID="settings-invite"
    >
      <View style={styles.hero}>
        <IconChip icon="gift" size={88} iconSize={40} background="surfaceTint" outline />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {t('settingsScreens.invite.title')}
        </Text>
        <Text variant="subtitle" color="textMuted" align="center">
          {t('settingsScreens.invite.subtitle', { reward: appConfig.referral.rewardText })}
        </Text>
      </View>
      <Card variant="outlined" padding={spacing.lg} style={styles.card}>
        <Text variant="small" color="textMuted">
          {t('settingsScreens.invite.code')}
        </Text>
        <Text variant="statLg" color="text" selectable>
          {appConfig.referral.code}
        </Text>
        <Text variant="small" color="textMuted" selectable>
          {appConfig.referral.link}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: rs(spacing.sm), marginTop: rv(layout.titleTop) },
  card: { marginTop: rv(spacing.xl), alignItems: 'center', gap: rs(4) },
});
