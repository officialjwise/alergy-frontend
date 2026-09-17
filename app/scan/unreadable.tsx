import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, IconChip, NavHeader, Screen, Text } from '@/components/ui';
import { isScanMode } from '@/features/scan/modes';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const TIPS = ['unreadable.tip1', 'unreadable.tip2', 'unreadable.tip3'] as const;

/** Blurry or dark photo: shows the capture, three tips, Retake and Type instead. */
export default function UnreadableScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ uri?: string; mode?: string; from?: string }>();
  const mode = isScanMode(params.mode) ? params.mode : 'food';
  const from = params.from ?? 'home';
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));

  return (
    <Screen
      header={<NavHeader onLeftPress={back} />}
      footer={
        <View style={styles.footer}>
          <Button
            title={t('unreadable.retake')}
            haptic="medium"
            onPress={() => router.replace({ pathname: '/scan', params: { mode, from } })}
            testID="unreadable-retake"
          />
          <Button
            title={t('unreadable.typeInstead')}
            variant="secondary"
            onPress={() => router.replace('/scan/manual')}
            testID="unreadable-manual"
          />
        </View>
      }
      testID="scan-unreadable"
    >
      <View style={styles.photo} accessibilityLabel={t('unreadable.title')}>
        {params.uri ? (
          <Image
            source={{ uri: params.uri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={6}
          />
        ) : null}
        <View style={styles.photoBadge}>
          <IconChip
            icon="eyeOff"
            size={64}
            iconSize={30}
            background="background"
            color="text"
            outline
          />
        </View>
      </View>
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('unreadable.title')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('unreadable.body')}
      </Text>
      <View style={styles.tips}>
        {TIPS.map((tip) => (
          <View key={tip} style={styles.tip}>
            <Icon name="checkCircle" size={rs(20)} color="successBright" />
            <Text variant="body" color="textBody" style={styles.tipText}>
              {t(tip)}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    height: rv(200),
    marginTop: rv(spacing.lg),
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceTint,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: { alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  tips: { marginTop: rv(spacing.xl), gap: rs(spacing.sm) },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.sm) },
  tipText: { flex: 1 },
  footer: { gap: rs(spacing.sm) },
});
