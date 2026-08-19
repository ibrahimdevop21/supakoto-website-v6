# Phase 18 — pre-cutover: quick wins + tracking foundation

*Brief from Ibrahim, 2026-08-19. Autonomous, no gates, one commit per item,
one report at the end. Branch: `feat/phase-18-pre-cutover`.*

Context: the V2 tracking audit (`supakoto-Website_V2_Prod/docs/TRACKING-AUDIT.md`)
found GTM-PKSH2C5K had zero custom-event triggers — every `dataLayer.push`
was ignored and Meta/GA4/TikTok only ever received PageView. V6 uses direct
pixels in the repo, no tag manager.

## Plan

| # | Item | Deliverable |
|---|------|-------------|
| 1 | Testimonials (harvest from V2 `src/data/testimonials.ts`, 30 entries) | `content/testimonials.ts` (typed, ar+en, source), `components/sections/Testimonials.tsx`, placement home (4) / service pages (2, service-filtered) / about, aggregate rating from `content/branches.ts`, JSON-LD Review + AggregateRating for displayed items only |
| 2 | Payment methods | `content/payments.ts`, fill `TrustBadges` (region-aware), logos harvested from V2 `public/payment/` → `public/payment/*.webp` |
| 3 | Social + email | five social URLs in `lib/nav.ts`, `info@supakoto.com` in footer + /contact, `sameAs` on Organization JSON-LD |
| 4 | Direct pixels | `lib/analytics.ts` (single `track()`), `components/providers/Analytics.tsx` (afterInteractive, route-change pageviews), IDs from `NEXT_PUBLIC_*` env, `scripts/check-analytics-calls.mjs` build guard |
| 5 | Event taxonomy | page_view, service_view, booking_start/step/complete, quote_start/complete, whatsapp_click, call_click, branch_view, form_submit — wired into every tel:/wa.me element and form; Meta/TikTok standard-event mapping |
| 6 | Ref IDs | `SK-XXXXXX` at booking_complete / quote_complete, on its own labelled line in the WhatsApp message, stored in the intent log with UTMs/referrer/fbclid/gclid, `docs/progress/TRACKING-SPEC.md` contract for Phase 3 |
| 7 | Checks | placeholder `wa.me/20123456789` absent, no untracked tel/wa, no un-hydrated interactive component, consent flagged as open |

## Report (2026-08-19, end of phase)

Branch `feat/phase-18-pre-cutover`, 7 commits on top of `main` 92b3b7e.
**Nothing pushed, nothing merged** — Ibrahim's word.

### 1. Per item

