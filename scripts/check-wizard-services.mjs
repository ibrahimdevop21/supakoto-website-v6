#!/usr/bin/env node
/**
 * Build guard (Phase 19): the booking wizard offers EVERY service in
 * content/services.ts and routes every substrate into a flow. A service
 * added to the catalogue can never silently miss the wizard again.
 *
 *  1. every `substrate` value used in content/services.ts has a key in the
 *     wizard's FLOW_OF map (TypeScript enforces this too via `satisfies
 *     Record<Substrate, Flow>` — this catches a substrate typed as a new
 *     literal that slipped past `Substrate`);
 *  2. every flow FLOW_OF points at exists in FLOWS;
 *  3. the wizard renders from the full `services` array — it must import
 *     `services` and must not call `services.filter(` / `vehicleServices`
 *     to build its options (grouping by substrate inside the render is
 *     allowed and is what the source does).
 */
import { readFileSync } from "node:fs";

const services = readFileSync("content/services.ts", "utf8");
const wizard = readFileSync("components/forms/BookingWizard.tsx", "utf8");

const catalogue = [...services.matchAll(/\bid:\s*"([^"]+)"[\s\S]*?\bsubstrate:\s*"([^"]+)"/g)].map((m) => ({
  id: m[1],
  substrate: m[2],
}));
const block = (name) => {
  const m = wizard.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\} as const`));
  if (!m) throw new Error(`BookingWizard.tsx: \`const ${name} = { … } as const\` not found`);
  return m[1];
};
const flowOf = Object.fromEntries([...block("FLOW_OF").matchAll(/^\s*([a-z]+):\s*"([a-z]+)"/gm)].map((m) => [m[1], m[2]]));
const flows = [...block("FLOWS").matchAll(/^\s*([a-z]+):\s*\[/gm)].map((m) => m[1]);

const failures = [];
if (catalogue.length === 0) failures.push("no services parsed from content/services.ts");
for (const s of catalogue) {
  if (!(s.substrate in flowOf)) failures.push(`service "${s.id}" has substrate "${s.substrate}" with no FLOW_OF entry in the wizard`);
  else if (!flows.includes(flowOf[s.substrate])) failures.push(`substrate "${s.substrate}" → flow "${flowOf[s.substrate]}" is not defined in FLOWS`);
}
if (!/import\s*\{[^}]*\bservices\b[^}]*\}\s*from\s*"@\/content\/services"/.test(wizard))
  failures.push("BookingWizard.tsx must import `services` from @/content/services");
if (/\bvehicleServices\b/.test(wizard)) failures.push("BookingWizard.tsx must not use vehicleServices — every service is offered");
// The service step must iterate the whole catalogue: the only allowed
// filter is the per-group substrate filter inside the render.
const filters = [...wizard.matchAll(/services\.filter\(([\s\S]{0,120})/g)].map((m) => m[1]);
for (const f of filters)
  if (!/^\(?\w+\)?\s*=>\s*group\.substrates\.includes\(\w+\.substrate\)/.test(f))
    failures.push(`BookingWizard.tsx filters the catalogue: services.filter(${f.split("\n")[0]}`);

if (failures.length) {
  console.error("✖ check-wizard-services: the booking wizard does not cover the service catalogue\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(
  `✔ check-wizard-services: ${catalogue.length} services / ${new Set(catalogue.map((s) => s.substrate)).size} substrates all routed (${Object.entries(flowOf).map(([k, v]) => `${k}→${v}`).join(", ")})`,
);
