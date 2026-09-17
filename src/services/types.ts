import type {
  ActionPlanPhoto,
  AppNotification,
  DailyActivity,
  DailyCalories,
  DayNutrition,
  ExpenditureRow,
  HealthConnection,
  HomeDashboard,
  TrackingOverview,
  WaterDay,
  WeeklyEnergy,
  WeightChangeRow,
  WeightEntry,
  WeightEntryInput,
  WeightPoint,
  Workout,
  WorkoutInput,
  AuthSession,
  Badge,
  DailyScans,
  DaySummary,
  Group,
  GroupMember,
  InsightsOverview,
  NewPostInput,
  Post,
  PostComment,
  PostFilter,
  PostReportReason,
  InsightsRange,
  Reaction,
  ReactionInput,
  ScanChangeRow,
  SeriesPoint,
  TopFlagged,
  WeeklyOverview,
  HistoryFilter,
  HomeSummary,
  Ingredient,
  Product,
  ReportProblemInput,
  ScanMode,
  ScanResult,
  ScanSource,
  UserProfile,
  Verdict,
} from '@/types';

/**
 * Every data call in the app goes through one of these interfaces.
 * `src/services/mock` implements them with local data and a small delay;
 * `src/services/http` will talk to the real backend. Components never import
 * either directly - they use `getServices()` or the TanStack Query hooks.
 */

export interface IngredientService {
  /** Full-text search over names and label aliases. Empty query returns the suggested list. */
  search(query: string, limit?: number): Promise<Ingredient[]>;
  getById(id: string): Promise<Ingredient | null>;
  getByIds(ids: string[]): Promise<Ingredient[]>;
  suggested(): Promise<Ingredient[]>;
}

export interface ProfileService {
  list(): Promise<UserProfile[]>;
  get(id: string): Promise<UserProfile | null>;
  create(profile: UserProfile): Promise<UserProfile>;
  update(id: string, patch: Partial<UserProfile>): Promise<UserProfile>;
  remove(id: string): Promise<void>;
}

export interface AnalyzeInput {
  profile: UserProfile;
  source: ScanSource;
  mode?: ScanMode;
  /** A product looked up by barcode / search. */
  product?: Product;
  /** Raw text captured from a label photo (OCR happens on the backend later). */
  labelText?: string;
  /** Local image uri for camera / gallery captures. */
  imageUri?: string;
}

export interface ScanService {
  /** Runs the verdict engine for one product against one profile. */
  analyze(input: AnalyzeInput): Promise<ScanResult>;
  /** Looks up a product by barcode. */
  lookupBarcode(barcode: string): Promise<Product | null>;
  /** Loads one catalogue product (search results, notifications). */
  getProduct(id: string): Promise<Product | null>;
  /** Product name / barcode search for the manual fallback. */
  searchProducts(query: string): Promise<Product[]>;
  /** Re-evaluates an existing product against a profile (profile edits, switching profiles). */
  verdictFor(product: Product, profile: UserProfile): Promise<Verdict>;
  /** Sends a "this result looks wrong" report. */
  report(input: ReportProblemInput): Promise<void>;
}

/** Fields a user can change from "Fix results". */
export type ScanPatch = Partial<Pick<ScanResult, 'product' | 'verdict' | 'labelText' | 'saved'>>;

export interface HistoryService {
  list(profileId: string, filter?: HistoryFilter): Promise<ScanResult[]>;
  get(id: string): Promise<ScanResult | null>;
  add(result: ScanResult): Promise<ScanResult>;
  update(id: string, patch: ScanPatch): Promise<ScanResult>;
  setSaved(id: string, saved: boolean): Promise<ScanResult>;
  remove(id: string): Promise<void>;
  clearForProfile(profileId: string): Promise<void>;
}

