import { serviceIds, type ServiceId } from "./services";

/**
 * Gallery items — real photography harvested from V2_Prod (our own work
 * photos; V2's design is rejected, its photography is not). Originals live
 * in assets/source/ (gitignored); web-ready webp under public/images/,
 * served as AVIF/WebP by next/image.
 *
 * Categories: everything is watermarked "Protection Film", so PPF is the
 * default; non-PPF categories are assigned only where the photo visibly
 * shows that work (wraps, coating application, tinted glass).
 * Alt text: gallery.items.<id>.alt in both message files — written fresh,
 * nothing ported from V2.
 *
 * Rendered by GalleryViewer (Phase 20): main stage shows the full frame
 * (object-contain); thumbnails crop to 16:9 (Ibrahim 2026-08-21).
 * width/height here are the intrinsic dimensions for the stage/lightbox.
 * Every entry must be a distinct photo — sk-234 (byte-identical to
 * sk-123) and sk-232 (same Porsche as sk-230, second angle) stay excluded
 * from the Phase 20 full-library ingest (Phase 19 decision).
 * The full V2 harvest (202 more photos) shipped in Phase 20 after a
 * per-image audit: watermark verified on all, categories assigned only
 * where the work is visible in the photo.
 */

export type GalleryCategory = ServiceId | "video";

export type GalleryItem =
  | {
      id: string;
      kind: "image";
      category: Exclude<GalleryCategory, "video">;
      src: string;
      width: number;
      height: number;
    }
  | {
      id: string;
      kind: "video";
      category: "video";
      src: string;
      /** Lower-bitrate source for small screens. */
      srcMobile?: string;
    };

const img = (
  num: string,
  category: Exclude<GalleryCategory, "video">,
  width = 1600,
  height = 1066,
): GalleryItem => ({
  id: `sk-${num}`,
  kind: "image",
  category,
  src: `/images/gallery/sk-${num}.webp`,
  width,
  height,
});

