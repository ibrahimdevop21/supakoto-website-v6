/**
 * Homepage partner strip (shares the first viewport with the hero).
 * Display strings live in messages under home.partners.items.<id>.* —
 * this file is structure only.
 *
 * Only entries with `confirmed: true` render. With zero confirmed
 * entries the strip renders nothing at all — no empty state, no
 * reserved space — and the hero fills the viewport alone.
 *
 * HISTORY OF THE MANUFACTURER-LOGO RULE: the original spec banned car
 * manufacturer logos outright. Ibrahim explicitly reversed that on
 * 2026-08-11 (after twice declining) and chose to import the V2 brand
 * set — the 25 car marks below ship visible. Two files stay banned:
 * mansour-group-logo.svg (parent conglomerate, not the dealership —
 * overstates the relationship) and any fabricated mark (SK-BLD class
 * error). Brand logos were re-rendered to trimmed transparent WebPs
 * from V2's public/partners/ SVGs.
 */

export type PartnerId =
  | "mansour-chevrolet"
  | "rb-garage"
  | "avatr"
  | "bentley"
  | "bmw"
  | "byd"
  | "changan"
  | "chery"
  | "citroen"
  | "ferrari"
  | "geely"
  | "haval"
  | "hyundai"
  | "jetour"
  | "kia"
  | "lamborghini"
  | "lexus"
  | "mercedes-benz"
  | "nissan"
  | "peugeot"
  | "porsche"
  | "renault"
  | "rolls-royce"
  | "skoda"
  | "tesla"
  | "toyota"
  | "volkswagen";

export type Partner = {
  id: PartnerId;
  /** Canonical trade name (localized display name in messages). */
  name: string;
  /** Path under public/. */
  logo: string;
  /** Renders only when true. */
  confirmed: boolean;
  url?: string;
};

const brand = (id: PartnerId, name: string): Partner => ({
  id,
  name,
  logo: `/images/partners/${id}.webp`,
  confirmed: true,
});

export const partners: Partner[] = [
  // Business partners — placeholders until written permission AND a
  // real logo land; flip `confirmed` only then.
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
  // Car brands (V2 set, import approved 2026-08-11).
  brand("avatr", "Avatr"),
  brand("bentley", "Bentley"),
  brand("bmw", "BMW"),
  brand("byd", "BYD"),
  brand("changan", "Changan"),
  brand("chery", "Chery"),
  brand("citroen", "Citroën"),
  brand("ferrari", "Ferrari"),
  brand("geely", "Geely"),
  brand("haval", "Haval"),
  brand("hyundai", "Hyundai"),
  brand("jetour", "Jetour"),
  brand("kia", "Kia"),
  brand("lamborghini", "Lamborghini"),
  brand("lexus", "Lexus"),
  brand("mercedes-benz", "Mercedes-Benz"),
  brand("nissan", "Nissan"),
  brand("peugeot", "Peugeot"),
  brand("porsche", "Porsche"),
  brand("renault", "Renault"),
  brand("rolls-royce", "Rolls-Royce"),
  brand("skoda", "Škoda"),
  brand("tesla", "Tesla"),
  brand("toyota", "Toyota"),
  brand("volkswagen", "Volkswagen"),
];
