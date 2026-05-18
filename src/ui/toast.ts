export type ToastTone = 'info' | 'success' | 'error';

export interface Toast {
  tone: ToastTone;
  message: string;
  ttlMs: number;
}

const queue: Toast[] = [];

export function pushToast(tone: ToastTone, message: string, ttlMs = 4000): void {
  queue.push({ tone, message, ttlMs });
}

export function drainToasts(): Toast[] {
  return queue.splice(0, queue.length);
}
