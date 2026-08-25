"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { branchesForRegion, branchHours, timeSlotsFor } from "@/content/branches";
import { services, type ServiceId, type Substrate } from "@/content/services";
import { regions, type RegionId } from "@/content/regions";
import { useRegion } from "@/components/providers/RegionProvider";
import { Button } from "@/components/ui/Button";
import { Label, Input, PhoneInput, Textarea } from "@/components/ui/Field";
import { choiceClass } from "@/components/forms/choice";
import { DatePicker } from "@/components/forms/DatePicker";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { track, type Flow } from "@/lib/analytics";
import { generateRef } from "@/lib/ref";
import { logIntent } from "@/lib/intent";
import { submitForm } from "@/lib/forms/submit";
import { refOnlyWhatsAppUrl } from "@/lib/forms/whatsapp";
import {
  PropertyStep,
  LocationStep,
  MeasurementsStep,
  ProblemStep,
} from "./building/steps";
import {
  emptyBuildingDetails,
  locationOk,
  measurementsOk,
  problemOk,
  propertyOk,
  type BuildingDetails,
} from "./building/types";
import { buildingQuoteLines } from "./building/message";

/**
 * Which flow each substrate enters. Exhaustive over Substrate by type —
 * a new substrate in content/services.ts fails to compile until it is
 * routed here; scripts/check-wizard-services.mjs enforces the same at
 * build time and that every service (not a filtered subset) is offered.
 */
const FLOW_OF = {
  vehicle: "vehicle",
  building: "building",
  marine: "enquiry",
  interior: "enquiry",
} as const satisfies Record<Substrate, Flow>;

const FLOWS = {
  // Existing booking: branch, car, slot, contact.
  vehicle: ["service", "region", "branch", "car", "date", "time", "contact", "confirm"],
  // Quote from measurements — no branch, no date, no car: the work happens
  // at the property and scheduling follows the quote.
  building: ["service", "region", "property", "location", "measurements", "problem", "contact", "confirm"],
  // Marine / interior: TAKAI product unconfirmed, so we ask for nothing we
  // cannot quote against — a free-text line and a way to reach them.
  enquiry: ["service", "region", "details", "contact", "confirm"],
} as const satisfies Record<Flow, readonly string[]>;

type Step = (typeof FLOWS)[Flow][number];

/** Groups on the first screen, in display order. */
const GROUPS: Array<{ key: "vehicle" | "building" | "pending"; substrates: Substrate[] }> = [
  { key: "vehicle", substrates: ["vehicle"] },
  { key: "building", substrates: ["building"] },
  { key: "pending", substrates: ["marine", "interior"] },
];

type Draft = {
  serviceId: ServiceId | "";
  region: RegionId;
  branchId: string;
  make: string;
  model: string;
  date: string;
  time: string;
  building: BuildingDetails;
  details: string;
  name: string;
  phone: string;
};

/**
 * One question per screen, per spec. Step 1 is the service — the flows
 * diverge there (Ibrahim, 2026-08-21): cars book a slot at a branch,
 * buildings request a quote from measurements, marine/interior send an
 * enquiry. Country is asked in every flow: it decides the WhatsApp line.
 *
 * Submit opens a prefilled wa.me deeplink to the chosen region's line.
 * The message body is built from the ACTIVE locale's messages — /en sends
 * English, / sends Arabic — same field order both ways (Ibrahim,
 * 2026-08-07; same rule as the buildings quote form). Intent is logged
 * client-side (lib/intent.ts).
 *
 * TODO(post-launch): replace the WhatsApp handoff with the real bdm-flow
 * write path — the RPC contract and its mismatches (auth-only, date-only,
 * UUID branch ids) are documented in docs/progress/05-pages.md.
 */
