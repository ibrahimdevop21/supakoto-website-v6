# 02 — AI Crawlability

Read-only audit of https://supakoto.com, 2026-08-25. Sources: `docs/audit/data/nojs/*.html` (JS-disabled capture, all sitemap URLs + marine-ppf + surface-protection + dev/kitchen-sink), `app/robots.ts`, `middleware.ts`, `lib/jsonld.ts`, `content/faq.ts`, `content/warranty.ts`, `content/services.ts`, `messages/{en,ar}.json`, and the relevant components. No source changed.

> Verification addendum (run by the orchestrator after the specialist finished, because that agent had no shell): `curl -A "<bot>" https://supakoto.com/` returned **200** for GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, OAI-SearchBot, CCBot and Bytespider. No Vercel firewall / bot-protection rule is blocking AI crawlers. Raw output: `docs/audit/data/bot-ua-check.txt`. Finding #10 below is therefore resolved as "verified open".

## Score: 5/10

The schema foundation is genuinely good — FAQPage, Service, BreadcrumbList, per-branch AutomotiveBusiness, correct `noindex,follow` on unconfirmed services, clean canonical/hreflang, a fully permissive robots.txt. What drags this to a 5 is that a large share of the site's actual prose — the FAQ answers, the warranty tier breakdown, the TAKAI product-comparison table, most gallery captions — is either absent from the no-JS DOM entirely or systematically hidden for one of two regions. An AI system that fetches the page without executing JavaScript (which is how most retrieval-bot fetchers work, including GPTBot, ClaudeBot, and PerplexityBot in their default crawl mode) sees markup skeletons and JSON-LD, not the answers a user asked for. The JSON-LD is honest and matches the visible text where it exists — that's the redeeming part — but JSON-LD alone is a weaker citation signal than prose, and for the UAE product line there is no JSON-LD either.

## What is blocking AI citability, ranked

1. **FAQ/Accordion answers don't exist in the no-JS DOM anywhere on the site.** 14 pages emit `FAQPage` JSON-LD whose `acceptedAnswer.text` has no corresponding visible text until a user clicks — same defect flagged in `03-technical-seo.md` #1, but for AI citability it means an entire category of content (procedural Q&A, the exact shape LLMs lift verbatim) is invisible to any crawler that doesn't render JS.
2. **UAE product names never appear in the crawlable HTML, site-wide, regardless of visitor location.** `TierBreakdown` and `TakaiComparison` both read `useRegion()`, which SSRs `DEFAULT_REGION = "egypt"` and only switches after a client-side cookie read. TAKAI SILVER, MATT, MATT PLUS, ULTIMATE GLOSS, STEELPLUS — the entire UAE line — are absent from `warranty.html` and `en__warranty.html`, verified by direct grep. An AI answering "what's the warranty on TAKAI SILVER" has nothing to cite.
3. **A literal placeholder is live in production copy.** The car heat-isolation service page's spec table reads `"[To be confirmed]"` / `"[قيد التأكيد]"` for heat rejection and UV rejection — an actual bracketed TODO shipped to customers and crawlers on both locales.
4. **Gallery page has ~90 words of visible text across 238 photos.** No per-image captions in the DOM, empty `alt=""` on the thumbnail strip, no `ImageObject`/`ImageGallery` schema.
5. **No llms.txt.** Cheap and worth doing (Anthropic + Perplexity read it), but not a substitute for #1–2.

## Findings table

