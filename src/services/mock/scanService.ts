import { simulate } from './support';
import { mockConfig } from '../config';
import { ServiceError, type ScanService } from '../types';
import { evaluateProduct } from '../verdictEngine';
import { PRODUCTS } from '@/mocks/products';
import type { Product, ScanResult } from '@/types';
import { createId } from '@/utils/id';
import { normalize } from '@/utils/text';

/** Camera / gallery captures rotate through the catalogue so demos show every verdict. */
let captureCursor = 0;
const CAPTURE_ROTATION = [
  'p-rice-cakes',
  'p-dark-chocolate',
  'p-granola-bar',
  'p-mystery-label',
  'p-hummus',
  'p-veggie-burger',
];

function productFromCapture(labelText?: string): Product {
  if (labelText && labelText.trim().length > 0) {
    return {
      id: createId('p'),
      name: 'Scanned label',
      ingredientsText: labelText,
      mayContain: [],
    };
  }
  const id = CAPTURE_ROTATION[captureCursor % CAPTURE_ROTATION.length];
  captureCursor += 1;
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]!;
}

export const mockScanService: ScanService = {
  async analyze({ profile, source, mode, product, labelText, imageUri }) {
    const fromPhoto = source === 'camera' || source === 'gallery';
    await simulate(fromPhoto ? 3 : 1.2);
    if (fromPhoto && mockConfig.unreadableNext) {
      mockConfig.unreadableNext = false;
      throw new ServiceError('Photo too blurry or dark to read', 'unreadable');
    }
    const resolved = product ?? productFromCapture(labelText);
    const withImage = imageUri ? { ...resolved, imageUri } : resolved;
    const textMode = mode === 'label' || mode === 'menu';
    const result: ScanResult = {
      id: createId('scan'),
      profileId: profile.id,
      product: withImage,
      verdict: evaluateProduct(withImage, profile),
      source,
      mode,
      // Mock OCR: the label variant shows the ingredient list as the scanned text.
      labelText: textMode ? (labelText ?? withImage.ingredientsText) : undefined,
      scannedAt: new Date().toISOString(),
      saved: false,
    };
    return result;
  },
  async lookupBarcode(barcode) {
    await simulate(0.8);
    const digits = barcode.replace(/\D/g, '');
    return PRODUCTS.find((p) => p.barcode === digits) ?? null;
  },
  async searchProducts(query) {
    await simulate(0.6);
    const q = normalize(query);
    if (!q) return [];
    const digits = q.replace(/\D/g, '');
    return PRODUCTS.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        normalize(p.brand ?? '').includes(q) ||
        (digits.length >= 4 && (p.barcode ?? '').includes(digits)),
    ).slice(0, 12);
  },
  async verdictFor(product, profile) {
    await simulate(0.3);
    return evaluateProduct(product, profile);
  },
  async report() {
    // The mock accepts every report; the backend will store it.
    await simulate(0.8);
  },
};
