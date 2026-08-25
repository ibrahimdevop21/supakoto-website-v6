# 04 — Content Quality

Read-only audit of supakoto.com copy (AR default + EN) against CLAUDE.md content rules.
Sources: `messages/ar.json`, `messages/en.json` (1,256 keys each), `content/*.ts`,
`app/[locale]/**`, `components/**`, `docs/audit/data/nojs/*.html` (live capture, JS off),
`scripts/check-claims.mjs`, `scripts/check-privacy-claims.mjs`. No source code was changed.

## Score: 6/10

Measured as rule violations found, weighted by whether a build guard should have caught them:

| Rule (CLAUDE.md) | Violations | Notes |
|---|---|---|
| Warranty tier-scoping + lifetime page allow-list | **0** | Clean. "Lifetime" visible only on `/warranty` (3×) and `/services/ppf` (4×), qualifier in-block every time. Not in footer, taglines, or any meta description. |
| Every i18n key in both locales | **0** | 1,256 / 1,256, zero diff. |
| No tashkeel, phones LTR | **0** in messages | 2 tashkeel chars in `content/testimonials.ts` (customer text, verbatim rule applies). Phones are `dir=ltr` via content files. |
| No regionalisms | **1** | Egyptian dialect on `/authentic` (§4). |
| No unsubstantiated superlatives | **5** | `largest`, `highest standard`, `first name`, `strongest combination`, `flagship` — all slip past the guard regex (§3). |
| Brand: never "discount / best price" | **4 rendered reviews** | Testimonials carousel shows "great discount" ×2, "Ramadan deal", "prices lower than other companies" on home, about and every vehicle service page (§3). |
| Claims must be sourced | **4 strings** | "the same Japanese TAKAI films" for boats/interiors/wraps while `content/services.ts` says no confirmed TAKAI product exists (§3). |
| No internal notes in copy | **6 live strings** | `[Investment ranges — to be supplied by Ibrahim]`, `[To be confirmed]` ×3 spec cells, form stubs ×4 pages on the live capture (§1, §6). |
| White Arabic register | ~12 strings | Mostly calques and corporate-vision Arabic, not dialect (§4). |

The warranty discipline is the best-executed rule on the site. The weakest area is not the
copy the team wrote — it is what the team let through unfiltered: harvested reviews and
bracketed TODOs rendering on production.

## Findings table

