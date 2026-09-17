/**
 * Profile model from "The Onboarding Questionnaire" (version 2, 17 Sep 2026):
 * a list of foods to avoid (each with how serious it is), any health
 * conditions, and personal notes. The original answers are kept alongside.
 */

export type PlanId = 'free' | 'plus' | 'family';

/** "Me" or someone the account holder shops for (Plus and Family plans). */
export type ProfileFor = 'myself' | 'other';

/** Question 2. */
export type HasAllergiesAnswer = 'yes' | 'no' | 'unsure';

/** Question 5: what happens when they eat it. "Not sure" is recorded as an allergy. */
export type ReactionKind = 'allergy' | 'intolerance' | 'sensitivity' | 'choice';

/** Question 6: how bad the worst reaction has been. "Not sure" is treated as severe. */
export type WorstReaction = 'severe' | 'treatment' | 'mild' | 'unsure';

/** Question 7: how strictly a food avoided by choice is avoided. */
export type Strictness = 'strict' | 'prefers';

/** Question 8: saved for reference only. */
export type DoctorConfirmed = 'yes' | 'no' | 'unknown';

/** How a product containing the food is shown. */
export type RiskLevel = 'high' | 'warning';

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
  /** One of the 14 allergens that UK and EU labels must highlight; shown first. */
  major?: boolean;
  /** Example shown next to the name ("e.g. prawns"). */
  example?: string;
  /** True for ingredients typed in by the user. */
  isCustom?: boolean;
}

export interface AvoidedFood {
  /** Catalogue allergen id, or a generated id for a food kept as typed. */
  id: string;
  name: string;
  /** Set when the food is (or was resolved to) a catalogue allergen. */
  allergenId: string | null;
  /** Kept as typed: labels are checked for this name only. */
  byNameOnly: boolean;
  kind: ReactionKind;
  /** The user was not sure what kind of reaction; allergy was assumed. */
  kindAssumed: boolean;
  /** Null for foods avoided by choice. */
  worst: WorstReaction | null;
  /** The user was not sure how bad, or it has not happened yet; severe was assumed. */
  severityAssumed: boolean;
  /** Only for foods avoided by choice. */
  strictness: Strictness | null;
  doctorConfirmed: DoctorConfirmed | null;
  /** Derived from the answers above; how a product containing it is shown. */
  level: RiskLevel;
  addedAt: string;
  updatedAt: string;
}

export type HealthConditionId =
  | 'diabetes'
  | 'kidney_disease'
  | 'pregnancy'
  | 'breastfeeding'
  | 'high_blood_pressure'
  | 'heart_disease'
  | 'coeliac'
  | 'ibs'
  | 'gout'
  | 'pku';

export interface HealthCondition {
  id: HealthConditionId;
  temporary: boolean;
  /** YYYY-MM-DD; for a pregnancy the due date. */
  endsAt: string | null;
  /** When the user last confirmed the condition still applies (asked two weeks after `endsAt`). */
  confirmedAt: string | null;
  addedAt: string;
}

/** Answers to questions 5 to 8 for one food. */
export interface FoodAnswers {
  kind: ReactionKind | null;
  /** Answered "I'm not sure" to question 5. */
  kindUnsure: boolean;
  worst: WorstReaction | null;
  strictness: Strictness | null;
  doctorConfirmed: DoctorConfirmed | null;
}

export type TypedFoodResolution =
  | { kind: 'known'; allergenId: string }
  | { kind: 'custom'; id: string }
  | { kind: 'refused' };

/** A food typed in at question 4 and what the app did with it. */
export interface TypedFood {
  text: string;
  resolution: TypedFoodResolution;
}

export type QuestionnaireTarget = 'me' | 'other' | 'existing';

/** Everything the questionnaire collects for one person; kept with the profile. */
export interface QuestionnaireAnswers {
  version: number;
  target: QuestionnaireTarget | null;
  personName: string;
  existingProfileId: string | null;
  hasAllergies: HasAllergiesAnswer | null;
  /** Catalogue ids picked at question 3. */
  pickedFoods: string[];
  typedFoods: TypedFood[];
  /** Keyed by food id (catalogue id or custom id). */
  perFood: Record<string, FoodAnswers>;
  hasConditions: boolean | null;
  conditions: HealthConditionId[];
  /** YYYY-MM-DD per temporary condition (question 11). */
  conditionEnds: Record<string, string | null>;
  note: string;
  cameraScanning: boolean | null;
  notificationsAsked: boolean;
}

