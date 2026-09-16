import type { IconName } from '@/components/ui/iconNames';
import type { ColorToken } from '@/theme/tokens';
import type { VerdictKind } from '@/types';

export interface VerdictTheme {
  color: ColorToken;
  tint: ColorToken;
  icon: IconName;
  titleKey: string;
  bodyKey: string;
  a11yKey: string;
}

/** Four verdict states, each with an icon and text so colour is never the only signal. */
export const VERDICT_THEME: Record<VerdictKind, VerdictTheme> = {
  safe: {
    color: 'success',
    tint: 'successTint',
    icon: 'checkCircle',
    titleKey: 'verdict.safe',
    bodyKey: 'verdict.safeBody',
    a11yKey: 'a11y.verdictIcon_safe',
  },
  caution: {
    color: 'warning',
    tint: 'warningTint',
    icon: 'warning',
    titleKey: 'verdict.caution',
    bodyKey: 'verdict.cautionBody',
    a11yKey: 'a11y.verdictIcon_caution',
  },
  unsafe: {
    color: 'danger',
    tint: 'dangerTint',
    icon: 'closeCircle',
    titleKey: 'verdict.unsafe',
    bodyKey: 'verdict.unsafeBody',
    a11yKey: 'a11y.verdictIcon_unsafe',
  },
  unknown: {
    color: 'neutral',
    tint: 'neutralTint',
    icon: 'helpCircle',
    titleKey: 'verdict.unknown',
    bodyKey: 'verdict.unknownBody',
    a11yKey: 'a11y.verdictIcon_unknown',
  },
};
