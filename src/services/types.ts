import type {
  AuthSession,
  DaySummary,
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
}

export interface Services {
  ingredients: IngredientService;
  profiles: ProfileService;
  scan: ScanService;
  history: HistoryService;
  auth: AuthService;
  insights: InsightsService;
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
