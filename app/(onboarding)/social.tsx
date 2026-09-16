import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Avatar, Button, Card, Icon, Stars, Text } from '@/components/ui';
import { colors, sizes, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const laurelLeft = require('@/assets/images/laurel-left.png');
const laurelRight = require('@/assets/images/laurel-right.png');
const avatars = [
  require('@/assets/images/avatar-1.png'),
  require('@/assets/images/avatar-2.png'),
  require('@/assets/images/avatar-3.png'),
];

/** Social proof: rating with laurels, stacked avatars, and the review card. */
export default function SocialScreen() {
  const { t } = useTranslation();
  return (
    <OnboardingScreen
      route="social"
      title={t('social.title')}
      footer={(nav) => <Button title={t('common.continue')} onPress={nav.goNext} haptic="medium" />}
    >
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.ratingRow} accessible accessibilityLabel={t('social.ratingA11y')}>
            <Image source={laurelLeft} style={styles.laurel} contentFit="contain" />
            <View style={styles.ratingCenter}>
              <View style={styles.ratingLine}>
                <Text variant="rating" color="text">
                  4.8
                </Text>
                <Icon
                  name="star"
                  size={rs(sizes.ratingStar)}
                  color="gold"
                  style={styles.ratingStar}
                />
              </View>
              <Text variant="captionSm" color="textMuted">
                {t('social.avgRating')}
              </Text>
            </View>
            <Image source={laurelRight} style={styles.laurel} contentFit="contain" />
          </View>
          <Text variant="caption" color="textMuted" align="center" style={styles.statLabel}>
            {t('social.ratings')}
          </Text>
        </View>
        <View style={styles.stat}>
          <View style={styles.avatars}>
            {avatars.map((source, index) => (
              <Avatar
                key={index}
                source={source}
                size={sizes.avatar + 8}
                style={index > 0 ? styles.avatarOverlap : null}
              />
            ))}
          </View>
          <Text variant="caption" color="textMuted" align="center" style={styles.statLabel}>
            {t('social.users')}
          </Text>
        </View>
      </View>

      <Card style={styles.review}>
        <Stars accessibilityLabel={t('social.starsA11y')} />
        <Text variant="body" color="textMuted" style={styles.reviewAuthor}>
          {t('social.reviewAuthor')}
        </Text>
        <Text variant="bodyLg" color="text" style={styles.reviewText}>
          {t('social.reviewText')}
        </Text>
      </Card>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    marginTop: rv(spacing.huge),
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stat: { flex: 1, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  ratingCenter: { alignItems: 'center' },
  ratingLine: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  ratingStar: { marginTop: -4 },
  laurel: { width: rs(34), height: rs(70) },
  statLabel: { marginTop: rs(spacing.sm) },
  avatars: { flexDirection: 'row', alignItems: 'center', height: rs(sizes.avatar + 8) + 6 },
  avatarOverlap: { marginLeft: -rs(14) },
  review: { marginTop: rv(spacing.xxxl), backgroundColor: colors.surfaceTint },
  reviewAuthor: { marginTop: rs(spacing.md) },
  reviewText: { marginTop: rs(spacing.sm) },
});
