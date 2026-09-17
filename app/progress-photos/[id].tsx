import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { confirm, ErrorState, HeaderButton, showToast, Text } from '@/components/ui';
import { useActionPlan, useRemoveActionPlanPhoto } from '@/features/actionPlan/useActionPlan';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatLongDate } from '@/utils/date';

/** Full screen viewer for one progress photo with delete. */
export default function ProgressPhotoScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useProfileStore(selectActiveProfile);
  const photos = useActionPlan(profile?.id ?? null);
  const remove = useRemoveActionPlanPhoto();
  const photo = photos.data?.find((item) => item.id === id) ?? null;

  const deletePhoto = async () => {
    if (!photo) return;
    const ok = await confirm({
      title: t('progressPhotos.deleteTitle'),
      message: t('progressPhotos.deleteBody'),
      confirmLabel: t('progressPhotos.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      icon: 'trash',
    });
    if (!ok) return;
    remove.mutate(photo.id, {
      onSuccess: () => {
        showToast({ message: t('progressPhotos.deleted'), icon: 'trash' });
        router.back();
      },
    });
  };

  return (
    <View style={styles.root} testID="progress-photos-viewer">
      {photo ? (
        <Image
          source={{ uri: photo.uri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          accessibilityLabel={t('progressPhotos.viewerTitle')}
        />
      ) : photos.data ? (
        <View style={styles.center}>
          <ErrorState
            title={t('states.errorTitle')}
            actionLabel={t('common.back')}
            onAction={() => router.back()}
          />
        </View>
      ) : null}
      <View style={[styles.header, { top: insets.top + rs(layout.headerTop) }]}>
        <HeaderButton
          icon="close"
          label={t('common.close')}
          onDark
          onPress={() => router.back()}
          testID="viewer-close"
        />
        {photo ? (
          <HeaderButton
            icon="trash"
            label={t('progressPhotos.delete')}
            onDark
            onPress={() => void deletePhoto()}
            testID="viewer-delete"
          />
        ) : null}
      </View>
      {photo ? (
        <View
          style={[styles.caption, { bottom: Math.max(insets.bottom, spacing.md) + rs(spacing.sm) }]}
        >
          <Text variant="small" color="textOnDark" align="center">
            {t('progressPhotos.addedOn', { date: formatLongDate(photo.addedAt, i18n.language) })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appleBlack },
  center: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
  header: {
    position: 'absolute',
    left: rs(layout.screenPaddingH),
    right: rs(layout.screenPaddingH),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caption: { position: 'absolute', left: 0, right: 0 },
});
