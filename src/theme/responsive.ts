import { Dimensions, PixelRatio } from 'react-native';

/**
 * The design was drawn on a 393pt-wide phone. Sizes are scaled relative to that
 * width so small phones (iPhone SE 375pt, small Android 360dp) get slightly
 * tighter layouts and large phones do not blow up. Scaling is clamped so text
 * never grows more than 5% or shrinks more than 14%.
 */
export const DESIGN_WIDTH = 393;
export const DESIGN_HEIGHT = 852;

const MIN_SCALE = 0.86;
const MAX_SCALE = 1.05;

const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

export const screenWidth = Math.min(initialWidth, initialHeight);
export const screenHeight = Math.max(initialWidth, initialHeight);

/** Width-based scale factor, clamped. */
export const scaleFactor = Math.min(MAX_SCALE, Math.max(MIN_SCALE, screenWidth / DESIGN_WIDTH));

/** True on short screens (iPhone SE class) where vertical rhythm needs to tighten. */
export const isShortScreen = screenHeight < 700;
export const isSmallScreen = screenWidth < 375;

const round = (value: number) => PixelRatio.roundToNearestPixel(value);

/** Responsive size: scales spacing and component sizes with the screen width. */
export const rs = (size: number): number => round(size * scaleFactor);

/**
 * Responsive font size. Uses a moderated factor (half the width scale) so type
 * stays close to the design on every phone.
 */
export const rf = (size: number, factor = 0.5): number =>
  round(size + (scaleFactor - 1) * size * factor);

/** Vertical spacing that also compresses on short screens. */
export const rv = (size: number): number => round(size * scaleFactor * (isShortScreen ? 0.85 : 1));

/**
 * Caps for the OS font scaling (Dynamic Type / Android font size) so extreme
 * settings do not break fixed layouts. Body text still scales generously.
 */
export const maxFontMultiplier = {
  title: 1.2,
  body: 1.4,
  control: 1.3,
} as const;