export interface BirthDate {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface UserProfile {
  id: string;
  name: string;
  profileFor: ProfileFor;
  /** The account holder's own profile ("Me"). */
  isAccountHolder: boolean;
  birthDate: BirthDate | null;
  hasAllergies: HasAllergiesAnswer;
  foods: AvoidedFood[];
  conditions: HealthCondition[];
  /** Question 12; only the account holder sees it and scans never read it. */
  note: string;
  /** Version of the questionnaire the answers came from; older invites a redo. */
  questionnaireVersion: number;
  /** The original answers, kept so it is always possible to see why something was recorded. */
  answers: QuestionnaireAnswers | null;
  emergencyContact: EmergencyContact | null;
  doctor: string;
  /** Days without a reaction the person is aiming for (Insights goal). */
  reactionFreeGoalDays: number;
  /** Colour token used for the avatar initial. */
  color: string;
  /** Height, weights and step goal (Personal Details). Missing on profiles created before Phase 3. */
  body?: BodyMetrics;
  /** Daily nutrition goals (Edit Nutrition Goals). Defaults apply until set. */
  nutritionGoals?: NutritionGoals;
  createdAt: string;
  updatedAt: string;
}

export type VerdictKind = 'safe' | 'caution' | 'unsafe' | 'unknown';

export type TriggerKind = 'contains' | 'may_contain' | 'cross_contact' | 'unclear';

export interface VerdictTrigger {
  /** The avoided food's id (catalogue allergen or custom). */
  ingredientId: string;
  ingredientName: string;
  /** The label text that matched ("whey (milk)"). */
  matchedText: string;
  kind: TriggerKind;
  /** How the food is shown when a product contains it. */
  level: RiskLevel;
  /** The food is checked by its typed name only. */
  byNameOnly: boolean;
}

/** An ingredient a health condition asks to limit or avoid. */
export interface ConditionNote {
  conditionId: HealthConditionId;
  matchedText: string;
  advice: 'limit' | 'avoid';
}

export interface Verdict {
  kind: VerdictKind;
  triggers: VerdictTrigger[];
  /** Food ids from the profile that were checked and not found. */
  clearedIngredientIds: string[];
  /** Ingredients to limit or avoid for the person's active health conditions. */
  conditionNotes: ConditionNote[];
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
  /** Per serving; missing for products the catalogue has no facts for. */
  nutrition?: Nutrition;
  /** 1 (heavily processed) to 10 (whole food); feeds the daily health score. */
  healthScore?: number;
  servingLabel?: string;
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

export type ReportReason = 'ingredients' | 'verdict' | 'product' | 'other';

export interface ReportProblemInput {
  scanId: string;
  reason: ReportReason;
  notes?: string;
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
  /** Health conditions only take effect once the email address is confirmed. */
  emailConfirmed: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  createdAt: string;
  /** ISO time after which the session must be renewed. */
  expiresAt?: string;
}

export type LanguageCode = 'en' | 'zh' | 'hi' | 'es' | 'fr' | 'de' | 'ru' | 'pt';

export interface Language {
  code: LanguageCode;
  /** Native name as shown in the design ("Español"). */
  nativeName: string;
  flag: string;
}

// Reactions (personal log, not medical advice)
export type ReactionSeverity = 'mild' | 'moderate' | 'severe';

export type Symptom =
  | 'hives'
  | 'itching'
  | 'swelling'
  | 'stomach'
  | 'nausea'
  | 'vomiting'
  | 'diarrhea'
  | 'breathing'
  | 'dizziness'
  | 'other';

export interface Reaction {
  id: string;
  profileId: string;
  /** When the reaction happened (ISO). */
  occurredAt: string;
  foodName: string;
  /** Linked scan when the food came from history. */
  scanId?: string;
  symptoms: Symptom[];
  severity: ReactionSeverity;
  notes?: string;
  photoUri?: string;
  createdAt: string;
}

export type ReactionInput = Omit<Reaction, 'id' | 'createdAt'>;

// Badges (achievements computed from activity)
export type BadgeGroup =
  | 'streak'
  | 'meals'
  | 'goals'
  | 'friends'
  | 'water'
  | 'habits'
  | 'food'
  | 'special';

export interface Badge {
  id: string;
  icon: string;
  group: BadgeGroup;
  current: number;
  target: number;
  earnedAt: string | null;
}

// Allergy action plan photos
export interface ActionPlanPhoto {
  id: string;
  profileId: string;
  uri: string;
  addedAt: string;
}

export type InsightsRange = '90d' | '6m' | '1y' | 'all';

export type ScanWindow = '3d' | '7d' | '14d' | '30d' | '90d' | 'all';

// Groups (private family groups and community groups)
export type GroupKind = 'community' | 'private';

export interface Group {
  id: string;
  name: string;
  description: string;
  kind: GroupKind;
  memberCount: number;
  /** Blurhash placeholder artwork; no photos of real people. */
  blurhash: string;
  imageUri?: string;
  joined: boolean;
  /** True when the current user created the group. */
  owner: boolean;
  /** Invite code (private groups). */
  code?: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  name: string;
  color: string;
  streak: number;
  isOwner: boolean;
  /** Set when the member is one of the profiles on this device (family). */
  profileId?: string;
  /** True for the current user. */
  isMe: boolean;
}

export interface PostVerdict {
  memberId: string;
  name: string;
  kind: VerdictKind;
}

export interface PostReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface Post {
  id: string;
  groupId: string;
  author: GroupMember;
  createdAt: string;
  text: string;
  foodName?: string;
  scanId?: string;
  blurhash?: string;
  imageUri?: string;
  /** Verdict per family member (private groups) or for the poster (community). */
  verdicts: PostVerdict[];
  reactions: PostReaction[];
  commentCount: number;
}

export interface PostComment {
  id: string;
  postId: string;
  author: GroupMember;
  createdAt: string;
  text: string;
}

export interface NewPostInput {
  groupId: string;
  text: string;
  foodName?: string;
  scanId?: string;
  imageUri?: string;
}

export type PostFilter = 'all' | VerdictKind;

export type PostReportReason = 'spam' | 'harmful' | 'offensive' | 'other';

// Notifications
export type NotificationKind = 'product' | 'reply' | 'reaction' | 'group' | 'reminder';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Route to open (deep link ready), e.g. "/product/p-rice-cakes". */
  target?: string;
}

// Nutrition tracking (Phase 3: calories, macros, weight, activity)
export interface Nutrition {
  calories: number;
  /** grams */
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  /** milligrams */
  sodium: number;
}

/** Daily targets, same shape as what was eaten. */
export type NutritionGoals = Nutrition;

export type Gender = 'male' | 'female' | 'other';

export interface BodyMetrics {
  currentWeightLbs: number | null;
  goalWeightLbs: number | null;
  heightInches: number | null;
  gender: Gender | null;
  dailyStepGoal: number;
}

/** Ring colour on the home calendar ("Ring Colors Explained"). */
export type RingStatus = 'none' | 'green' | 'yellow' | 'red';

/** Everything logged and burned on one local day (YYYY-MM-DD). */
export interface DayNutrition {
  date: string;
  eaten: Nutrition;
  goals: NutritionGoals;
  /** Calorie goal plus burned calories when "add burned calories" is on. */
  budget: number;
  /** Calories burned by workouts and steps (only when Apple Health is connected or logged by hand). */
  burned: number;
  steps: number;
  mealsLogged: number;
  status: RingStatus;
  healthScore: number | null;
}

export type WorkoutKind = 'run' | 'walk' | 'cycle' | 'strength' | 'yoga' | 'swim' | 'hiit' | 'other';

export type WorkoutSource = 'apple_health' | 'manual';

export interface Workout {
  id: string;
  profileId: string;
  kind: WorkoutKind;
  name: string;
  minutes: number;
  calories: number;
  source: WorkoutSource;
  loggedAt: string;
}

export type WorkoutInput = Omit<Workout, 'id' | 'source' | 'loggedAt'> & { loggedAt?: string };

export interface DailyActivity {
  date: string;
  steps: number;
  stepCalories: number;
  workouts: Workout[];
  /** Workout calories plus step calories. */
  caloriesBurned: number;
}

export interface HealthConnection {
  connected: boolean;
  connectedAt: string | null;
}

export interface WaterDay {
  date: string;
  ounces: number;
}

/** Everything the Home dashboard shows for one selected day. */
export interface HomeDashboard {
  day: DayNutrition;
  /** Consecutive days with at least one logged food, ending today or yesterday. */
  streak: number;
  longestStreak: number;
  water: WaterDay;
  activity: DailyActivity;
  health: HealthConnection;
}

export interface WeightEntry {
  id: string;
  profileId: string;
  weightLbs: number;
  loggedAt: string;
  photoUri?: string;
}

export interface WeightEntryInput {
  profileId: string;
  weightLbs: number;
  loggedAt?: string;
  photoUri?: string;
}

export interface WeightGoalProgress {
  startLbs: number;
  currentLbs: number;
  goalLbs: number | null;
  /** 0..1 of the way from start to goal (0 without a goal). */
  percent: number;
  /** YYYY-MM-DD the goal is reached at about a pound a week, null without a goal. */
  goalDate: string | null;
}

export interface WeightPoint {
  date: string;
  weightLbs: number;
}

export interface WeightChangeRow {
  window: ScanWindow;
  /** Pounds gained (positive) or lost since the start of the window; null until ready. */
  changeLbs: number | null;
  trend: 'up' | 'down' | 'same' | 'pending';
  /** Weights inside the window, oldest first, for the mini chart. */
  series: number[];
  ready: boolean;
}

export interface DailyCaloriesDay {
  date: string;
  calories: number;
  /** Calories from each macro, for the stacked bars. */
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyCalories {
  weekStart: string;
  days: DailyCaloriesDay[];
  /** Average over the days that have logs. */
  average: number;
  hasData: boolean;
}

export interface WeeklyEnergy {
  weekStart: string;
  burned: number;
  consumed: number;
  days: { date: string; burned: number; consumed: number }[];
}

export interface ExpenditureRow {
  window: ScanWindow;
  /** Average daily burn over the window; null until enough activity data exists. */
  burned: number | null;
  trend: 'up' | 'down' | 'same' | 'pending';
  ready: boolean;
}

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obese';

export interface BmiResult {
  value: number | null;
  category: BmiCategory | null;
}

/** Top of Insights: streak, badges, weight goal and BMI. */
export interface TrackingOverview {
  streak: number;
  longestStreak: number;
  badgesEarned: number;
  badgesTotal: number;
  mealsLogged: number;
  /** Logged foods that came back not safe or caution (the allergy report). */
  flaggedMeals: number;
  daysWithLogs: number;
  weight: WeightGoalProgress | null;
  bmi: BmiResult;
}
