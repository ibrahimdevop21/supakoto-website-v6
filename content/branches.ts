import type { RegionId } from "./regions";

export type BranchHours = { open: string; close: string };

/**
 * INTERIM DEFAULT — ops unconfirmed. V2 published «السبت–الجمعة: 10ص–8م»
 * for every branch; Ibrahim approved it as the placeholder on 2026-08-21
 * (Phase 19, Q5). Replace per branch via `hours` as real figures arrive.
 */
export const DEFAULT_HOURS: BranchHours = { open: "10:00", close: "20:00" };

export type Branch = {
  /** Also the message key: branches.items.<id>.{name,address} */
  id: string;
  region: RegionId;
  /**
   * Display phone, always rendered LTR. OPS-CONFIRMED full replacement,
   * Ibrahim/Dr. Amer 2026-08-16 (E.164 with spaces, as supplied).
   * Alexandria's BRANCH number is +20 10 44202946; the Egypt REGIONAL line
   * in content/regions.ts stays 01103402446 on purpose — see that file.
   */
  phone: string;
  /** wa.me target, digits only. */
  whatsapp: string;
  /** Map pin — all six OPS-CONFIRMED by Ibrahim on-site, 2026-08-06. */
  coords: { lat: number; lng: number; approximate?: boolean };
  /** Branch photo under public/images/branches/ — placeholder until set. */
  photo?: string;
  franchise?: boolean;
  /** Server-enforced daily capacity where known (bdm-flow). */
  capacity?: number;
  /**
   * Opening hours, "HH:MM" 24h, local branch time. Drives the booking
   * wizard's slot buttons (hourly, open → close − 1h). NOT SET on any
   * branch yet: every branch falls back to DEFAULT_HOURS below until ops
   * confirms real per-branch hours (ASSETS-NEEDED). Closure days are not
   * modelled — the wizard shades nothing until ops supplies them.
   */
  hours?: BranchHours;
  /**
   * Public Google Business Profile rating for the branch listing. The
   * testimonials section shows the COUNT-WEIGHTED average across every
   * branch that has one (never an average of averages) plus the summed
   * count. Figures supplied by Ibrahim 2026-08-19; refresh `asOf` when
   * updated. Alexandria and Damietta have no listing figures yet.
   */
  reviews?: { rating: number; count: number; asOf: string; url?: string };
};

export const branches: Branch[] = [
  {
    id: "tagamoa",
    reviews: { rating: 4.9, count: 699, asOf: "2026-08-19" },
    photo: "/images/branches/tagamoa.webp",
    coords: { lat: 30.019004, lng: 31.432151 },
    region: "egypt",
    phone: "+20 10 12747478",
    whatsapp: "201012747478",
    capacity: 8,
  },
  {
    id: "zayed",
    reviews: { rating: 4.8, count: 439, asOf: "2026-08-19" },
    photo: "/images/branches/zayed.webp",
    coords: { lat: 30.019908, lng: 30.977818 },
    region: "egypt",
    phone: "+20 11 03670059",
    whatsapp: "201103670059",
    capacity: 6,
  },
  {
    id: "maadi",
    reviews: { rating: 4.8, count: 363, asOf: "2026-08-19" },
    photo: "/images/branches/maadi.webp",
    coords: { lat: 29.959924, lng: 31.320286 },
    region: "egypt",
    phone: "+20 11 00512230",
    whatsapp: "201100512230",
    capacity: 3,
  },
  {
    id: "alexandria",
    photo: "/images/branches/alexandria.webp",
    coords: { lat: 31.048005, lng: 29.785749 },
    region: "egypt",
    phone: "+20 10 44202946",
    whatsapp: "201044202946",
  },
  {
    id: "damietta",
    photo: "/images/branches/damietta.webp",
    coords: { lat: 31.443499, lng: 31.675357 },
    region: "egypt",
    phone: "+20 11 26978186",
    whatsapp: "201126978186",
    franchise: true,
  },
  {
    id: "dubai",
    reviews: { rating: 4.9, count: 69, asOf: "2026-08-19" },
    photo: "/images/branches/dubai.webp",
    coords: { lat: 25.117529, lng: 55.236156 },
    region: "uae",
    phone: "+971 55 205 4478",
    whatsapp: "971552054478",
  },
];

export function branchHours(branch: Branch): BranchHours {
  return branch.hours ?? DEFAULT_HOURS;
}

/**
 * Hourly start times a customer may request at a branch: open … close − 1h
 * (a 10:00–20:00 day offers 10:00 … 19:00). These are REQUESTS, not
 * reservations — capacity lives in bdm-flow and the form does not talk to
 * it yet; the team confirms every slot.
 */
export function timeSlotsFor(branch: Branch): string[] {
  const { open, close } = branchHours(branch);
  const [oh] = open.split(":").map(Number);
  const [ch] = close.split(":").map(Number);
  const slots: string[] = [];
  for (let h = oh; h < ch; h++) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

export function branchesForRegion(region: RegionId): Branch[] {
  return branches.filter((b) => b.region === region);
}

/**
 * Google Maps navigation deep link to the exact ops-confirmed pin —
 * opens turn-by-turn directions from the user's location on any platform.
 */
export function directionsUrl(branch: Branch): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${branch.coords.lat},${branch.coords.lng}`;
}
