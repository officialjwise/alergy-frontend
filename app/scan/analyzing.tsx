import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line } from 'react-native-svg';

import { Button, ErrorState, Icon, Spinner, Text } from '@/components/ui';
import { isScanMode } from '@/features/scan/modes';
import { useAnalyze, useBarcodeLookup } from '@/features/scan/useAnalyze';
import { VERDICT_THEME } from '@/features/scan/verdictTheme';
import { haptic } from '@/hooks/useHaptics';
import { ServiceError } from '@/services';
import { colors, layout, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Product, ScanMode, ScanResult, ScanSource } from '@/types';

const STEP_KEYS = ['scan.stepRead', 'scan.stepProfile', 'scan.stepResult'] as const;
/** The screen never disappears faster than this so the steps are readable. */
const MIN_DURATION_MS = 1500;
/** Extra hold after the result arrives while the food callouts animate. */
const CALLOUT_HOLD_MS = 1100;
const MAX_CALLOUTS = 4;
/** Where callout dots sit on the photo, as fractions of the photo area. */
const ANCHORS = [
  { x: 0.3, y: 0.36, dx: 0.14, dy: -0.11 },
  { x: 0.68, y: 0.3, dx: -0.06, dy: -0.12 },
  { x: 0.38, y: 0.6, dx: 0.16, dy: 0.1 },
  { x: 0.7, y: 0.56, dx: -0.2, dy: 0.12 },
] as const;

interface Callout {
  name: string;
  flagged: boolean;
  color: ColorToken;
}

function calloutsFor(result: ScanResult): Callout[] {
  const flaggedByName = new Map(
    result.verdict.triggers.map((trigger) => [trigger.ingredientName.toLowerCase(), trigger.kind]),
  );
  const names = result.product.ingredientsText
    .split(/[,;]/)
    .map((part) => part.replace(/\(.*?\)/g, '').trim())
    .filter((part) => part.length > 1 && part.length <= 24);
  const flaggedNames = [...flaggedByName.keys()];
  const ordered = [
    ...flaggedNames,
    ...names.map((name) => name.toLowerCase()).filter((name) => !flaggedByName.has(name)),
  ];
  return Array.from(new Set(ordered))
    .slice(0, MAX_CALLOUTS)
    .map((name) => {
      const kind = flaggedByName.get(name);
      const flagged = kind !== undefined;
      const color: ColorToken = !flagged
        ? 'text'
        : kind === 'contains'
          ? VERDICT_THEME.unsafe.color
          : VERDICT_THEME.caution.color;
      return { name: name.charAt(0).toUpperCase() + name.slice(1), flagged, color };
    });
}

/**
 * Between capture and result: the dimmed photo, ingredient callouts (food mode),
 * a progress bar and three steps ticking off. Replaces itself with the result,
 * the not-found screen or the unreadable screen.
 */
