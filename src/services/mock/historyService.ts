import { simulate } from './support';
import { ServiceError, type HistoryService } from '../types';
import { productById } from '@/mocks/products';
import { seedHistory } from '@/mocks/scans';
import { useDevStore } from '@/store/devStore';
import { storage, storageKeys } from '@/store/storage';
import { useProfileStore } from '@/store/profileStore';
import type { ConditionNote, HistoryFilter, RiskLevel, ScanResult, VerdictTrigger } from '@/types';
import { normalize } from '@/utils/text';

/**
 * History lives in MMKV under one key so it survives relaunches. Seeded once
 * per profile so the home / history screens are not empty on first run.
 */
/**
 * Scans stored by older builds are brought up to date on read: nutrition facts
 * from the catalogue, and verdicts without condition notes or trigger levels
 * (the questionnaire model) get the missing fields.
 */
function hydrate(scan: ScanResult): ScanResult {
  let next = scan;
  if (!scan.product.nutrition) {
    const catalogue = productById(scan.product.id);
    if (catalogue?.nutrition) {
      next = {
        ...next,
        product: {
          ...next.product,
          nutrition: catalogue.nutrition,
          healthScore: catalogue.healthScore,
          servingLabel: catalogue.servingLabel,
        },
      };
    }
  }
  type LegacyTrigger = Omit<VerdictTrigger, 'level' | 'byNameOnly'> & {
    level?: RiskLevel;
    byNameOnly?: boolean;
    severity?: string;
  };
  const legacyTriggers = next.verdict.triggers as LegacyTrigger[];
  const legacyNotes = (next.verdict as { conditionNotes?: ConditionNote[] }).conditionNotes;
  if (!legacyNotes || legacyTriggers.some((trigger) => trigger.level === undefined)) {
    next = {
      ...next,
      verdict: {
        ...next.verdict,
        conditionNotes: legacyNotes ?? [],
        triggers: legacyTriggers.map(({ severity, ...trigger }) => ({
          ...trigger,
          level:
            trigger.level ?? (severity === 'severe' || severity === 'anaphylaxis' ? 'high' : 'warning'),
          byNameOnly: trigger.byNameOnly ?? false,
        })),
      },
    };
  }
  return next;
}

function load(): ScanResult[] {
  const raw = storage.getString(storageKeys.history);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as ScanResult[]).map(hydrate);
  } catch {
    return [];
  }
}

function save(items: ScanResult[]): void {
  storage.set(storageKeys.history, JSON.stringify(items));
}

const seededProfiles = new Set<string>();

function ensureSeeded(profileId: string): ScanResult[] {
  let items = load();
  const hasItems = items.some((r) => r.profileId === profileId);
  const seedFlag = `history-seeded:${profileId}`;
  if (!hasItems && !storage.getBoolean(seedFlag) && !seededProfiles.has(profileId)) {
    const profile = useProfileStore.getState().profiles.find((p) => p.id === profileId);
    if (profile) {
      items = [...items, ...seedHistory(profile)];
      save(items);
      storage.set(seedFlag, true);
      seededProfiles.add(profileId);
    }
  }
  return items;
}

function applyFilter(items: ScanResult[], filter?: HistoryFilter): ScanResult[] {
  let out = items;
  if (filter?.savedOnly) out = out.filter((r) => r.saved);
  if (filter?.verdict && filter.verdict !== 'all')
    out = out.filter((r) => r.verdict.kind === filter.verdict);
  if (filter?.query) {
    const q = normalize(filter.query);
    out = out.filter(
      (r) => normalize(r.product.name).includes(q) || normalize(r.product.brand ?? '').includes(q),
    );
  }
  return [...out].sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
}

const SEED_PREFIX = 'scan_seed_';

/** The "new user" mock data set hides the seeded scans so every empty state can be checked. */
function visibleItems(profileId: string): ScanResult[] {
  if (useDevStore.getState().mockDataset === 'new') {
    return load().filter((r) => !r.id.startsWith(SEED_PREFIX));
  }
  return ensureSeeded(profileId);
}

export const mockHistoryService: HistoryService = {
  async list(profileId, filter) {
    await simulate(0.6);
    return applyFilter(
      visibleItems(profileId).filter((r) => r.profileId === profileId),
      filter,
    );
  },
  async get(id) {
    await simulate(0.3);
    return load().find((r) => r.id === id) ?? null;
  },
  async add(result) {
    await simulate(0.2);
    const items = load().filter((r) => r.id !== result.id);
    save([result, ...items]);
    return result;
  },
  async update(id, patch) {
    await simulate(0.4);
    const items = load();
    const index = items.findIndex((r) => r.id === id);
    const current = items[index];
    if (!current) throw new ServiceError('Scan not found', 'not_found');
    const updated: ScanResult = { ...current, ...patch };
    items[index] = updated;
    save(items);
    return updated;
  },
  async setSaved(id, saved) {
    await simulate(0.3);
    const items = load();
    const index = items.findIndex((r) => r.id === id);
    const current = items[index];
    if (!current) throw new ServiceError('Scan not found', 'not_found');
    const updated: ScanResult = { ...current, saved };
    items[index] = updated;
    save(items);
    return updated;
  },
  async remove(id) {
    await simulate(0.3);
    save(load().filter((r) => r.id !== id));
  },
  async clearForProfile(profileId) {
    await simulate(0.3);
    save(load().filter((r) => r.profileId !== profileId));
    storage.remove(`history-seeded:${profileId}`);
  },
};
