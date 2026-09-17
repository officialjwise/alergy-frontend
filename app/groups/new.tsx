import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  showToast,
  Text,
  TextField,
} from '@/components/ui';
import { pickDocumentPhoto } from '@/features/actionPlan/useActionPlan';
import { useCreateGroup } from '@/features/groups/useGroups';
import { colors, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Create a private group: name, description and an optional photo, then invite. */
export default function CreateGroupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const create = useCreateGroup();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

  const addPhoto = async () => {
    const uri = await pickDocumentPhoto();
    if (uri === 'denied') {
      showToast({ message: t('actionPlan.permissionDenied'), icon: 'alert' });
      return;
    }
    if (uri) setImageUri(uri);
  };

  const submit = () => {
    if (!name.trim()) return;
    create.mutate(
      { name, description, imageUri },
      {
        onSuccess: (group) => {
          showToast({ message: t('groups.created'), icon: 'people' });
          router.replace({ pathname: '/groups/[id]/invite', params: { id: group.id } });
        },
        onError: () => showToast({ message: t('states.errorTitle'), icon: 'alert' }),
      },
    );
  };

  return (
    <Screen
      header={<NavHeader title={t('groups.createTitle')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('groups.create')}
          onPress={submit}
          disabled={!name.trim()}
          loading={create.isPending}
          haptic="medium"
          testID="group-create"
        />
      }
      testID="group-new"
    >
      <View style={styles.photoRow}>
        <PressableScale
          onPress={() => void addPhoto()}
          haptic="light"
          pressedScale={0.96}
          accessibilityRole="button"
          accessibilityLabel={t('groups.addImage')}
          style={styles.photo}
          testID="group-photo"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Icon name="image" size={rs(28)} color="textMuted" outline />
          )}
        </PressableScale>
        <Text variant="small" color="textMuted" style={styles.photoHint}>
          {t('groups.createImage')}
        </Text>
      </View>
      <TextField
        label={t('groups.createName')}
        value={name}
        onChangeText={setName}
        placeholder={t('groups.createNamePlaceholder')}
        autoCapitalize="words"
        autoFocus
        style={styles.field}
        testID="group-name"
      />
      <TextField
        label={t('groups.createDescription')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('groups.createDescriptionPlaceholder')}
        multiline
        style={styles.field}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoRow: { alignItems: 'center', gap: rs(spacing.xs), marginTop: rs(spacing.lg) },
  photo: {
    width: rs(96),
    height: rs(96),
    borderRadius: rs(48),
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: { textAlign: 'center' },
  field: { marginTop: rs(spacing.lg) },
});
