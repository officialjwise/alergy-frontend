import type { ScanResult, TriggerKind, Verdict, VerdictTrigger } from '@/types';
import { normalize } from '@/utils/text';

export type IngredientStatus = TriggerKind | 'clear';

export interface IngredientRow {
  name: string;
  status: IngredientStatus;
  trigger?: VerdictTrigger;
  /** Came from the product's "may contain" statement rather than the ingredient list. */
  fromMayContain: boolean;
}

/** Splits a label's ingredient text into entries; separators inside brackets do not split. */
export function parseIngredients(text: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  for (const char of text) {
    if (char === '(' || char === '[') depth += 1;
    if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
    if ((char === ',' || char === ';' || char === '\n') && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts
    .map((part) => part.replace(/\s+/g, ' ').trim().replace(/\.+$/, '').trim())
    .filter((part) => part.length > 0 && part !== '…');
}

function matchTrigger(name: string, triggers: VerdictTrigger[]): VerdictTrigger | undefined {
  const haystack = normalize(name);
  return triggers.find(
    (trigger) => trigger.matchedText && haystack.includes(normalize(trigger.matchedText)),
  );
}

/** One row per ingredient (plus "may contain" entries) with its status and the trigger that caused it. */
export function ingredientRows(scan: ScanResult): IngredientRow[] {
  const { product, verdict } = scan;
  const rows: IngredientRow[] = parseIngredients(product.ingredientsText).map((name) => {
    const trigger = matchTrigger(name, verdict.triggers);
    return { name, status: trigger ? trigger.kind : 'clear', trigger, fromMayContain: false };
  });
  product.mayContain.forEach((name) => {
    // A "may contain" statement is at most a may-contain risk, even if the same
    // ingredient already produced a stronger "contains" trigger elsewhere.
    const trigger = matchTrigger(name, verdict.triggers);
    const status: IngredientStatus = !trigger
      ? 'clear'
      : trigger.kind === 'contains'
        ? 'may_contain'
        : trigger.kind;
    rows.push({ name, status, trigger, fromMayContain: true });
  });
  return rows;
}

/** Counts behind the "Contains" and "May contain" tiles. */
export function triggerCounts(verdict: Verdict): { contains: number; mayContain: number } {
  const ids = (kinds: TriggerKind[]) =>
    new Set(
      verdict.triggers.filter((item) => kinds.includes(item.kind)).map((item) => item.ingredientId),
    ).size;
  return { contains: ids(['contains']), mayContain: ids(['may_contain', 'cross_contact']) };
}

export interface TextSegment {
  text: string;
  kind?: TriggerKind;
}

/** Splits scanned text into plain and flagged segments so flagged words can be highlighted. */
export function highlightSegments(text: string, triggers: VerdictTrigger[]): TextSegment[] {
  const terms = Array.from(
    new Map(
      triggers
        .filter((item) => item.matchedText)
        .map((item) => [item.matchedText.toLowerCase(), item] as const),
    ).values(),
  ).sort((a, b) => b.matchedText.length - a.matchedText.length);
  if (!terms.length || !text) return [{ text }];
  const pattern = new RegExp(
    `(${terms.map((item) => item.matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi',
  );
  const segments: TextSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    const found = match[0];
    if (index > last) segments.push({ text: text.slice(last, index) });
    const term = terms.find((item) => item.matchedText.toLowerCase() === found.toLowerCase());
    segments.push({ text: found, kind: term?.kind ?? 'contains' });
    last = index + found.length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

/** Ingredient names that triggered the verdict, strongest first, without duplicates. */
export function flaggedNames(verdict: Verdict): string[] {
  const rank: Record<TriggerKind, number> = {
    contains: 3,
    may_contain: 2,
    cross_contact: 1,
    unclear: 0,
  };
  return Array.from(
    new Set(
      [...verdict.triggers]
        .sort((a, b) => rank[b.kind] - rank[a.kind])
        .filter((item) => item.ingredientId !== 'unclear')
        .map((item) => item.ingredientName),
    ),
  );
}
