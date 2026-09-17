import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, StyleSheet, View } from 'react-native';

import { VerdictBadge } from '@/components/app/VerdictBadge';
import {
  Button,
  Chip,
  confirm,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  showToast,
  Text,
  TextField,
  useSheetRef,
} from '@/components/ui';
import { pickDocumentPhoto } from '@/features/actionPlan/useActionPlan';
import { useCreatePost, useGroup } from '@/features/groups/useGroups';
import { FoodPickerSheet } from '@/features/reactions/components/FoodPickerSheet';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';

/** Compose a post: text, an optional food from history (with its verdict) and an optional photo. */
export default function NewPostScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const group = useGroup(groupId);
  const profile = useProfileStore(selectActiveProfile);
  const create = useCreatePost();
  const foodRef = useSheetRef();
  const [text, setText] = useState('');
  const [food, setFood] = useState<ScanResult | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const dirty = text.trim().length > 0 || !!food || !!photoUri;
  const valid = text.trim().length > 0 || !!food;

  const leave = useCallback(async () => {
    if (!dirty) {
      router.back();
      return;
    }
    const discard = await confirm({
      title: t('groups.discardTitle'),
      message: t('groups.discardBody'),
      confirmLabel: t('fix.discard'),
      cancelLabel: t('fix.keepEditing'),
      destructive: true,
      icon: 'trash',
    });
    if (discard) router.back();
  }, [dirty, router, t]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      void leave();
      return true;
    });
    return () => sub.remove();
  }, [leave]);

  const addPhoto = async () => {
    const uri = await pickDocumentPhoto();
    if (uri === 'denied') {
      showToast({ message: t('progressPhotos.permissionDenied'), icon: 'alert' });
      return;
    }
    if (uri) setPhotoUri(uri);
  };

  const submit = () => {
    if (!groupId || !valid) return;
    create.mutate(
      {
        groupId,
        text: text.trim(),
        foodName: food?.product.name,
        scanId: food?.id,
        imageUri: photoUri,
      },
      {
        onSuccess: () => {
          showToast({ message: t('groups.posted'), icon: 'chat' });
          router.back();
        },
        onError: () => showToast({ message: t('groups.postFailed'), icon: 'alert' }),
      },
    );
  };

  return (
    <Screen
      header={
        <NavHeader
          title={group.data?.name ?? t('groups.newPost')}
          onLeftPress={() => void leave()}
        />
      }
      keyboardAvoiding
      footer={
        <Button
          title={t('groups.post')}
          onPress={submit}
          disabled={!valid}
          loading={create.isPending}
          haptic="medium"
          testID="post-submit"
        />
      }
      testID="post-new"
    >
      <TextField
        value={text}
        onChangeText={setText}
        placeholder={t('groups.postPlaceholder')}
        multiline
        autoFocus
        style={styles.text}
        testID="post-text"
      />
      <Text variant="label" color="text" style={styles.label}>
        {t('groups.postFood')}
      </Text>
      {food ? (
        <View style={styles.foodRow}>
          <Chip
            label={food.product.name}
            onRemove={() => setFood(null)}
            removeLabel={t('a11y.removeChip', { label: food.product.name })}
          />
          <VerdictBadge kind={food.verdict.kind} />
        </View>
      ) : (
        <Button
          title={t('groups.postPickFood')}
          variant="secondary"
          size="md"
          leading={<Icon name="scan" size={rs(20)} color="text" outline />}
          onPress={() => foodRef.current?.present()}
          style={styles.pick}
        />
      )}
      <Text variant="label" color="text" style={styles.label}>
        {t('groups.postPhoto')}
      </Text>
      {photoUri ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
          <PressableScale
            onPress={() => setPhotoUri(undefined)}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('reactions.removePhoto')}
            style={styles.removePhoto}
          >
            <Icon name="close" size={rs(18)} color="text" />
          </PressableScale>
        </View>
      ) : (
        <Button
          title={t('reactions.addPhoto')}
          variant="secondary"
          size="md"
          leading={<Icon name="image" size={rs(20)} color="text" outline />}
          onPress={() => void addPhoto()}
          style={styles.pick}
        />
      )}
      <FoodPickerSheet ref={foodRef} profileId={profile?.id ?? null} onPick={setFood} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { marginTop: rs(spacing.md) },
  label: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.xs) },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), flexWrap: 'wrap' },
  pick: { alignSelf: 'flex-start', paddingHorizontal: rs(spacing.lg) },
  photoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.sm) },
  photo: {
    width: rs(120),
    height: rs(120),
    borderRadius: radii.card,
    backgroundColor: colors.surfaceStrong,
  },
  removePhoto: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
