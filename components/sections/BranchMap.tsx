"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Map as LeafletMap } from "leaflet";
import { branches } from "@/content/branches";
import { useRegion } from "@/components/providers/RegionProvider";
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
        const maps = `https://www.google.com/maps/search/?api=1&query=${b.coords.lat},${b.coords.lng}`;
        const approx = b.coords.approximate
          ? `<div class="sk-popup-note">${t("map.approx")}</div>`
          : "";
        const popup = `
          <div dir="${dir}" class="sk-popup">
            <strong>${name}</strong>
            <div>${address}</div>
            ${approx}
            <div class="sk-popup-links">
              <a href="tel:${b.phone.replace(/\s/g, "")}" dir="ltr">${b.phone}</a>
              <a href="https://wa.me/${b.whatsapp}" target="_blank" rel="noopener noreferrer">${t("whatsapp")}</a>
              <a href="${maps}" target="_blank" rel="noopener noreferrer">${t("directions")}</a>
            </div>
          </div>`;
        L.marker([b.coords.lat, b.coords.lng], { icon })
          .addTo(map)
          .bindPopup(popup);
      }

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
