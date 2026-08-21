/**
 * Session-seeded shuffle for the gallery (Phase 20). The seed is minted
 * once per browser session so the order stays put while the visitor
 * browses (filter toggles, navigating away and back), and a new session
 * gets a fresh order. Client-only — call after hydration; storage access
 * is wrapped so a blocked sessionStorage just means canonical order.
 */

const SEED_KEY = "sk-gallery-seed";

export function sessionSeed(): number | null {
  try {
    const stored = sessionStorage.getItem(SEED_KEY);
    if (stored !== null) return Number(stored) >>> 0;
    const seed = (Math.random() * 2 ** 32) >>> 0;
    sessionStorage.setItem(SEED_KEY, String(seed));
    return seed;
  } catch {
    return null;
  }
}

/** mulberry32 — tiny deterministic PRNG, good enough for display order. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a seeded PRNG; returns a new array. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
