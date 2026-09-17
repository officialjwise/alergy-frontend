import {
  flaggedNames,
  highlightSegments,
  ingredientRows,
  parseIngredients,
  triggerCounts,
} from '../ingredients';
import type { ScanResult, Verdict, VerdictTrigger } from '@/types';

const trigger = (over: Partial<VerdictTrigger>): VerdictTrigger => ({
  ingredientId: 'peanut',
  ingredientName: 'Peanuts',
  matchedText: 'peanuts',
  kind: 'contains',
  level: 'high',
  byNameOnly: false,
  ...over,
});

const verdict = (triggers: VerdictTrigger[], over: Partial<Verdict> = {}): Verdict => ({
  kind: triggers.length ? 'unsafe' : 'safe',
  triggers,
  clearedIngredientIds: [],
  conditionNotes: [],
  incomplete: false,
  ...over,
});

const scan = (
  ingredientsText: string,
  mayContain: string[],
  triggers: VerdictTrigger[],
): ScanResult => ({
  id: 's1',
  profileId: 'p1',
  product: { id: 'x', name: 'Bar', ingredientsText, mayContain },
  verdict: verdict(triggers),
  source: 'camera',
  scannedAt: new Date().toISOString(),
  saved: false,
});

describe('parseIngredients', () => {
  it('splits on commas and semicolons and drops ellipses', () => {
    expect(parseIngredients('Oats, honey; roasted peanuts, ...')).toEqual([
      'Oats',
      'honey',
      'roasted peanuts',
    ]);
  });

  it('keeps commas inside brackets together', () => {
    expect(parseIngredients('peanut butter (peanuts, salt), sugar [cane, beet]')).toEqual([
      'peanut butter (peanuts, salt)',
      'sugar [cane, beet]',
    ]);
  });
});

describe('ingredientRows', () => {
  it('marks the ingredient that matched a trigger and keeps the rest clear', () => {
    const rows = ingredientRows(scan('Oats, roasted peanuts, salt', ['milk'], [trigger({})]));
    expect(rows.map((row) => [row.name, row.status])).toEqual([
      ['Oats', 'clear'],
      ['roasted peanuts', 'contains'],
      ['salt', 'clear'],
      ['milk', 'clear'],
    ]);
    expect(rows[3]?.fromMayContain).toBe(true);
  });

  it('shows a may-contain statement as may contain even when the trigger is contains', () => {
    const rows = ingredientRows(
      scan(
        'Cocoa butter',
        ['milk'],
        [trigger({ ingredientId: 'milk', ingredientName: 'Milk', matchedText: 'milk' })],
      ),
    );
    expect(rows[1]).toMatchObject({ name: 'milk', status: 'may_contain', fromMayContain: true });
  });

  it('matches may-contain statements with may-contain triggers', () => {
    const rows = ingredientRows(
      scan(
        'Oats',
        ['milk'],
        [
          trigger({
            ingredientId: 'milk',
            ingredientName: 'Milk',
            matchedText: 'milk',
            kind: 'may_contain',
          }),
        ],
      ),
    );
    expect(rows[1]).toMatchObject({ name: 'milk', status: 'may_contain', fromMayContain: true });
  });
});

describe('triggerCounts', () => {
  it('counts distinct ingredients per tile', () => {
    const counts = triggerCounts(
      verdict([
        trigger({}),
        trigger({ matchedText: 'peanut oil' }),
        trigger({
          ingredientId: 'milk',
          ingredientName: 'Milk',
          matchedText: 'milk',
          kind: 'may_contain',
        }),
      ]),
    );
    expect(counts).toEqual({ contains: 1, mayContain: 1 });
  });
});

describe('highlightSegments', () => {
  it('splits text around flagged words, case-insensitively', () => {
    const segments = highlightSegments('Wheat flour, Peanuts, salt', [
      trigger({}),
      trigger({
        ingredientId: 'wheat',
        ingredientName: 'Wheat',
        matchedText: 'wheat',
        kind: 'may_contain',
      }),
    ]);
    expect(segments).toEqual([
      { text: 'Wheat', kind: 'may_contain' },
      { text: ' flour, ' },
      { text: 'Peanuts', kind: 'contains' },
      { text: ', salt' },
    ]);
  });

  it('returns the text untouched without triggers', () => {
    expect(highlightSegments('Salt', [])).toEqual([{ text: 'Salt' }]);
  });
});

describe('flaggedNames', () => {
  it('orders strongest triggers first and removes duplicates', () => {
    const names = flaggedNames(
      verdict([
        trigger({ ingredientId: 'milk', ingredientName: 'Milk', kind: 'may_contain' }),
        trigger({}),
        trigger({ matchedText: 'peanut oil' }),
        trigger({ ingredientId: 'unclear', ingredientName: 'Unclear', kind: 'unclear' }),
      ]),
    );
    expect(names).toEqual(['Peanuts', 'Milk']);
  });
});