| # | Impact | Effort (h) | Finding | Evidence |
|---|---|---|---|---|
| 1 | H | 3 | FAQ/Accordion answers absent from no-JS DOM on 14 pages (`/faq`, `/warranty`, `/franchise`, `/authentic`, `services/building-heat-isolation`, and the 4 dynamic service-detail pages, ×2 locales); JSON-LD carries the full text but visible prose doesn't. | `docs/audit/data/nojs/faq.html`: 15 `<button>` questions, 0 answer text in `<main>`; `components/ui/Accordion.tsx:79-93` mounts the panel only inside `{open && …}`. |
| 2 | H | 4 | UAE TAKAI product line (SILVER/MATT/MATT PLUS/ULTIMATE GLOSS/STEELPLUS) never renders in static/no-JS HTML on `/warranty` or the home TAKAI comparison table — `RegionProvider` always SSRs `egypt` and switches only after a client cookie read. | `content/regions.ts:46` `DEFAULT_REGION = "egypt"`; `components/providers/RegionProvider.tsx:35-43`; grep of `warranty.html` + `en__warranty.html` for `SILVER\|MATT\|STEELPLUS\|ULTIMATE GLOSS` — zero matches. |
| 3 | H | 0.5 | Car heat-isolation page ships literal `"[To be confirmed]"` / `"[قيد التأكيد]"` for heat-rejection and UV-rejection spec values, live, both locales. | `messages/en.json:364-369`, `messages/ar.json:363-369`; `services__heat-isolation.html` contains `قيد التأكيد`. |
| 4 | M-H | 4 | Gallery (238 images) has ~87-90 visible words total; only the single "current" stage image gets real visible `alt`; all 238 thumbnails render `alt=""` (real alt text only in the button's `aria-label`); no `ImageObject`/`ImageGallery` schema. | `components/sections/GalleryViewer.tsx:271-279`; `_index.json` gallery textWords: 87 (ar) / 86 (en). |
| 5 | M | 6 | Booking wizard is entirely client-state; no-JS view shows only the first screen (service picker). No booking-process detail (branch/date/contact/confirm) is crawlable text — compounded by #1 hiding the FAQ answers (`howLongInstall`, `bookingDeposit`) that would explain the flow. | `components/forms/BookingWizard.tsx` — 8-step `FLOWS` object, single-step render; `_index.json` booking textWords: 133. |
| 6 | M | 2 | The full entity-establishing `Organization` node (brand → TAKAI → manufacturer → Tokyo address) fires only on the homepage. Other pages that include `Testimonials` (incl. `/about`) get a thinner `Organization` node with the same `@id` but only a `review` array — no brand, no manufacturer, no description. | `lib/jsonld.ts:25-52` (`organizationLd`, used only in `app/[locale]/page.tsx`) vs `components/sections/Testimonials.tsx:46-62`. |
| 7 | M | 0.5 | No `llms.txt`. Cheap; Anthropic/Perplexity are confirmed consumers — see §2. | `public/`, `app/` — no `llms.txt` route or static file. |
| 8 | M | 1 | Branch `PostalAddress` schema has `streetAddress` + `addressCountry` only — no `addressLocality`, `addressRegion`, `postalCode`; `streetAddress` values are landmark strings ("الجيزة — الشيخ زايد"). | `app/[locale]/branches/page.tsx:41-56`; grep of `branches.html` for `addressLocality` — no matches. |
| 9 | L | 1 | TAKAI (the manufacturer) has no stable `@id`/URL/`sameAs` of its own — an inline anonymous node under `brand.manufacturer`. | `lib/jsonld.ts:41-49`. |
| 10 | — | 0 | **Verified**: all AI bot UAs get 200 from the live site (see addendum). No Vercel firewall interference. | `docs/audit/data/bot-ua-check.txt` |
| 11 | L | 2 | No `dateModified`/visible "last updated" on `/warranty`, service pages, or `/faq` — content that changes carries no freshness signal. `/privacy` does this correctly (`2026-08-22`). | grep of `warranty.html`/`services__ppf.html` for a date pattern: none. |
| 12 | L | 1 | Home hero: only slide 1 of 5 renders before interaction (`cycled` state gates `SlideCopy`). 4 of 5 value props never appear in the no-JS `<h1>`/`<p>`. | `components/sections/home/HeroCarousel.tsx:25-37`, `71-88`. |

## 1. robots.txt vs AI user agents

Live rule (`app/robots.ts`): `User-Agent: *` / `Allow: /` / `Disallow: /dev/, /en/dev/`. No bot-specific group for any agent.

Per the robots.txt spec, a crawler applies the most specific matching group for its own token; if none exists, it falls back to `*`. All 14 bots — **GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Applebot-Extended, Bytespider, Amazonbot, meta-externalagent** — fall through to `*` and are **implicitly permitted**, site-wide except `/dev/`. None is blocked.

Retrieval vs training: `OAI-SearchBot`, `ChatGPT-User`, `Claude-Web`/`Claude-User`, `Perplexity-User`, `PerplexityBot` fetch live pages to answer a user query (citation-relevant). `GPTBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `CCBot`, `Bytespider`, `Applebot-Extended`, `Amazonbot`, `meta-externalagent` are (or can be) training crawlers. The site currently permits both categories identically — an owner decision not yet made, not a bug.

Repo-level: no `vercel.json`; `middleware.ts` runs only `next-intl` locale routing (matcher excludes `/api`, `/_next`, `/_vercel`, dotted paths) and does no user-agent inspection. Live check (addendum): all bots 200.

## 2. llms.txt — research verdict

No `llms.txt` exists. Current evidence:
- **Anthropic**: publicly confirmed Claude's retrieval workflows consult `llms.txt` where present.
- **Perplexity**: publicly confirmed it fetches `llms.txt` to prioritise page selection.
- **OpenAI**: no confirmation GPTBot/ChatGPT parse it; anecdotal only.
- **Google**: explicitly rejected. Gary Illyes (July 2025) said Google doesn't support it and isn't planning to; John Mueller compared it to the keywords meta tag.

**Verdict: worth 30 minutes, with expectations set correctly.** Real signal for Claude and Perplexity retrieval; costs nothing; will not move Google or AI Overviews. If built: a single flat markdown at `/llms.txt` — 1–2 line description (the `authentic.hero.sub` sentence is ready to use), then a curated list of the highest-value URLs with one-line descriptions — `/warranty`, `/services/ppf`, `/authentic`, `/faq`, `/branches` — not a sitemap dump.

Sources:
- https://codersera.com/blog/llms-txt-complete-guide-2026/
- https://presenc.ai/research/state-of-llms-txt-2026
- https://limy.ai/blog/llms-txt-in-2026-the-full-guide
- https://nohacks.co/blog/ai-user-agents-landscape-2026
- https://dataimpulse.com/blog/robots-txt-ai-crawlers/

## 3. JS-disabled content parity, by route

| Route type | Missing/hidden with JS off |
|---|---|
| Home (`/`, `/en`) | Hero: only slide 1 of 5. Full `Organization` JSON-LD present (good). TAKAI comparison table region-gated to Egypt (#2). |
| `/services` | Fine — server-rendered card grid, thin by design (133 words), links to detail pages. |
| `/services/ppf` (+ heat-isolation, colour-change, nano-ceramic) | Body copy, spec table, `Service`+`FAQPage`+`Breadcrumb` present. FAQ answers absent (#1). Heat-isolation ships the `[To be confirmed]` placeholder (#3). |
| `/faq` | 15 questions render, 0 answers, until click. `FAQPage` JSON-LD matches hidden text exactly. |
| `/warranty` | Coverage table renders. `TierBreakdown` shows Egypt tiers only (#2). Own FAQ accordion hides answers (#1). |
| `/branches` | Good — `BranchGrid` renders every branch in both regions as visible text; per-branch `AutomotiveBusiness` JSON-LD present. |
| `/booking` | Only the first wizard screen renders. All 8 subsequent steps never mount. |
| `/gallery` | ~90 visible words for 238 images. Thumbnails `alt=""`. No JSON-LD. |
| `/about`, `/authentic` | Good — server components, full prose (2,300+ / 450-550 words), strong entity sentences in both locales. `/authentic` carries the full brand `Organization`; `/about` does not (#6). |
| `/contact`, `/careers`, `/business`, `/franchise`, `/terms`, `/warranty/claim` | Thin (106–248 words) but server-rendered; transactional/legal by design. `/franchise` hides its FAQ answers (#1). |
| `/services/marine-ppf`, `/services/surface-protection` | Correctly `noindex, follow`, excluded from sitemap, spec fields intentionally empty pending TAKAI confirmation (`content/services.ts:91-97`). Deliberate, not a bug. |

## 4. FAQ extractability

15 entries on `/faq`. All 15 pass **standalone quality** and all 15 have **JSON-LD text matching the visible-when-open text exactly** (same `t()` call feeds both). Two lean lightly on neighbouring UI (`whichBranch` ends "See the branches page"; `warrantyVoid` says "Details are in your tier's booklet") — still usable standalone.

**Count passing all four criteria (standalone / in nojs HTML / in JSON-LD / text matches): 0 of 15.** Every answer fails "in nojs HTML" because `components/ui/Accordion.tsx` only mounts `item.answer` inside `{open && …}`. Same on `/warranty`, `/franchise`, `/authentic`, `services/building-heat-isolation`, and the 4 dynamic service-detail pages (`ServiceDetailBody.tsx`) — 14 pages.

## 5. Citable facts

| Fact | Where stated | Number or adjective |
|---|---|---|
| PPF film thickness: 170–270 μm by tier | `/services/ppf` spec table, in no-JS HTML | Number |
| PPF self-healing coating: 15 μm every tier | same | Number |
| Standard TAKAI warranty: up to 15 years | `/warranty`, PPF section of `/services`, home | Number, tier-scoped (compliant) |
| Premium Plus: lifetime (of the vehicle, transfers on resale) | `/warranty`, PPF section, tier card | Qualifier co-rendered every time — compliant, no bare "lifetime" found |
| Car heat-isolation: heat/UV rejection | `/services/heat-isolation` spec table | **Neither** — literal `[To be confirmed]` (#3) |
| Building heat isolation: 99% IR rejection at 950/1400 nm; 99.5% UV; 70% VLT; 54% TSER | `/services/building-heat-isolation` | Number |
| Building film: TAKAI TK-7099-IR, 3.5 mil; 10-year warranty | same | Number + named product |
| Branches: 6, Egypt & UAE | `/about` stats; `Organization` `areaServed` | Number |
| Operating since 2016 | `/about`; JSON-LD `foundingDate` | Number |
| Cars protected: "past 25,000" | `/about` prose only — `stats.cars` card has a `label` but no visible `value` | Number (check) |
| Google rating: 4.8 across 1,570 reviews | Testimonials visible text (deliberately not `aggregateRating`) | Number |
| Install time: PPF 1–3 days, heat isolation half-day–1 day, ceramic 1–2 days | FAQ `howLongInstall` | Number, but not extractable no-JS (#1) |
| TAKAI origin: Japan, "Nippon Takai Trading & Innovation Co., Ltd.", Tokyo | `Organization` JSON-LD (home only); prose on `/about`, `/authentic` | Named entity; structured version homepage-only (#6) |

## 6. Organization schema

`lib/jsonld.ts:organizationLd()` — homepage only — is strong: `@id`, `name`, `url`, `logo`, `description` ("sole authorized distributor" sentence), `sameAs`, `foundingDate: "2016"`, `areaServed`, and `brand` → `TAKAI` → `manufacturer` → Nippon Takai (Tokyo). Close to a correct exclusive-distributor declaration.

Gaps: (a) homepage-only; `/about`, `/authentic` and service pages with `Testimonials.tsx` get a second, thinner `Organization` with the same `@id` but only `review`; (b) the manufacturer node has no `url`/`sameAs`/`@id`; (c) no `AboutPage`/`WebSite` node.

Proposed shape (single source of truth in the root layout; manufacturer becomes a linkable entity) — report only:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://supakoto.com/#organization",
  "name": "SupaKoto",
  "url": "https://supakoto.com",
  "logo": "https://supakoto.com/brand/logo.svg",
  "description": "SupaKoto is the sole authorized distributor of TAKAI films in Egypt and the UAE.",
  "foundingDate": "2016",
  "areaServed": [
    { "@type": "Country", "name": "Egypt" },
    { "@type": "Country", "name": "United Arab Emirates" }
  ],
  "brand": {
    "@type": "Brand",
    "name": "TAKAI",
    "manufacturer": {
      "@type": "Organization",
      "@id": "<TAKAI official domain>/#organization",
      "name": "Nippon Takai Trading & Innovation Co., Ltd.",
      "url": "<TAKAI official domain>",
      "address": { "@type": "PostalAddress", "addressLocality": "Tokyo", "addressCountry": "JP" }
    }
  },
  "mainEntityOfPage": "https://supakoto.com/authentic",
  "sameAs": ["<social links>"]
}
```
Use `parentOrganization`/`memberOf` only if TAKAI's corporate structure supports it. The manufacturer `url`/`@id` needs TAKAI's real official domain — not in the repo; do not invent one.

The reviews-only `Organization` node in `Testimonials.tsx` should merge into this via `@graph`, or drop the `@id` collision (see also 03-technical-seo #2 — self-serving Review markup).

## 7. Entity clarity in prose

**Present and strong.** `/authentic` hero: *"SupaKoto is the sole authorized distributor of TAKAI films in Egypt and the UAE. Buy from the authorized source and the question does not arise."* — reused verbatim as the JSON-LD `description`. `/about` `whoWeAre.body`: *"We started in 2016... exclusive distributor of genuine Japanese TAKAI film in Egypt and the UAE... past 25,000 cars protected."* Arabic equivalents exist and read naturally. Strongest part of the site for AI citability.

## 8. Other citation blockers

- **Dates**: `/privacy` has a visible "updated 2026-08-22". `/warranty`, service pages, `/faq` have none.
- **Brand naming**: consistent — "SupaKoto" / "سوباكوتو". (04-content-quality found one TAKAI/تاكاي mixed hero block.)
- **Phones**: `tel:` hrefs clean (`tel:+201103402446`); visible text and JSON-LD `telephone` carry spaces (`+20 110 340 2446`) — not strict E.164. Source: `content/branches.ts`.
- **Addresses**: not fully structured (#8).

## What is already good (do not touch)

- robots.txt: fully permissive, correct sitemap reference; all AI bots verified 200.
- `FAQPage`, `Service`, `BreadcrumbList`, per-branch `AutomotiveBusiness` JSON-LD: well-formed; where answer text is reachable it matches visible source exactly.
- `/about` and `/authentic`: fully server-rendered, real prose, one-sentence entity statement in both locales matching JSON-LD verbatim.
- `marine-ppf` / `surface-protection`: correct `noindex, follow`, excluded from sitemap, deliberately empty specs — content-integrity discipline.
- `/branches`: every branch in both regions renders unconditionally with structured data.
- Testimonials: visible review text matches `reviewBody`; deliberate omission of `aggregateRating` is correct.
- Warranty "lifetime" qualifier discipline: zero bare "lifetime" strings.
- Canonical + hreflang: correct and reciprocal.

## Open questions for the owner

1. **Training vs retrieval bots — same policy or split?** Currently `*` permits both. Blocking training crawlers while allowing citation bots requires explicit per-bot groups in `app/robots.ts`.
2. ~~Vercel firewall~~ — verified open, no action.
3. **Fix order**: the Accordion-hides-answers pattern (#1) is the single highest-leverage fix — one component change (render answers in the DOM, control visibility via CSS/`aria-hidden`/`hidden` instead of conditional mount) covers 14 pages. Confirm before touching FAQ content.
4. **Region-gating (#2)**: render both regions' product lines server-side (two static blocks, one revealed by toggle) so both are crawlable regardless of cookie?
5. **`stats.cars` value**: the "Cars protected" stat card on `/about` has a `label` but no paired `value` — confirm whether "25,000" should appear there.
