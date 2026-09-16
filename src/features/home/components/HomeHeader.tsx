import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Icon, PressableScale, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { UserProfile } from '@/types';

const logo = require('@/assets/images/icon.png');

export interface HomeHeaderProps {
  streak: number;
  onStreakPress: () => void;
  /** Shown only for family setups (more than one profile). */
  profile: UserProfile | null;
  showSwitcher: boolean;
  onSwitchPress: () => void;
}

/** Logo and app name on the left, safe scan streak pill on the right, optional profile switcher below. */
export function HomeHeader({
  streak,
  onStreakPress,
  profile,
  showSwitcher,
  onSwitchPress,
}: HomeHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View
          style={styles.brand}
          accessible
          accessibilityRole="header"
          accessibilityLabel={t('home.appName')}
        >
          <Image
            source={logo}
            style={styles.logo}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <Text variant="cardTitle" color="text">
            {t('home.appName')}
          </Text>
        </View>
        <PressableScale
          onPress={onStreakPress}
          haptic="light"
          pressedScale={0.95}
          accessibilityRole="button"
          accessibilityLabel={t('home.streakA11y', { count: streak })}
          style={styles.streak}
          testID="home-streak"
        >
          <Icon name="shieldCheck" size={rs(18)} color={streak > 0 ? 'success' : 'textMuted'} />
          <Text variant="statSm" color="text">
            {streak}
          </Text>
        </PressableScale>
      </View>
      {showSwitcher && profile ? (
        <PressableScale
          onPress={onSwitchPress}
          haptic="light"
          pressedScale={0.97}
          accessibilityRole="button"
          accessibilityLabel={`${t('home.activeProfile')} ${profile.name}. ${t('home.switchProfile')}`}
          style={styles.switcher}
          testID="home-switcher"
        >
          <Avatar name={profile.name} color={profile.color} size={24} bordered={false} />
          <Text variant="small" color="textBody" numberOfLines={1} style={styles.switcherText}>
            {t('home.checkingFor', { name: profile.name })}
          </Text>
          <Icon name="chevronDown" size={rs(16)} color="textMuted" />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: rs(spacing.sm) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  logo: { width: rs(30), height: rs(30), borderRadius: rs(8) },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    minHeight: rs(36),
    paddingHorizontal: rs(spacing.sm),
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.xs),
    alignSelf: 'flex-start',
    minHeight: rs(36),
    paddingLeft: rs(6),
    paddingRight: rs(spacing.sm),
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  switcherText: { maxWidth: 200 },
});
