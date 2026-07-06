import { MAX_DAILY_REQUESTS } from './constants';

// Simplest possible daily cap: an in-memory counter that resets when the
// calendar date (UTC) changes. This is per server-instance — it is not
// shared across multiple serverless instances/regions and resets on cold
// starts or redeploys. That's an acceptable tradeoff for a low-traffic,
// no-login internal tool; swap for Vercel KV/Upstash if stricter global
// enforcement is ever needed.
const state = {
  date: '',
  count: 0,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function resetIfNewDay(): void {
  const today = todayKey();
  if (state.date !== today) {
    state.date = today;
    state.count = 0;
  }
}

export function isDailyLimitReached(): boolean {
  resetIfNewDay();
  return state.count >= MAX_DAILY_REQUESTS;
}

export function recordRequest(): void {
  resetIfNewDay();
  state.count += 1;
}
