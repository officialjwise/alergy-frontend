import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
  Text,
  useSheetRef,
} from '@/components/ui';
import { CameraPermissionView } from '@/features/scan/components/CameraPermissionView';
import { ModeTiles, ZoomPills } from '@/features/scan/components/ModeTiles';
import { ScannerHelpSheet } from '@/features/scan/components/ScannerHelpSheet';
import {
  isScanMode,
  SCAN_MODES,
  ULTRA_WIDE_LENS_PATTERN,
  ZOOM_LEVELS,
  type ZoomLevel,
} from '@/features/scan/modes';
import { haptic } from '@/hooks/useHaptics';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, layout, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanMode } from '@/types';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128'] as const;

/**
 * Live scanner sheet: grab handle, close and help buttons, white corner frame,
 * zoom pills, Food / Barcode / Label / Menu tiles, flash, shutter and gallery.
 * Barcode mode detects automatically; every capture hands off to /scan/analyzing.
 */
export default function ScannerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string; from?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const defaultMode = useAppStore((state) => state.preferences.defaultScanMode);
  const [mode, setMode] = useState<ScanMode>(isScanMode(params.mode) ? params.mode : defaultMode);
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState<ZoomLevel>('1');
  const [lenses, setLenses] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const scannedRef = useRef<string | null>(null);
  const helpRef = useSheetRef();
  const profile = useProfileStore(selectActiveProfile);
  const from = params.from ?? 'home';

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      setBusy(false);
      scannedRef.current = null;
      return () => {
        setActive(false);
        setTorch(false);
      };
    }, []),
  );

  const close = useCallback(
    () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')),
    [router],
  );

  const goAnalyze = useCallback(
    (extra: Record<string, string>) => {
      router.replace({ pathname: '/scan/analyzing', params: { mode, from, ...extra } });
    },
    [from, mode, router],
  );

  const capture = useCallback(async () => {
    if (busy || mode === 'barcode') return;
    setBusy(true);
    haptic('medium');
    let uri: string | undefined;
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.6,
        skipProcessing: true,
      });
      uri = photo?.uri;
    } catch {
      // No camera (simulator) or capture failed: the mock still analyses without a photo.
      uri = undefined;
    }
    goAnalyze({ source: 'camera', ...(uri ? { uri } : {}) });
  }, [busy, goAnalyze, mode]);

  const pickFromGallery = useCallback(async () => {
    if (busy) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;
    setBusy(true);
    goAnalyze({ source: 'gallery', uri: asset.uri });
  }, [busy, goAnalyze]);

  const onBarcode = useCallback(
    (event: BarcodeScanningResult) => {
      if (busy || mode !== 'barcode' || scannedRef.current === event.data) return;
      scannedRef.current = event.data;
      setBusy(true);
      haptic('success');
      goAnalyze({ source: 'barcode', barcode: event.data });
    },
    [busy, goAnalyze, mode],
  );

  const onCameraReady = useCallback(async () => {
    try {
      const available = await cameraRef.current?.getAvailableLensesAsync();
      if (available) setLenses(available);
    } catch {
      // Lens listing is a nice-to-have; the .5x pill simply stays hidden.
    }
  }, []);

  const ultraWide = lenses.find((lens) => ULTRA_WIDE_LENS_PATTERN.test(lens));
  const zoomValue = ZOOM_LEVELS.find((level) => level.key === zoom)?.zoom ?? 0;
  const selectedLens = zoom === '0.5' && ultraWide ? ultraWide : undefined;
  const modeConfig = SCAN_MODES.find((item) => item.key === mode) ?? SCAN_MODES[0]!;

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <CameraPermissionView
        variant={permission.canAskAgain ? 'ask' : 'denied'}
        busy={requesting}
        onAllow={() => {
          setRequesting(true);
          void requestPermission().finally(() => setRequesting(false));
        }}
        onOpenSettings={() => void Linking.openSettings()}
        onTypeInstead={() => router.replace('/scan/manual')}
        onClose={close}
      />
    );
  }

  // The scanner is a native modal, so sheets need a provider inside it or they render behind it.
  return (
    <BottomSheetModalProvider>
      <View style={styles.root} testID="scanner">
        {active ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torch}
            zoom={zoomValue}
            selectedLens={selectedLens}
            onCameraReady={() => void onCameraReady()}
            barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
            onBarcodeScanned={mode === 'barcode' && !busy ? onBarcode : undefined}
          />
        ) : null}
        <View
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + rs(spacing.xs),
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.handle} accessibilityLabel={t('scan.handleA11y')} />
          <View style={styles.topRow}>
            <HeaderButton
              icon="close"
              label={t('scan.close')}
              onDark
              onPress={close}
              testID="scanner-close"
            />
            <HeaderButton
              icon="question"
              label={t('scan.help')}
              onDark
              onPress={() => helpRef.current?.present()}
              testID="scanner-help"
            />
          </View>
          <Text variant="label" color="textOnDark" align="center" style={styles.hint}>
            {t(modeConfig.hintKey)}
          </Text>
          <View style={styles.frameArea}>
            <View style={[styles.frame, mode === 'barcode' ? styles.frameWide : null]}>
              <ScanFrame color={colors.onPrimary} thickness={3} />
            </View>
          </View>
          <ZoomPills value={zoom} onChange={setZoom} hasUltraWide={!!ultraWide} />
          <View style={styles.modes}>
            <ModeTiles
              mode={mode}
              onChange={(next) => {
                setMode(next);
                scannedRef.current = null;
              }}
            />
          </View>
          <View style={styles.controls}>
            <PressableScale
              onPress={() => setTorch((value) => !value)}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={torch ? t('scan.flashOn') : t('scan.flashOff')}
              accessibilityState={{ selected: torch }}
              style={styles.roundButton}
              testID="scanner-flash"
            >
              <Icon name={torch ? 'flash' : 'flashOff'} size={rs(22)} color="onPrimary" />
            </PressableScale>
            <PressableScale
              onPress={() => void capture()}
              haptic="medium"
              pressedScale={0.92}
              accessibilityRole="button"
              accessibilityLabel={mode === 'barcode' ? t('scan.shutterBarcode') : t('scan.capture')}
              accessibilityState={{ disabled: busy || mode === 'barcode' }}
              style={[styles.shutter, mode === 'barcode' ? styles.shutterOff : null]}
              disabled={busy || mode === 'barcode'}
              testID="scanner-shutter"
            >
              <View style={styles.shutterInner} />
            </PressableScale>
            <PressableScale
              onPress={() => void pickFromGallery()}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={t('scan.gallery')}
              style={styles.roundButton}
              disabled={busy}
              testID="scanner-gallery"
            >
              <Icon name="image" size={rs(22)} color="onPrimary" outline />
            </PressableScale>
          </View>
        </View>
        {!profile ? (
          <View style={styles.noProfile}>
            <Button
              title={t('scan.noProfile')}
              size="md"
              onPress={() => router.push('/profiles')}
            />
          </View>
        ) : null}
        <ScannerHelpSheet ref={helpRef} />
      </View>
    </BottomSheetModalProvider>
  );
}

const round = rs(sizes.backButton);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  overlay: { flex: 1, justifyContent: 'space-between' },
  handle: {
    alignSelf: 'center',
    width: sizes.sheetHandleWidth,
    height: sizes.sheetHandleHeight,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(layout.screenPaddingH),
    marginTop: rs(spacing.xs),
  },
  hint: {
    paddingHorizontal: rs(layout.screenPaddingH),
    marginTop: rs(spacing.sm),
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowRadius: 6,
  },
  frameArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '74%', aspectRatio: 1, maxWidth: 340 },
  frameWide: { aspectRatio: 1.6 },
  modes: { marginTop: rs(spacing.sm), marginBottom: rs(spacing.md) },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(spacing.giant),
  },
  roundButton: {
    width: round,
    height: round,
    borderRadius: round / 2,
    backgroundColor: 'rgba(15, 13, 20, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: rs(76),
    height: rs(76),
    borderRadius: rs(38),
    borderWidth: 4,
    borderColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOff: { opacity: 0.35 },
  shutterInner: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    backgroundColor: colors.onPrimary,
  },
  noProfile: {
    position: 'absolute',
    left: rs(layout.screenPaddingH),
    right: rs(layout.screenPaddingH),
    bottom: rs(170),
  },
});