export default function AnalyzingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    uri?: string;
    source?: string;
    mode?: string;
    barcode?: string;
    from?: string;
  }>();
  const mode: ScanMode = isScanMode(params.mode) ? params.mode : 'food';
  const source: ScanSource =
    params.source === 'gallery' || params.source === 'barcode' ? params.source : 'camera';
  const from = params.from ?? 'home';
  const uri = params.uri;
  const barcode = params.barcode;

  const analyze = useAnalyze();
  const lookup = useBarcodeLookup();
  const [stepsDone, setStepsDone] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);
  const progress = useSharedValue(0);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const run = useCallback(async () => {
    setFailed(false);
    setStepsDone(0);
    setResult(null);
    progress.set(0);
    progress.set(withTiming(0.85, { duration: MIN_DURATION_MS, easing: Easing.out(Easing.quad) }));
    const started = Date.now();
    const timers = [
      setTimeout(() => setStepsDone(1), 450),
      setTimeout(() => setStepsDone(2), 1000),
    ];
    try {
      let product: Product | undefined;
      if (source === 'barcode' && barcode) {
        product = (await lookup.mutateAsync(barcode)) ?? undefined;
        if (!product) {
          router.replace({ pathname: '/scan/not-found', params: { barcode, from } });
          return;
        }
      }
      const outcome = await analyze.mutateAsync({ source, mode, imageUri: uri, product });
      setResult(outcome);
      setStepsDone(3);
      progress.set(withTiming(1, { duration: 250 }));
      haptic(
        outcome.verdict.kind === 'safe'
          ? 'success'
          : outcome.verdict.kind === 'unsafe'
            ? 'error'
            : 'warning',
      );
      const elapsed = Date.now() - started;
      const hold =
        Math.max(0, MIN_DURATION_MS - elapsed) + (mode === 'food' && uri ? CALLOUT_HOLD_MS : 250);
      const variant =
        source === 'barcode' ? 'barcode' : mode === 'label' || mode === 'menu' ? 'label' : 'food';
      setTimeout(() => {
        router.replace({
          pathname: '/scan/result/[id]',
          params: { id: outcome.id, from, variant },
        });
      }, hold);
    } catch (error) {
      if (error instanceof ServiceError && error.code === 'unreadable') {
        router.replace({ pathname: '/scan/unreadable', params: { uri: uri ?? '', mode, from } });
        return;
      }
      setFailed(true);
      progress.set(withTiming(0, { duration: 200 }));
    } finally {
      timers.forEach(clearTimeout);
    }
  }, [analyze, barcode, from, lookup, mode, progress, router, source, uri]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
  }, [run]);

  const callouts = useMemo(
    () => (result && mode === 'food' && uri ? calloutsFor(result) : []),
    [mode, result, uri],
  );
  // Reveal callouts one after another; SVG elements cannot be wrapped in Animated.View.
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (!callouts.length) return;
    const timers = callouts.map((_, index) =>
      setTimeout(() => setRevealed(index + 1), 120 + index * 160),
    );
    return () => timers.forEach(clearTimeout);
  }, [callouts]);
  const photoHeight = height * 0.62;
  const currentStep = Math.min(stepsDone, STEP_KEYS.length - 1);

  return (
    <View style={styles.root} testID="analyzing">
      {uri ? (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, { height: photoHeight }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.noPhoto, { height: photoHeight }]}>
          <Icon
            name={source === 'barcode' ? 'barcode' : 'scan'}
            size={rs(64)}
            color="textOnDark"
            outline
          />
        </View>
      )}
      <View style={[styles.dim, { height: photoHeight }]} />

      {callouts.length ? (
        <View style={[styles.callouts, { height: photoHeight }]} pointerEvents="none">
          <Svg width={width} height={photoHeight} style={StyleSheet.absoluteFill}>
            {callouts.slice(0, revealed).map((callout, index) => {
              const anchor = ANCHORS[index] ?? ANCHORS[0];
              const x1 = anchor.x * width;
              const y1 = anchor.y * photoHeight;
              const x2 = (anchor.x + anchor.dx) * width;
              const y2 = (anchor.y + anchor.dy) * photoHeight;
              return (
                <G key={callout.name}>
                  <Line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={colors[callout.color]}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Circle
                    cx={x1}
                    cy={y1}
                    r={5}
                    fill={colors[callout.color]}
                    stroke={colors.onPrimary}
                    strokeWidth={2}
                  />
                </G>
              );
            })}
          </Svg>
          {callouts.slice(0, revealed).map((callout, index) => {
            const anchor = ANCHORS[index] ?? ANCHORS[0];
            const left = (anchor.x + anchor.dx) * width;
            const top = (anchor.y + anchor.dy) * photoHeight;
            return (
              <Animated.View
                key={callout.name}
                entering={FadeIn.duration(180)}
                style={[
                  styles.callout,
                  { left: Math.min(left, width - rs(140)), top: top - rs(16) },
                  callout.flagged ? { backgroundColor: colors[callout.color] } : null,
                ]}
                accessible
                accessibilityLabel={t('scan.calloutA11y', {
                  name: callout.name,
                  status: callout.flagged ? t('scan.calloutFlagged') : t('scan.calloutClear'),
                })}
              >
                {callout.flagged ? <Icon name="warning" size={rs(14)} color="onPrimary" /> : null}
                <Text
                  variant="small"
                  color={callout.flagged ? 'onPrimary' : 'text'}
                  numberOfLines={1}
                >
                  {callout.name}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      ) : null}

      <View
        style={[
          styles.card,
          { paddingBottom: Math.max(insets.bottom, spacing.md) + rs(spacing.md) },
        ]}
      >
        {failed ? (
          <ErrorState
            title={t('scan.analyzeFailed')}
            body={t('scan.analyzeFailedBody')}
            actionLabel={t('common.retry')}
            onAction={() => void run()}
            secondaryLabel={t('common.close')}
            onSecondary={() =>
              router.canGoBack() ? router.back() : router.replace('/(tabs)/home')
            }
            compact
          />
        ) : (
          <>
            <Text variant="sectionTitle" color="text" accessibilityRole="header">
              {source === 'barcode' && !result ? t('scan.lookingUp') : t('scan.analyzingTitle')}
            </Text>
            <View
              style={styles.track}
              accessible
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 3, now: stepsDone }}
            >
              <Animated.View style={[styles.fill, barStyle]} />
            </View>
            <View style={styles.steps}>
              {STEP_KEYS.map((key, index) => {
                const done = index < stepsDone;
                const current = !done && index === currentStep;
                return (
                  <View
                    key={key}
                    style={styles.step}
                    accessible
                    accessibilityLabel={`${t(key)}, ${done ? t('scan.stepDone') : t('scan.stepPending')}`}
                  >
                    <View style={styles.stepIcon}>
                      {done ? (
                        <Icon name="checkCircle" size={rs(22)} color="successBright" />
                      ) : current ? (
                        <Spinner size={20} />
                      ) : (
                        <Icon name="checkCircle" size={rs(22)} color="ring" outline />
                      )}
                    </View>
                    <Text variant="body" color={done || current ? 'text' : 'textMuted'}>
                      {t(key)}
                    </Text>
                  </View>
                );
              })}
            </View>
            {failed ? null : (
              <Button
                title={t('common.cancel')}
                variant="text"
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/(tabs)/home')
                }
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary, justifyContent: 'flex-end' },
  noPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 13, 20, 0.45)',
  },
  callouts: { position: 'absolute', top: 0, left: 0, right: 0 },
  callout: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(6),
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    maxWidth: rs(150),
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: rs(layout.screenPaddingH),
    paddingTop: rs(spacing.xl),
    gap: rs(spacing.md),
  },
  track: {
    height: rs(10),
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.successBright },
  steps: { gap: rs(spacing.sm) },
  step: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), minHeight: rs(28) },
  stepIcon: { width: rs(24), alignItems: 'center' },
});
