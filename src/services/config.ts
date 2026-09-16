export type ApiMode = 'mock' | 'real';

const rawMode = process.env.EXPO_PUBLIC_API_MODE;

/** The single switch between mock and real services. */
export const apiMode: ApiMode = rawMode === 'real' ? 'real' : 'mock';

export const apiBaseUrl: string = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * Mock behaviour knobs. The hidden dev screen toggles these to preview
 * loading, error and offline states.
 */
export const mockConfig = {
  /** Base latency in ms for mock calls. */
  latency: 450,
  /** When true every mock call rejects with a network error. */
  failNext: false,
  /** When true the next camera or gallery analysis reports an unreadable photo. */
  unreadableNext: false,
  /** Verification code accepted by the mock email flow. */
  emailCode: '123456',
};
