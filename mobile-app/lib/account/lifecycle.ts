export type ManagedWallet = { session: { end(): void } };

/** Owns signing-key lifetime independently of React and native modules. */
export class SessionLifecycle<T extends ManagedWallet> {
  private wallet: T | null = null;
  private generation = 0;
  private unlocking = false;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;
  private backgroundTimer: ReturnType<typeof setTimeout> | undefined;
  private backgroundAt: number | null = null;

  constructor(
    private readonly onReady: (wallet: T) => void,
    private readonly onEnd: () => void,
    private readonly idleMs = 10 * 60_000,
    private readonly backgroundMs = 60_000
  ) {}

  /** Rejects concurrent prompts; discards late responses after sign-out/unmount. */
  async unlock(create: () => Promise<T>): Promise<boolean> {
    if (this.unlocking) return false;
    this.end();
    this.unlocking = true;
    const generation = this.generation;
    try {
      const wallet = await create();
      if (generation !== this.generation) {
        wallet.session.end();
        return false;
      }
      this.wallet = wallet;
      this.onReady(wallet);
      this.touch();
      if (this.backgroundAt !== null) this.scheduleBackgroundExpiry();
      return this.wallet !== null;
    } finally {
      if (generation === this.generation) this.unlocking = false;
    }
  }

  touch() {
    if (!this.wallet) return;
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.end(), this.idleMs);
  }

  background() {
    if (this.backgroundAt !== null) return;
    this.backgroundAt = Date.now();
    if (this.wallet || this.unlocking) this.scheduleBackgroundExpiry();
  }

  foreground() {
    const expired =
      this.backgroundAt !== null && Date.now() - this.backgroundAt >= this.backgroundMs;
    this.backgroundAt = null;
    clearTimeout(this.backgroundTimer);
    // Native JS timers may pause in the background; check elapsed time on return.
    if (expired) this.end();
  }

  private scheduleBackgroundExpiry() {
    clearTimeout(this.backgroundTimer);
    const remaining = this.backgroundMs - (Date.now() - (this.backgroundAt ?? Date.now()));
    if (remaining <= 0) this.end();
    else this.backgroundTimer = setTimeout(() => this.end(), remaining);
  }

  end(notify = true) {
    this.generation++;
    this.unlocking = false;
    clearTimeout(this.idleTimer);
    clearTimeout(this.backgroundTimer);
    this.wallet?.session.end();
    this.wallet = null;
    if (notify) this.onEnd();
  }
}
