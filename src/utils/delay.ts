export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Small random jitter so mock calls feel like a real network. */
export const jitter = (base: number, spread = 0.4): number =>
  Math.round(base * (1 - spread / 2 + Math.random() * spread));
