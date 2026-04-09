export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
}

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = (code: string, message: string, cause?: unknown): Result<never> => ({
  ok: false,
  error: { code, message, cause },
});

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
  return result.value;
}
