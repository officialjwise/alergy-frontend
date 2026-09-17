import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  showToast,
  Skeleton,
  Text,
} from '@/components/ui';
import {
  pickDocumentPhoto,
  useActionPlan,
  useAddActionPlanPhoto,
} from '@/features/actionPlan/useActionPlan';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatShortDate } from '@/utils/date';

/** Progress photos: add, view and delete. */
export default function ProgressPhotosScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const photos = useActionPlan(profile?.id ?? null);
  const add = useAddActionPlanPhoto(profile?.id ?? null);

  const addPhoto = useCallback(async () => {
    const uri = await pickDocumentPhoto();
    if (uri === 'denied') {
      showToast({ message: t('progressPhotos.permissionDenied'), icon: 'alert' });
      return;
    }
    if (!uri) return;
    await add.mutateAsync(uri);
    showToast({ message: t('progressPhotos.added'), icon: 'checkCircle' });
  }, [add, t]);

  return (
    <Screen
      header={
        <NavHeader
          title={t('progressPhotos.title')}
          rightIcon="plus"
          rightLabel={t('progressPhotos.add')}
          onRightPress={() => void addPhoto()}
        />
      }
      footer={
        <Button
          title={t('progressPhotos.add')}
          leading={<Icon name="plus" size={rs(20)} color="onPrimary" />}
          onPress={() => void addPhoto()}
          loading={add.isPending}
          haptic="medium"
          testID="progress-photos-add"
        />
      }
      testID="progress-photos"
    >
      <Text variant="body" color="textMuted" style={styles.subtitle}>
        {t('progressPhotos.subtitle')}
      </Text>
      {photos.isLoading && !photos.data ? (
        <View style={styles.grid}>
          <Skeleton height={rs(180)} radius={radii.lg} style={styles.tile} />
          <Skeleton height={rs(180)} radius={radii.lg} style={styles.tile} />
        </View>
      ) : photos.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void photos.refetch()}
        />
      ) : photos.data?.length ? (
        <View style={styles.grid}>
          {photos.data.map((photo) => (
            <PressableScale
              key={photo.id}
              onPress={() =>
                router.push({ pathname: '/progress-photos/[id]', params: { id: photo.id } })
              }
              haptic="light"
              pressedScale={0.97}
              accessibilityRole="button"
              accessibilityLabel={t('progressPhotos.addedOn', {
                date: formatShortDate(photo.addedAt, i18n.language),
              })}
              style={styles.tile}
              testID={`progress-photos-${photo.id}`}
            >
              <Image source={{ uri: photo.uri }} style={styles.image} contentFit="cover" />
              <Text variant="small" color="textMuted" style={styles.caption}>
                {t('progressPhotos.addedOn', { date: formatShortDate(photo.addedAt, i18n.language) })}
              </Text>
            </PressableScale>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="image"
          title={t('progressPhotos.emptyTitle')}
          body={t('progressPhotos.emptyBody')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rs(spacing.sm), marginBottom: rs(spacing.lg) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.sm) },
  tile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  image: { height: rs(160), backgroundColor: colors.surfaceStrong },
  caption: { padding: rs(spacing.xs) },
});
