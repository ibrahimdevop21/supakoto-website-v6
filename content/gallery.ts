import type { ServiceId } from "./services";

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
      aspect: "square" | "portrait" | "landscape";
    }
  | {
      id: string;
      kind: "video";
      category: "video";
      src: string;
      /** Lower-bitrate source for small screens. */
      srcMobile?: string;
      aspect: "landscape";
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
  aspect:
    width / height > 1.15
      ? "landscape"
      : width / height < 0.87
        ? "portrait"
        : "square",
});

export const galleryItems: GalleryItem[] = [
  img("001", "ppf", 1600, 1200),
  img("005", "ppf"),
  img("013", "polishing"),
  img("021", "ppf"),
  img("034", "nano-ceramic"),
  img("041", "ppf"),
  img("050", "heat-isolation"),
  img("059", "colour-change"),
  img("065", "ppf"),
  img("072", "ppf"),
  img("088", "ppf"),
  img("095", "ppf"),
  img("100", "ppf"),
  img("105", "polishing"),
  img("107", "nano-ceramic"),
  img("116", "ppf"),
  img("123", "ppf", 1536, 2048),
  img("128", "heat-isolation", 1365, 2048),
  img("131", "ppf"),
  img("141", "ppf"),
  img("148", "ppf"),
  img("154", "ppf"),
  img("158", "ppf"),
  img("165", "ppf"),
  img("173", "ppf", 1536, 2048),
  img("176", "colour-change", 1536, 2048),
  img("182", "ppf", 1536, 2048),
  img("187", "ppf", 1536, 2048),
  img("196", "ppf", 1536, 2048),
  img("200", "ppf", 1536, 2048),
  img("213", "ppf", 1536, 2048),
  img("221", "ppf", 1536, 2048),
  img("225", "ppf", 1536, 2048),
  img("230", "nano-ceramic", 1536, 2048),
  img("232", "colour-change", 1536, 2048),
  img("234", "ppf", 1536, 2048),
  {
    id: "showreel",
    kind: "video",
    category: "video",
    src: "/videos/showreel.webm",
    srcMobile: "/videos/showreel-mobile.webm",
    aspect: "landscape",
  },
];

export const galleryCategories: Array<GalleryCategory | "all"> = [
  "all",
  "ppf",
  "heat-isolation",
  "colour-change",
  "nano-ceramic",
  "polishing",
  "building-heat-isolation",
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
