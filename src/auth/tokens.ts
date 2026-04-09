import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.AUTH_SECRET ?? 'dev-only-secret';

export function sign(payload: string): string {
  const mac = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${mac}`;
}

export function verify(token: string): string | null {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const payload = Buffer.from(body, 'base64url').toString();
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? payload : null;
}