export const galleryItems: GalleryItem[] = [
  img("001", "ppf", 1600, 1200),
  img("002", "ppf"),
  img("003", "colour-change"),
  img("004", "colour-change"),
  img("005", "ppf"),
  img("006", "colour-change"),
  img("007", "ppf"),
  img("008", "ppf"),
  img("009", "ppf"),
  img("010", "ppf"),
  img("011", "ppf"),
  img("012", "ppf"),
  img("013", "nano-ceramic"),
  img("014", "ppf"),
  img("015", "ppf"),
  img("016", "ppf"),
  img("017", "ppf"),
  img("018", "ppf"),
  img("019", "ppf"),
  img("020", "ppf"),
  img("021", "ppf"),
  img("022", "ppf"),
  img("023", "ppf"),
  img("024", "ppf"),
  img("025", "ppf"),
  img("026", "ppf"),
  img("027", "ppf"),
  img("028", "ppf"),
  img("029", "ppf"),
  img("030", "ppf"),
  img("031", "ppf"),
  img("032", "ppf"),
  img("033", "ppf"),
  img("034", "nano-ceramic"),
  img("035", "ppf"),
  img("036", "ppf"),
  img("037", "ppf"),
  img("038", "ppf"),
  img("039", "ppf"),
  img("040", "ppf"),
  img("041", "ppf"),
  img("042", "ppf"),
  img("043", "ppf"),
  img("044", "ppf"),
  img("045", "ppf"),
  img("046", "ppf"),
  img("047", "ppf"),
  img("048", "ppf"),
  img("049", "ppf"),
  img("050", "heat-isolation"),
  img("051", "ppf"),
  img("052", "ppf"),
  img("053", "colour-change"),
  img("054", "colour-change"),
  img("055", "colour-change"),
  img("056", "colour-change"),
  img("057", "colour-change"),
  img("058", "ppf"),
  img("059", "colour-change"),
  img("060", "ppf"),
  img("061", "ppf"),
  img("062", "ppf"),
  img("063", "ppf"),
  img("064", "ppf"),
  img("065", "ppf"),
  img("066", "ppf"),
  img("067", "ppf"),
  img("068", "ppf"),
  img("069", "ppf"),
  img("070", "ppf"),
  img("071", "ppf"),
  img("072", "ppf"),
  img("073", "ppf"),
  img("074", "ppf"),
  img("075", "ppf"),
  img("076", "ppf"),
  img("077", "ppf"),
  img("078", "ppf"),
  img("079", "ppf"),
  img("080", "ppf"),
  img("081", "ppf"),
  img("082", "ppf", 1365, 2048),
  img("083", "ppf"),
  img("084", "ppf"),
  img("085", "ppf"),
  img("086", "ppf"),
  img("087", "ppf"),
  img("088", "ppf"),
  img("089", "ppf"),
  img("090", "colour-change"),
  img("091", "colour-change"),
  img("092", "colour-change"),
  img("093", "colour-change"),
  img("094", "ppf"),
  img("095", "ppf"),
  img("096", "ppf"),
  img("097", "ppf"),
  img("098", "ppf"),
  img("099", "ppf"),
  img("100", "ppf"),
  img("101", "ppf"),
  img("102", "ppf"),
  img("103", "ppf"),
  img("104", "ppf"),
  img("105", "nano-ceramic"),
  img("106", "ppf"),
  img("107", "nano-ceramic"),
  img("108", "ppf"),
  img("109", "ppf"),
  img("110", "ppf"),
  img("111", "ppf"),
  img("112", "ppf"),
  img("113", "ppf"),
  img("114", "ppf"),
  img("115", "ppf"),
  img("116", "ppf"),
  img("117", "ppf"),
  img("118", "ppf"),
  img("119", "ppf"),
  img("120", "ppf"),
  img("121", "ppf"),
  img("122", "ppf"),
  img("123", "ppf", 1536, 2048),
  img("124", "ppf"),
  img("125", "ppf"),
  img("126", "ppf"),
  img("127", "ppf"),
  img("128", "heat-isolation", 1365, 2048),
  img("129", "ppf"),
  img("130", "ppf"),
  img("131", "ppf"),
  img("132", "ppf"),
  img("133", "ppf"),
  img("134", "ppf"),
  img("135", "ppf"),
  img("136", "ppf"),
  img("137", "ppf"),
  img("138", "ppf"),
  img("139", "ppf"),
  img("140", "ppf"),
  img("141", "ppf"),
  img("142", "ppf"),
  img("143", "ppf"),
  img("144", "ppf"),
  img("145", "ppf"),
  img("146", "ppf"),
  img("147", "ppf"),
  img("148", "ppf"),
  img("149", "ppf"),
  img("150", "ppf"),
  img("151", "ppf"),
  img("152", "ppf"),
  img("153", "ppf"),
  img("154", "ppf"),
  img("155", "ppf"),
  img("156", "ppf"),
  img("157", "ppf"),
  img("158", "ppf"),
  img("159", "ppf"),
  img("160", "ppf"),
  img("161", "ppf"),
  img("162", "ppf"),
  img("163", "ppf"),
  img("164", "ppf"),
  img("165", "ppf"),
  img("166", "ppf"),
  img("167", "ppf"),
  img("168", "ppf"),
  img("169", "ppf"),
  img("170", "ppf"),
  img("171", "ppf"),
  img("172", "ppf", 1536, 2048),
  img("173", "ppf", 1536, 2048),
  img("174", "ppf", 1536, 2048),
  img("175", "ppf", 1600, 1200),
  img("176", "colour-change", 1536, 2048),
  img("177", "ppf", 1536, 2048),
  img("178", "ppf", 1600, 1200),
  img("179", "ppf", 1536, 2048),
  img("180", "ppf", 1536, 2048),
  img("181", "ppf", 1536, 2048),
  img("182", "ppf", 1536, 2048),
  img("183", "ppf", 1536, 2048),
  img("184", "ppf", 1536, 2048),
  img("185", "ppf", 1536, 2048),
  img("186", "ppf", 1536, 2048),
  img("187", "ppf", 1536, 2048),
  img("188", "ppf", 1536, 2048),
  img("189", "ppf", 1536, 2048),
  img("190", "ppf", 1600, 1200),
  img("191", "ppf", 1600, 1200),
  img("192", "ppf", 1536, 2048),
  img("193", "ppf", 1536, 2048),
  img("194", "ppf", 1536, 2048),
  img("195", "ppf", 1536, 2048),
  img("196", "ppf", 1536, 2048),
  img("197", "ppf", 1536, 2048),
  img("198", "ppf", 1536, 2048),
  img("199", "ppf", 1536, 2048),
  img("200", "ppf", 1536, 2048),
  img("201", "ppf", 1536, 2048),
  img("202", "ppf", 1536, 2048),
  img("203", "ppf", 1536, 2048),
  img("204", "ppf", 1536, 2048),
  img("205", "ppf", 1536, 2048),
  img("206", "ppf", 1536, 2048),
  img("207", "ppf", 1536, 2048),
  img("208", "ppf", 1536, 2048),
  img("209", "ppf", 1536, 2048),
  img("210", "ppf", 1536, 2048),
  img("211", "ppf", 1600, 1200),
  img("212", "ppf", 1536, 2048),
  img("213", "ppf", 1536, 2048),
  img("214", "ppf", 1536, 2048),
  img("215", "ppf", 1536, 2048),
  img("216", "ppf", 1536, 2048),
  img("217", "ppf", 1600, 1200),
  img("218", "ppf", 1536, 2048),
  img("219", "ppf", 1536, 2048),
  img("220", "ppf", 1536, 2048),
  img("221", "ppf", 1536, 2048),
  img("222", "ppf", 1600, 1200),
  img("223", "ppf", 1536, 2048),
  img("224", "ppf", 1536, 2048),
  img("225", "ppf", 1536, 2048),
  img("226", "ppf", 1536, 2048),
  img("227", "ppf", 1536, 2048),
  img("228", "ppf", 1536, 2048),
  img("229", "ppf", 1536, 2048),
  img("230", "nano-ceramic", 1536, 2048),
  img("231", "ppf", 1600, 1200),
  img("233", "ppf", 1536, 2048),
  img("235", "ppf", 1600, 1200),
  img("236", "ppf", 1536, 2048),
  img("237", "ppf", 1536, 2048),
  img("238", "ppf", 1536, 2048),
  // Building projects — our own installation photos (SupaKoto × TAKAI
  // watermarked), not from the V2_Prod harvest.
  {
    id: "building-astrazeneca",
    kind: "image",
    category: "building-heat-isolation",
    src: "/images/gallery/building-astrazeneca.webp",
    width: 680,
    height: 383,
  },
  {
    id: "building-hustle-drip",
    kind: "image",
    category: "building-heat-isolation",
    src: "/images/gallery/building-hustle-drip.webp",
    width: 408,
    height: 544,
  },
  // Surface protection — our own installation and product photos
  // (SupaKoto × TAKAI watermarked).
  {
    id: "surface-film-roll",
    kind: "image",
    category: "surface-protection",
    src: "/images/gallery/surface-film-roll.webp",
    width: 1000,
    height: 1000,
  },
  {
    id: "surface-marble-counter",
    kind: "image",
    category: "surface-protection",
    src: "/images/gallery/surface-marble-counter.webp",
    width: 563,
    height: 1000,
  },
  {
    id: "surface-marble-table",
    kind: "image",
    category: "surface-protection",
    src: "/images/gallery/surface-marble-table.webp",
    width: 387,
    height: 516,
  },
  {
    id: "surface-interior-table",
    kind: "image",
    category: "surface-protection",
    src: "/images/gallery/surface-interior-table.webp",
    width: 470,
    height: 640,
  },
  {
    id: "showreel",
    kind: "video",
    category: "video",
    src: "/videos/showreel.webm",
    srcMobile: "/videos/showreel-mobile.webm",
  },
];

/**
 * Filter row = the service catalogue, verbatim, plus "all" and "video".
 * DERIVED, never hardcoded — a hardcoded list is how marine went missing
 * (same defect class as the wizard pre-Phase-19). Categories with no
 * photography yet still render, with a labelled empty state.
 * Guarded by scripts/check-gallery-filters.mjs.
 */
export const galleryCategories: Array<GalleryCategory | "all"> = [
  "all",
  ...serviceIds,
  "video",
];

/** Hero slide backdrops (home carousel). */
export const heroImages: Record<
  "s1" | "s2" | "s3" | "s4" | "s5",
  { src: string; width: number; height: number }
> = {
  s1: { src: "/images/hero/s1.webp", width: 2000, height: 1500 },
  s2: { src: "/images/hero/s2.webp", width: 2000, height: 1333 },
  s3: { src: "/images/hero/s3.webp", width: 2000, height: 1500 },
  s4: { src: "/images/hero/s4.webp", width: 2000, height: 1333 },
  s5: { src: "/images/hero/s5.webp", width: 2000, height: 1333 },
};

/** One representative photo per service (index rows, rail cards, detail hero). */
export function serviceImage(id: ServiceId): string {
  return `/images/services/${id}.webp`;
}
