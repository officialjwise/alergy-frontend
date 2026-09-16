import { PRODUCTS } from './products';
import { evaluateProduct } from '@/services/verdictEngine';
import type { ScanResult, ScanSource, UserProfile } from '@/types';

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Seeds a believable history for a freshly created profile. */
export function seedHistory(profile: UserProfile): ScanResult[] {
  const picks: { id: string; hours: number; source: ScanSource; saved?: boolean }[] = [
    { id: 'p-rice-cakes', hours: 2, source: 'barcode', saved: true },
    { id: 'p-hummus', hours: 5, source: 'camera' },
    { id: 'p-dark-chocolate', hours: 26, source: 'camera' },
    { id: 'p-oat-milk', hours: 30, source: 'barcode', saved: true },
    { id: 'p-granola-bar', hours: 50, source: 'gallery' },
    { id: 'p-sourdough', hours: 74, source: 'camera' },
    { id: 'p-greek-yogurt', hours: 96, source: 'manual' },
    { id: 'p-mystery-label', hours: 120, source: 'camera' },
  ];
  return picks.flatMap(({ id, hours, source, saved }) => {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return [];
    const verdict = evaluateProduct(product, profile);
    return [
      {
        id: `scan_seed_${profile.id}_${id}`,
        profileId: profile.id,
        product,
        verdict,
        source,
        scannedAt: hoursAgo(hours),
        saved: saved === true && verdict.kind === 'safe',
      },
    ];
  });
}
