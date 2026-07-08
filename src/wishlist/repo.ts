export interface WishlistEntry {
  userId: string;
  productId: string;
  addedAt: Date;
}

export class InMemoryWishlistRepo {
  private readonly entries: WishlistEntry[] = [];

  add(entry: WishlistEntry): void {
    if (!this.has(entry.userId, entry.productId)) this.entries.push(entry);
  }

  remove(userId: string, productId: string): void {
    const i = this.entries.findIndex((e) => e.userId === userId && e.productId === productId);
    if (i !== -1) this.entries.splice(i, 1);
  }

  has(userId: string, productId: string): boolean {
    return this.entries.some((e) => e.userId === userId && e.productId === productId);
  }

  forUser(userId: string): readonly WishlistEntry[] {
    return this.entries.filter((e) => e.userId === userId);
  }
}
