import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, HeaderButton, Icon, showToast, Text } from '@/components/ui';
import { pickDocumentPhoto, useAddActionPlanPhoto } from '@/features/actionPlan/useActionPlan';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** "Your Photos, Your Privacy": the dark notice shown before the first upload; Continue opens the library. */
export default function PhotoPrivacyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(selectActiveProfile);
  const add = useAddActionPlanPhoto(profile?.id ?? null);
  const [busy, setBusy] = useState(false);

  const proceed = useCallback(async () => {
    setBusy(true);
    try {
      const uri = await pickDocumentPhoto();
      if (uri === 'denied') {
        showToast({ message: t('progressPhotos.permissionDenied'), icon: 'alert' });
        return;
      }
      if (!uri) return;
      await add.mutateAsync(uri);
      showToast({ message: t('progressPhotos.added'), icon: 'checkCircle' });
      router.back();
    } catch {
      showToast({ message: t('states.errorTitle'), icon: 'alert' });
    } finally {
      setBusy(false);
    }
  }, [add, router, t]);

  return (
    <View style={styles.root} testID="photo-privacy">
      <View style={[styles.header, { top: insets.top + rs(layout.headerTop) }]}>
        <HeaderButton icon="close" label={t('common.close')} onDark onPress={() => router.back()} />
      </View>
      <View style={styles.body}>
        <View style={styles.shield}>
          <Icon name="lock" size={rs(26)} color="onPrimary" />
        </View>
        <Text variant="sectionTitle" color="textOnDark" align="center" accessibilityRole="header">
          {t('progressPhotos.privacyTitle')}
        </Text>
        <Text variant="body" color="textFaded" align="center" style={styles.copy}>
          {t('progressPhotos.privacyBody')}
        </Text>
        <Button
          title={t('progressPhotos.continue')}
          variant="secondary"
          size="md"
          onPress={() => void proceed()}
          loading={busy || add.isPending}
          style={styles.button}
          haptic="medium"
          testID="photo-privacy-continue"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appleBlack },
  header: { position: 'absolute', left: rs(layout.screenPaddingH), right: rs(layout.screenPaddingH) },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(spacing.xxxl),
    gap: rs(spacing.sm),
  },
  shield: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(16),
    backgroundColor: colors.textBody,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(spacing.xs),
  },
  copy: { maxWidth: 300 },
  button: { marginTop: rs(spacing.md), minWidth: rs(160), alignSelf: 'center' },
});
