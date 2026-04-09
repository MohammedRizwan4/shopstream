import { err, ok, type Result } from '../shared/result.js';
import type { Clock } from '../shared/clock.js';
import type { UserRepo } from '../users/repo.js';
import { sign, verify } from './tokens.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export interface Session {
  userId: string;
  expiresAt: number;
}

export class AuthService {
  constructor(
    private readonly users: UserRepo,
    private readonly clock: Clock,
  ) {}

  login(email: string): Result<string> {
    const user = this.users.byEmail(email);
    if (!user) return err('auth/unknown-user', 'no account for that email');
    const session: Session = {
      userId: user.id,
      expiresAt: this.clock.now().getTime() + SESSION_TTL_MS,
    };
    return ok(sign(JSON.stringify(session)));
  }

  authenticate(token: string): Result<Session> {
    const payload = verify(token);
    if (!payload) return err('auth/bad-token', 'token failed verification');
    const session = JSON.parse(payload) as Session;
    if (session.expiresAt < this.clock.now().getTime()) {
      return err('auth/expired', 'session expired');
    }
    return ok(session);
  }
}