| # | Item | What changed | Files | Commit |
|---|------|--------------|-------|--------|
| 1 | Testimonials | 30 V2 reviews harvested verbatim (29 shipped, #18 held — see below), typed content file with ar+en (faithful translations, labelled in the UI), server-rendered section, placements home 4 / about 3 / 2 per vehicle service page, visible aggregate (branch `reviews` field → fallback mean of the set), JSON-LD Review + AggregateRating for displayed items only | `content/testimonials.ts`, `components/sections/Testimonials.tsx`, `content/branches.ts` (+`reviews?`), `app/[locale]/{page,about/page,services/[slug]/page}.tsx`, `messages/*.json` (`testimonials.*`) | `5c98851` |
| 2 | Payment methods | TrustBadges filled: region-aware strip (Egypt valU · Banque Misr · NBE · CIB; UAE Tabby; both Visa · Mastercard · Amex · Apple Pay · Google Pay); logos = V2 `public/payment/` converted to trimmed WebP (NBE SVG kept; Visa's baked checkerboard made transparent, mark untouched) | `content/payments.ts`, `components/chrome/TrustBadges.tsx`, `public/payment/*`, `messages/*.json` (`footer.payments.*`) | `baa5d18` |
| 3 | Social + email | five live URLs (V2 values), all icons render, `info@supakoto.com` in footer + /contact card, Organization `sameAs` (5) + `email` | `lib/nav.ts`, `lib/jsonld.ts`, `components/chrome/Footer.tsx`, `components/icons.tsx` (MailIcon), `components/forms/ContactForm.tsx`, `messages/*.json` (`contact.info.email*`) | `e4a4793` |
| 4 | Direct pixels | `lib/analytics.ts` single `track()` fan-out (GA4, Meta, TikTok, Ads base tag), IDs from `NEXT_PUBLIC_*`, loaded after hydration from `<Analytics />`, route-change `page_view` (auto pageviews off → no double count), idempotent init, `?sk_debug` console + GA4 DebugView; `lib/attribution.ts`; build guard `scripts/check-analytics-calls.mjs` in `pnpm build`/`guards` | `lib/analytics.ts`, `lib/attribution.ts`, `components/providers/Analytics.tsx`, `app/[locale]/layout.tsx`, `scripts/check-analytics-calls.mjs`, `package.json`, `.env.example` | `d69876b` |
| 5 | Event taxonomy | every tel:/wa.me element and every form wired (FAB, footer, /contact, branch cards, Leaflet popups via delegation, pending-service CTA, StubForm `formId`, `ServiceViewTracker` on service pages incl. building); `data-track` on each element; Button link variant gains onClick/target/rel | `components/chrome/{WhatsAppFab,Footer}.tsx`, `components/forms/*.tsx`, `components/sections/{BranchGrid,BranchMap}.tsx`, `components/sections/services/PendingServiceCta.tsx`, `components/providers/ServiceViewTracker.tsx`, `components/ui/Button.tsx`, service pages | `db51cd3` |
| 6 | Ref IDs | `SK-XXXXXX` (`lib/ref.ts`) at booking_complete / quote_complete, line 2 of the WhatsApp message («رقم الطلب: SK-…» / «Request ref: SK-…»), on the success screen, on the events (Meta eventID / TikTok event_id / GA4 transaction_id), in the intent log with attribution; `docs/progress/TRACKING-SPEC.md` Phase-3 contract; `scripts/e2e-analytics.mjs` | `lib/ref.ts`, `components/forms/{BookingWizard,BuildingQuoteForm}.tsx`, `messages/*.json` (`booking.waRef`, `buildingQuote.wa.ref`), `docs/progress/TRACKING-SPEC.md`, `scripts/e2e-analytics.mjs` | `3937616` |
| 7 | Checks | placeholder `wa.me/20123456789` absent (grep); untracked tel:/wa.me link = build failure (guard extended); JSON-LD audit validates Review/AggregateRating + sameAs; ASSETS-NEEDED updated | `scripts/check-analytics-calls.mjs`, `scripts/jsonld-audit.mjs`, `docs/progress/ASSETS-NEEDED.md` | `653fe58` |

### 2. Testimonials harvested — for Ibrahim's review

Source for ALL entries: `supakoto-Website_V2_Prod/src/data/testimonials.ts` (30 entries,
rendered on V2 home by `src/components/carousels/Testimonials.tsx`). V2 carried
**no dates and no source field**; all are rated 5 and all carry a name + branch.
They read like Google reviews but V2 never states that — treat as "V2 site".
Translations (other language) are in `content/testimonials.ts`; the table shows
the customer's original text. Nothing was edited; translations into Arabic carry
no tashkeel; originals keep theirs.

**Held out:** V2 #18 *mohamed elseman* (New Cairo) — "…finding the best protection
of my car, I found and dealt with the best company in protection, such as SUPA
KOTO…" — trips the superlative claims guard (`best protection`); the guard is
law, so it is not in the file. Your call whether to drop it or accept a quoted
exception.

**Weaker as social proof / flagged (not placed on any page):** #7 (prices lower
than competitors), #9 (Ramadan deal), #26 and #28 (discounts/offers), #19 (names
"Takai Steel Plus", a line V6 does not list), #11 and #26 (V2 branch tag ≠ branch
named in the text). None are anonymous — every entry has a name. If you prefer
Google reviews with dates, see ASSETS-NEEDED (per-branch GBP review list).

