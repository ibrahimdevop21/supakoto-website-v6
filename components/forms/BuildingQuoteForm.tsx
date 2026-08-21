"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { regions, type RegionId } from "@/content/regions";
import { Button } from "@/components/ui/Button";
import { Label, Input, PhoneInput } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { generateRef } from "@/lib/ref";
import { logIntent } from "@/lib/intent";
import {
  PropertyStep,
  LocationStep,
  MeasurementsStep,
  ProblemStep,
} from "./building/steps";
import { buildingDetailsOk, emptyBuildingDetails, type BuildingDetails } from "./building/types";
import { buildingQuoteLines } from "./building/message";

const SERVICE_ID = "building-heat-isolation";

/**
 * Quotation request — NOT a booking, NOT a survey request. Captures enough
 * for a quote to be produced without a site visit; never asks for a car.
 *
 * Phase 19: the question groups live in ./building/steps.tsx and are the
 * same components the booking wizard pages through one screen at a time —
 * this page stacks them in one form, exactly as before. Both paths build
 * the WhatsApp body with buildingQuoteLines(), so the inbox sees one
 * message shape whichever door the customer came in by.
 *
 * Submit opens a prefilled wa.me deeplink. The body is built from the
 * ACTIVE locale's messages (/en sends English, / sends Arabic). The line
 * is picked by the property's region (form selection), overriding the
 * RegionPicker.
 */
export function BuildingQuoteForm() {
  const t = useTranslations("buildingQuote");
  const tChrome = useTranslations("chrome.region");

  const [submitted, setSubmitted] = useState(false);
  const [region, setRegion] = useState<RegionId>("egypt");
  const [details, setDetails] = useState<BuildingDetails>(emptyBuildingDetails);
  const [contact, setContact] = useState({ name: "", phone: "", whatsapp: "" });

  const patchDetails = (p: Partial<BuildingDetails>) => setDetails((d) => ({ ...d, ...p }));

  const [ref, setRef] = useState<string | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track("quote_start", { region, service: SERVICE_ID, source: "page" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit =
    buildingDetailsOk(details) && contact.name.trim().length > 1 && contact.phone.trim().length >= 10;

  const buildWhatsAppUrl = (currentRef: string | null = ref) => {
    const lines = buildingQuoteLines({ t, tChrome, details, region, ref: currentRef, ...contact });
    return `https://wa.me/${regions[region].whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  if (submitted) {
    return (
      <div className="max-w-xl space-y-4">
        <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-4">
          {t("success")}
        </p>
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp:quote"
          onClick={() => track("whatsapp_click", { source: "quote", region, ref: ref ?? undefined })}
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
        track("quote_complete", {
          ref: newRef,
          region,
          property_type: details.propertyType,
          service: SERVICE_ID,
          source: "page",
        });
        track("whatsapp_click", { source: "quote", region, ref: newRef });
        logIntent("quote", {
          ref: newRef,
          region,
          branch: null,
          service: SERVICE_ID,
          draft: { region, ...details, ...contact },
        });
        window.open(buildWhatsAppUrl(newRef), "_blank", "noopener,noreferrer");
        setSubmitted(true);
      }}
    >
      <PropertyStep details={details} onChange={patchDetails} />
      {/* Region + governorate/emirate — decides which line gets the quote */}
      <LocationStep
        details={details}
        onChange={patchDetails}
        region={region}
        onRegionChange={setRegion}
      />
      <MeasurementsStep details={details} onChange={patchDetails} />
      <ProblemStep details={details} onChange={patchDetails} />

      {/* Contact */}
      <fieldset className="grid gap-4">
        <div>
          <Label htmlFor="bq-name">{t("fields.nameLabel")}</Label>
          <Input
            id="bq-name"
            autoComplete="name"
            value={contact.name}
            onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="bq-phone">{t("fields.phoneLabel")}</Label>
          <PhoneInput
            id="bq-phone"
            value={contact.phone}
            onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="bq-whatsapp">{t("fields.whatsappLabel")}</Label>
          <PhoneInput
            id="bq-whatsapp"
            value={contact.whatsapp}
            onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
          />
        </div>
      </fieldset>

      <Button type="submit" disabled={!canSubmit}>
        {t("submit")}
      </Button>
    </form>
  );
}
