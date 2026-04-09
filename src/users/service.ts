import { err, ok, type Result } from '../shared/result.js';
import { nextId } from '../shared/ids.js';
import type { Clock } from '../shared/clock.js';
import { emailIsValid, type User } from './model.js';
import type { UserRepo } from './repo.js';

export class UserService {
  constructor(
    private readonly repo: UserRepo,
    private readonly clock: Clock,
  ) {}

  register(email: string, displayName: string): Result<User> {
    if (!emailIsValid(email)) return err('user/invalid-email', `not an email: ${email}`);
    if (this.repo.byEmail(email)) return err('user/duplicate', 'email already registered');
    const user: User = {
      id: nextId('usr'),
      email,
      displayName: displayName.trim(),
      createdAt: this.clock.now(),
      marketingOptIn: false,
    };
    this.repo.save(user);
    return ok(user);
  }

  profile(id: string): Result<User> {
    const user = this.repo.byId(id);
    return user ? ok(user) : err('user/not-found', `no user ${id}`);
  }
}