| V2 # | Name | Branch (V6 id) | Original | Service tags | Placed on | Flags | Original text |
|---|---|---|---|---|---|---|---|
| 1 | Ebraheem A | dubai | ar | heat-isolation | /services/heat-isolation |  | السلام عليكم انصح فيه بقوه من توصل لين تستلم سيارتك الشغل والمعامله ممتازه وأسعارهم بالمتناول شكرا أستاذ عمر و شريف ومش قصور بالباقي اخترت ٥٠٪؜ عزل الحراره ممتاز وواضح من الداخل |
| 2 | nithin premnath | dubai | en | ppf | home |  | I recently had a full PPF applied to my Mazda CX-60 by the Supakoto team in Dubai, and I’m thoroughly impressed with the entire experience. The quality of the work is flawless — the finish is seamless, and the attention to detail is clearly visible from every angle. Special credit to Sherif and Hisham, who were incredibly helpful throughout the process. I highly recommend Supakoto for anyone considering PPF in Dubai. Outstanding service from start to finish! |
| 3 | Mohamed Taha | dubai | ar | ppf | /about |  | بعد دراسة ومقارنة لأغلب مراكز الـ PPF في السوق لمدة شهر تقريبًا، قررت التعامل مع SUPA KOTO بناءً على تواصل الأستاذ عمر المحترم الذي كان صبورًا وواضحًا وصادقًا في توضيح الفروقات وطمأنني بجودة الخدمة – وقد كان عند وعده. سلمت لهم سيارتي وسيارة أخي، ووجدت احترافية عالية، دقة في التفاصيل، ومعاملة راقية من كل الطاقم، وعلى رأسهم الأستاذ شريف مدير الفرع، والأستاذ هشام. المنتج المستخدم ياباني بجودة ممتازة والنتيجة النهائية رائعة، وأنصح بالتعامل معهم. |
| 4 | Hany Fathy | dubai | en | — | — (file only) |  | I had a great experience with Supa Koto, they made my Avatr look fantastic. Highly recommended. Special thanks to Mr. Sherif and all the staff. |
| 5 | Hassan Adam | dubai | en | — | /services/nano-ceramic |  | Very professional and great work. Also good after sale follow up — highly recommend. |
| 6 | Engy Ibrahim | dubai | en | — | /services/colour-change |  | Original 100% and after sales service is perfect with annual check ups and maintenance 👌 |
| 7 | mohamed fishar | dubai | ar | — | — (file only) | Mentions prices being lower than competitors — brand framing avoids price talk; not placed on any page. | شركة ممتازة والاسعار أقل بكتير من الشركات الأخرى وفريق العمل متمكن وأعلى كفاءة وجودة وسرعة. أنصح بالتعامل معهم. |
| 8 | Ahmed El Hariry | dubai | en | — | — (file only) |  | Had a great experience and a great service with the place and with Hesham. The details and the service are brilliant. |
| 9 | Michaelangelo D'Sa | dubai | en | ppf, heat-isolation | — (file only) | Mentions a Ramadan deal — not placed on any page. | I had done a month of research, which included reading about PPF and the options I had here in Dubai. I even visited the 3 companies shortlisted for the job. I decided to use Supakoto purely due to the fact that Japan quality goes without question, and moreover, I managed to get the Ramadan deal that was on offer. This also included complete window tinting. After meeting up with Mr Hisham, I was convinced that I would not be disappointed. On the day I received my 2025 Lexus nx350h from the showroom, I drove directly to Al quoz and handed my car to Mr Hisham. It took almost a week, but the final outcome was nice. |
| 10 | Mahmoud Fathy | zayed | ar | — | home |  | انا سعيد بتجربتي مع سوباكوتو … ان شاءالله تتكرر في السيارات القادمة … مستوى عالي من الاحترافية والمهنية في التعامل و الدقة في المواعيد والاسعار مناسبة جدا وكذلك المصداقية في المنتج من خلال التاكيد على انه اصلي بالسريال من الشركة المصنعة و كذلك المتابعة وخدمة ما بعد البيع …. كل شئ كان ممتازت |
| 11 | Ahmed Ali | maadi | en | ppf | — (file only) | V2 tags this review to Maadi but the text says New Cairo branch. | I recently had a protection Film for 2 Cars in New Cairo Branch.They really have an excellent Professional Team and a very good customer service. A very good after sale follow up. I am very satisfied with their provided service. A big thank you to Mr Mohamed - The Branch Manager for handling all the issues. |
| 12 | Alber Wadea | zayed | en | ppf | /services/ppf |  | I recently had a PPF installed on my vehicle, and I couldn't be more impressed with the quality of service and the final result. From start to finish, the team demonstrated top-tier professionalism, attention to detail, and deep product knowledge. The consultation was clear and informative—they explained the different film options, coverage areas, and long-term benefits, helping me choose the best package for my needs. The installation itself was meticulous. The film was applied seamlessly, with no bubbles, visible edges, or imperfections. You can barely tell it's there, but the protection is immediately noticeable. What truly stood out was the pride the team took in their work. They treated my car with care as if it were their own. I was also impressed with the turnaround time and the follow-up instructions to ensure the film cures properly. |
| 13 | Amel Fathy | maadi | en | ppf | /about |  | I had a protection film as well as internal protection 3 months ago. I was really impressed by the quality of the products and the professionality of the staff.The results were outstanding. And what is really special is their after sale follow up every now and then to check on the film and if I have any comments ❤️comments ❤️ To sum up, I am totally satisfied with the service and I highly recommend them to everyone. |
| 14 | Mohamed Samy | tagamoa | ar | — | home |  | من أحسن التجارب اللي مريت بيها بصراحة بعد مقارنة بين كذا شركة. اخترت شركة Supa Koto بناءً على ترشيحات كتير وفعلاً كانوا قد التوقعات. فريق العمل محترم جدًا وملتزم من أول ما تواصلت معاهم لحد ما استلمت العربية، كل حاجة كانت ماشية بسلاسة ومنظمة جدًا. خامات ممتازة حسيت إني واخد قيمة حقيقية مقابل اللي دفعتُه. الأستاذ محمد سويلم قمة في الذوق والرُقي وخلاني مرتاح جدًا في التعامل معاهم. استلمت العربية قبل الميعاد وده خلاني أحترمهم أكتر. تجربة محترمة وأنصح أي حد بيهم. |
| 15 | Amr Othman | tagamoa | en | ppf, heat-isolation | — (file only) |  | I would like to thank Mr. Mohamed Swelam and Mr. Ramy for their incredible professionalism and friendly attitude. Professional Service: The team was highly professional, ensuring top-quality service and attention to detail. They offer a diverse range of protective and thermal insulation films, selecting the best option for my car. Expert Recommendations: Their knowledge and expertise helped me choose the most suitable film for my needs. Respectful & Courteous Staff: The customer service was exceptional, with respectful and polite interactions throughout the process. Great Hospitality: From the moment I arrived, they provided a warm welcome and made the experience enjoyable. Highly Recommended: I would definitely recommend them to anyone looking for car paint protection films. |
| 16 | Ahmed Gaber | tagamoa | en | ppf, heat-isolation | /services/heat-isolation | States a 10-year warranty — customer's words, not a site claim; warranty copy on the site stays tier-scoped. | Great customer relation management & high quality products and service. Amazing heat isolation as well. Just recieved my car from them after film protection and heat isolation installation with them with 10 years warranty. Hope they continue to offer great quality along the coming years ISA. |
| 17 | Ahmed Gado | tagamoa | en | ppf | — (file only) |  | Thank you Supa Koto for providing high-quality protection films for your car. It was a great experience with your products, and I am grateful for your excellent service. Supa Koto is my favorite company for protection films. Their products are of high quality and prove to be effective in protecting cars. Thank you for your great service. I highly recommend Supa Koto Protection Film Company. I used their products for my car and the results were great. Thank you for your excellent products. |
| 19 | Mohamed Elleithy | tagamoa | en | ppf | — (file only) |  | Outstanding Service and Top-Quality Product at Supakoto. I recently had my car protected with Takai Steel Plus film at Supakoto, and I couldn't be more impressed with the entire experience. From start to finish, the team demonstrated professionalism, patience, and genuine care. A special thanks to Mr. Mohamed Sweilm, who went above and beyond by patiently answering all my questions and even showing me the full installation process. His knowledge and friendly attitude made me feel confident and well-informed every step of the way. I also want to highlight Mr. Ramy, whose attention to detail and commitment to quality ensured that the car was delivered in perfect condition. He personally inspected the work more than once to make sure everything was flawless. The Takai Steel Plus film itself is of excellent quality — the finish looks incredible and gives me peace of mind knowing that my car is protected. Highly recommended for anyone who values premium service, high-quality products, and a truly professional team! |
| 20 | Unis elassal | tagamoa | en | — | /services/nano-ceramic |  | I would like to thank Supa Koto team, specially Mr Mohamed Swelam for warm hospitality and professionalism. I already made almost 7 cars until now since 2022 and they have super after sales service. Highly recommended. |
| 21 | rami ashraf | tagamoa | en | ppf | /services/ppf |  | Highly recommended place for film car protection — everything is perfect: the material, treatment, and the staff. I would like to thank Mr. Mohamed Swelam and Mr. Ramy for their incredible professionalism and friendly attitude. The car came out perfect and ahead of schedule and the service after sale is perfect. |
| 22 | Amr Shawky | tagamoa | en | — | /about |  | I’d like to extend my sincere thanks to the entire team at Supa Koto for their exceptional service and unwavering commitment to quality control. From the very beginning, the experience was smooth and professional—even during the initial sales process with Enjyu, who was incredibly helpful and knowledgeable. A very special thank you goes out to Swelam, the Operations Manager, whose attention to detail were clearly reflected in the outstanding execution and overall professionalism of the team. Everyone I interacted with was kind, decent, and conducted themselves with the highest level of professionalism. It was truly a pleasure working with Supa Koto, and I highly recommend them to anyone seeking quality and reliability. |
| 23 | Mohamed Galaa | tagamoa | en | ppf | — (file only) |  | Honestly, Supa Koto has become my recommended provider for anyone who is interested in the PPF. The material exceeds expectations. They are taking care of every inch of the car. Thanks, Supa Koto. |
| 24 | Mina Jack | tagamoa | en | — | /services/colour-change |  | More than excellent whether in car protection or after sale service. Had two major incidents and car is like brand new fully protected. Strongly recommend this place for even higher professionalism. |
| 25 | Hazem Nagy | maadi | en | ppf | — (file only) |  | I had PPF and various other services at this place. They are the real deal, perfect in every way. Special thanks to Mr Mohammed Sweilam and Ms Effat for the wonderful customer experience. The car was done earlier than expected and I have zero comments. Amazing experience. |
| 26 | Mohamed Fadel | maadi | en | — | — (file only) | V2 tags this to Maadi but the text says 5th Settlement; mentions a discount — not placed on any page. | It was such an amazing experience, the service was more than excellent starting from the customer service offering all the required details and clear explanation. When I visited the store (5th settlement) the team was very helpful and decent, they offered me the best for my car with a great discount. They have a very professional follow up and after sales. I highly recommend. |
| 27 | Yousef Baghdady | maadi | en | ppf | home |  | Had a great experience with Supakoto when I installed PPF film on my car. The team was very professional, explained everything clearly, and the quality of the work really shows. The film was applied perfectly — no bubbles, no edges showing, just a super clean finish. |
| 28 | Mariam Saeid | maadi | en | — | — (file only) | Mentions offers and a discount — not placed on any page. | It was such an amazing experience, the service was excellent starting from the customer service offering me all the details needed. They also offered me lots of offers to choose from. When I visited the store Mr. Tarek was very helpful and decent; he offered me the best for my car with a great discount. They have high quality materials with expert finishing. I highly recommend. |
| 29 | sh elfeki | maadi | en | ppf | — (file only) |  | I was completely impressed with their professionalism and customer service. High quality films are consistently outstanding which clearly appear on my car, exceeding my expectations with their friendly respectable team and nice place easy to reach. All the thanks for the consistent follow up 🙏🏻🙏🏻🙏🏻. |
| 30 | Esraa Ibrahim | maadi | en | ppf | — (file only) |  | I make protection film at Maadi branch and it was a very wise decision. All the staff is very professional, respectful and helpful, specially Mr Tarek. I asked him millions of questions about protection and about my car and he responded gently and tried to help me in every situation when I scratched my car or had any incident. So thank you to all Maadi staff at Maadi branch, really appreciated. |

