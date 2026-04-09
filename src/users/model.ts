export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  createdAt: Date;
  marketingOptIn: boolean;
}

export const emailIsValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
