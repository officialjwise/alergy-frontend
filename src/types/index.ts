/** Who the profile is being set up for (onboarding question 1). */
export type ProfileFor = 'myself' | 'child' | 'family' | 'care';

export type Frequency = 'few_month' | 'few_week' | 'daily' | 'every_meal';

export type WatchCategory = 'allergies' | 'intolerances' | 'gluten' | 'religious' | 'vegetarian';

export type AvoidReason = 'allergy' | 'intolerance' | 'religious' | 'lifestyle' | 'preference';

export type CautionLevel = 'ingredient' | 'may_contain' | 'cross_contact' | 'uncertain';

export type Challenge = 'labels' | 'hidden' | 'cross_contact' | 'restaurants' | 'alternatives';

export type Diet =
  | 'none'
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'low_fodmap'
  | 'keto'
  | 'kosher'
  | 'pescatarian'
  | 'paleo';

export type Goal = 'know_instantly' | 'avoid_exposure' | 'shop_faster' | 'eat_out';

/** Per-ingredient severity (not in the PDF; asked after the ingredient picker). */
export type Severity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis';

export type IngredientCategory =
  | 'nuts'
  | 'dairy'
  | 'seafood'
  | 'meat'
  | 'grains'
  | 'eggs'
  | 'seeds'
  | 'legumes'
  | 'fruit'
  | 'vegetables'
  | 'additives'
  | 'alcohol'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  /** Alternative label names ("casein" for milk) used for search and matching. */
  aliases: string[];
  category: IngredientCategory;
  /** Icon name from the semantic icon set. */
  icon: string;
  /** True for ingredients typed in by the user. */
  isCustom?: boolean;
}

export interface Restriction {
  ingredientId: string;
  name: string;
  severity: Severity;
}

export interface BirthDate {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

export interface OnboardingAnswers {
  profileFor: ProfileFor | null;
  profileName: string;
  birthDate: BirthDate | null;
  frequency: Frequency | null;
  triedOtherApps: boolean | null;
  watchFor: WatchCategory[];
  /** Ingredient ids, in the order they were added. */
  ingredients: string[];
  /** Custom ingredients created during onboarding, keyed by id. */
  customIngredients: Record<string, Ingredient>;
  severities: Record<string, Severity>;
  reasons: AvoidReason[];
  cautionLevel: CautionLevel | null;
  challenges: Challenge[];
  diet: Diet | null;
  goal: Goal | null;
  cameraScanning: boolean | null;
  rememberFoods: boolean | null;
  notificationsAsked: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  profileFor: ProfileFor;
  birthDate: BirthDate | null;
  restrictions: Restriction[];
  customIngredients: Record<string, Ingredient>;
  reasons: AvoidReason[];
  cautionLevel: CautionLevel;
  diet: Diet;
  goal: Goal | null;
  rememberFoods: boolean;
  /** Colour token used for the avatar initial. */
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type VerdictKind = 'safe' | 'caution' | 'unsafe' | 'unknown';

export type TriggerKind = 'contains' | 'may_contain' | 'cross_contact' | 'unclear';

export interface VerdictTrigger {
  ingredientId: string;
  ingredientName: string;
  /** The label text that matched ("whey (milk)"). */
  matchedText: string;
  kind: TriggerKind;
  severity: Severity;
}

export interface Verdict {
  kind: VerdictKind;
  triggers: VerdictTrigger[];
  /** Ingredient ids from the profile that were checked and not found. */
  clearedIngredientIds: string[];
  /** True when the label could not be read fully. */
  incomplete: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category?: string;
  /** Blurhash placeholder for expo-image. */
  blurhash?: string;
  imageUri?: string;
  ingredientsText: string;
  allergenStatement?: string;
  mayContain: string[];
}

export type ScanSource = 'camera' | 'barcode' | 'gallery' | 'manual';

/** What the scanner was pointed at. */
export type ScanMode = 'food' | 'barcode' | 'label' | 'menu';

export interface ScanResult {
  id: string;
  profileId: string;
  product: Product;
  verdict: Verdict;
  source: ScanSource;
  mode?: ScanMode;
  /** Text read from a label or menu photo (label result variant). */
  labelText?: string;
  scannedAt: string;
  saved: boolean;
}

/** Scan counts for one local calendar day (`date` is YYYY-MM-DD). */
export interface DaySummary {
  date: string;
  total: number;
  safe: number;
  caution: number;
  unsafe: number;
  unknown: number;
}

export interface FlaggedIngredientCount {
  ingredientId: string;
  name: string;
  count: number;
}

/** Everything the Home dashboard shows for one selected day. */
export interface HomeSummary {
  day: DaySummary;
  /** Consecutive days with scans and nothing unsafe, ending today or yesterday. */
  streak: number;
  /** Share of safe scans on the day, 0..1, or null when nothing was scanned. */
  safeRate: number | null;
  topFlagged: FlaggedIngredientCount | null;
  savedCount: number;
  totalScans: number;
}

export interface HistoryFilter {
  query?: string;
  verdict?: VerdictKind | 'all';
  savedOnly?: boolean;
}

export type AuthProvider = 'apple' | 'google' | 'email';

export interface AuthUser {
  id: string;
  provider: AuthProvider;
  email?: string;
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  createdAt: string;
}

export type LanguageCode = 'en' | 'zh' | 'hi' | 'es' | 'fr' | 'de' | 'ru' | 'pt';

export interface Language {
  code: LanguageCode;
  /** Native name as shown in the design ("Español"). */
  nativeName: string;
  flag: string;
}
