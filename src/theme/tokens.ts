/**
 * Design tokens extracted from the designer's PDF
 * (`dietary_restrictions_app_onboarding_survey(1)(1).pdf`, 7 pages / 21 screens).
 *
 * Every value here was measured from the 300 DPI rasters of the PDF.
 * The phone frames in the PDF are 393pt wide (iPhone 14/15 Pro class), so the
 * pixel-to-point scale used for all measurements is 1.763 px/pt.
 * See `docs/DESIGN_TOKENS.md` for where each value was sampled.
 */

export const colors = {
  // Surfaces
  background: '#FFFFFF',
  surface: '#F5F5F7', // icon chips, back button, feature circles
  surfaceTint: '#F6F6FB', // lavender cards: review, profile summary, why-use, hero
  surfaceStrong: '#F2F2F7', // ingredient chips, close button, date wheel highlight
  overlay: 'rgba(15, 13, 20, 0.45)', // sheet backdrop tint (over blur)

  // Lines
  border: '#EFEFF2', // unselected card / input / secondary button borders
  divider: '#F2F2F4', // list row dividers
  track: '#E8E8EC', // progress bar track
  ring: '#D9D9DE', // unselected radio ring
  handle: '#C7C7CC', // sheet grabber

  // Brand / primary
  primary: '#1C1A20', // buttons, selected border, filled checks, progress fill
  primaryPressed: '#2E2B34',
  onPrimary: '#FFFFFF',
  appleBlack: '#000000',

  // Text
  text: '#0F0D14', // titles, large text
  textBody: '#37363C', // option labels, list rows, checkbox labels
  textSecondary: '#6B6B70', // feature captions
  textMuted: '#85858A', // subtitles, section labels, dates, "avg rating"
  textPlaceholder: '#A6A6AC',
  textFaded: '#C7C7CC', // date wheel unselected rows
  textOnDark: '#FFFFFF',

  // Semantic
  success: '#1C9750', // "Works for you" badge circle
  successBright: '#29AD51', // loading bar head, check strokes, diet icon
  successSoft: '#B8DFB3', // loading bar tail
  successTint: '#D5EFDA', // "All done" check circle
  danger: '#F5433A', // X marks, "Avoid" icon
  dangerTint: '#FDE8E6',
  warning: '#E8A317', // caution verdict (not in PDF, chosen to sit with the palette)
  warningTint: '#FDF3DF',
  neutral: '#85858A', // "not sure" verdict
  neutralTint: '#F2F2F4',
  gold: '#EDB962', // rating stars and laurels
  info: '#3B9FD8', // loading spinner ring
  infoTint: '#E3F2FB',
} as const;

export type ColorToken = keyof typeof colors;

/** 4pt base scale. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 40,
  giant: 48,
  massive: 56,
} as const;

export const layout = {
  /** Horizontal screen padding. Cards span x=39..659 of a 693px (393pt) frame -> 20pt. */
  screenPaddingH: 20,
  /** Gap between the safe-area top and the header row. */
  headerTop: 16,
  /** Header row height (back button diameter). */
  headerHeight: 46,
  /** Gap between the header row and the question title. */
  titleTop: 40,
  /** Gap between a title (no subtitle) and the first option card. */
  titleToContent: 40,
  /** Gap between a subtitle and the first option card. */
  subtitleToContent: 24,
  /** Gap between title and subtitle. */
  titleToSubtitle: 12,
  /** Gap between option cards (30px measured -> 17pt). */
  cardGap: 16,
  /** Gap between the bottom button and the home indicator area. */
  buttonBottom: 16,
  /** Gap between stacked auth buttons (25-30pt measured). */
  authButtonGap: 28,
  /** Progress bar: gap after the back button and inset from the right edge. */
  progressGapLeft: 24,
  progressInsetRight: 8,
  /** Gap between a large tab title and the first card. */
  largeTitleBottom: 20,
  /** Floating pill tab bar (main app): height and gap above the home indicator. */
  tabBarHeight: 64,
  tabBarBottom: 12,
  /** Gap between sections on a page. */
  sectionGap: 24,
} as const;

export const radii = {
  xs: 6, // checkbox, scan-frame corners
  sm: 12,
  md: 14, // date wheel highlight
  card: 16, // option cards, search input
  lg: 24, // large content cards (review, profile, checklist, why-use)
  xl: 28, // hero / camera image cards, bottom sheet
  pill: 999,
} as const;

export const sizes = {
  button: 62, // primary pill button height (110-116px measured on 9 screens)
  authButton: 76, // Apple / Google / email buttons on "Save your profile"
  input: 60, // search field height
  chip: 50, // removable ingredient chip height
  optionCardMinHeight: 92, // 52 chip + 2 x 20 padding
  optionCardCompactMinHeight: 68, // 44 chip + 2 x 12 padding (long lists)
  iconChip: 52, // circular icon background inside option cards
  iconChipCompact: 44,
  iconInChip: 26,
  icon: 24, // list-row icons
  iconSm: 20,
  radio: 32, // radio ring / filled check circle inside cards
  checkbox: 28,
  backButton: 46,
  closeButton: 40,
  progressBar: 8,
  loadingBar: 10,
  featureCircle: 64,
  featureIcon: 28,
  badgeCircle: 40,
  badgeRing: 5,
  avatar: 48,
  avatarBorder: 3,
  star: 22,
  ratingStar: 26,
  sheetHandleWidth: 44,
  sheetHandleHeight: 5,
  scanCornerArm: 52,
  scanCornerThickness: 2.5,
  wheelRow: 50,
  wheelHighlight: 52,
  spinner: 28,
  touchTarget: 44,
  plusButton: 60, // round dark + button beside the tab bar
  tabAvatar: 28,
  plusTileIcon: 28,
} as const;

export const borders = {
  hairline: 1,
  selected: 1.5,
} as const;

/** The PDF cards are flat (no shadows). Only the floating "Works for you" badge casts one. */
export const shadows = {
  badge: {
    shadowColor: '#0F0D14',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sheet: {
    shadowColor: '#0F0D14',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
} as const;

export const motion = {
  /** Option selection border / check animation. */
  select: 180,
  /** Press feedback scale. */
  press: 120,
  pressScale: 0.97,
  /** Progress bar width animation. */
  progress: 320,
  /** Screen transitions. */
  screen: 260,
} as const;

export const tokens = { colors, spacing, layout, radii, sizes, borders, shadows, motion } as const;
export type Tokens = typeof tokens;