| # | Impact | Effort (h) | Finding | Evidence |
|---|---|---|---|---|
| 1 | HIGH | 1 | Live site shows English-only stub notices on four forms. Arabic pages show a different stub string. Every B2B / franchise / careers / warranty-claim lead is currently a dead end. Phase 23 fixes this on a local branch — not deployed. | `nojs/en__contact.html`: "[Submission activates with system integration — this form is a stub for now]"; `nojs/contact.html`: "[يفعل الإرسال مع ربط الأنظمة — النموذج شكلي حاليا]"; same on `en__business`, `en__careers`, `en__warranty__claim`. |
| 2 | HIGH | 1 | Testimonials carousel renders every harvested review, including four the harvest file itself flags as "not placed on any page". `orderedTestimonials()` has no filter; `Testimonials.tsx` never reads `note`. Result: "great discount" appears on the homepage of a brand whose rule is "never cheap, discount, best price". | `content/testimonials.ts` ids 7 ("الاسعار أقل بكتير من الشركات الأخرى"), 9 ("Ramadan deal"), 26 & 28 ("with a great discount"), 16 ("10 years warranty" — flat figure). `nojs/en.html` matches "discount" 4×. |
| 3 | HIGH | 0.5 | Site attributes TAKAI film to services that have no confirmed TAKAI product. Contradicts the claim-discipline rule the codebase enforces elsewhere. | `home.services.sub` EN "Cars, buildings, boats, interiors — the same Japanese TAKAI films." AR "بأفلام تاكاي اليابانية نفسها"; `services.index.seoDescription` "Seven services with Japanese TAKAI films: … marine and surface protection"; `gallery.items.surface-marble-table.alt` "فيلم حماية الأسطح من تاكاي"; `surface-film-roll.alt` "من تاكاي". Versus `content/services.ts` L90: "NO CONFIRMED TAKAI PRODUCT exists for either". Colour-change is "certified premium wrap vinyl", also not TAKAI. |
| 4 | HIGH | 0.1 | Egyptian dialect on a trust page. The same question already exists in white Arabic on `/faq`. | `authentic.faq.1.q` = "إزاي أعرف إن فيلم الحماية أصلي؟" vs `faq.items.genuine.q` = "كيف أعرف أن فيلم الحماية أصلي؟". |
| 5 | HIGH | owner | Franchise page renders an internal TODO to prospective investors, both locales. | `franchise.investmentTodo` = "[Investment ranges and terms — to be supplied by Ibrahim]" / "[نطاقات الاستثمار والشروط — يحددها إبراهيم]"; rendered by `app/[locale]/franchise/page.tsx:92`; visible in `nojs/en__franchise.html`. |
| 6 | MEDIUM | owner | Spec tables show bracketed placeholders on two indexed service pages. Heat-isolation material is "Japanese nano-ceramic" with no product name — "Japanese" is unsubstantiated here. | `services.items.heat-isolation.spec.heatRejection.value` = "[To be confirmed]", `.uvRejection.value` same, `nano-ceramic.spec.hardness.value` same; visible in `nojs/en__services__heat-isolation.html`, `nojs/services__nano-ceramic.html`. |
| 7 | MEDIUM | 0.5 | Five superlatives the claims guard does not catch (regex covers best/finest/#1/أفضل/الأول only). | `about.journey.events.3.desc` "Egypt's largest heat and UV protection project" / "أكبر مشروع … في مصر"; `about.vmv.mission.body` "the highest standard of installation" / "أعلى مستوى تركيب"; `about.vmv.vision.body` "the first name that comes to mind" / "أول اسم يخطر ببالك"; `nano-ceramic.faq.5.a` "the strongest combination" / "أقوى تركيبة"; `takai.lines.signature.tagline` "flagship performance" / "أداء رائد". |
| 8 | MEDIUM | 2 | Service-page "Book this service" sends the user to `/booking` with nothing preselected; the wizard's first step asks them to pick the service again. | `components/sections/services/ServiceDetailBody.tsx:193` `<Button href="/booking">`; `BookingWizard.tsx` has no `useSearchParams`. |
| 9 | MEDIUM | owner | Three different opening-hours truths. | `/branches`: "Working hours: contact the branch" (`branches.hoursUnverified`); `/booking` step: "Branch hours: 10:00–20:00" (`DEFAULT_HOURS`, comment says ops-unconfirmed); `/contact`: "Saturday–Thursday, 10:00–18:00" (`contact.info.hoursValue`). |
| 10 | MEDIUM | 3 | No pricing signal anywhere, yet `/about` promises "clear pricing". Installments exist only as footer logos with no copy. | `about.vmv.mission.body` "clear pricing, written warranty"; `content/payments.ts` (valU, Banque Misr, NBE, CIB, Tabby, `installments: true`) rendered only by `components/chrome/TrustBadges.tsx`. |
| 11 | MEDIUM | 1 | Locale fact mismatch inside one bullet. | `ppf.solutions.b3` EN "chemical rain" vs AR "الأمطار الحمضية" (acid rain). Also `building-heat-isolation.spec.thickness.value` AR "3.5 مل" — "مل" reads as millilitre to an Arabic reader; unit is mil. |
| 12 | MEDIUM | 1 | Distributor-vs-agent wording drifts. Guard rule 3 says DISTRIBUTOR. | `footer.tagline` "Exclusive agent"; `about.sub` "Exclusive agent"; `about.stats.exclusive.label` "Exclusive agent"; vs `authentic.*` "sole authorized distributor"; `home.metaDescription` "Sole authorized TAKAI distributor". AR: "الوكيل الحصري" vs "الموزع المعتمد الوحيد". |
| 13 | LOW | 0.5 | TAKAI spelled both ways within the same Arabic screen, with no rule. | `home.hero.slides.s1.title` "أفلام تاكاي" then `.sub` "أفلام TAKAI". Counts: تاكاي 34, TAKAI 48 in `ar.json`. |
| 14 | LOW | 0.5 | Gallery alt orthography — missing hamza in six alts. | `gallery.items.sk-015.alt` "المانيتان"; `sk-089`, `sk-103`, `sk-139` "كروس اوفر"; `sk-175`, `sk-190` "اثناء"; `sk-210` "اخرى". |
| 15 | LOW | 0 | Stale note in the harvest file. | `content/testimonials.ts` id 19 note: "Names a product line (Takai Steel Plus) that V6 does not list" — `content/takai.ts` L226 does list TAKAI STEEL PLUS. |
| 16 | LOW | owner | 27 car-manufacturer logos render under `aria-label="Brands & partners"`. Only Škoda, Kasrawy, Mansour have provenance in `PARTNERSHIP_CLAIMS`. Ferrari / Rolls-Royce / Lamborghini as "partners" is a trademark question, not a copy one. | `content/partners.ts` L384-433; `home.partners.aria`. Ibrahim approved 2026-08-11 — logged as open question. |

## 1. Search-intent match

"First screen" = what the nojs capture renders before the first fold-equivalent (H1 + sub + first block).

| Page | Target query | Answers it in first screen? |
|---|---|---|
| `/` | "PPF Egypt / حماية طلاء السيارات" | Partly. H1 is a keyword list ("TAKAI Japanese films: car paint protection and building heat isolation"), not a promise. Second screen (7 service cards) does the work. "Book now" is above the fold. |
| `/services` | "car protection services" | Yes — 7 cards with one-line benefits. Book CTA only at page bottom. |
| `/services/ppf` | "paint protection film price/tiers Egypt" | Yes for what/why; **no** for price or "which tier". The TAKAI spec table lives on `/` (home), not here — home's CTA "PPF details & warranty" links to a page with less detail than the table it leaves. |
| `/services/heat-isolation` | "car window tint heat rejection %" | No — the two numbers a tint buyer searches for are "[To be confirmed]". |
| `/services/colour-change` | "car wrap cost / brand" | Partly — finishes and removal answered; material is "certified premium wrap vinyl" (no brand), no price. |
| `/services/nano-ceramic` | "ceramic coating durability / 9H" | Partly — hardness is "[To be confirmed]", durability "months, not weeks" is vague. |
| `/services/building-heat-isolation` | "window film for office/villa heat" | Yes — the best service page: numbers, product code, funnel, quote CTA. |
| `/services/marine-ppf`, `/surface-protection` | (noindex) | Honest "pending confirmation" pages; correct decision. |
| `/faq` | "PPF questions" | Yes, 15 answers. No CTA anywhere on the page. |
| `/warranty` | "TAKAI warranty years" | Yes — exemplary. Tier table, region breakdown, qualifier, registration, claim CTA. |
| `/warranty/claim` | "file warranty claim" | Form only; live capture shows the stub notice. |
| `/branches` | "SupaKoto branch near me / phone" | Yes — 6 cards with call/WhatsApp/directions. Hours punt to "contact the branch". |
| `/booking` | "book PPF appointment" | Yes — wizard starts with service pick. |
| `/about` | "who is SupaKoto" | The first screen is an 18-minute documentary with "Turn sound on". Story text arrives on screen two. Fine for brand, weak for the query. |
| `/authentic` | "is TAKAI film original / فيلم أصلي" | Yes — strongest reasoning on the site. One dialect string (F4). |
| `/business` | "fleet PPF corporate" | Three one-liners then a form (stubbed live). No terms, no case study despite AstraZeneca being on `/about`. |
| `/franchise` | "car protection franchise Egypt" | Yes until "Investment: [to be supplied by Ibrahim]". |
| `/careers` | "SupaKoto jobs" | "No roles are posted" + form (stubbed live). |
| `/contact` | "SupaKoto phone" | Yes — phone, WhatsApp, email, hours above the form. |
| `/gallery` | "PPF before after" | 243 "after" photos, zero before/after pairs. No CTA. |
| `/privacy`, `/terms` | legal | Yes. Privacy is unusually honest (names Google/Meta/TikTok, CR number). |

## 2. Content gaps (specific)

| Gap | Why a Cairo/Dubai buyer cares | Owner page |
|---|---|---|
| No price, "from" price, or price band per package/tier | First question on every WhatsApp lead; site promises "clear pricing" on `/about` and delivers none | `/services/ppf` packages block; `/faq` booking category |
| Which tier for whom (TAKAI 5 vs GOLD vs STEEL vs PREMIUM PLUS) | Table on `/` is raw spec (μm, MPa, ΔE); nothing says "daily commuter → GOLD, new SUV kept 5+ years → STEEL PLUS" | `/services/ppf` (move or mirror the comparison here, add a one-line recommendation per tier) |
| Installment plans | valU / Banque Misr / NBE / CIB / Tabby logos exist; no copy on months, 0% or not, minimum ticket, which branch | `/booking` sidebar + `/faq` "bookingDeposit" (currently a non-answer) |
| Aftercare / curing | One line ("wait a week"). Buyers ask: haze and small bubbles for X days are normal, no pressure-wash at edges, when ceramic can go on top, parking in sun | `/faq` aftercare + each vehicle service page |
| Concrete "what voids the warranty" | "clear misuse" is not a list. Automatic brushes, solvents, outside repair, pressure at edges, accident panels | `/warranty` exclusions row |
| Warranty booklet download | Copy says "you receive the warranty booklet" — no PDF or sample | `/warranty` |
| Booking lead time and deposit | "pick a day in the next 60" but no "typical wait: 3–5 days in Cairo, Dubai same-week"; deposit FAQ defers to a call | `/booking`, `/faq` |
| Heat-isolation numbers and product name | VLT options, IR %, UV %, TAKAI product code — the actual comparison basis for tint | `/services/heat-isolation` |
| Which branch does what | Damietta is a franchise; Alexandria sits inside a dealership; Maadi capacity 3 vs Tagamoa 8 (`branches.ts`). Do all six install PREMIUM PLUS, wraps, building film? | `/branches` per-card service list |
| Before/after evidence | 243 glamour shots; no before/after pair, no self-healing clip, no 3-year-old install | `/gallery` (a "before/after" filter), `/services/ppf` (heading `beforeAfterHeading` exists in messages — verify assets) |
| TAKAI vs generic film, in plain terms | `/authentic` argues provenance; nothing explains TPU vs PVC, why ΔE<1 matters, what 15 μm self-healing layer means to a buyer | `/services/ppf` or `/authentic` |
| Fleet / B2B terms | Volume tiers, on-site install, SLA, invoicing; AstraZeneca and Mansour exist as proof and are unused here | `/business` |
| Colour-change: material brand and paperwork per country | "traffic paperwork — we walk you through it" — Egypt and UAE differ; a buyer wants the steps | `/services/colour-change` FAQ 3 |
| EV-specific note | A large share of gallery cars are EVs; nothing on sensor/camera cut-outs, charge-port protection | `/services/ppf` FAQ |

## 3. Claim risk

**Figures and superlatives**

| Claim | Where | Backing | Risk |
|---|---|---|---|
| "6 branches" | home, about, branches, meta | `content/branches.ts` (6 entries, one franchise) | Low |
| "25,000+ cars protected" / "تجاوزنا 25 ألف" | `about.whoWeAre.body`, `about.seoDescription`, counter | `lib/site.ts CARS_PROTECTED` confirmedBy Ibrahim 2026-08-16 | Medium — internal attestation only, no method |
| "100% genuine Japanese TAKAI film" | `about.stats.japanese` | Guarded by `/authentic` chain-of-custody copy | Low-medium (true only for PPF; site also sells non-TAKAI wraps) |
| "Egypt's largest heat and UV protection project" | `about.journey.events.3.desc` | None | **High** — unverifiable superlative, guard misses `largest/أكبر` |
| "highest standard of installation" / "أعلى مستوى" | `about.vmv.mission.body`, `about.title` | None | Medium |
| "the first name that comes to mind" / "أول اسم" | `about.vmv.vision.body` | Vision statement, but reads as a market-position claim | Low-medium |
| "Factory-grade installation" / "بمعايير المصنع" | `services.index.sub`, `about.whoWeAre.body` | No TAKAI certification cited | Medium |
| "Real savings on AC load" / "توفير حقيقي" | `heat-isolation.solutions.b4` | No number | Low |
| 99% IR, 99.5% UV, 70% VLT, 54% TSER, 3.5 mil | building page + meta | TAKAI TK-7099-IR sheet (per code comments) | Low — link or cite the datasheet |
| 170–270 μm, ≥350–450%, 30–45 MPa, ΔE<1, R9–R10 | home table | `content/takai.ts` "verbatim specs, Ibrahim 2026-08-06" | Low |
| "4.8 out of 5 · 1,570 Google reviews" | Testimonials header | `branches.ts reviews` asOf 2026-08-19, count-weighted | Medium — no `url` set on any branch, so the number is not verifiable from the page |
| "Protection that lasts years" | `home.hero.slides.s1.sub` | Tier warranty | Low |

**Named third parties**

- TAKAI / Nippon Takai Trading & Innovation Co., Ltd., Tokyo — named on `/authentic` and `/faq`. Backing: distributor status per `check-claims.mjs` rule 3. Needs written TAKAI permission on file for the corporate name and the "sole authorized distributor" statement (the site says it in 9 places).
- Škoda, Kasrawy Group, Mansour Group — `PARTNERSHIP_CLAIMS` sourced, Ibrahim 2026-08-16. OK.
- AstraZeneca — `about.journey.events.3` and `gallery.items.building-astrazeneca.alt`. **Not in `PARTNERSHIP_CLAIMS`.** A named client + a photo of their facade needs consent.
- Hustle Drip (café) — `gallery.items.building-hustle-drip.alt`. Same — no provenance entry.
- Mansour Chevrolet, RB Garage — `confirmed: false` in `partners.ts` (logos hidden) but named in `branches.items.alexandria.address` and `damietta.address`, and in `home.partners.items.*.line`. Address use is fine; the partner `line` strings exist for a strip that is not shown.
- 27 car-brand logos in the partner strip (F16).
- Testimonials: 29 named individuals with branch and staff names (Sherif, Hisham, Omar, Mohamed Swelam, Ramy, Tarek, Effat, Enjyu) harvested from V2, `source: "v2-site"`, no dates, no consent field. Rating aggregate is Google's; the quotes are not linked to Google. Consent status is unknown from the repo.
- Competitor names: none (guard rule 7 works). Testimonial 9 mentions "the 3 companies shortlisted" — unnamed, fine.

**Warranty statements — every instance checked**

| String | Key | Tier named? | Page allowed? |
|---|---|---|---|
| "Standard tiers: up to 15 years · Premium Plus: lifetime*" + qualifier | `services.items.ppf.spec.warranty.value` | Yes | `/services/ppf` — yes |
| "Lifetime warranty*" + qualifier in card | `ppf.premiumPlusCard.term` | Premium Plus | `/services/ppf` — yes |
| "Up to 15 years" / "Lifetime*" + qualifier | `warranty.termStandard/termLifetime` | Yes | `/warranty` — yes |
| Per-product 5/10/15/lifetime by region | `TierBreakdown.tsx` via `takai.terms.*` | Yes | `/warranty` only; home table deliberately omits the column (`TakaiComparison.tsx` L20) — yes |
| "10 years — TAKAI buildings warranty" | `building-heat-isolation.spec.warranty.value`, `warranty.buildings.*` | Building product (separate from tiers) | Yes |
| "up to 15 years on standard tiers" | `ppf.seoDescription`, `warranty.seoDescription` | Yes | Meta is allowed for "15 years"; "lifetime" absent from all meta — yes |
| "Per tier — confirmed at booking" | heat-isolation / colour-change / nano-ceramic warranty cells | Deferred | Compliant but empty |
| "Every protection tier carries its own documented warranty" | `home.features.warranty.sub`, `warranty.sub` | Generic, no figure | Yes |
| "10 years warranty" (customer quote) | `testimonials.ts` id 16 | No tier | Rendered on home/about/service pages — the only flat figure on the site, and it is not ours |

Verdict: the authored warranty copy is fully compliant. The one leak is the harvested review.

**Guards: what they catch and miss**

`check-claims.mjs` catches: heat language in PPF contexts, SILVER≠TAKAI 5, manufacturer framing, emoji flags, `lifetime` outside allowed namespaces, best/finest/#1/أفضل/الأول on brand terms, competitor names.
It misses: `largest/biggest/highest/strongest/leading/flagship` and `أكبر/أعلى/أقوى/رائد/أول اسم`; flat warranty figures in `content/testimonials.ts` (content dir is scanned for code rules only, not the LIFETIME/SUPERLATIVE-in-string path — and "10 years" is not a pattern anyway); discount/deal/price language (`discount|deal|أقل بكتير|خصم|عروض`); bracketed TODOs (`\[.*(confirmed|supplied|TBC|قيد التأكيد).*\]`) reaching production; dialect markers (`إزاي|ليه|عشان|بتاع|دلوقتي|شو|وين|كيفك`); TAKAI attribution on services whose `specKeys` are empty.
`check-privacy-claims.mjs` does one job well (privacy copy cannot contradict armed pixels, both locales). Nothing to add.

## 4. Arabic register

Read `messages/ar.json` in full and all Arabic in `content/*.ts` (only `testimonials.ts` has Arabic; verbatim customer text is exempt by the owner's rule). No tashkeel in messages. No banned classical constructions found (تجدر الإشارة / نظرًا لـ / يُعد / حيث أن — zero hits). No banned MSA clichés found (نقدم لكم / أفضل الأسعار / خدمة متميزة / يسعدنا — zero hits). The baseline is genuinely good; the issues are calques and corporate-speak.

| Key | Current | Problem | White-Arabic fix |
|---|---|---|---|
| `authentic.faq.1.q` | إزاي أعرف إن فيلم الحماية أصلي؟ | (a) Egyptian dialect | كيف أعرف أن فيلم الحماية أصلي؟ |
| `home.hero.slides.s1.title` (H1) | أفلام تاكاي اليابانية: حماية طلاء السيارات وعزل حراري للمباني | (c) keyword list, colon-joined like an EN SEO title | حماية يابانية أصلية لسيارتك — ولمبناك أيضا |
| `takai.lines.signature.tagline` | تشطيبات متقدمة وأداء رائد | (d) generic; "رائد" is press-release Arabic | تشطيبات أكثر، وأعلى درجات الخط |
| `takai.lines.performance.tagline` | حماية عالية القوة للاستخدام اليومي | (c) calque of "high-strength" | حماية قوية للاستخدام اليومي |
| `about.vmv.vision.body` | أن نكون المرجع في حلول الحماية في الشرق الأوسط — أول اسم يخطر ببالك عندما تفكر في حماية استثمارك | (d) corporate vision boilerplate; "حلول الحماية" is B2B-speak | أن يكون اسمنا أول ما يتذكره صاحب السيارة عندما يفكر في حمايتها — في مصر والخليج |
| `about.vmv.mission.body` | أن نجمع بين أفلام TAKAI اليابانية وأعلى مستوى تركيب… | (d) "أعلى مستوى" superlative filler | فيلم TAKAI الياباني، وتركيب نوثقه خطوة بخطوة، وسعر واضح، وضمان مكتوب، ونتيجة تراها بعينك |
| `about.journey.events.4.desc` | شراكة استراتيجية وسعت انتشارنا وقدرتنا التشغيلية | (c) word-for-word from EN "strategic alliance that expanded our reach and capabilities" | شراكة فتحت لنا مدنا جديدة وزادت طاقة فروعنا |
| `about.journey.events.9.desc` | اتفاقية توسع حضورنا في السوق. | (d) says nothing | اتفاقية جاءت بفرع الإسكندرية داخل منصور شيفروليه في السنة التالية |
| `about.journey.events.3.desc` | نفذنا أكبر مشروع عزل حراري وأشعة فوق بنفسجية لمبنى تجاري في مصر | superlative + "عزل … وأشعة فوق بنفسجية" is a calque | ركبنا عزل تاكاي على واجهات مبنى أسترازينيكا بالكامل — أكبر مشروع مبان نفذناه حتى اليوم |
| `franchise.why.4.body` | وعي متزايد بقيمة الحماية — والطلب أكبر من المعروض الاحترافي | (c) "المعروض الاحترافي" is economist English | الناس تعرف قيمة الحماية أكثر كل سنة — ومن يركبها باحتراف أقل من الطلب |
| `services.items.ppf.solutions.b3` | حماية من اصفرار الشمس والأمطار الحمضية | (c) "اصفرار الشمس" calque; fact differs from EN | لا يصفر مع الشمس، ويقاوم الأمطار الحمضية |
| `services.items.building-heat-isolation.spec.thickness.value` | 3.5 مل | (f) "مل" = millilitre to an Arabic reader | 3.5 mil (89 ميكرون) |
| `authentic.hero.sub` | …ولن يبقى للسؤال مكان. | slightly literary | …وينتهي السؤال. |
| `services.items.colour-change.spec.material.value` | فينيل تغليف عالمي معتمد | (d) "معتمد" by whom? vague | فينيل تغليف من ماركة عالمية — نسميها لك عند الحجز |
| gallery alts ×~120 | داخل المركز المتخصص / أمام المركز المتخصص | (d) "المركز المتخصص" is a euphemism nobody says; repeated in 120 alts | مركز سوباكوتو / فرع سوباكوتو |
| `gallery.items.sk-015/089/103/139/175/190/210.alt` | المانيتان، كروس اوفر، اثناء، اخرى | (e-adjacent) missing hamza | ألمانيتان، كروس أوفر، أثناء، أخرى |
| `home.hero.slides.s1.title` vs `.sub` | تاكاي / TAKAI | mixed script for the brand in one block | Pick one rule: Latin TAKAI in product names and spec cells, تاكاي in running prose — and apply it |

Strings that pass the Cairo/Dubai/Riyadh test and should not be touched: `home.hero.slides.s2.title` "الشمس لا ترحم. ونحن نتولى الباقي", `s3.title` "لمعان الوكالة — بدون العودة إلى الوكالة", `warranty.title` "ضمان حماية السيارات — مكتوب، لا كلام", `booking.sub` "سؤال واحد في كل خطوة — دقيقتان وتنتهي", `careers.sub` "نبحث دائما عمن يتقن عمله", `contact.sub`, `heat-isolation.faq.3.a` "بدون أن تشعر أنك تقود في نفق", all of `warranty.*`, all of `authentic.*` except FAQ 1, all of `building-heat-isolation.*`.

## 5. AR/EN parity

- Key sets: 1,256 = 1,256, zero one-sided keys (checked with a flatten-and-diff in python3).
- Identical values across locales: 5, all proper nouns (`takai.lines.*.name`, `about.eyebrow` "SupaKoto", `about.journey.events.7.title` "TAKAI Steel Plus", `warranty.buildings.product`). Acceptable.
- `content/*.ts`: only `testimonials.ts` carries prose; it is deliberately single-language per review. No locale-split objects to compare.
- Live word counts (AR / EN): home 2345/2394, about 2316/2390, ppf 2238/2277, warranty 350/394, authentic 446/551 (−19%), building 317/372 (−15%), faq 148/167, privacy 533/614. Arabic is naturally 10–20% denser; I read `authentic.html` and `services__building-heat-isolation.html` side by side and found no missing sections — the gap is compression, not omission.
- Fact mismatch: `ppf.solutions.b3` chemical rain vs acid rain (F11). `about.journey.events.9.desc` EN "pivotal agreement accelerating our growth" vs AR "اتفاقية توسع حضورنا" — both empty, EN hype-ier.
- Form-stub strings on the live capture differ by locale and are not in `messages/*` at all (removed in commit ec9d5ca) — parity is moot once Phase 23 deploys.

## 6. CTA clarity

| Page | Primary CTA | Above fold | Label specific | Service preselected | Phone/WA fallback | Issue |
|---|---|---|---|---|---|---|
| `/` | "Book now" → `/booking` | Yes | Yes | n/a | Header WhatsApp | Five secondary CTAs compete lower down (All services, Explore, PPF details, franchise, quote) — acceptable for a hub |
| `/services` | Card "Details & packages"; band "Book your slot" | Cards yes, book no | Yes | No | Footer only | Fine |
| `/services/{vehicle}` | "Book this service" | No — after problem/solution/spec | Yes | **No** (F8) | Header WhatsApp only; no in-body phone | Add `?service=ppf` and a WhatsApp button beside it |
| `/services/building-heat-isolation` | "Request a quote" → `/quote` | No, but funnel is explicit | Yes | Yes (dedicated route) | WA in quote flow | Best CTA on the site |
| marine / surface | "Talk to us about your boat/project" → WhatsApp | Yes | Yes | Prefilled message | Yes | Good |
| `/warranty` | "File a warranty claim" | No (bottom) | Yes | n/a | No | Fine for intent |
| `/warranty/claim` | Submit | Yes | Yes | n/a | No | Live = stub (F1) |
| `/branches` | Call / WhatsApp / Directions per card | Yes | Yes | n/a | Yes | No "Book at this branch" link to wizard with branch preselected |
| `/booking` | Wizard | Yes | Yes | — | `booking.stub` line + WA handoff | OK |
| `/about` | Band "Book your slot" | No — documentary first | Yes | No | No | Acceptable |
| `/authentic` | "Authorized branches" + "Book your slot" | No (bottom) | Yes | No | No | Fine |
| `/business` | Form | Form above fold | "Send request" | n/a | **None in body** | Live = stub; add direct line for B2B |
| `/franchise` | Form | No | "Submit application" | n/a | None | Live = stub; TODO block sits above the form |
| `/careers` | Form | Yes | Yes | n/a | None | Live = stub |
| `/contact` | Phone / WA / email / form | Yes | Yes | n/a | Yes | Live form = stub |
| `/faq` | **None** | — | — | — | Footer only | Add "Still unsure? Book / WhatsApp" band |
| `/gallery` | **None** | — | — | — | Footer only | Add band after grid |

## 7. Tone drift

**English, hype or off-register**

- `heat-isolation.problem` "works the AC to death, and slowly cooks the upholstery" — vivid, borderline; keep one image, not two.
- `ppf.problem` "half-centimetre accidents" — nobody says this; "door dings".
- `about.journey.events.9.desc` "A pivotal agreement accelerating our growth and market presence" — press-release.
- `takai.lines.signature.tagline` "Advanced finishes & flagship performance"; `services.index.sub` "Factory-grade installation"; `colour-change.solutionIntro` "world-class materials"; `nano-ceramic.faq.5.a` "the strongest combination" — all unbacked intensifiers.
- `about.vmv.vision.body` "the Middle East's reference in protection solutions" — "solutions" is B2B filler.
- `franchise.why.4.body` "demand outruns professional supply" — fine in EN, calqued into AR (§4).

**Arabic, bland/generic** — listed in §4 (vision, mission, journey 4/9, taglines, "المركز المتخصص" ×120).

**Brand naming**

- SupaKoto: EN 151×, AR سوباكوتو 157×, consistent. "Supa Koto" / "سوبا كوتو" appear once each as the legal entity in the privacy controller line — correct usage. Testimonials carry Supa Koto / Supakoto / SUPA KOTO in customer text — exempt.
- TAKAI casing: uppercase everywhere authored (EN 82, AR 48). Title-case "Takai" only inside testimonials. Arabic script تاكاي (34) has no rule vs Latin (F13).
- Distributor / agent / وكيل / موزع — four labels for one relationship (F12). Recommend "sole authorized distributor" / "الموزع المعتمد الوحيد" everywhere; drop "agent".

## Content gap list, ranked by buyer value

1. Price bands per package and tier (PPF first) — `/services/ppf`, `/faq`
2. "Which tier is for me" guidance + move/mirror the TAKAI table to `/services/ppf`
3. Installment plans in words, not logos — `/booking`, `/faq`
4. Heat-isolation real numbers and product name — `/services/heat-isolation`
5. Aftercare and curing guide — `/faq` aftercare, service pages
6. Concrete warranty exclusions + booklet PDF — `/warranty`
7. Before/after pairs and an aged-install photo — `/gallery`, `/services/ppf`
8. Booking lead time and deposit answer — `/booking`, `/faq`
9. Per-branch service list and real hours — `/branches`
10. Fleet terms and one case study (AstraZeneca / Mansour) — `/business`
11. TAKAI vs generic film in plain terms — `/authentic`
12. Colour-change: brand of vinyl, paperwork steps per country — `/services/colour-change`
13. EV note (sensors, charge port) — `/services/ppf` FAQ

## What is already good (do not touch)

- The entire warranty system: `content/warranty.ts` as single source of truth, qualifier rendered in-block, region-gated product lists, home table deliberately without a warranty column, zero "lifetime" in metadata. This is the rule most sites fail and this one passes cleanly.
- `/authentic` — argues provenance without naming a competitor, states the limit of what can be verified (`verify.s4`), and offers documents on request. The strongest page on the site.
- `/services/building-heat-isolation` — numbers, product code, honest positioning ("darker films score higher — we fit those on cars"), a five-step funnel, no-visit quote. Model for the vehicle pages.
- Marine / surface pages: publicly say "pending confirmation from TAKAI" and are noindexed. Correct.
- Privacy policy: names Google/Meta/TikTok/WhatsApp, cookie lifetimes, CR number, both legal frameworks. Rare honesty.
- Arabic baseline: no tashkeel, no classical constructions, no banned clichés, phones LTR from content files. The hero lines and warranty title are good white Arabic.
- Key parity 1,256/1,256 with a build guard mindset throughout.
- Claim guards exist and are documented in code; extending them is cheap (§3).

## Open questions for the owner

1. Phase 23 deploy date — every form on the live capture is a stub with an English-only notice on EN pages and a different Arabic one on AR pages.
2. Testimonials 7, 9, 26, 28 (discount / deal / cheaper than competitors) and 16 (flat "10 years warranty"): exclude from render, or accept that the homepage says "great discount"?
3. Do the 29 named reviewers (and the named staff) have consent for reuse outside Google? No consent field exists in `testimonials.ts`.
4. AstraZeneca and Hustle Drip are named clients with facade photos — is there written consent? Neither is in `PARTNERSHIP_CLAIMS`.
5. Written TAKAI permission for "sole authorized distributor" and for using "Nippon Takai Trading & Innovation Co., Ltd." by name?
6. "Egypt's largest heat and UV protection project" — by what measure? If none, it goes.
7. 25,000 cars — method (invoices? warranty registrations?) so the number can be defended.
8. Car-brand logo strip: keep as "cars we protect" (rename the aria/heading) or as "partners" (needs agreements)?
9. Heat-isolation film: is it a TAKAI product? If yes, product code and datasheet; if no, drop "Japanese" until confirmed.
10. Colour-change vinyl brand — can it be named?
11. Real per-branch hours, and the one true "office hours" line for `/contact`.
12. Investment ranges for `/franchise`, or hide the block until they exist.
13. Google Business Profile URLs per branch so the 4.8 / 1,570 aggregate is verifiable.
14. TAKAI in Arabic: تاكاي in prose, Latin in product names — confirm the rule so the copy can be normalised.
15. May the claims guard be extended (largest/highest/strongest, discount/deal, dialect markers, bracketed TODOs, TAKAI attribution on empty-spec services)? All are one-regex additions to `scripts/check-claims.mjs`.
