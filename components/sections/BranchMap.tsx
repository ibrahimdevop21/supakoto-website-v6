"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Map as LeafletMap } from "leaflet";
import { branches, directionsUrl } from "@/content/branches";
import { useRegion } from "@/components/providers/RegionProvider";
import { track } from "@/lib/analytics";
import "leaflet/dist/leaflet.css";

/**
 * Interactive map of ALL branches (both regions always pinned). Leaflet +
 * dark Carto tiles — no API key. Markers are brand-red divIcons (no image
 * assets). Region switch reframes the view to that region's branches.
 * Coordinates: see content/branches.ts — two pins are approximate until
 * ops confirms.
 */
export function BranchMap() {
  const t = useTranslations("branches");
  const locale = useLocale();
  const { region } = useRegion();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Init once, client-only (leaflet touches window at import-use time).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 18,
        },
      ).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: '<span class="sk-map-pin" aria-hidden="true"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12],
      });

      for (const b of branches) {
        const name = t(`items.${b.id}.name`);
        const address = t(`items.${b.id}.address`);
        const dir = locale === "ar" ? "rtl" : "ltr";
        const maps = directionsUrl(b);
        const approx = b.coords.approximate
          ? `<div class="sk-popup-note">${t("map.approx")}</div>`
          : "";
        const popup = `
          <div dir="${dir}" class="sk-popup">
            <strong>${name}</strong>
            <div>${address}</div>
            ${approx}
            <div class="sk-popup-links">
              <a href="tel:${b.phone.replace(/\s/g, "")}" dir="ltr" data-track="call:branch_map" data-branch="${b.id}">${b.phone}</a>
              <a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener noreferrer" data-track="whatsapp:branch_map" data-branch="${b.id}" data-region="${b.region}">${t("whatsapp")}</a>
              <a href="${maps}" target="_blank" rel="noopener noreferrer" data-track="directions:branch_map" data-branch="${b.id}">${t("directions")}</a>
            </div>
          </div>`;
        L.marker([b.coords.lat, b.coords.lng], { icon })
          .addTo(map)
          .bindPopup(popup)
          .on("popupopen", () => track("branch_view", { branch: b.id, action: "map_popup" }));
      }

      // Popup links are innerHTML strings — delegate their clicks to the
      // analytics module so map tel:/wa.me links are never untracked.
      containerRef.current.addEventListener("click", (e) => {
        const a = (e.target as Element | null)?.closest?.("a[data-track]") as HTMLAnchorElement | null;
        if (!a) return;
        const branch = a.dataset.branch ?? "";
        const kind = a.dataset.track?.split(":")[0];
        if (kind === "call") {
          track("call_click", { branch, source: "branch_map" });
          track("branch_view", { branch, action: "call" });
        } else if (kind === "whatsapp") {
          track("whatsapp_click", { source: "branch_map", branch, region: a.dataset.region });
          track("branch_view", { branch, action: "whatsapp" });
        } else if (kind === "directions") {
          track("branch_view", { branch, action: "directions" });
        }
      });

      mapRef.current = map;
      fitRegion(map, region.id, false);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reframe when the region changes.
  useEffect(() => {
    if (mapRef.current) fitRegion(mapRef.current, region.id, true);
  }, [region.id]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={t("map.ariaLabel")}
      className="h-105 w-full overflow-hidden rounded-card border border-ink-700 bg-paper"
    />
  );
}

function fitRegion(map: LeafletMap, regionId: string, animate: boolean) {
  const list = branches.filter((b) => b.region === regionId);
  const points = (list.length > 0 ? list : branches).map(
    (b) => [b.coords.lat, b.coords.lng] as [number, number],
  );
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  map.fitBounds(points, {
    padding: [48, 48],
    maxZoom: 11,
    animate: animate && !reduce,
  });
}
