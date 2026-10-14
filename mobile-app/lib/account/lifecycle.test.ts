import { expect, mock, test } from 'bun:test';
import { SessionLifecycle } from './lifecycle';

test('sign-out while unlocking destroys the late signing session', async () => {
  const end = mock(() => {});
  const ready = mock(() => {});
  const lifecycle = new SessionLifecycle(ready, () => {});
  let resolve!: (wallet: { session: { end: typeof end } }) => void;
  const result = lifecycle.unlock(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  lifecycle.end();
  resolve({ session: { end } });
  expect(await result).toBe(false);
  expect(end).toHaveBeenCalledTimes(1);
  expect(ready).not.toHaveBeenCalled();
});

test('prevents concurrent passkey prompts', async () => {
  const lifecycle = new SessionLifecycle(
    () => {},
    () => {}
  );
  const wallet = { session: { end: mock(() => {}) } };
  let resolve!: (result: typeof wallet) => void;
  const first = lifecycle.unlock(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const second = mock(async () => wallet);
  expect(await lifecycle.unlock(second)).toBe(false);
  expect(second).not.toHaveBeenCalled();
  resolve(wallet);
  expect(await first).toBe(true);
  lifecycle.end();
});

test('idle expiry destroys the signing session', async () => {
  const wallet = { session: { end: mock(() => {}) } };
  const lifecycle = new SessionLifecycle(
    () => {},
    () => {},
    10,
    60_000
  );
  await lifecycle.unlock(async () => wallet);
  await Bun.sleep(25);
  expect(wallet.session.end).toHaveBeenCalledTimes(1);
  lifecycle.end();
});

test('returning after the background limit expires the session', async () => {
  const wallet = { session: { end: mock(() => {}) } };
  const lifecycle = new SessionLifecycle(
    () => {},
    () => {},
    60_000,
    10
  );
  await lifecycle.unlock(async () => wallet);
  lifecycle.background();
  await Bun.sleep(25);
  lifecycle.foreground();
  expect(wallet.session.end).toHaveBeenCalledTimes(1);
  lifecycle.end();
});