export function BookingWizard() {
  const t = useTranslations("booking");
  const tQuote = useTranslations("buildingQuote");
  const tChrome = useTranslations("chrome.region");
  const tBranches = useTranslations("branches");
  const tServices = useTranslations("services.items");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { region } = useRegion();
  const reduce = useReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [draft, setDraft] = useState<Draft>({
    serviceId: "",
    region: region.id,
    branchId: "",
    make: "",
    model: "",
    date: "",
    time: "",
    building: emptyBuildingDetails,
    details: "",
    name: "",
    phone: "",
  });

  const service = services.find((s) => s.id === draft.serviceId);
  const flow: Flow | null = service ? FLOW_OF[service.substrate] : null;
  const steps: readonly Step[] = flow ? FLOWS[flow] : ["service"];
  const step: Step = steps[stepIndex];
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const patchBuilding = (p: Partial<BuildingDetails>) =>
    setDraft((d) => ({ ...d, building: { ...d.building, ...p } }));

  // One ref per visitor session, reused across retries so the inbox never
  // sees two refs for one customer (Ibrahim, 2026-08-25).
  const [ref] = useState<string>(() => generateRef());

  // Funnel top per flow, once, at the moment the flow is chosen.
  const startedFlows = useRef(new Set<Flow>());
  const selectService = (id: ServiceId) => {
    patch({ serviceId: id });
    const f = FLOW_OF[services.find((s) => s.id === id)!.substrate];
    if (startedFlows.current.has(f)) return;
    startedFlows.current.add(f);
    if (f === "vehicle") track("booking_start", { region: draft.region, service: id });
    else if (f === "building") track("quote_start", { region: draft.region, service: id, source: "wizard" });
    else track("enquiry_start", { region: draft.region, service: id });
  };

  // booking_step on every step shown (flow known from step 2 on).
  useEffect(() => {
    track("booking_step", {
      step: stepIndex + 1,
      step_name: step,
      region: draft.region,
      ...(flow ? { flow } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const serviceName = draft.serviceId ? tServices(`${draft.serviceId}.name`) : "";
  const slotLabel = `${draft.date} - ${draft.time} (${t("teamConfirms")})`;

  const buildWhatsAppUrl = (currentRef: string | null = ref): string => {
    let lines: string[];
    if (flow === "building") {
      lines = buildingQuoteLines({
        t: tQuote,
        tChrome,
        details: draft.building,
        region: draft.region,
        ref: currentRef,
        name: draft.name,
        phone: draft.phone,
      });
    } else if (flow === "enquiry") {
      lines = [
        t("waEnquiryTitle", { service: serviceName }),
        ...(currentRef ? [`${t("waRef")}: ${currentRef}`] : []),
        `${t("summary.region")}: ${tChrome(draft.region)}`,
        `${t("summary.service")}: ${serviceName}`,
        ...(draft.details.trim() ? [`${t("summary.details")}: ${draft.details.trim()}`] : []),
        `${t("steps.contact.nameLabel")}: ${draft.name}`,
        `${t("steps.contact.phoneLabel")}: ${draft.phone}`,
      ];
    } else {
      lines = [
        t("waTitle"),
        // Ref on its own clearly-labelled line, right under the title, so
        // whoever answers sees and records it (Phase 18 item 6).
        ...(currentRef ? [`${t("waRef")}: ${currentRef}`] : []),
        `${t("summary.region")}: ${tChrome(draft.region)}`,
        `${t("summary.branch")}: ${draft.branchId ? tBranches(`items.${draft.branchId}.name`) : ""}`,
        `${t("summary.service")}: ${serviceName}`,
        `${t("summary.car")}: ${draft.make} ${draft.model}`.trim(),
        `${t("summary.datetime")}: ${slotLabel}`,
        `${t("steps.contact.nameLabel")}: ${draft.name}`,
        `${t("steps.contact.phoneLabel")}: ${draft.phone}`,
      ];
    }
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${regions[draft.region].whatsapp}?text=${text}`;
  };

  const canContinue: Record<Step, boolean> = {
    service: !!draft.serviceId,
    region: !!draft.region,
    branch: !!draft.branchId,
    car: draft.make.trim().length > 0 && draft.model.trim().length > 0,
    date: !!draft.date,
    time: !!draft.time,
    property: propertyOk(draft.building),
    location: locationOk(draft.building),
    measurements: measurementsOk(draft.building),
    problem: problemOk(draft.building),
    details: true,
    contact: draft.name.trim().length > 1 && draft.phone.trim().length >= 10,
    confirm: true,
  };

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const regionBranches = branchesForRegion(draft.region);
  const branch = regionBranches.find((b) => b.id === draft.branchId);
  // Hourly requests within the branch's hours (DEFAULT_HOURS until ops
  // confirms). Nothing is unavailable yet — capacity lives in bdm-flow and
  // the form does not talk to it; when it does, mark slots disabled here
  // rather than hiding them so the customer still sees the shape of the day.
  const slots = branch ? timeSlotsFor(branch) : [];
  const unavailable = new Set<string>(); // bdm-flow capacity, when it arrives

  // Per-flow wording: the sale is different, so the CTA and the success line are.
  const waSource = flow === "building" ? "quote" : flow === "enquiry" ? "enquiry" : "booking";
  const confirmLabel =
    flow === "building"
      ? t("steps.confirm.confirmQuote")
      : flow === "enquiry"
        ? t("steps.confirm.confirmEnquiry")
        : t("steps.confirm.confirmButton");
  const successText =
    flow === "building" ? t("successQuote") : flow === "enquiry" ? t("successEnquiry") : t("success");

  /** The email body's fields — stable keys the API route labels in English. */
  const submissionFields = (): Record<string, string> => {
    const base = { service: draft.serviceId, region: draft.region, name: draft.name, phone: draft.phone };
    if (flow === "building") return { ...base, ...draft.building, source: "wizard" };
    if (flow === "enquiry") return { ...base, details: draft.details };
    return {
      ...base,
      branch: draft.branchId,
      make: draft.make,
      model: draft.model,
      date: draft.date,
      time: draft.time,
    };
  };

  const whatsappLink = (href: string, label: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track={`whatsapp:${waSource}`}
      onClick={() =>
        track("whatsapp_click", {
          source: waSource,
          region: draft.region,
          ...(flow === "vehicle" ? { branch: draft.branchId } : {}),
          ref,
        })
      }
      className="inline-flex items-center justify-center gap-2 rounded-card border border-ink-700 px-6 py-3 text-body font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
    >
      {label}
    </a>
  );

  const submit = async () => {
    if (!flow || !draft.serviceId || status === "sending") return;
    setStatus("sending");
    // Email is the record. Nothing below runs unless the send is confirmed —
    // a failed send must never count as a Lead (Phase 21 lesson, re-locked
    // 2026-08-25).
    try {
      await submitForm({
        form: flow === "vehicle" ? "booking" : flow === "building" ? "quote" : "enquiry",
        ref,
        fields: submissionFields(),
      });
    } catch {
      setStatus("error");
      return;
    }
    // PRIMARY conversion — fired only after a confirmed send. eventID = ref.
    if (flow === "vehicle") {
      track("booking_complete", {
        ref,
        region: draft.region,
        branch: draft.branchId,
        service: draft.serviceId,
      });
    } else if (flow === "building") {
      track("quote_complete", {
        ref,
        region: draft.region,
        property_type: draft.building.propertyType,
        service: draft.serviceId,
        source: "wizard",
      });
    } else {
      track("enquiry_complete", { ref, region: draft.region, service: draft.serviceId });
    }
    logIntent(waSource, {
      ref,
      region: draft.region,
      branch: flow === "vehicle" ? draft.branchId : null,
      service: draft.serviceId,
      draft,
    });
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="max-w-xl space-y-4">
        <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-4">
          {successText}
        </p>
        <p className="text-small text-fg-muted" dir="auto">
          {t("waRef")}: <span className="font-medium text-fg" dir="ltr">{ref}</span>
        </p>
        <p className="text-small text-fg-muted">{tCommon("keepRef")}</p>
        <p className="text-small text-fg-muted">{tCommon("whatsappOptional")}</p>
        {/* Optional acceleration, ref-only: both channels reconcile on one identifier. */}
        {whatsappLink(refOnlyWhatsAppUrl(draft.region, ref, locale), tCommon("continueOnWhatsApp"))}
      </div>
    );
  }

  const summaryRows: Array<[string, string]> =
    flow === "building"
      ? [
          ["service", serviceName],
          ["region", tChrome(draft.region)],
          [
            "property",
            draft.building.propertyType
              ? tQuote(
                  draft.building.propertyType === "commercial"
                    ? "fields.propertyCommercial"
                    : "fields.propertyResidential",
                )
              : "",
          ],
          [
            "location",
            draft.building.area
              ? tQuote(`${draft.region === "egypt" ? "governorates" : "emirates"}.${draft.building.area}`)
              : "",
          ],
          [
            "measurements",
            draft.building.measureMode === "area"
              ? `${draft.building.glazingArea} m² · ${tQuote("wa.floors")} ${draft.building.floors}`
              : `${tQuote("wa.windows")} ${draft.building.windowCount} · ${tQuote("wa.floors")} ${draft.building.floors}`,
          ],
          [
            "problem",
            draft.building.problem
              ? tQuote(`fields.problem${draft.building.problem.charAt(0).toUpperCase()}${draft.building.problem.slice(1)}`)
              : "",
          ],
        ]
      : flow === "enquiry"
        ? [
            ["service", serviceName],
            ["region", tChrome(draft.region)],
            ["details", draft.details.trim() || "—"],
          ]
        : [
            ["service", serviceName],
            ["region", tChrome(draft.region)],
            ["branch", draft.branchId ? tBranches(`items.${draft.branchId}.name`) : ""],
            ["car", `${draft.make} ${draft.model}`.trim()],
            ["datetime", `${draft.date} · ${draft.time} (${t("teamConfirms")})`],
          ];

  return (
    <div className="max-w-xl">
      {/* Progress — from step 2: the total depends on the service chosen on step 1 */}
      {flow && (
        <div className="mb-8">
          <p className="text-small text-fg-muted">
            {t("progress", { current: stepIndex + 1, total: steps.length })}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
            <div
              className="h-full bg-sk-red transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <h2 className="text-h2 font-display font-bold">{t(`steps.${step}.title`)}</h2>
          <p className="mt-2 text-small text-fg-muted">{t(`steps.${step}.hint`)}</p>

          <div className="mt-6">
            {step === "service" && (
              <div className="grid gap-6">
                {GROUPS.map((group) => {
                  const items = services.filter((s) => group.substrates.includes(s.substrate));
                  if (items.length === 0) return null;
                  return (
                    <div key={group.key}>
                      <p className="mb-3 text-eyebrow text-fg-subtle">{t(`serviceGroups.${group.key}`)}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectService(s.id)}
                            aria-pressed={draft.serviceId === s.id}
                            className={choiceClass(draft.serviceId === s.id)}
                          >
                            {tServices(`${s.id}.name`)}
                            <span className="mt-1 block text-small font-normal text-fg-subtle">
                              {t(`serviceKinds.${FLOW_OF[s.substrate]}`)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step === "region" && (
              <div className="grid grid-cols-2 gap-3">
                {(["egypt", "uae"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      patch({ region: id, branchId: "" });
                      patchBuilding({ area: "" });
                    }}
                    aria-pressed={draft.region === id}
                    className={choiceClass(draft.region === id)}
                  >
                    {tChrome(id)}
                  </button>
                ))}
              </div>
            )}

            {step === "branch" && (
              <div className="grid gap-3">
                {regionBranches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => patch({ branchId: b.id })}
                    aria-pressed={draft.branchId === b.id}
                    className={choiceClass(draft.branchId === b.id)}
                  >
                    {tBranches(`items.${b.id}.name`)}
                    <span className="mt-1 block text-small font-normal text-fg-subtle">
                      {tBranches(`items.${b.id}.address`)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === "car" && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bk-make">{t("steps.car.makeLabel")}</Label>
                  <Input id="bk-make" value={draft.make} onChange={(e) => patch({ make: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="bk-model">{t("steps.car.modelLabel")}</Label>
                  <Input id="bk-model" value={draft.model} onChange={(e) => patch({ model: e.target.value })} />
                </div>
              </div>
            )}

            {step === "date" && (
              <DatePicker id="bk-date" value={draft.date} onChange={(iso) => patch({ date: iso, time: "" })} />
            )}

            {step === "time" && branch && (
              <div>
                <p className="mb-3 text-small text-fg-subtle">
                  {t("steps.time.hours")}{" "}
                  <span dir="ltr" className="tabular-nums">
                    {branchHours(branch).open}–{branchHours(branch).close}
                  </span>
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      disabled={unavailable.has(slot)}
                      onClick={() => patch({ time: slot })}
                      aria-pressed={draft.time === slot}
                      className={cn(
                        choiceClass(draft.time === slot),
                        "text-center tabular-nums disabled:cursor-not-allowed disabled:opacity-40",
                      )}
                      dir="ltr"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-small text-fg-subtle">{t("steps.time.request")}</p>
              </div>
            )}

            {step === "property" && (
              <PropertyStep details={draft.building} onChange={patchBuilding} legend={false} />
            )}
            {step === "location" && (
              <LocationStep
                details={draft.building}
                onChange={patchBuilding}
                region={draft.region}
                legend={false}
                idPrefix="bk"
              />
            )}
            {step === "measurements" && (
              <MeasurementsStep
                details={draft.building}
                onChange={patchBuilding}
                legend={false}
                idPrefix="bk"
              />
            )}
            {step === "problem" && (
              <ProblemStep details={draft.building} onChange={patchBuilding} legend={false} />
            )}

            {step === "details" && (
              <div>
                <Label htmlFor="bk-details">{t("steps.details.label")}</Label>
                <Textarea
                  id="bk-details"
                  rows={4}
                  maxLength={500}
                  value={draft.details}
                  onChange={(e) => patch({ details: e.target.value })}
                />
              </div>
            )}

            {step === "contact" && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bk-name">{t("steps.contact.nameLabel")}</Label>
                  <Input
                    id="bk-name"
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bk-phone">{t("steps.contact.phoneLabel")}</Label>
                  <PhoneInput
                    id="bk-phone"
                    value={draft.phone}
                    onChange={(e) => patch({ phone: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === "confirm" && (
              <dl className="divide-y divide-ink-700 rounded-card border border-ink-700 bg-ink-800">
                {summaryRows.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="shrink-0 text-small text-fg-muted">{t(`summary.${key}`)}</dt>
                    <dd className="text-end text-small font-medium" dir="auto">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3">
            {stepIndex > 0 && (
              <Button variant="ghost" onClick={back}>
                {t("back")}
              </Button>
            )}
            {step === "confirm" ? (
              <Button data-track={`${waSource}:confirm`} onClick={submit} disabled={status === "sending"}>
                {status === "sending" ? tCommon("formSending") : confirmLabel}
              </Button>
            ) : (
              <Button onClick={next} disabled={!canContinue[step]}>
                {t("next")}
              </Button>
            )}
          </div>
          {step === "confirm" && status === "error" && (
            <div className="mt-4 space-y-3">
              <p role="alert" className="rounded-card border border-ink-700 bg-ink-900 px-4 py-3 text-fg-muted">
                {tCommon("formError")}
              </p>
              {/* The email did not go, so the fallback carries the FULL request. */}
              {whatsappLink(buildWhatsAppUrl(ref), tCommon("sendOnWhatsApp"))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
