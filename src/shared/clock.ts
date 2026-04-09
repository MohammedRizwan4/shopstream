export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** Deterministic clock for tests. */
export function fixedClock(iso: string): Clock {
  const frozen = new Date(iso);
  return { now: () => frozen };
}
