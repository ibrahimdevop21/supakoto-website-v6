/**
 * Human-readable request reference carried across the WhatsApp jump
 * (Phase 18 item 6). Format `SK-XXXXXX`: six uppercase alphanumerics from an
 * alphabet without the ambiguous O/0 and I/1 (32 symbols → ~1.07 × 10⁹
 * combinations). Generated client-side at booking_complete /
 * quote_complete / enquiry_complete; contract in docs/progress/TRACKING-SPEC.md.
 */
export const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const REF_PATTERN = /^SK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export function generateRef(): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  let out = "";
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `SK-${out}`;
}

export function isRef(value: string): boolean {
  return REF_PATTERN.test(value);
}
