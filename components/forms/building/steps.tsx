"use client";

import { useTranslations } from "next-intl";
import { areasForRegion } from "@/content/buildingQuote";
import type { RegionId } from "@/content/regions";
import { Label, Input, Select, Textarea } from "@/components/ui/Field";
import { choiceClass } from "@/components/forms/choice";
import { cap, type BuildingDetails, type MeasureMode } from "./types";

type StepProps = {
  details: BuildingDetails;
  onChange: (patch: Partial<BuildingDetails>) => void;
  /** Render the fieldset legend (standalone form). The wizard supplies its own heading. */
  legend?: boolean;
  /** Prefix for control ids — two instances must never collide. */
  idPrefix?: string;
};

function Group({
  legend,
  title,
  children,
}: {
  legend: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      {legend ? (
        <legend className="text-body font-medium">{title}</legend>
      ) : (
        <legend className="sr-only">{title}</legend>
      )}
      {children}
    </fieldset>
  );
}

/** Residential / commercial. */
export function PropertyStep({ details, onChange, legend = true }: StepProps) {
  const t = useTranslations("buildingQuote");
  return (
    <Group legend={legend} title={t("fields.propertyType")}>
      <div className={legend ? "mt-3 grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3"}>
        {(["residential", "commercial"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange({ propertyType: v })}
            aria-pressed={details.propertyType === v}
            className={choiceClass(details.propertyType === v)}
          >
            {t(v === "commercial" ? "fields.propertyCommercial" : "fields.propertyResidential")}
          </button>
        ))}
      </div>
    </Group>
  );
}

/**
 * Country + governorate/emirate. The country buttons render only when the
 * caller hands over `onRegionChange` (standalone form); the wizard has
 * already asked for the country on its own step.
 */
export function LocationStep({
  details,
  onChange,
  legend = true,
  idPrefix = "bq",
  region,
  onRegionChange,
}: StepProps & { region: RegionId; onRegionChange?: (region: RegionId) => void }) {
  const t = useTranslations("buildingQuote");
  const tChrome = useTranslations("chrome.region");
  const areaKind = region === "egypt" ? "governorates" : "emirates";
  return (
    <Group legend={legend} title={t("fields.region")}>
      {onRegionChange && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["egypt", "uae"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onRegionChange(id);
                onChange({ area: "" });
              }}
              aria-pressed={region === id}
              className={choiceClass(region === id)}
            >
              {tChrome(id)}
            </button>
          ))}
        </div>
      )}
      <div className={onRegionChange ? "mt-4" : undefined}>
        <Label htmlFor={`${idPrefix}-area`}>
          {t(region === "egypt" ? "fields.governorate" : "fields.emirate")}
        </Label>
        <Select
          id={`${idPrefix}-area`}
          value={details.area}
          onChange={(e) => onChange({ area: e.target.value })}
        >
          <option value="" disabled />
          {areasForRegion(region).map((id) => (
            <option key={id} value={id}>
              {t(`${areaKind}.${id}`)}
            </option>
          ))}
        </Select>
      </div>
    </Group>
  );
}

/** Area or window count, floors, glass type — approximate is fine, the disclaimer says so. */
export function MeasurementsStep({ details, onChange, legend = true, idPrefix = "bq" }: StepProps) {
  const t = useTranslations("buildingQuote");
  return (
    <Group legend={legend} title={t("fields.measure")}>
      <div className={legend ? "mt-3 grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
        {(["area", "windows"] as const satisfies readonly MeasureMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ measureMode: mode })}
            aria-pressed={details.measureMode === mode}
            className={choiceClass(details.measureMode === mode)}
          >
            {t(mode === "area" ? "fields.modeArea" : "fields.modeWindows")}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4">
        {details.measureMode === "area" ? (
          <div>
            <Label htmlFor={`${idPrefix}-glazing`}>{t("fields.areaLabel")}</Label>
            <Input
              id={`${idPrefix}-glazing`}
              type="number"
              min="1"
              inputMode="numeric"
              dir="ltr"
              value={details.glazingArea}
              onChange={(e) => onChange({ glazingArea: e.target.value })}
            />
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor={`${idPrefix}-count`}>{t("fields.windowsCountLabel")}</Label>
              <Input
                id={`${idPrefix}-count`}
                type="number"
                min="1"
                inputMode="numeric"
                dir="ltr"
                value={details.windowCount}
                onChange={(e) => onChange({ windowCount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-dims`}>{t("fields.windowsDimsLabel")}</Label>
              <Textarea
                id={`${idPrefix}-dims`}
                rows={2}
                placeholder={t("fields.windowsDimsHint")}
                value={details.windowDims}
                onChange={(e) => onChange({ windowDims: e.target.value })}
              />
            </div>
          </>
        )}
        <div>
          <Label htmlFor={`${idPrefix}-floors`}>{t("fields.floorsLabel")}</Label>
          <Input
            id={`${idPrefix}-floors`}
            type="number"
            min="1"
            inputMode="numeric"
            dir="ltr"
            value={details.floors}
            onChange={(e) => onChange({ floors: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-glass`}>{t("fields.glassTypeLabel")}</Label>
          <Select
            id={`${idPrefix}-glass`}
            value={details.glassType}
            onChange={(e) => onChange({ glassType: e.target.value as BuildingDetails["glassType"] })}
          >
            {(["unknown", "clear", "tinted", "double"] as const).map((v) => (
              <option key={v} value={v}>
                {t(`fields.glass${cap(v)}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <p className="mt-4 max-w-prose text-small text-fg-subtle">{t("disclaimer")}</p>
    </Group>
  );
}

/** Primary problem — no privacy option: TK-7099-IR is near-clear. */
export function ProblemStep({ details, onChange, legend = true }: StepProps) {
  const t = useTranslations("buildingQuote");
  return (
    <Group legend={legend} title={t("fields.problemLabel")}>
      <div className={legend ? "mt-3 grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3"}>
        {(["heat", "glare", "bills", "fading"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange({ problem: v })}
            aria-pressed={details.problem === v}
            className={choiceClass(details.problem === v)}
          >
            {t(`fields.problem${cap(v)}`)}
          </button>
        ))}
      </div>
    </Group>
  );
}
