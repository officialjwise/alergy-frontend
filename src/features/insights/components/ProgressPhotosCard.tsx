import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { DashboardCard } from '@/features/home/components/DashboardCard';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ActionPlanPhoto } from '@/types';

export interface ProgressPhotosCardProps {
  photos: ActionPlanPhoto[];
  onUpload: () => void;
  onOpen: () => void;
  testID?: string;
}

/** "Progress Photos": the stacked-cards illustration with the upload prompt, or the latest photos. */
export function ProgressPhotosCard({ photos, onUpload, onOpen, testID }: ProgressPhotosCardProps) {
  const { t } = useTranslation();
  return (
    <DashboardCard padding={spacing.lg} testID={testID}>
      <Text variant="cardTitle" color="text" accessibilityRole="header">
        {t('progressPhotos.title')}
      </Text>
      {photos.length ? (
        <PressableScale
          onPress={onOpen}
          haptic="light"
          pressedScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={t('progressPhotos.count', { count: photos.length })}
          style={styles.thumbs}
        >
          {photos.slice(0, 3).map((photo) => (
            <Image key={photo.id} source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
          ))}
          <View style={styles.count}>
            <Text variant="label" color="text">
              {t('progressPhotos.count', { count: photos.length })}
            </Text>
            <Icon name="chevronRight" size={rs(16)} color="textMuted" />
          </View>
        </PressableScale>
      ) : (
        <View style={styles.row}>
          <View style={styles.art} accessibilityElementsHidden>
            <View style={[styles.ghost, styles.ghostBack]} />
            <View style={[styles.ghost, styles.ghostMid]} />
            <View style={styles.cardArt}>
              <Icon name="person" size={rs(28)} color="textMuted" outline />
            </View>
          </View>
          <View style={styles.text}>
            <Text variant="body" color="textMuted">
              {t('progressPhotos.question')}
            </Text>
            <PressableScale
              onPress={onUpload}
              haptic="light"
              pressedScale={0.96}
              accessibilityRole="button"
              accessibilityLabel={t('progressPhotos.add')}
              style={styles.upload}
              testID="progress-photos-upload"
            >
              <Icon name="plus" size={rs(18)} color="text" />
              <Text variant="label" color="text">
                {t('progressPhotos.add')}
              </Text>
            </PressableScale>
          </View>
        </View>
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.md), marginTop: rs(spacing.sm) },
  art: { width: rs(84), height: rs(96), alignItems: 'center', justifyContent: 'center' },
  ghost: {
    position: 'absolute',
    width: rs(60),
    height: rs(76),
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ghostBack: { transform: [{ rotate: '-10deg' }, { translateX: -8 }] },
  ghostMid: { transform: [{ rotate: '8deg' }, { translateX: 8 }] },
  cardArt: {
    width: rs(60),
    height: rs(76),
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: rs(spacing.sm) },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    alignSelf: 'flex-start',
    minHeight: rs(40),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.pill,
    borderWidth: borders.hairline,
    borderColor: colors.ring,
  },
  thumbs: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), marginTop: rs(spacing.sm) },
  thumb: { width: rs(56), height: rs(72), borderRadius: radii.sm, backgroundColor: colors.surfaceStrong },
  count: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
});
