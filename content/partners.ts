/**
 * Homepage partner strip. Display strings live in messages under
 * home.partners.items.<id>.* — this file is structure only.
 *
 * Only entries with `confirmed: true` render. With zero confirmed
 * entries the band renders nothing at all — no empty state, no
 * reserved space.
 *
 * TRADEMARK RULE: car manufacturer logos (Mercedes, BMW, Porsche,
 * Lamborghini, …) are never ours to display. Do not add them, now or
 * later. V2's public/partners/ folder is a banned source in its
 * entirety — including mansour-group-logo.svg (parent conglomerate,
 * not the dealership; using it overstates the relationship).
 */

export type PartnerId = "mansour-chevrolet" | "rb-garage";

export type Partner = {
  id: PartnerId;
  /** Canonical trade name (localized display name in messages). */
  name: string;
  /**
   * Path under public/. Every current file is a labelled placeholder —
   * drop the real mark in, point this at it, then flip `confirmed`.
   */
  logo: string;
  /**
   * Renders only when true. Flip only with the partner's written
   * permission AND a real logo in place — never over a placeholder.
   */
  confirmed: boolean;
  url?: string;
};

// TAKAI is deliberately NOT in this roster: it is the mother company —
// SupaKoto is its exclusive distributor for Egypt and UAE — so it does
// not belong in a peer-partner strip (Ibrahim, 2026-08-11).
export const partners: Partner[] = [
  {
    // Hosts the Alexandria branch. Permission not yet granted.
    id: "mansour-chevrolet",
    name: "Mansour Chevrolet",
    logo: "/images/partners/placeholder-mansour-chevrolet.webp",
    confirmed: false,
  },
  {
    // Damietta franchise. Permission not yet granted.
    id: "rb-garage",
    name: "RB Garage",
    logo: "/images/partners/placeholder-rb-garage.webp",
    confirmed: false,
  },
];
