let counter = 0;

/** Collision-safe enough for local ids; the backend will assign real ids later. */
export function createId(prefix = 'id'): string {
  counter += 1;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}${counter.toString(36)}`;
}
