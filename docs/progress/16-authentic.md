# Phase 16 — `/authentic` genuine TAKAI verification page (2026-08-16)

Status: DONE (local commit, not pushed) (Ibrahim: "no gates, report at the end").

═══ BRIEF authentic-page ═══
READ FIRST: CLAUDE.md content rules (white Arabic, claim discipline);
STRUCTURE-SPEC → "Claim discipline" + new `/authentic` section; scripts/check-claims.mjs.
SCOPE: new route /authentic + /en/authentic; nav/home/about/ppf/faq/footer links;
FAQPage + Organization JSON-LD; new `competitor-name` guard rule; sitemap + smoke.
NOT IN SCOPE: any new fact beyond the three supplied; document images; competitor
comparison; changes to warranty terms; push/deploy (local commits only).
LOCKED DECISIONS:
1. Only the three supplied facts appear; everything else is category-level.
2. Documentation wording is exactly "available on request" / «متاحة عند الطلب».
3. We speak only for film installed at our branches; we do not verify others' film.
4. The FAQ question «إزاي أعرب/إزاي أعرف إن فيلم الحماية أصلي؟» is kept verbatim per
   Ibrahim (search intent) — the ONE sanctioned regionalism; answer is white Arabic.
5. Home TAKAI tile → /authentic. Nav About group: About, Authenticity, FAQ.
6. Guard: competitor names fail the build (messages, content, app, components).
SMOKE: route 200 both locales + dir; FAQPage + Organization JSON-LD present; all
guards green; links from the six surfaces resolve; no competitor names; no
superlatives; lifetime scoping untouched.

## Execution log
- STRUCTURE-SPEC: new `/authentic` section (facts, hard constraints, structure,
  JSON-LD, linked-from list); home tile note; nav About group.
- Guard: `competitor-name` rule (3M / XPEL / SunTek / Llumar / STEK / Garware) over
  messages, content, app, components — 7 rules total now.
- Copy: `authentic.*` namespace (hero, why, takai, distributor, verify s1–s4, FAQ 1–6,
  CTA, link labels), `nav.authenticity`, `faq.items.genuine` — Arabic first (white
  Arabic), English second. Only the three supplied facts; documentation "متاحة عند
  الطلب / available on request"; step 4 + FAQ 5 state we speak only for film installed
  at our branches. FAQ 1 keeps the verbatim customer wording «إزاي أعرف إن فيلم الحماية
  أصلي؟» per Ibrahim (the one sanctioned regionalism; answer is white Arabic).
- Page `app/[locale]/authentic/page.tsx`: 7 sections per spec; JSON-LD FAQPage +
  Organization (brand TAKAI → manufacturer Nippon Takai Trading & Innovation Co., Ltd.,
  Tokyo; areaServed EG + AE; distributor relationship in description).
- Surfaces: nav About → [About, Authenticity, FAQ]; home TAKAI tile → /authentic;
  /about story link + exclusive-stat link; PPF spec block link (PPF only); /faq new
  "genuine" question with link-through (FaqEntry.link); footer trust line under
  TrustBadges. `lib/site.ts` ROUTES → sitemap. Smoke extended (JSON-LD, citable line,
  on-request wording, no competitor names, links from 4 surfaces): **115/115**.
- Green: typecheck, lint (0 errors), build 44/44, both guards, en/ar parity, no tashkeel;
  screenshots ar/en 1280 + ar 390, zero page errors.
- Not pushed (push only on Ibrahim's word).
