import type { TextStyle } from 'react-native';

/**
 * Inter (loaded with `expo-font` via `@expo-google-fonts/inter`).
 * The PDF is rendered in an Inter / SF Pro style face; Inter is used so both
 * platforms render identically. Sizes were fitted by matching Inter's measured
 * text widths to the PDF (see docs/DESIGN_TOKENS.md, "Typography").
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type FontWeightToken = keyof typeof fontFamily;

type TypeStyle = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontVariant'
>;

const style = (
  family: FontWeightToken,
  fontSize: number,
  lineHeight: number,
  letterSpacing = 0,
): TypeStyle => ({ fontFamily: fontFamily[family], fontSize, lineHeight, letterSpacing });

/** Numbers that must not jump as digits change (stat cards, counters). */
const numeric = (
  family: FontWeightToken,
  fontSize: number,
  lineHeight: number,
  letterSpacing = 0,
): TypeStyle => ({
  ...style(family, fontSize, lineHeight, letterSpacing),
  fontVariant: ['tabular-nums'],
});

export const typography = {
  /** Welcome headline "Eating with restrictions made easy" (40.4pt fitted, 51.6pt pitch). */
  display: style('bold', 40, 52, -0.6),
  /** End-of-flow titles: "Save your profile", "Why use this app?", "Time to generate…" (37.5pt). */
  titleLg: style('bold', 38, 48, -0.5),
  /** Question titles: "Who are you setting this up for?" (36.5pt fitted, 48.2pt pitch). */
  title: style('bold', 36, 48, -0.5),
  /** "78%" on the loading screen (59.4pt). */
  loading: style('bold', 60, 68, -1),
  /** "4.8" rating figure. */
  rating: style('bold', 40, 44, -0.5),
  /** "We're setting everything up for you" (32.5pt fitted, 42.5pt pitch). */
  statement: style('semibold', 32, 42, -0.4),
  /** Card section titles: "Setting up", "Your profile", "Without the app", sheet title (22.3pt). */
  sectionTitle: style('semibold', 22, 28, -0.2),
  /** Review body and "All done!" (22-23pt fitted, 34pt pitch). */
  bodyLg: style('regular', 22, 32, -0.1),
  /** Subtitles under question titles (20.6pt fitted, 30pt pitch). */
  subtitle: style('regular', 20, 30),
  /** Date wheel rows (23.5pt fitted). */
  wheel: style('regular', 24, 30),
  /** Primary button label (18.4pt fitted). */
  button: style('semibold', 18, 22),
  /** Section labels such as "Suggested" (18.3pt). */
  sectionLabel: style('regular', 18, 24),
  /** Text input / placeholder (19pt fitted, rounded to 18). */
  input: style('regular', 18, 24),
  /** Option card labels (17.8pt fitted). */
  label: style('medium', 17, 24),
  /** Body copy, list rows, checkbox labels (17-17.9pt fitted). */
  body: style('regular', 17, 24),
  /** Bold key inside summary rows ("Avoid:", "Diet:"). */
  bodyStrong: style('semibold', 17, 24),
  /** Text-only secondary button ("No"). */
  textButton: style('medium', 17, 22),
  /** Feature captions under the welcome icons (15.5pt fitted, 22.7pt pitch). */
  caption: style('regular', 16, 22),
  /** "avg rating" (15.1pt). */
  captionSm: style('regular', 15, 20),
  /** "Works for you" badge (15.7pt fitted). */
  badge: style('semibold', 16, 20),
  /** Small helper text (not in PDF: OTP hints, timestamps). */
  small: style('regular', 13, 18),

  // Main app (Phase 2). Sizes follow the reference captures, re-drawn in Inter.
  /** Large left-aligned tab titles ("Insights", "Groups", "Profile"). */
  largeTitle: style('bold', 34, 40, -0.5),
  /** Card titles ("Weekly overview", nav header titles). */
  cardTitle: style('semibold', 18, 24, -0.1),
  /** Hero figure on Home and Insights ("12", "395"). */
  statLg: numeric('bold', 44, 48, -1),
  /** Stat card figure. */
  stat: numeric('bold', 28, 34, -0.5),
  /** Small figure inside rings and week strips. */
  statSm: numeric('semibold', 15, 18),
  /** Tab bar labels. */
  tabLabel: style('medium', 12, 14),
} as const;

export type TypographyToken = keyof typeof typography;
