import type { User, UserId } from './model.js';

export interface UserRepo {
  byId(id: UserId): User | undefined;
  byEmail(email: string): User | undefined;
  save(user: User): void;
}

export class InMemoryUserRepo implements UserRepo {
  private readonly users = new Map<UserId, User>();

  byId(id: UserId): User | undefined {
    return this.users.get(id);
  }

  byEmail(email: string): User | undefined {
    const needle = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === needle) return user;
    }
    return undefined;
  }

  save(user: User): void {
    this.users.set(user.id, user);
  }
}
