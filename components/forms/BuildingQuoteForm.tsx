"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { areasForRegion } from "@/content/buildingQuote";
import { regions, type RegionId } from "@/content/regions";
import { Button } from "@/components/ui/Button";
import { Label, Input, PhoneInput, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { generateRef } from "@/lib/ref";
import { readAttribution } from "@/lib/attribution";

type MeasureMode = "area" | "windows";

type Draft = {
  propertyType: "residential" | "commercial" | "";
  region: RegionId;
  area: string; // governorate or emirate id
  measureMode: MeasureMode;
  glazingArea: string;
  windowCount: string;
  windowDims: string;
  floors: string;
  glassType: "clear" | "tinted" | "double" | "unknown";
  problem: "heat" | "glare" | "bills" | "fading" | "";
  name: string;
  phone: string;
  whatsapp: string;
};

/**
 * Quotation request — NOT a booking, NOT a survey request. Captures enough
 * for a quote to be produced without a site visit; never asks for a car.
 *
 * Submit opens a prefilled wa.me deeplink. The body is built from the
 * ACTIVE locale's messages (/en sends English, / sends Arabic) and the
 * FIRST LINE is the quote marker, then measurements — it must never read
 * like a car booking to whoever triages the inbox. The line is picked by
 * the property's region (form selection), overriding the RegionPicker.
 */
export function BuildingQuoteForm() {
  const t = useTranslations("buildingQuote");
  const tChrome = useTranslations("chrome.region");

  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    propertyType: "",
    region: "egypt",
    area: "",
    measureMode: "area",
    glazingArea: "",
    windowCount: "",
    windowDims: "",
    floors: "",
    glassType: "unknown",
    problem: "",
    name: "",
    phone: "",
    whatsapp: "",
  });

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const [ref, setRef] = useState<string | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track("quote_start", { region: draft.region });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const measurementsOk =
    draft.measureMode === "area"
      ? draft.glazingArea.trim().length > 0
      : draft.windowCount.trim().length > 0 && draft.windowDims.trim().length > 0;

  const canSubmit =
    !!draft.propertyType &&
    !!draft.area &&
    measurementsOk &&
    draft.floors.trim().length > 0 &&
    !!draft.problem &&
    draft.name.trim().length > 1 &&
    draft.phone.trim().length >= 10;

  const buildWhatsAppUrl = (currentRef: string | null = ref) => {
    const areaKind = draft.region === "egypt" ? "governorates" : "emirates";
    // Quote marker first, ref on its own labelled line (Phase 18 item 6),
    // measurements immediately after — triage-proof.
    const lines = [
      t("wa.title"),
      ...(currentRef ? [`${t("wa.ref")}: ${currentRef}`] : []),
      ...(draft.measureMode === "area"
        ? [`${t("wa.area")}: ${draft.glazingArea} m²`]
        : [
            `${t("wa.windows")}: ${draft.windowCount}`,
            `${t("wa.dims")}: ${draft.windowDims}`,
          ]),
      `${t("wa.floors")}: ${draft.floors}`,
      `${t("wa.glass")}: ${t(`fields.glass${cap(draft.glassType)}`)}`,
      `${t("wa.property")}: ${t(
        draft.propertyType === "commercial"
          ? "fields.propertyCommercial"
          : "fields.propertyResidential",
      )}`,
      `${t("wa.location")}: ${t(`${areaKind}.${draft.area}`)} — ${tChrome(draft.region)}`,
      `${t("wa.problem")}: ${t(`fields.problem${cap(draft.problem)}`)}`,
      `${t("wa.name")}: ${draft.name}`,
      `${t("wa.phone")}: ${draft.phone}`,
      `${t("wa.whatsapp")}: ${draft.whatsapp || draft.phone}`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${regions[draft.region].whatsapp}?text=${text}`;
  };

  const logIntent = (currentRef: string) => {
    const entry = {
      ref: currentRef,
      kind: "quote" as const,
      at: new Date().toISOString(),
      region: draft.region,
      branch: null,
      service: "building-heat-isolation",
      locale: typeof document !== "undefined" ? document.documentElement.lang : undefined,
      attribution: readAttribution(),
      draft,
    };
    console.info("[building-quote] submit intent", entry);
    try {
      const key = "sk-building-quote-intents";
      const log = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      log.push(entry);
      localStorage.setItem(key, JSON.stringify(log.slice(-20)));
    } catch {
      // storage unavailable — console log above still fired
    }
  };

  const choiceButton = (selected: boolean) =>
    cn(
      "rounded-card border px-4 py-3 text-start text-body font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
      selected
        ? "border-sk-red bg-sk-red-muted text-fg"
        : "border-ink-700 bg-ink-800 text-fg-muted hover:border-fg-subtle hover:text-fg",
    );

  if (submitted) {
    return (
      <div className="max-w-xl space-y-4">
        <p
          role="status"
          className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-4"
        >
          {t("success")}
        </p>
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp:quote"
          onClick={() => track("whatsapp_click", { source: "quote", region: draft.region, ref: ref ?? undefined })}
          className="inline-flex items-center justify-center gap-2 rounded-card border border-ink-700 px-6 py-3 text-body font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
        >
          {t("reopenWhatsApp")}
        </a>
        {ref && (
          <p className="text-small text-fg-muted" dir="auto">
            {t("wa.ref")}: <span className="font-medium text-fg" dir="ltr">{ref}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="max-w-xl space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const newRef = generateRef();
        setRef(newRef);
        // PRIMARY conversion — fired BEFORE the WhatsApp handoff.
        track("quote_complete", { ref: newRef, region: draft.region, property_type: draft.propertyType });
        track("whatsapp_click", { source: "quote", region: draft.region, ref: newRef });
        logIntent(newRef);
        window.open(buildWhatsAppUrl(newRef), "_blank", "noopener,noreferrer");
        setSubmitted(true);
      }}
    >
      {/* Property type */}
      <fieldset>
        <legend className="text-body font-medium">
          {t("fields.propertyType")}
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["residential", "commercial"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => patch({ propertyType: v })}
              aria-pressed={draft.propertyType === v}
              className={choiceButton(draft.propertyType === v)}
            >
              {t(
                v === "commercial"
                  ? "fields.propertyCommercial"
                  : "fields.propertyResidential",
              )}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Region + governorate/emirate — decides which line gets the quote */}
      <fieldset>
        <legend className="text-body font-medium">{t("fields.region")}</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["egypt", "uae"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => patch({ region: id, area: "" })}
              aria-pressed={draft.region === id}
              className={choiceButton(draft.region === id)}
            >
              {tChrome(id)}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Label htmlFor="bq-area">
            {t(draft.region === "egypt" ? "fields.governorate" : "fields.emirate")}
          </Label>
          <Select
            id="bq-area"
            value={draft.area}
            onChange={(e) => patch({ area: e.target.value })}
          >
            <option value="" disabled />
            {areasForRegion(draft.region).map((id) => (
              <option key={id} value={id}>
                {t(
                  `${draft.region === "egypt" ? "governorates" : "emirates"}.${id}`,
                )}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      {/* Measurements — approximate is fine, the disclaimer says so */}
      <fieldset>
        <legend className="text-body font-medium">{t("fields.measure")}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["area", "windows"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => patch({ measureMode: mode })}
              aria-pressed={draft.measureMode === mode}
              className={choiceButton(draft.measureMode === mode)}
            >
              {t(mode === "area" ? "fields.modeArea" : "fields.modeWindows")}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          {draft.measureMode === "area" ? (
            <div>
              <Label htmlFor="bq-glazing">{t("fields.areaLabel")}</Label>
              <Input
                id="bq-glazing"
                type="number"
                min="1"
                inputMode="numeric"
                dir="ltr"
                value={draft.glazingArea}
                onChange={(e) => patch({ glazingArea: e.target.value })}
              />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="bq-count">{t("fields.windowsCountLabel")}</Label>
                <Input
                  id="bq-count"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  dir="ltr"
                  value={draft.windowCount}
                  onChange={(e) => patch({ windowCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bq-dims">{t("fields.windowsDimsLabel")}</Label>
                <Textarea
                  id="bq-dims"
                  rows={2}
                  placeholder={t("fields.windowsDimsHint")}
                  value={draft.windowDims}
                  onChange={(e) => patch({ windowDims: e.target.value })}
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="bq-floors">{t("fields.floorsLabel")}</Label>
            <Input
              id="bq-floors"
              type="number"
              min="1"
              inputMode="numeric"
              dir="ltr"
              value={draft.floors}
              onChange={(e) => patch({ floors: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bq-glass">{t("fields.glassTypeLabel")}</Label>
            <Select
              id="bq-glass"
              value={draft.glassType}
              onChange={(e) =>
                patch({ glassType: e.target.value as Draft["glassType"] })
              }
            >
              {(["unknown", "clear", "tinted", "double"] as const).map((v) => (
                <option key={v} value={v}>
                  {t(`fields.glass${cap(v)}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <p className="mt-4 max-w-prose text-small text-fg-subtle">
          {t("disclaimer")}
        </p>
      </fieldset>

      {/* Primary problem — no privacy option: TK-7099-IR is near-clear */}
      <fieldset>
        <legend className="text-body font-medium">{t("fields.problemLabel")}</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["heat", "glare", "bills", "fading"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => patch({ problem: v })}
              aria-pressed={draft.problem === v}
              className={choiceButton(draft.problem === v)}
            >
              {t(`fields.problem${cap(v)}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className="grid gap-4">
        <div>
          <Label htmlFor="bq-name">{t("fields.nameLabel")}</Label>
          <Input
            id="bq-name"
            autoComplete="name"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bq-phone">{t("fields.phoneLabel")}</Label>
          <PhoneInput
            id="bq-phone"
            value={draft.phone}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bq-whatsapp">{t("fields.whatsappLabel")}</Label>
          <PhoneInput
            id="bq-whatsapp"
            value={draft.whatsapp}
            onChange={(e) => patch({ whatsapp: e.target.value })}
          />
        </div>
      </fieldset>

      <Button type="submit" disabled={!canSubmit}>
        {t("submit")}
      </Button>
    </form>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
