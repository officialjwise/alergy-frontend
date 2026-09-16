import { tokens } from './tokens';
import { typography } from './typography';

export type Theme = typeof tokens & { typography: typeof typography };

const theme: Theme = { ...tokens, typography };

/**
 * The PDF only specifies a light theme, so the theme is static for now.
 * Keeping it behind a hook means a dark theme can be added later without
 * touching components.
 */
export function useTheme(): Theme {
  return theme;
}