### 3. Event table — verified in a real browser

`scripts/e2e-analytics.mjs` (headless Chromium against the production build,
both locales for the booking flow): **84/84**. "Verified" = the in-page event
log + the gtag command queue + fbq() calls + **real network beacons** (GA4
`/g/collect`, Meta `/tr`, TikTok `/api/v2/pixel`) captured by request
interception. Meta's pixel blocks automation by default ("Bot traffic detected")
— the harness hides `navigator.webdriver` so `/tr` beacons flow, and also spies
on `fbq()` as ground truth. GA4's event bodies travel by `sendBeacon` (opaque to
interception) so event names are asserted on the gtag queue and delivery on the
`/g/collect` requests.

| Event | Trigger | Platforms (mapping) | Verified firing |
|---|---|---|---|
| page_view | hard load + every pathname change | GA4 page_view (send_to GA4+Ads) · Meta PageView · TikTok page | yes — 1 on load, exactly 2 after one client nav; GA4/Meta/TikTok beacons seen |
| service_view | service detail mount (ppf, marine-ppf, building…) | GA4 view_item · Meta ViewContent · TikTok ViewContent | yes — 3 pages |
| booking_start | wizard mount | custom ×3 | yes (en+ar) |
| booking_step | each step | custom ×3 | yes — 1:region…8:confirm in order (en+ar) |
| **booking_complete** | confirm click, before window.open | GA4 booking_complete + generate_lead(transaction_id=ref) · Meta **Lead** eventID=ref · TikTok SubmitForm (wire: "Lead") event_id=ref | yes (en+ar) — ref matched across all three + intent log |
| quote_start | quote form mount | custom ×3 | yes |
| **quote_complete** | submit, before window.open | same as booking_complete | yes — Meta Lead eventID=ref, ref line 2 |
| whatsapp_click | FAB, footer, contact, branch card, map popup, pending-service CTA, booking/quote (incl. "open again") | GA4 whatsapp_click · Meta Contact · TikTok Contact | yes — all 8 sources exercised |
| call_click | footer, contact, branch card, map popup | GA4 call_click · Meta Contact · TikTok Contact | yes — regional + branch ids |
| branch_view | card call/whatsapp/directions, map pin popup | custom ×3 | yes — 4 actions |
| form_submit | contact / careers / franchise / business / warranty_claim | GA4 form_submit · Meta Lead (careers → SubmitApplication) · TikTok SubmitForm | yes — 5 forms |
| (static) | every tel:/wa.me anchor on /, /en, /contact, /branches, /services/ppf, /services/marine-ppf, /booking | — | yes — 0 untracked anchors; plus the build guard |

