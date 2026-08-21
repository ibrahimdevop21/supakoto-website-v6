/**
 * Per-page-load seeded shuffle for the gallery (Phase 20). The seed is
 * minted once per JS lifetime (module scope): every full page load — a
 * refresh included — gets a fresh order (Ibrahim, 2026-08-22: "shuffle on
 * each page load"; sessionStorage survived refreshes and kept showing the
 * same first image). Client-side navigation away and back keeps module
 * state, so the order never changes mid-browse, and filtering stays
 * stable because the same seed re-derives the same permutation.
 */

let seed: number | null = null;

export function pageLoadSeed(): number {
  if (seed === null) seed = (Math.random() * 2 ** 32) >>> 0;
  return seed;
}

/** mulberry32 — tiny deterministic PRNG, good enough for display order. */
function mulberry32(s: number): () => number {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a seeded PRNG; returns a new array. */
export function seededShuffle<T>(items: readonly T[], withSeed: number): T[] {
  const rand = mulberry32(withSeed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
