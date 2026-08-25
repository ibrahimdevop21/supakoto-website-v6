"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { regions, type RegionId } from "@/content/regions";
import { Button } from "@/components/ui/Button";
import { Label, Input, PhoneInput } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { takeSessionRef, clearSessionRef } from "@/lib/forms/session-ref";
import { logIntent } from "@/lib/intent";
import { submitForm } from "@/lib/forms/submit";
import { refOnlyWhatsAppUrl } from "@/lib/forms/whatsapp";
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
 * this page stacks them in one form, exactly as before.
 *
 * 2026-08-25: submit emails the request (🏢 [BUILDING], identical body to
 * the wizard's building flow) and shows the SK-ref. quote_complete fires
 * only after a confirmed send. WhatsApp is an optional ref-only button on
 * success; on failure the full-body WhatsApp message (buildingQuoteLines)
 * is the fallback so the lead is never stranded.
 */
export function BuildingQuoteForm() {
  const t = useTranslations("buildingQuote");
  const tCommon = useTranslations("common");
  const tChrome = useTranslations("chrome.region");
  const locale = useLocale();

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [region, setRegion] = useState<RegionId>("egypt");
  const [details, setDetails] = useState<BuildingDetails>(emptyBuildingDetails);
  const [contact, setContact] = useState({ name: "", phone: "", whatsapp: "" });

  const patchDetails = (p: Partial<BuildingDetails>) => setDetails((d) => ({ ...d, ...p }));

  // One ref per browser session for this surface — survives reload, cleared on send.
  const [ref] = useState<string>(() => takeSessionRef("quote"));
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track("quote_start", { region, service: SERVICE_ID, source: "page" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit =
    buildingDetailsOk(details) && contact.name.trim().length > 1 && contact.phone.trim().length >= 10;

  /** Full-body WhatsApp message — the ERROR fallback (the email did not go). */
  const fullWhatsAppUrl = () => {
    const lines = buildingQuoteLines({ t, tChrome, details, region, ref, ...contact });
    return `https://wa.me/${regions[region].whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const whatsappLink = (href: string, label: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp:quote"
      onClick={() => track("whatsapp_click", { source: "quote", region, ref })}
      className="inline-flex items-center justify-center gap-2 rounded-card border border-ink-700 px-6 py-3 text-body font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
    >
      {label}
    </a>
  );

  if (status === "sent") {
    return (
      <div className="max-w-xl space-y-4">
        <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-4">
          {t("success")}
        </p>
        <p className="text-small text-fg-muted" dir="auto">
          {t("wa.ref")}: <span className="font-medium text-fg" dir="ltr">{ref}</span>
        </p>
        <p className="text-small text-fg-muted">{tCommon("keepRef")}</p>
        <p className="text-small text-fg-muted">{tCommon("whatsappOptional")}</p>
        {whatsappLink(refOnlyWhatsAppUrl(region, ref, locale), tCommon("continueOnWhatsApp"))}
      </div>
    );
  }

  return (
    <form
      className="max-w-xl space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit || status === "sending") return;
        setStatus("sending");
        try {
          await submitForm({
            form: "quote",
            ref,
            fields: {
              service: SERVICE_ID,
              region,
              ...details,
              ...contact,
              source: "page",
            },
          });
        } catch {
          setStatus("error");
          return;
        }
        // PRIMARY conversion — fired only after a confirmed send.
        track("quote_complete", {
          ref,
          region,
          property_type: details.propertyType,
          service: SERVICE_ID,
          source: "page",
        });
        logIntent("quote", {
          ref,
          region,
          branch: null,
          service: SERVICE_ID,
          draft: { region, ...details, ...contact },
        });
        clearSessionRef("quote");
        setStatus("sent");
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

      <div className="space-y-3">
        <Button type="submit" disabled={!canSubmit || status === "sending"}>
          {status === "sending" ? tCommon("formSending") : t("submit")}
        </Button>
        {status === "error" && (
          <div className="space-y-3">
            <p role="alert" className="rounded-card border border-ink-700 bg-ink-900 px-4 py-3 text-fg-muted">
              {tCommon("formError")}
            </p>
            {whatsappLink(fullWhatsAppUrl(), tCommon("sendOnWhatsApp"))}
          </div>
        )}
      </div>
    </form>
  );
}