Observed while verifying: GA4 Enhanced Measurement also auto-fires `click`
(outbound) on the WhatsApp links — harmless duplicate signal, turn it off in the
GA4 stream if it clutters reports.

### 4. Payment methods wired — CONFIRM BEFORE CUTOVER

| Region | Method | Asset | Note |
|---|---|---|---|
| Egypt | valU | `public/payment/valu.webp` (from V2) | instalments row |
| Egypt | Banque Misr | `banque-misr.webp` | instalments row |
| Egypt | National Bank of Egypt | `nbe.svg` | instalments row |
| Egypt | CIB | `cib.webp` (V2's 109×33 white "CIB 50" mark, dark chip) | low-res → ASSETS-NEEDED |
| UAE | Tabby | `tabby.webp` | instalments row |
| Both | Visa · Mastercard · American Express · Apple Pay · Google Pay | `visa / mastercard / amex / apple-pay / google-pay.webp` | cards & wallets row |

Displaying a logo implies acceptance — please confirm each is actually accepted
at the branches (esp. the four Egypt instalment programmes and Tabby). V2 also
had `e.webp` (Etisalat?), `vodafone.jpg`, `we.png` under `/payment/eg/` — **not**
in your list, **not** wired.

### 5. Placeholders / ASSETS-NEEDED

- CIB wordmark (proper logo). — Per-branch public rating + count for the
  aggregate line (`content/branches.ts → reviews`; until then: 5.0 · 29 from the
  harvested set). — Testimonial dates/sources if they are Google reviews. —
  Payment acceptance confirmation (above). — Consent banner (open item, §7).

### 6. Green

| Check | Result |
|---|---|
| `pnpm build` (phone-literal guard · claims guard · **analytics-call + untracked-link guard** · next build 56/56) | ✓ |
| `pnpm lint` | ✓ 0 errors, **0 warnings** (BranchGrid `t` fixed) |
| `pnpm typecheck` | ✓ |
| i18n parity | en 1009 keys = ar 1009 keys; no tashkeel in `ar.json` |
| `scripts/smoke.mjs` | 196/196 |
| `scripts/crawl.mjs` | clean (72 URLs, no 404/chains/orphans) |
| `scripts/jsonld-audit.mjs` (+Review/AggregateRating/sameAs rules) | CLEAN — home: Organization + Organization(reviews×4); /about reviews×3; vehicle service pages reviews×2 |
| `scripts/e2e-whatsapp-routing.mjs` | 16/16 |
| `scripts/e2e-analytics.mjs` | **84/84** |

### 7. Open items

- **Consent banner / Consent Mode v2 — not built.** Regulatory position as I
  read it: Egypt's PDPL (Law 151/2020) and the UAE PDPL (Federal Decree-Law
  45/2021) require transparency and a lawful basis for personal-data processing
  but neither enforces an EU-style prior-consent cookie banner today; only
  EU/UK visitors would strictly need one. `initAnalytics()` in
  `lib/analytics.ts` is the single gate if/when we add one. Your decision.
- Vercel env: set `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`,
  `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID` (values in
  `.env.example`) for Production **and** Preview before deploying — without
  them the build ships with tracking silently off.
- Google Ads conversion actions deliberately absent (base tag only).
- Stub forms still fake their submission (Phase 3 backend); `form_submit`
  fires on the fake submit so the funnel is measurable now.
- Meta: after deploy, check Events Manager → pixel 1306471927697780 shows
  PageView / ViewContent / Contact / Lead from supakoto.com; GA4 DebugView with
  `?sk_debug`; TikTok Events Manager for Pageview / Contact / Lead.
