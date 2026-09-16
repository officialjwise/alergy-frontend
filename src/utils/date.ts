import type { BirthDate } from '@/types';

export const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isValidBirthDate(date: BirthDate | null): date is BirthDate {
  if (!date) return false;
  const { year, month, day } = date;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  const value = new Date(year, month - 1, day);
  const now = new Date();
  if (value.getTime() > now.getTime()) return false;
  return year >= now.getFullYear() - 120;
}

export function ageFromBirthDate(date: BirthDate, now = new Date()): number {
  let age = now.getFullYear() - date.year;
  const hadBirthday =
    now.getMonth() + 1 > date.month ||
    (now.getMonth() + 1 === date.month && now.getDate() >= date.day);
  if (!hadBirthday) age -= 1;
  return age;
}

export function formatBirthDate(date: BirthDate, locale: string): string {
  return new Date(date.year, date.month - 1, date.day).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeDay(
  iso: string,
  locale: string,
  labels: { today: string; yesterday: string },
): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.floor(
    (startOfToday - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );
  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

export function formatLongDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