export interface AuthService {
  signInWithApple(): Promise<AuthSession>;
  signInWithGoogle(): Promise<AuthSession>;
  requestEmailCode(email: string): Promise<{ expiresInSeconds: number }>;
  verifyEmailCode(email: string, code: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  restoreSession(): Promise<AuthSession | null>;
}

export interface InsightsService {
  /** Dashboard numbers for one local day (YYYY-MM-DD). */
  homeSummary(profileId: string, date: string): Promise<HomeSummary>;
  /** One summary per day from `fromDate` to `toDate` inclusive (YYYY-MM-DD), oldest first. */
  daySummaries(profileId: string, fromDate: string, toDate: string): Promise<DaySummary[]>;
  overview(profileId: string): Promise<InsightsOverview>;
  /** Flagged scans over time, bucketed by day (90d) or week (longer ranges). */
  flaggedSeries(profileId: string, range: InsightsRange): Promise<SeriesPoint[]>;
  scanChanges(profileId: string): Promise<ScanChangeRow[]>;
  /** Sunday-to-Saturday week; `weekOffset` 0 is this week, 1 last week. */
  dailyScans(profileId: string, weekOffset: number): Promise<DailyScans>;
  weeklyOverview(profileId: string, weekOffset: number): Promise<WeeklyOverview>;
  topFlagged(profileId: string): Promise<TopFlagged>;
  // Nutrition tracking (Phase 3)
  /** Calories, macros, burn and ring colour for one day, plus streaks, water and activity. */
  homeDashboard(profileId: string, date: string): Promise<HomeDashboard>;
  /** One entry per day from `fromDate` to `toDate` inclusive (YYYY-MM-DD), oldest first. */
  dayNutrition(profileId: string, fromDate: string, toDate: string): Promise<DayNutrition[]>;
  trackingOverview(profileId: string): Promise<TrackingOverview>;
  /** Logged weights over the range, oldest first (the chart). */
  weightSeries(profileId: string, range: InsightsRange): Promise<WeightPoint[]>;
  weightChanges(profileId: string): Promise<WeightChangeRow[]>;
  /** Sunday-to-Saturday week; `weekOffset` 0 is this week, 1 last week. */
  dailyCalories(profileId: string, weekOffset: number): Promise<DailyCalories>;
  weeklyEnergy(profileId: string, weekOffset: number): Promise<WeeklyEnergy>;
  expenditureChanges(profileId: string): Promise<ExpenditureRow[]>;
}

export interface WeightService {
  list(profileId: string): Promise<WeightEntry[]>;
  add(input: WeightEntryInput): Promise<WeightEntry>;
  remove(id: string): Promise<void>;
}

/** Steps, workouts and water. Apple Health is the source once connected; workouts can also be logged by hand. */
export interface ActivityService {
  health(): Promise<HealthConnection>;
  connectHealth(): Promise<HealthConnection>;
  disconnectHealth(): Promise<HealthConnection>;
  activity(profileId: string, date: string): Promise<DailyActivity>;
  workouts(profileId: string): Promise<Workout[]>;
  logWorkout(input: WorkoutInput): Promise<Workout>;
  removeWorkout(id: string): Promise<void>;
  water(profileId: string, date: string): Promise<WaterDay>;
  /** Sets the total for the day (not an increment). */
  logWater(profileId: string, date: string, ounces: number): Promise<WaterDay>;
}

export interface ReactionService {
  list(profileId: string): Promise<Reaction[]>;
  get(id: string): Promise<Reaction | null>;
  add(input: ReactionInput): Promise<Reaction>;
  update(id: string, patch: Partial<ReactionInput>): Promise<Reaction>;
  remove(id: string): Promise<void>;
}

export interface BadgeService {
  list(profileId: string): Promise<Badge[]>;
}

export interface GroupService {
  /** Community groups to discover plus the private groups the user belongs to. */
  list(): Promise<Group[]>;
  get(id: string): Promise<Group | null>;
  join(id: string): Promise<Group>;
  leave(id: string): Promise<void>;
  create(input: { name: string; description?: string; imageUri?: string }): Promise<Group>;
  members(groupId: string): Promise<GroupMember[]>;
  member(id: string): Promise<GroupMember | null>;
  posts(groupId: string, filter?: PostFilter): Promise<Post[]>;
  post(id: string): Promise<Post | null>;
  createPost(input: NewPostInput): Promise<Post>;
  react(postId: string, emoji: string): Promise<Post>;
  comments(postId: string): Promise<PostComment[]>;
  addComment(postId: string, text: string): Promise<PostComment>;
  reportPost(postId: string, reason: PostReportReason, notes?: string): Promise<void>;
  blockMember(memberId: string): Promise<void>;
  invite(groupId: string): Promise<{ link: string; code: string }>;
}

export interface NotificationService {
  list(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

export interface ActionPlanService {
  list(profileId: string): Promise<ActionPlanPhoto[]>;
  add(profileId: string, uri: string): Promise<ActionPlanPhoto>;
  remove(id: string): Promise<void>;
}

export interface Services {
  ingredients: IngredientService;
  profiles: ProfileService;
  scan: ScanService;
  history: HistoryService;
  auth: AuthService;
  insights: InsightsService;
  reactions: ReactionService;
  badges: BadgeService;
  actionPlan: ActionPlanService;
  groups: GroupService;
  notifications: NotificationService;
  weight: WeightService;
  activity: ActivityService;
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'network'
      | 'not_found'
      | 'invalid_code'
      | 'expired_code'
      | 'too_many_attempts'
      | 'cancelled'
      | 'unavailable'
      | 'unreadable'
      | 'unknown',
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
