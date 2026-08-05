"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { branchesForRegion } from "@/content/branches";
import { services } from "@/content/services";
import { regions, type RegionId } from "@/content/regions";
import { useRegion } from "@/components/providers/RegionProvider";
import arMessages from "@/messages/ar.json";
import { Button } from "@/components/ui/Button";
import { Label, Input, PhoneInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

const STEPS = [
  "region",
  "branch",
  "service",
  "car",
  "date",
  "time",
  "contact",
  "confirm",
] as const;

type Step = (typeof STEPS)[number];

const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type Draft = {
  region: RegionId;
  branchId: string;
  serviceId: string;
  make: string;
  model: string;
  date: string;
  time: string;
  name: string;
  phone: string;
};

/**
 * One question per screen, per spec.
 *
 * Submit opens a prefilled wa.me deeplink to the chosen region's line with
 * the answers as an ARABIC message body (always Arabic — labels read from
 * messages/ar.json directly so the body stays Arabic in the /en locale
 * too). Intent is logged client-side.
 *
 * TODO(post-launch): replace the WhatsApp handoff with the real bdm-flow
 * write path — the RPC contract and its mismatches (auth-only, date-only,
 * UUID branch ids) are documented in docs/progress/05-pages.md.
 */
const AR = arMessages.booking;
const AR_BRANCHES = arMessages.branches.items as Record<
  string,
  { name: string }
>;
const AR_SERVICES = arMessages.services.items as Record<
  string,
  { name: string }
>;

function buildWhatsAppUrl(draft: Draft): string {
  const arRegion =
    draft.region === "egypt"
      ? arMessages.chrome.region.egypt
      : arMessages.chrome.region.uae;
  const lines = [
    "حجز جديد من الموقع:",
    `${AR.summary.region}: ${arRegion}`,
    `${AR.summary.branch}: ${AR_BRANCHES[draft.branchId]?.name ?? ""}`,
    `${AR.summary.service}: ${AR_SERVICES[draft.serviceId]?.name ?? ""}`,
    `${AR.summary.car}: ${draft.make} ${draft.model}`.trim(),
    `${AR.summary.datetime}: ${draft.date} - ${draft.time}`,
    `${AR.steps.contact.nameLabel}: ${draft.name}`,
    `${AR.steps.contact.phoneLabel}: ${draft.phone}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${regions[draft.region].whatsapp}?text=${text}`;
}

function logIntent(draft: Draft) {
  const entry = { ...draft, at: new Date().toISOString() };
  console.info("[booking] submit intent", entry);
  try {
    const key = "sk-booking-intents";
    const log = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    log.push(entry);
    localStorage.setItem(key, JSON.stringify(log.slice(-20)));
  } catch {
    // storage unavailable (private mode) — console log above still fired
  }
}

export function BookingWizard() {
  const t = useTranslations("booking");
  const tChrome = useTranslations("chrome.region");
  const tBranches = useTranslations("branches");
  const tServices = useTranslations("services.items");
  const { region } = useRegion();
  const reduce = useReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    region: region.id,
    branchId: "",
    serviceId: "",
    make: "",
    model: "",
    date: "",
    time: "",
    name: "",
    phone: "",
  });

  const step: Step = STEPS[stepIndex];
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const canContinue: Record<Step, boolean> = {
    region: !!draft.region,
    branch: !!draft.branchId,
    service: !!draft.serviceId,
    car: draft.make.trim().length > 0 && draft.model.trim().length > 0,
    date: !!draft.date,
    time: !!draft.time,
    contact: draft.name.trim().length > 1 && draft.phone.trim().length >= 10,
    confirm: true,
  };

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const regionBranches = branchesForRegion(draft.region);

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
        <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-4">
          {t("success")}
        </p>
        <a
          href={buildWhatsAppUrl(draft)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-card border border-ink-700 px-6 py-3 text-body font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
        >
          {t("reopenWhatsApp")}
        </a>
        <p className="text-small text-fg-subtle">{t("stub")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Progress */}
      <div className="mb-8">
        <p className="text-small text-fg-muted">
          {t("progress", { current: stepIndex + 1, total: STEPS.length })}
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full bg-sk-red transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <h2 className="text-h2 font-display font-bold">
            {t(`steps.${step}.title`)}
          </h2>
          <p className="mt-2 text-small text-fg-muted">
            {t(`steps.${step}.hint`)}
          </p>

          <div className="mt-6">
            {step === "region" && (
              <div className="grid grid-cols-2 gap-3">
                {(["egypt", "uae"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch({ region: id, branchId: "" })}
                    aria-pressed={draft.region === id}
                    className={choiceButton(draft.region === id)}
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
                    className={choiceButton(draft.branchId === b.id)}
                  >
                    {tBranches(`items.${b.id}.name`)}
                    <span className="mt-1 block text-small font-normal text-fg-subtle">
                      {tBranches(`items.${b.id}.address`)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === "service" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => patch({ serviceId: s.id })}
                    aria-pressed={draft.serviceId === s.id}
                    className={choiceButton(draft.serviceId === s.id)}
                  >
                    {tServices(`${s.id}.name`)}
                  </button>
                ))}
              </div>
            )}

            {step === "car" && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bk-make">{t("steps.car.makeLabel")}</Label>
                  <Input
                    id="bk-make"
                    value={draft.make}
                    onChange={(e) => patch({ make: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bk-model">{t("steps.car.modelLabel")}</Label>
                  <Input
                    id="bk-model"
                    value={draft.model}
                    onChange={(e) => patch({ model: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === "date" && (
              <div>
                <Label htmlFor="bk-date">{t("steps.date.title")}</Label>
                <Input
                  id="bk-date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </div>
            )}

            {step === "time" && (
              <div className="grid grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => patch({ time: slot })}
                    aria-pressed={draft.time === slot}
                    className={cn(choiceButton(draft.time === slot), "text-center")}
                    dir="ltr"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {step === "contact" && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bk-name">{t("steps.contact.nameLabel")}</Label>
                  <Input
                    id="bk-name"
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
                {(
                  [
                    ["region", tChrome(draft.region)],
                    ["branch", draft.branchId ? tBranches(`items.${draft.branchId}.name`) : ""],
                    ["service", draft.serviceId ? tServices(`${draft.serviceId}.name`) : ""],
                    ["car", `${draft.make} ${draft.model}`.trim()],
                    ["datetime", `${draft.date} · ${draft.time}`],
                  ] as const
                ).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-small text-fg-muted">
                      {t(`summary.${key}`)}
                    </dt>
                    <dd className="text-small font-medium" dir="auto">
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
              <Button
                onClick={() => {
                  logIntent(draft);
                  window.open(
                    buildWhatsAppUrl(draft),
                    "_blank",
                    "noopener,noreferrer",
                  );
                  setSubmitted(true);
                }}
              >
                {t("steps.confirm.confirmButton")}
              </Button>
            ) : (
              <Button onClick={next} disabled={!canContinue[step]}>
                {t("next")}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
