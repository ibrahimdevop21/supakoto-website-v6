import type { ServiceId } from "./services";

/**
 * Gallery items. All media are PLACEHOLDERS until real assets land —
 * see docs/progress/ASSETS-NEEDED.md. Captions: gallery.items.<id>.caption.
 */

export type GalleryCategory = ServiceId | "video";

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  /** Placeholder until real media lands. */
  placeholder: true;
  aspect: "square" | "portrait" | "landscape";
};

export const galleryItems: GalleryItem[] = [
  { id: "g1", category: "ppf", placeholder: true, aspect: "landscape" },
  { id: "g2", category: "ppf", placeholder: true, aspect: "portrait" },
  { id: "g3", category: "nano-ceramic", placeholder: true, aspect: "square" },
  { id: "g4", category: "heat-isolation", placeholder: true, aspect: "landscape" },
  { id: "g5", category: "colour-change", placeholder: true, aspect: "portrait" },
  { id: "g6", category: "ppf", placeholder: true, aspect: "square" },
  { id: "g7", category: "polishing", placeholder: true, aspect: "landscape" },
  { id: "g8", category: "nano-ceramic", placeholder: true, aspect: "portrait" },
  { id: "g9", category: "colour-change", placeholder: true, aspect: "square" },
  { id: "g10", category: "video", placeholder: true, aspect: "landscape" },
  { id: "g11", category: "heat-isolation", placeholder: true, aspect: "square" },
  { id: "g12", category: "video", placeholder: true, aspect: "landscape" },
];

export const galleryCategories: Array<GalleryCategory | "all"> = [
  "all",
  "ppf",
  "heat-isolation",
  "colour-change",
  "nano-ceramic",
  "polishing",
  "video",
];
