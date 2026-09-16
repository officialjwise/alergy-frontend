import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  HeaderButton,
  Icon,
  PressableScale,
  ScanFrame,
  Spinner,
  StateView,
  Text,
} from '@/components/ui';
import { useAnalyze, useBarcodeLookup } from '@/features/scan/useAnalyze';
import { haptic } from '@/hooks/useHaptics';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Product, ScanSource } from '@/types';

/**
 * Live scanner: camera preview with the design's scan-frame corners, torch,
 * gallery import, manual search fallback, and barcode detection.
 * Recognition is mocked; the capture flows through ScanService.analyze.
 */
export default function ScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const scannedRef = useRef<string | null>(null);
  const profile = useProfileStore(selectActiveProfile);
  const analyze = useAnalyze();
  const lookup = useBarcodeLookup();

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      scannedRef.current = null;
      return () => {
        setActive(false);
        setTorch(false);
      };
    }, []),
  );

  const finish = useCallback(
    async (input: { source: ScanSource; imageUri?: string; product?: Product | null }) => {
      if (!profile || busy) return;
      setBusy(true);
      try {
        const result = await analyze.mutateAsync({
          source: input.source,
          imageUri: input.imageUri,
          product: input.product ?? undefined,
        });
        haptic(
          result.verdict.kind === 'safe'
            ? 'success'
            : result.verdict.kind === 'unsafe'
              ? 'error'
              : 'warning',
        );
        router.push(`/scan/result/${result.id}` as Href);
      } finally {
        setBusy(false);
        setTimeout(() => {
          scannedRef.current = null;
        }, 1500);
      }
    },
    [analyze, busy, profile, router],
  );

  const capture = useCallback(async () => {
    if (busy) return;
    haptic('medium');
    let uri: string | undefined;
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.6,
        skipProcessing: true,
      });
      uri = photo?.uri;
    } catch {
      uri = undefined;
    }
    await finish({ source: 'camera', imageUri: uri });
  }, [busy, finish]);

  const pickFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;
    await finish({ source: 'gallery', imageUri: asset.uri });
  }, [finish]);

  const onBarcode = useCallback(
    async (event: BarcodeScanningResult) => {
      if (busy || scannedRef.current === event.data) return;
      scannedRef.current = event.data;
      const product = await lookup.mutateAsync(event.data);
      if (product) {
        await finish({ source: 'barcode', product });
      } else {
        router.push({ pathname: '/scan/manual', params: { query: event.data } } as Href);
      }
    },
    [busy, finish, lookup, router],
  );

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.topRow}>
          <HeaderButton
            icon="close"
            label={t('common.close')}
            onDark
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
          />
        </View>
        <StateView
          icon="camera"
          title={blocked ? t('permissions.cameraDeniedTitle') : t('permissions.cameraTitle')}
          body={blocked ? t('permissions.cameraDeniedSubtitle') : t('permissions.cameraSubtitle')}
          actionLabel={blocked ? t('common.openSettings') : t('common.allow')}
          onAction={() => (blocked ? void Linking.openSettings() : void requestPermission())}
          secondaryLabel={t('scan.manual')}
          onSecondary={() => router.push('/scan/manual' as Href)}
          style={styles.permission}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {active ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
          onBarcodeScanned={busy ? undefined : (event) => void onBarcode(event)}
        />
      ) : null}
      <View
        style={[styles.overlay, { paddingTop: insets.top + spacing.md }]}
        pointerEvents="box-none"
      >
        <View style={styles.topRow}>
          <HeaderButton
            icon="close"
            label={t('common.close')}
            onDark
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
          />
          <Text variant="label" color="onPrimary" style={styles.hint} align="center">
            {t('scan.hint')}
          </Text>
          <PressableScale
            onPress={() => setTorch((v) => !v)}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={torch ? t('scan.flashOn') : t('scan.flashOff')}
            accessibilityState={{ selected: torch }}
            style={styles.roundButton}
          >
            <Icon name={torch ? 'flash' : 'flashOff'} size={rs(22)} color="onPrimary" />
          </PressableScale>
        </View>
        <View style={styles.frameArea}>
          <View style={styles.frame}>
            <ScanFrame color={colors.onPrimary} thickness={3} />
            {busy ? (
              <View style={styles.analyzing}>
                <Spinner color="onPrimary" />
                <Text variant="label" color="onPrimary">
                  {t('scan.analyzing')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.controls, { paddingBottom: spacing.lg }]}>
          <PressableScale
            onPress={() => void pickFromGallery()}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('scan.gallery')}
            style={styles.sideButton}
            disabled={busy}
          >
            <Icon name="image" size={rs(24)} color="onPrimary" outline />
            <Text variant="small" color="onPrimary">
              {t('scan.gallery')}
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() => void capture()}
            haptic="medium"
            pressedScale={0.92}
            accessibilityRole="button"
            accessibilityLabel={t('scan.capture')}
            style={styles.shutter}
            disabled={busy}
          >
            <View style={styles.shutterInner} />
          </PressableScale>
          <PressableScale
            onPress={() => router.push('/scan/manual' as Href)}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('scan.manual')}
            style={styles.sideButton}
            disabled={busy}
          >
            <Icon name="keyboard" size={rs(24)} color="onPrimary" outline />
            <Text variant="small" color="onPrimary">
              {t('scan.manual')}
            </Text>
          </PressableScale>
        </View>
      </View>
      {!profile ? (
        <View style={styles.noProfile}>
          <Button
            title={t('profile.addProfile')}
            size="md"
            onPress={() => router.push('/profiles' as Href)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(layout.screenPaddingH),
  },
  hint: { flex: 1, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6 },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,13,20,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameArea: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  frame: { width: '72%', aspectRatio: 0.9, maxWidth: 340 },
  analyzing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(15,13,20,0.35)',
    borderRadius: radii.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(spacing.huge),
  },
  sideButton: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
    minHeight: 56,
    justifyContent: 'center',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.onPrimary },
  permission: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
  noProfile: {
    position: 'absolute',
    left: rs(layout.screenPaddingH),
    right: rs(layout.screenPaddingH),
    bottom: 120,
  },
});
