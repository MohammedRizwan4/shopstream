let counter = 0;

/** Monotonic, prefix-typed ids: usr_000001, ord_000002 … */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${String(counter).padStart(6, '0')}`;
}

export const isId = (value: string, prefix: string): boolean =>
  new RegExp(`^${prefix}_\d{6}$`).test(value);
