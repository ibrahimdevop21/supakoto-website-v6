# Phase 15 — VP feedback round (Dr. Amer), 2026-08-16

Status: **DONE 2026-08-16 — all items shipped on `feat/vp-feedback-round-1` (local only, not pushed)**; was approved in fully autonomous mode (no gates,
overrides recorded below). Order: A claims (2,3,6,7) → B data/assets (4,5,8) →
C white Arabic (1).

## Execution log

### Group A — claims (items 2, 3, 6, 7) + item 5 (folded in so the new guard is green from its first commit)
- **Item 2:** no Premium-Plus/PPF heat claim existed in V6 (see findings). Added
  spec rule (STRUCTURE-SPEC → "Claim discipline" §2), `scripts/check-claims.mjs`
  heat-in-ppf rule (PPF/TAKAI/warranty/home.takai/home.features.takai keys;
  self-healing keys whitelisted; buildings block excluded), wired into `pnpm build`.
  Copy: hero s2 dropped "and paint" (both locales); `takai.lines.performance.tagline`
  ("built for high-heat markets") neutralised to "High-strength protection for
  everyday driving" — key was never rendered anywhere, kept for parity.
  **Recorded:** the claim most likely lives on the LIVE supakoto.com (V2_Prod) or in
  sales material; V6 being clean does not mean it is not out there.
- **Item 3:** removed all six equivalence sites (takai.ts altName field+value+comment,
  warranty.ts comment + `"TAKAI SILVER (TAKAI 5)"` → `"TAKAI SILVER"`,
  `warranty.breakdown.note` deleted en+ar, TakaiComparison altName render).
  **OQ-3 override applied:** `/warranty` breakdown is now region-aware —
  new `components/sections/warranty/TierBreakdown.tsx` (client, `useRegion`) +
  `tierBreakdownForRegion()`; shows one region's list + the RegionPicker hint.
- **Item 6:** rewrote `home.features.takai.sub` and `about.whoWeAre.body` in both
  locales to distributor framing; grep for all listed variants → 0 (the only hit,
  franchise "workshop fit-out to our spec", is not about the film and the guard is
  scoped to film/TAKAI context). Guard rule `distributor-not-manufacturer`.
- **Item 6 addendum (found during the Arabic read-through):** two more
  manufacturer-framing strings — `franchise.why.1.body` ("TAKAI is made in Japan
  for us alone" / «TAKAI تصنع في اليابان لنا») and `faq.items.whyJapanese.a`
  ("made in Japan to specifications we set" / «بمواصفات نحددها نحن») — rewritten to
  distributor framing in both locales; guard patterns widened (`made in Japan for
  us`, `for us alone`, `specifications we set`, «تصنع في اليابان لنا», «نحددها نحن»).
- **Item 7:** standing traceability rule added to STRUCTURE-SPEC §1 (SK-BLD precedent).
- **Item 5:** `Flag_of_Japan.svg.webp` (960×640 WebP) → `public/images/brand/flag-japan.webp`,
  rendered via `next/image` in the /about stat; `about.stats.exclusive.value` removed
  from both locales; guard rule `emoji-flag` (regional-indicator range) → repo clean.
- Guard also enforces lifetime scoping (allowed namespaces only) so the "lifetime
  guard" Ibrahim referenced is now a real script, not a convention.
- Green: typecheck, lint (1 pre-existing BranchGrid warning), build, both guards.
  Commit `8812a4d`.

### Group B — item 4 phones (regions.ts UNFROZEN per Ibrahim's execution message)
- `content/branches.ts`: all six numbers replaced (display E.164-with-spaces as
  supplied; wa digits derived). `content/regions.ts`: UAE call line → +971 55 205 4478
  (= Dubai branch, intentional); Egypt line unchanged 01103402446 (dedicated main
  line, NOT Alexandria's — recorded as comments in the file so nobody "corrects" it).
  Old UAE 050 call line purged repo-wide (incl. docs). STRUCTURE-SPEC branch table
  updated. Old branch numbers: 0 hits repo-wide.
- **E2E verified** (`scripts/e2e-whatsapp-routing.mjs`, Playwright vs prod build):
  booking wizard + building quote form × {ar,en} × cookie {egypt,uae} × form
  choice {egypt,uae} = **16/16** wa.me targets correct (form choice overrides the
  RegionPicker cookie; Egypt → 201103402446, UAE → 971552054478; the post-submit
  "reopen WhatsApp" link matches). `/branches` DOM: 6 tel: links + 6 wa.me + JSON-LD
  `telephone` all new numbers, all `dir="ltr"`; footer/FAB regional line present.
- Region gating spot-check on the running build: `/warranty` and home TAKAI table
  show TAKAI 5 only with the Egypt cookie and TAKAI SILVER only with the UAE cookie,
  both locales; no "(TAKAI 5)" alias anywhere.
  Commit `1aee293`.

### Group B — item 8 home feature tiles
- **Diagnosis:** the image slot was never wired — `FeatureGrid.tsx` had no image
  element at all (not broken paths, not missing assets). Fixed by adding
  `next/image` fill backgrounds + a bottom-up scrim, min-height 44→56.
- Images (all SupaKoto × TAKAI watermarked, from the sanctioned V2 harvest already
  in `public/images`): فروعنا → `branches/tagamoa.webp` (aerial of the branch);
  التقنية اليابانية → `gallery/sk-034.webp` (film gloss on a bonnet); الضمان →
  `gallery/sk-148.webp` (Prado after full protection); احجز موعدك →
  `gallery/sk-105.webp` (cars in the workshop). No car photo on any buildings
  surface (none of these tiles is a buildings surface).
- Verified on the prod build: all 4 `<img>` load (`naturalWidth>0`), screenshot at
  1280 and 390 legible. ASSETS-NEEDED: SVG-flag note + tile-imagery note logged.
  Commit `c98f155`.

### Group C — item 1 White Arabic (عربية بيضاء)
- CLAUDE.md Arabic rule replaced FIRST (verbatim Dr. Amer rule + simple≠bland +
  Cairo/Dubai/Riyadh test); STRUCTURE-SPEC "Claim discipline" §6 points to it and
  retires the stale "Egyptian dialect" note in the buildings section.
- `messages/ar.json` rewritten against the rule. **en.json untouched.** Key parity
  en↔ar: exact (0 missing either side); ICU placeholders match; no tashkeel; banned
  list (نقدم لكم / أفضل الأسعار / خدمة متميزة / يسعدنا / تجدر الإشارة / نظرا لـ /
  يُعد / من الجدير بالذكر / حيث أن / يقي / يصون / متى شئت / أصلا / بحسب / من دون
  / conditional إن) → 0 hits outside `dev.*` (kitchen-sink strings left as-is).
- Neutral kept: branch names, addresses, product names, spec labels, governorates,
  emirates, gallery alts, TAKAI column labels.
- **What changed and why (patterns):** passives → active/direct («يزال متى شئت» →
  «تزيله متى أردت»); technical calques → plain («رفض الحرارة» → «صد الحرارة»,
  «كاره للماء» → «سطح يطرد الماء», «يماسك الزجاج» → «يثبت الزجاج»); «التدخل
  الخارجي في الفيلم» → «أي عمل على الفيلم خارج فروعنا»; «إن» → «إذا»; «حين» →
  «عندما»; «معتاد» → «عادي»; «فيم» → «كيف»; «تحكم هذه الشروط» → «تنظم»; «ما …
  أصلا؟» (regional) → «ما هو …؟»; the one tashkeel slip «مبانٍ» → «مبان»;
  `about.title` aligned to the EN meaning (the AR had added «بأيد مصرية», which
  is not in the EN and reads wrong for the UAE branch).
- Global everyday-word swaps, counted not flagged: «بحسب»→«حسب», «من دون»→«بدون»
  — 12 additional strings touched by these alone (plus inside the targeted ones).
- **Substantially changed strings — for Ibrahim's review (103):**

| key | before | after |
|---|---|---|
| `home.hero.slides.s1.sub` | أفلام TAKAI تصنع في اليابان — شفافية تامة وحماية تدوم لسنوات | أفلام TAKAI مصنوعة في اليابان — شفافية كاملة وحماية تدوم سنوات |
| `home.hero.slides.s4.sub` | تغيير لون كامل بخامات تزال بأمان والطلاء الأصلي كما هو | تغيير لون كامل بخامات يمكن إزالتها بأمان، والطلاء الأصلي يبقى كما هو |
| `home.hero.slides.s5.title` | استثمار طويل الأمد في سيارتك، لا مصروف | استثمار طويل الأمد في سيارتك — لا مجرد مصروف |
| `home.services.sub` | سيارات ومبانٍ وقوارب وأسطح داخلية — أفلام تاكاي اليابانية نفسها. | سيارات ومبان وقوارب وأسطح داخلية — بأفلام تاكاي اليابانية نفسها. |
| `home.knowMore.sub` | لكل خدمة صفحة كاملة بالتفاصيل والباقات | لكل خدمة صفحة كاملة فيها التفاصيل والباقات |
| `home.features.warranty.sub` | لكل درجة حماية ضمان موثق باسمها | لكل درجة حماية ضمان مكتوب باسمها |
| `home.takai.sub` | المواصفات الكاملة لكل فيلم في سوقك. الضمان يختلف بحسب الفئة — التفاصيل في صفحة أفلام الحماية. | المواصفات الكاملة لكل فيلم في سوقك. الضمان يختلف حسب الفئة — التفاصيل في صفحة أفلام الحماية. |
| `services.index.sub` | خامات يابانية وتركيب بمعايير المصنع — اختر ما يناسبك | خامات يابانية وتركيب بمعايير المصنع — اختر ما يناسب سيارتك |
| `services.items.ppf.benefit` | درع شفاف يتلقى الضربات بدلا من الطلاء | درع شفاف يتحمل الضربات بدل الطلاء |
| `services.items.ppf.problem` | حصى الطريق والرمال والمفاتيح وحوادث النصف سنتيمتر — كلها تترك أثرها في الطلاء الأصلي، وسعر السيارة ينخفض مع كل خدش. | حصى الطريق والرمل والمفاتيح والحوادث الصغيرة — كلها تترك أثرها في الطلاء الأصلي، وسعر السيارة ينخفض مع كل خدش. |
| `services.items.ppf.solutionIntro` | فيلم TAKAI الياباني يركب فوق الطلاء ويتلقى الضرر بدلا منه: | فيلم TAKAI الياباني يركب فوق الطلاء ويتحمل الضرر بدلا منه: |
| `services.items.ppf.solutions.b1` | خامة تلتئم ذاتيا مع الحرارة — الخدوش الخفيفة تختفي | خامة تلتئم ذاتيا مع الحرارة — الخدوش الخفيفة تختفي وحدها |
| `services.items.ppf.solutions.b2` | شفافية كاملة من دون أي تغيير في اللون الأصلي | شفافية كاملة بدون أي تغيير في اللون الأصلي |
| `services.items.ppf.solutions.b3` | حماية من اصفرار الشمس والأمطار الكيميائية | حماية من اصفرار الشمس والأمطار الحمضية |
| `services.items.ppf.solutions.b4` | يزال متى شئت من دون أثر على الطلاء | تزيله متى أردت بدون أي أثر على الطلاء |
| `services.items.ppf.faq.1.a` | لا — خامة TAKAI شفافة تماما وتأخذ شكل الطلاء نفسه. ما يظهر هو اللمعان. | لا — فيلم TAKAI شفاف تماما ويأخذ شكل الطلاء نفسه. ما يظهر هو اللمعان. |
| `services.items.ppf.faq.2.a` | من يوم إلى ثلاثة أيام بحسب التغطية — الجسم الكامل يأخذ وقته ليتم بشكل صحيح. | من يوم إلى ثلاثة أيام حسب التغطية — الجسم الكامل يأخذ وقته حتى يتم بشكل صحيح. |
| `services.items.ppf.faq.5.a` | الالتئام الذاتي يعمل مع الخدوش السطحية. أما القطع العميق فيستبدل جزؤه المتضرر فقط. | الالتئام الذاتي يعالج الخدوش السطحية. أما القطع العميق فنستبدل فيلم الجزء المتضرر فقط. |
| `services.items.heat-isolation.problem` | شمس الصيف تحول المقصورة إلى فرن، وترهق التكييف، وتتلف الفرش ولوحة القيادة على المدى الطويل. | شمس الصيف تحول المقصورة إلى فرن، وترهق التكييف، وتتلف الفرش ولوحة القيادة مع الوقت. |
| `services.items.heat-isolation.solutionIntro` | عازل حراري ياباني يعمل من دون أن يعتم الرؤية: | عازل حراري ياباني يعمل بدون أن يحجب الرؤية: |
| `services.items.heat-isolation.solutions.b1` | رفض عال للحرارة والأشعة فوق البنفسجية | يصد نسبة عالية من الحرارة والأشعة فوق البنفسجية |
| `services.items.heat-isolation.spec.heatRejection.label` | رفض الحرارة | صد الحرارة |
| `services.items.heat-isolation.spec.uvRejection.label` | رفض UV | حجب الأشعة فوق البنفسجية |
| `services.items.heat-isolation.spec.shades.value` | متعددة — بحسب القانون المحلي | عدة درجات — حسب القانون المحلي |
| `services.items.heat-isolation.faq.2.a` | نعم، الفرق ملموس من اليوم الأول — خصوصا عند الوقوف تحت الشمس. | نعم، الفرق واضح من أول يوم — خصوصا عند الوقوف تحت الشمس. |
| `services.items.heat-isolation.faq.3.a` | الدرجات التي نرشحها متوازنة — عزل عال من دون أن تشعر أنك تقود في نفق. | الدرجات التي نرشحها متوازنة — عزل عال بدون أن تشعر أنك تقود في نفق. |
| `services.items.heat-isolation.faq.4.a` | من نصف يوم إلى يوم بحسب عدد الأسطح. | من نصف يوم إلى يوم حسب عدد الأسطح. |
| `services.items.heat-isolation.faq.5.a` | يختلف الضمان بحسب درجة العازل التي تختارها — ويوثق لك مكتوبا عند التركيب. | يختلف الضمان حسب درجة العازل التي تختارها — ونكتبه لك عند التركيب. |
| `services.items.colour-change.problem` | مللت اللون؟ الدهان التقليدي يخفض سعر السيارة ويغلق طريق العودة. | مللت اللون؟ الدهان التقليدي يخفض سعر السيارة ولا يمكن التراجع عنه. |
| `services.items.colour-change.solutions.b2` | يزال في أي وقت والطلاء الأصلي كما هو | يزال في أي وقت والطلاء الأصلي يبقى كما هو |
| `services.items.colour-change.solutions.b4` | تفاصيل تنفذ بصبر: حواف مطوية وقصات نظيفة | تفاصيل مشغولة بصبر: حواف مطوية وقصات نظيفة |
| `services.items.colour-change.faq.2.a` | يستبدل الجزء المتضرر وحده من دون إعادة التغليف كاملا. | نستبدل الجزء المتضرر وحده بدون إعادة التغليف كاملا. |
| `services.items.colour-change.faq.3.a` | لتغيير اللون إجراءات مرورية — نوضحها لك قبل البدء. | تغيير اللون له إجراءات مرورية — نوضحها لك قبل البدء. |
| `services.items.colour-change.faq.4.a` | في أي وقت. الإزالة لدينا آمنة ويخرج الطلاء كما دخل. | في أي وقت. الإزالة عندنا آمنة، ويخرج الطلاء كما دخل. |
| `services.items.colour-change.faq.5.a` | التغليف يحافظ على قيمة السيارة ويمكن التراجع عنه — والدهان لا. | التغليف يحافظ على قيمة السيارة ويمكن التراجع عنه — الدهان لا. |
| `services.items.nano-ceramic.problem` | غسيل وشمس وأمطار — سطح الطلاء يتعب ويفقد لمعانه، والخدوش الدائرية تظهر مع الوقت. | غسيل وشمس ومطر — سطح الطلاء يتعب ويفقد لمعانه، والخدوش الدائرية تظهر مع الوقت. |
| `services.items.nano-ceramic.solutions.b2` | سطح كاره للماء — لا يلتصق به الغبار ولا الطين | سطح يطرد الماء — لا يلتصق به الغبار ولا الطين |
| `services.items.nano-ceramic.solutions.b4` | غسيل أسهل وأسرع من دون خطوط | غسيل أسهل وأسرع بدون خطوط |
| `services.items.nano-ceramic.faq.2.a` | يقلل الخدوش الخفيفة، أما الحماية الحقيقية من الصدمات فمصدرها فيلم الحماية. | يقلل الخدوش الخفيفة، أما الحماية الحقيقية من الصدمات فتأتي من فيلم الحماية. |
| `services.items.nano-ceramic.faq.4.a` | يوم إلى يومين بحسب حالة الطلاء — التجهيز والتلميع قبل السيراميك هما الأهم. | يوم إلى يومين حسب حالة الطلاء — التجهيز والتلميع قبل السيراميك هما الأهم. |
| `services.items.nano-ceramic.faq.5.a` | نعم، وهي أقوى تركيبة: الفيلم يتلقى الصدمات والسيراميك يسهل التنظيف. | نعم، وهي أقوى تركيبة: الفيلم يتحمل الصدمات والسيراميك يسهل التنظيف. |
| `services.items.building-heat-isolation.problem` | الشمس تدخل من الزجاج طوال اليوم: التكييف يعمل بأقصى طاقته والفاتورة ترتفع، وهج على الشاشات، والأثاث والأرضيات تبهت شيئا فشيئا. والحلول التقليدية — ستائر مغلقة أو زجاج داكن — تضيع الضوء والإطلالة. | الشمس تدخل من الزجاج طوال اليوم: التكييف يعمل بأقصى طاقته والفاتورة ترتفع، ووهج على الشاشات، والأثاث والأرضيات تبهت شيئا فشيئا. والحلول التقليدية — ستائر مغلقة أو زجاج داكن — تضيع الضوء والإطلالة. |
| `services.items.building-heat-isolation.solutionIntro` | فيلم واحد يركب على الزجاج ويحل المشكلة من دون تغيير شكل المبنى: | فيلم واحد يركب على الزجاج ويحل المشكلة بدون تغيير شكل المبنى: |
| `services.items.building-heat-isolation.solutions.b4` | يماسك الزجاج إذا انكسر فلا تتناثر الشظايا — أمان إضافي لمن في الداخل | يثبت الزجاج إذا انكسر فلا تتطاير الشظايا — أمان إضافي لمن في الداخل |
| `services.items.building-heat-isolation.positioning` | هناك أفلام أغمق تحقق نسبة عزل كلي أعلى — ولدينا منها لسيارتك. لكننا اخترنا للمباني TK-7099-IR لتوازنه: صد قوي للحرارة مع نفاذية ضوء 70%. إن أردت مكانا أبرد يحتفظ بمعظم ضوء النهار، فهذا اختيارك. | هناك أفلام أغمق تحقق نسبة عزل كلي أعلى — وعندنا منها لسيارتك. لكننا اخترنا للمباني TK-7099-IR لتوازنه: صد قوي للحرارة مع نفاذية ضوء 70%. إذا أردت مكانا أبرد يحتفظ بمعظم ضوء النهار، فهذا اختيارك. |
| `services.items.building-heat-isolation.funnel.s2` | أرسل مقاساتك بنفسك — التقريبية تكفي، ولا حاجة لزيارة مسبقة | أرسل مقاساتك بنفسك — التقريبية تكفي، ولا حاجة إلى زيارة مسبقة |
| `services.items.building-heat-isolation.funnel.s5` | يصل الفنيون، يراجعون المقاسات على الطبيعة، ثم يركبون | يصل الفنيون، يراجعون المقاسات على الطبيعة، ثم يبدأون التركيب |
| `services.items.building-heat-isolation.faq.1.a` | قس عرض وارتفاع كل نافذة أو واجهة زجاجية بالمتر، أو احسب المساحة الكلية بالمتر المربع تقريبيا. لا حاجة لدقة كاملة — الفني يراجع كل المقاسات على الطبيعة قبل التركيب. | قس عرض وارتفاع كل نافذة أو واجهة زجاجية بالمتر، أو احسب المساحة الكلية بالمتر المربع تقريبيا. لا تحتاج إلى دقة كاملة — الفني يراجع كل المقاسات على الطبيعة قبل التركيب. |
| `services.items.building-heat-isolation.faq.2.a` | لا. نسعر على المقاسات التي ترسلها، والمراجعة الفعلية تتم يوم التركيب نفسه. | لا. نحسب السعر على المقاسات التي ترسلها، والمراجعة الفعلية تتم يوم التركيب نفسه. |
| `services.items.building-heat-isolation.faq.3.a` | شقة أو مكتب معتاد ينتهي غالبا في يوم واحد. الواجهات الكبيرة قد تستغرق أكثر، ونحدد المدة المتوقعة في عرض السعر. | الشقة أو المكتب العادي ينتهي غالبا في يوم واحد. الواجهات الكبيرة قد تأخذ وقتا أطول، ونحدد المدة المتوقعة في عرض السعر. |
| `services.items.building-heat-isolation.faq.4.a` | يعدل السعر النهائي وفق القياس الفعلي قبل بدء العمل — لا مفاجآت بعد التركيب. | نعدل السعر النهائي حسب القياس الفعلي قبل بدء العمل — لا مفاجآت بعد التركيب. |
| `services.items.marine-ppf.problem` | الشمس والمياه المالحة والاحتكاك عند الرسو تعمل في هيكل القارب طوال الموسم. يبهت الجل كوت ويفقد عمقه قبل أن يتقدم القارب في العمر. | الشمس والمياه المالحة والاحتكاك عند الرسو تؤثر في هيكل القارب طوال الموسم. الجل كوت يبهت ويفقد عمقه قبل وقته. |
| `services.items.marine-ppf.solutionIntro` | نوسع حماية سوباكوتو لتشمل القوارب. ما سننشره هنا سيتبع القاعدة نفسها في هذا الموقع كله: منتجات تاكاي المؤكدة فقط. | نوسع حماية سوباكوتو لتشمل القوارب. وما سننشره هنا يتبع قاعدة الموقع كله: منتجات تاكاي المؤكدة فقط. |
| `services.items.marine-ppf.pendingBody` | بانتظار تأكيد المنتج من تاكاي. لن ندرج أي فيلم أو مواصفة أو ضمان قبل تأكيد خط المنتجات البحرية كتابيا. | بانتظار تأكيد المنتج من تاكاي. لن نعرض أي فيلم أو مواصفة أو ضمان قبل تأكيد خط المنتجات البحرية كتابيا. |
| `services.items.surface-protection.problem` | أسطح الرخام ومكاتب الاستقبال والأسطح الداخلية الثمينة تتعرض للخدش والتبقع والتآكل — وعلى خلاف الطلاء، لا يمكن إعادة رش الحجر الطبيعي. | أسطح الرخام ومكاتب الاستقبال والأسطح الداخلية الثمينة تتعرض للخدش والبقع والتآكل — وعلى عكس الطلاء، لا يمكن إعادة رش الحجر الطبيعي. |
| `services.items.surface-protection.solutionIntro` | نوسع حماية سوباكوتو لتشمل الأسطح الداخلية. ما سننشره هنا سيتبع القاعدة نفسها في هذا الموقع كله: منتجات تاكاي المؤكدة فقط. | نوسع حماية سوباكوتو لتشمل الأسطح الداخلية. وما سننشره هنا يتبع قاعدة الموقع كله: منتجات تاكاي المؤكدة فقط. |
| `services.items.surface-protection.pendingBody` | بانتظار تأكيد المنتج من تاكاي. لن ندرج أي فيلم أو مواصفة أو ضمان قبل تأكيد خط منتجات الأسطح كتابيا. | بانتظار تأكيد المنتج من تاكاي. لن نعرض أي فيلم أو مواصفة أو ضمان قبل تأكيد خط منتجات الأسطح كتابيا. |
| `takai.matteNote` | درجتا GOLD PLUS وSTEEL PLUS متاحتان بتشطيب مطفي في مصر — الحماية نفسها من دون لمعان. | درجتا GOLD PLUS وSTEEL PLUS متاحتان بتشطيب مطفي في مصر — الحماية نفسها بدون لمعان. |
| `about.title` | حماية يابانية بأيد مصرية محترفة | حماية يابانية، وتركيب على أعلى مستوى |
| `about.whoWeAre.body` | بدأنا سنة 2016 من حب حقيقي للسيارات وقناعة بأن السوق يستحق مستوى آخر من الحماية. أصبحنا الوكيل الحصري لأفلام TAKAI اليابانية الأصلية في مصر والإمارات، وبنينا حولها ورشا بمعايير المصنع نفسه: قياس قبل أي عمل، وتركيب موثق خطوة بخطوة. ومنذ ذلك الحين لم تتوقف الرحلة: شراكات مع شكودا والقصراوي ومنصور، فروع من المعادي إلى التجمع ومن الإسكندرية إلى دبي، حتى تجاوزنا 25 ألف سيارة محمية. هذه هي المحطات الكاملة: | بدأنا سنة 2016 من حب حقيقي للسيارات وقناعة بأن السوق يستحق مستوى آخر من الحماية. أصبحنا الوكيل الحصري لأفلام TAKAI اليابانية الأصلية في مصر والإمارات، وبنينا حولها ورشا بمعايير المصنع نفسه: قياس قبل أي عمل، وتركيب موثق خطوة بخطوة. ومن يومها لم تتوقف الرحلة: شراكات مع شكودا والقصراوي ومنصور، وفروع من المعادي إلى التجمع ومن الإسكندرية إلى دبي، حتى تجاوزنا 25 ألف سيارة محمية. هذه هي المحطات الكاملة: |
| `about.vmv.vision.body` | أن نكون المرجع في حماية السيارات في الشرق الأوسط — الاسم الأول الذي يحضر حين تفكر في حماية استثمارك. | أن نكون المرجع في حماية السيارات في الشرق الأوسط — أول اسم يخطر ببالك عندما تفكر في حماية استثمارك. |
| `about.vmv.mission.body` | أن نجمع بين أعلى خامة يابانية وأعلى مستوى تركيب، وأن نبقي تجربة الحماية شفافة: سعر واضح، ضمان مكتوب، ونتيجة ترى. | أن نجمع بين أفضل خامة يابانية وأعلى مستوى تركيب، وأن نحافظ على تجربة حماية واضحة: سعر واضح، وضمان مكتوب، ونتيجة تراها بعينك. |
| `about.journey.events.8.desc` | افتتحنا فرع التجمع الخامس تلبية للطلب المتزايد. | افتتحنا فرع التجمع الخامس مع زيادة الطلب. |
| `about.journey.events.9.desc` | اتفاقية محورية تسرع توسعنا وحضورنا في السوق. | اتفاقية أساسية تسرع توسعنا وحضورنا في السوق. |
| `warranty.sub` | لكل درجة حماية ضمان موثق باسمها — هذه سياستنا كاملة | لكل درجة حماية ضمان مكتوب باسمها — هذه سياستنا كاملة |
| `warranty.rows.exclusions.value` | الحوادث، والتدخل الخارجي في الفيلم خارج فروعنا، وسوء الاستخدام الواضح | الحوادث، وأي عمل على الفيلم خارج فروعنا، وسوء الاستخدام الواضح |
| `warranty.registration.steps.2` | تستلم كتيب الضمان مدونا فيه الدرجة والمدة | تستلم كتيب الضمان مكتوبا فيه الدرجة والمدة |
| `warranty.registration.steps.4` | أي ملاحظة على الفيلم؟ اتصل بنا فورا قبل أي تدخل خارجي | لاحظت شيئا على الفيلم؟ اتصل بنا فورا قبل أي عمل خارجي عليه |
| `warranty.faq.1.a` | التدخل الخارجي في الفيلم (تركيب أو إصلاح خارج فروعنا)، والحوادث، وسوء الاستخدام الواضح. التفاصيل الكاملة في كتيب ضمان درجتك. | أي عمل على الفيلم خارج فروعنا (تركيب أو إصلاح)، والحوادث، وسوء الاستخدام الواضح. التفاصيل الكاملة في كتيب ضمان درجتك. |
| `warranty.faq.2.a` | لا — لكل درجة مدة وشروط باسمها. لهذا لا يوجد رقم واحد على الموقع كله. | لا — لكل درجة مدة وشروط باسمها. لهذا لا يوجد رقم واحد في الموقع كله. |
| `warranty.buildings.note` | ضمان منتج المباني TK-7099-IR عشر سنوات من TAKAI — منفصل تماما عن فئات السيارات أعلاه. | ضمان منتج المباني TK-7099-IR عشر سنوات من TAKAI — منفصل تماما عن درجات السيارات أعلاه. |
| `booking.success` | جهزنا لك رسالة واتساب بكل تفاصيل حجزك — أرسلها وسنرد عليك بتأكيد الموعد. | جهزنا لك رسالة واتساب فيها كل تفاصيل حجزك — أرسلها وسنرد عليك بتأكيد الموعد. |
| `booking.stub` | الحجز المباشر عبر الموقع يفعل قريبا — حاليا يتم التأكيد عبر واتساب. | الحجز المباشر من الموقع يفعل قريبا — حاليا يتم التأكيد عبر واتساب. |
| `franchise.why.2.title` | علامة مبنية | علامة معروفة |
| `franchise.why.2.body` | اسم قائم بعملاء يعودون ويرشحون | اسم له عملاء يعودون إليه ويرشحونه |
| `franchise.formHeading` | قدم على الامتياز | قدم طلب الامتياز |
| `franchise.success` | وصلنا طلبك — إن وجد توافق نتواصل معك خلال أيام. | وصلنا طلبك — إذا وجدنا توافقا نتواصل معك خلال أيام. |
| `franchise.faq.2.a` | تختلف بحسب جاهزية الموقع — نحدد جدولا واضحا بعد تقييم المكان. | تختلف حسب جاهزية الموقع — نحدد جدولا واضحا بعد تقييم المكان. |
| `franchise.faq.3.a` | لا، لكننا نساعدك على بناء دراسة جدوى واقعية قبل الالتزام. | لا، لكننا نساعدك على بناء دراسة جدوى واقعية قبل أن تلتزم. |
| `faq.items.whatIsPpf.q` | ما فيلم حماية الطلاء أصلا؟ | ما هو فيلم حماية الطلاء؟ |
| `faq.items.whatIsPpf.a` | طبقة TPU شفافة تركب فوق الطلاء وتتلقى الخدوش والحصى بدلا منه — وتزال من دون أثر. | طبقة TPU شفافة تركب فوق الطلاء وتتحمل الخدوش والحصى بدلا منه — وتزال بدون أثر. |
| `faq.items.howLongInstall.a` | بحسب الخدمة: العازل نصف يوم إلى يوم، الفيلم من يوم إلى ثلاثة أيام، السيراميك يوم إلى يومين. | حسب الخدمة: العازل من نصف يوم إلى يوم، الفيلم من يوم إلى ثلاثة أيام، السيراميك من يوم إلى يومين. |
| `faq.items.bookingDeposit.a` | نؤكد هذه التفاصيل معك في مكالمة تأكيد الحجز — بحسب الخدمة والفرع. | نؤكد هذه التفاصيل معك في مكالمة تأكيد الحجز — حسب الخدمة والفرع. |
| `faq.items.whichBranch.q` | أي فرع أقصد؟ | أي فرع أختار؟ |
| `faq.items.warrantyTiers.a` | لأن الضمان يتبع درجة الحماية. لكل درجة مدة وشروط مكتوبة باسمها — وهذا أوضح من وعد عام مبهم. | لأن الضمان يتبع درجة الحماية. لكل درجة مدة وشروط مكتوبة باسمها — وهذا أوضح من وعد عام غامض. |
| `faq.items.warrantyVoid.a` | تدخل خارجي في الفيلم، أو حوادث، أو سوء استخدام واضح. التفاصيل في كتيب ضمان درجتك. | أي عمل على الفيلم خارج فروعنا، أو حوادث، أو سوء استخدام واضح. التفاصيل في كتيب ضمان درجتك. |
| `faq.items.bhiMeasure.a` | قس عرض وارتفاع كل نافذة أو واجهة زجاجية بالمتر، أو احسب المساحة الكلية بالمتر المربع تقريبيا. لا حاجة لدقة كاملة — الفني يراجع كل المقاسات على الطبيعة قبل التركيب. | قس عرض وارتفاع كل نافذة أو واجهة زجاجية بالمتر، أو احسب المساحة الكلية بالمتر المربع تقريبيا. لا تحتاج إلى دقة كاملة — الفني يراجع كل المقاسات على الطبيعة قبل التركيب. |
| `faq.items.bhiVisit.a` | لا. نسعر على المقاسات التي ترسلها، والمراجعة الفعلية تتم يوم التركيب نفسه. | لا. نحسب السعر على المقاسات التي ترسلها، والمراجعة الفعلية تتم يوم التركيب نفسه. |
| `faq.items.bhiDuration.a` | شقة أو مكتب معتاد ينتهي غالبا في يوم واحد. الواجهات الكبيرة قد تستغرق أكثر، ونحدد المدة المتوقعة في عرض السعر. | الشقة أو المكتب العادي ينتهي غالبا في يوم واحد. الواجهات الكبيرة قد تأخذ وقتا أطول، ونحدد المدة المتوقعة في عرض السعر. |
| `faq.items.bhiMismatch.a` | يعدل السعر النهائي وفق القياس الفعلي قبل بدء العمل — لا مفاجآت بعد التركيب. | نعدل السعر النهائي حسب القياس الفعلي قبل بدء العمل — لا مفاجآت بعد التركيب. |
| `contact.complaintNote` | تراجع الإدارة الشكاوى مباشرة ونرد خلال يومي عمل. | الإدارة تراجع الشكاوى مباشرة ونرد خلال يومي عمل. |
| `careers.noOpenings` | لا وظائف معلنة حاليا — لكن إن رأيت نفسك إضافة، أرسل لنا وسنحتفظ ببياناتك. | لا توجد وظائف معلنة حاليا — لكن إذا كنت ترى أنك إضافة لنا، أرسل بياناتك وسنحتفظ بها. |
| `careers.fields.message` | أخبرنا لماذا أنت | أخبرنا لماذا أنت الشخص المناسب |
| `careers.success` | وصلنا طلبك — سنراجعه ونتواصل إن وجد تطابق. | وصلنا طلبك — سنراجعه ونتواصل معك إذا وجدنا تطابقا. |
| `privacy.sections.use.title` | فيم نستخدمها | كيف نستخدمها |
| `privacy.sections.cookies.body` | نستخدم ملف كوكيز واحدا لحفظ اختيارك للمنطقة (مصر / الإمارات). لا تتبع إعلاني. | نستخدم ملف كوكيز واحدا لحفظ اختيارك للمنطقة (مصر / الإمارات). بدون أي تتبع إعلاني. |
| `terms.sections.scope.body` | تحكم هذه الشروط استخدام موقع سوباكوتو وحجز خدماتنا في مصر والإمارات. | تنظم هذه الشروط استخدام موقع سوباكوتو وحجز خدماتنا في مصر والإمارات. |
| `terms.sections.booking.body` | يؤكد الحجز بعد التواصل معك. إن احتجت إلى تعديل الموعد، أخبرنا قبله بيوم على الأقل. | يؤكد الحجز بعد التواصل معك. إذا احتجت إلى تعديل الموعد، أخبرنا قبله بيوم على الأقل. |
| `terms.sections.liability.body` | نلتزم بمعايير التركيب الموثقة. أي ملاحظة على الخدمة تراجعها الإدارة وتعالج وفق سياسة الضمان. | نلتزم بمعايير التركيب الموثقة. أي ملاحظة على الخدمة تراجعها الإدارة وتعالج حسب سياسة الضمان. |
| `notFound.sub` | ربما تغير الرابط — عد إلى الرئيسية وستجد طريقك | ربما تغير الرابط — ارجع إلى الرئيسية وستجد طريقك |
| `buildingQuote.sub` | أرسل مقاساتك وسنرد عليك بعرض سعر وموعد مقترح — من دون زيارة مسبقة. | أرسل مقاساتك وسنرد عليك بعرض سعر وموعد مقترح — بدون زيارة مسبقة. |
| `buildingQuote.disclaimer` | المقاسات التقريبية تكفي. يراجع الفني كل شيء على الطبيعة يوم التركيب، ويؤكد السعر النهائي قبل بدء العمل. | المقاسات التقريبية تكفي. الفني يراجع كل شيء على الطبيعة يوم التركيب، ويؤكد السعر النهائي قبل بدء العمل. |
| `buildingQuote.success` | تم — فتحنا لك واتساب برسالة فيها كل التفاصيل. إن لم تفتح تلقائيا، استخدم الزر أدناه. | تم — فتحنا لك واتساب برسالة فيها كل التفاصيل. إذا لم تفتح تلقائيا، استخدم الزر أدناه. |

- Commit `65a58bb`.

### Final gate (after all groups)
- `pnpm typecheck` ✓ · `pnpm lint` ✓ (0 errors; 1 pre-existing BranchGrid warning) ·
  `pnpm build` ✓ (phone-literal guard ✓, claims guard ✓, 42/42 pages) ·
  en/ar parity ✓ · `scripts/smoke.mjs` **97/97** (recreated + persisted, since the
  Phase-14 43-check script lived in a cleared scratchpad) ·
  `scripts/e2e-whatsapp-routing.mjs` **16/16**.
- Overrides applied vs. the original brief: OQ-2(b) tagline removed (was "keep");
  OQ-3 /warranty made region-aware (was "keep both lists"); regions.ts unfrozen
  and UAE line changed (was "frozen"); item 5 folded into the group-A commit so
  the new guard was green from its first commit.
- Not pushed. Merge/push is Ibrahim's call.

- CTA/button wrap at 390px: measured every `a`/`button` CTA on 15 routes with the
  rebuilt Arabic — no CTA overflows or wraps; no button label was lengthened by this
  pass. (Longest existing labels: «تفاصيل الحماية والضمان», «أرسل الطلب عبر واتساب»,
  «افتح واتساب مجددا» — all single-line at 390.)


═══ BRIEF vp-feedback-round-1 ═══

## READ FIRST (in order)
1. `CLAUDE.md` — Content rules (Arabic register line is being replaced by this brief)
2. `docs/STRUCTURE-SPEC.md` — `/about`, `/services`, `/warranty` sections
3. `content/warranty.ts` header comment (lifetime scoping law) and `content/takai.ts`
4. `content/regions.ts` + `content/branches.ts` + `scripts/check-phone-literals.mjs`
5. `docs/progress/14-services-one-page.md` (current services architecture)

## SCOPE
Six items from Dr. Amer's review. Items 2, 3, 6 are **claim corrections = blocking**;
they ship first, before the Arabic rewrite.

| # | Item | Class |
|---|------|-------|
| 2 | Premium Plus / PPF must carry no heat-isolation claim | claim correction |
| 3 | Delete "TAKAI Silver = TAKAI 5" equivalence; UAE says Silver only | claim correction |
| 6 | `/about` (and any other surface): distributor framing, not "made for us" | claim correction |
| 4 | Branch phone numbers — full replacement (regions.ts frozen) | data |
| 5 | Replace 🇯🇵 emoji with image asset; no emoji flags anywhere | asset |
| 1 | Arabic register → White Arabic; CLAUDE.md first, then ar.json rewrite | copy |

**NOT IN SCOPE:** any change to `content/regions.ts` (frozen until Ibrahim confirms
the new main Egypt line); TAKAI spec values; warranty terms/years; marine/interior
pending-product pages (still blocked); English copy beyond the three claim fixes;
push/merge/deploy.

## FINDINGS FROM THE CODE (what the brief is built on)

**Item 2 — Premium Plus / heat.** Searched all 43 heat/UV/IR strings in each locale,
plus `content/`, `components/`, `app/`, docs, and git history. **There is no
statement in the current codebase that Premium Plus (or PPF) provides heat
isolation.** The only heat mentions in PPF contexts are:
- `services.items.ppf.solutions.b1` — self-healing "with heat" (physically correct,
  not an isolation claim; keep)
- `warranty.rows.selfHealing.value`, `faq.items.selfHealing.a` — same (keep)
- `takai.lines.performance.tagline` — "built for high-heat markets like the Middle
  East" (durability framing, not isolation; borderline — see OQ-2)
- `home.hero.slides.s2.sub` — "Heat isolation that protects **cabin and paint**
  from Egyptian and Gulf summers" — this is the *heat-isolation* slide, but "and
  paint" blurs the glass-film/PPF line Dr. Amer is drawing (see OQ-2)
Everything else is on the automotive heat-isolation or building heat-isolation
surfaces, which stay untouched.
→ Likely Dr. Amer saw this on the **old supakoto.com** or heard it in sales copy,
not on V6. I will still add a spec rule + build guard so it cannot appear.

**Item 3 — Silver = TAKAI 5.** Equivalence lives in exactly 6 places:
`content/takai.ts:17,51,52` (`altName: "TAKAI 5"` on SILVER), `content/warranty.ts:68,110`
(`"TAKAI SILVER (TAKAI 5)"`), `messages/{en,ar}.json` `warranty.breakdown.note`,
and the `altName` render in `TakaiComparison.tsx:77`. Product naming is **already
region-aware** for the TAKAI table (Signature line = UAE shows SILVER; Performance
line = Egypt shows TAKAI 5; driven by RegionPicker/RegionProvider). The one
non-region-aware surface is **`/warranty` "Terms by tier"**, which renders the
Egypt AND UAE breakdowns side by side to every visitor (see OQ-3).

**Item 6 — "made for us".** Two strings, both locales:
`about.whoWeAre.body` ("a Japanese film made exclusively for us" / «خامة يابانية
تصنع خصيصا لنا») and **`home.features.takai.sub`** ("film made in Japan, exclusively
for us" / «خامة تصنع في اليابان لنا حصريا»). `about.sub`/`about.stats.exclusive.label`
already say «الوكيل الحصري» (exclusive agent) — that framing is correct and stays.

**Item 4 — phones.** `content/branches.ts` holds the six branch numbers; consumers
are all data-driven (BranchGrid, BranchMap, Footer, WhatsAppFab, forms, JSON-LD in
`app/[locale]/branches/page.tsx` via `b.phone`). Build guard forbids literals
elsewhere, so the change is one file. `content/regions.ts` Egypt line =
`+20 110 340 2446` / wa `201103402446` = old Alexandria number → **FROZEN**.
UAE regional: call (old 050 line, since retired), WhatsApp `971552054478` (already = new Dubai
branch number).

**Item 5 — flags.** Exactly one emoji flag in the repo: `about.stats.exclusive.value`
= 🇯🇵 (both locales), rendered at `app/[locale]/about/page.tsx:111`. No 🇪🇬/🇦🇪/🇸🇦
anywhere (RegionPicker is text-only). Ibrahim's file is already at repo root:
`Flag_of_Japan.svg.webp` — note it is a **WebP raster**, not an SVG.

**Item 1 — Arabic.** `messages/ar.json` = 886 strings. Current CLAUDE.md rule is
plain MSA (2026-08-07). Rewrite target is White Arabic per Dr. Amer.

## LOCKED DECISIONS (proposed — override earlier phrasing once approved)
1. **Order of work:** claim corrections (2, 3, 6) → data/asset (4, 5) → Arabic
   rewrite (1). Each group is its own commit; Arabic rewrite is its own commit(s)
   so the substantive-change list is reviewable in isolation.
2. **Item 2 scope = PPF contexts only.** Automotive heat-isolation service, building
   heat-isolation service, and self-healing "heals with heat" wording are untouched.
   Add to STRUCTURE-SPEC + `content/warranty.ts` header: *"PPF / Premium Plus is
   body-panel paint protection. It never claims heat isolation, IR/UV rejection, or
   cabin temperature benefit. Glass heat isolation is a separate product and
   service."* Add a build guard (`scripts/check-claims.mjs`) that fails if
   heat/IR/عازل/حرار terms appear inside `services.items.ppf.*`,
   `*.premiumPlus*`, or `warranty.tiers/rows` keys (self-healing rows whitelisted).
3. **Item 3:** delete `altName` field + render, delete both `breakdown.note` strings,
   change UAE breakdown label to `"TAKAI SILVER"`, rewrite `warranty.ts` comment.
   Add STRUCTURE-SPEC rule: *"TAKAI SILVER (UAE) and TAKAI 5 (Egypt) are never
   named together or described as equivalent. Product names are region-scoped."*
   Add the same to the claims guard (fail on `SILVER` and `TAKAI 5` in one string).
4. **Item 6 applies site-wide**, not only `/about` — both `about.whoWeAre.body` and
   `home.features.takai.sub` get distributor framing ("exclusive distributor of
   TAKAI in Egypt and the UAE — film engineered in Japan"). STRUCTURE-SPEC gains:
   *"SupaKoto is TAKAI's exclusive distributor. Never 'made for us / to our spec /
   exclusively for SupaKoto'."* Guard fails on `made (exclusively )?for us`,
   `خصيصا لنا`, `لنا حصريا`.
5. **Item 4:** replace all six numbers in `content/branches.ts` (display + wa
   digits, LTR). `regions.ts` untouched; I report its values (above) and stop.
   Damietta stays `franchise: true`; capacities unchanged.
6. **Item 5:** relocate `Flag_of_Japan.svg.webp` → `public/images/brand/flag-japan.webp`
   (brand-adjacent, not a partner logo), render via `next/image` at a fixed height
   in the stat slot; `about.stats.exclusive.value` key removed from both locales.
   Add STRUCTURE-SPEC line "no emoji flags anywhere" + guard on the regional-
   indicator emoji range.
7. **Item 1:** CLAUDE.md Arabic line replaced by the White Arabic rule verbatim
   (Dr. Amer's five bullets + the "simple ≠ bland" clause + the Cairo/Dubai/Riyadh
   test). Then rewrite `ar.json` in passes by namespace; every string whose
   meaning/structure changed (not just a synonym swap) is listed in this doc for
   Ibrahim's review with before/after. English is not touched in this item.
8. Every phase ends green: `pnpm build`, `pnpm lint`, phone-literal guard, new
   claims guard, and the 43-check smoke script from Phase 14 still passing.

## OPEN QUESTIONS (answer or accept the proposed default)
- **OQ-1 (item 2):** No explicit claim exists in V6. Do you want the extra guard +
  spec rule only (proposed), or do you know a specific surface Dr. Amer was
  looking at (old site? PDF? Meta ad)? If it's the old site, that's outside V6.
- **OQ-2 (item 2 edges):** (a) `home.hero.slides.s2.sub` "protects cabin **and
  paint**" — drop "and paint" so the heat-isolation slide speaks only about glass/
  cabin? *Default: yes, drop it.* (b) `takai.lines.performance.tagline` "built for
  high-heat markets" — keep (durability, not isolation)? *Default: keep.*
- **OQ-3 (item 3):** `/warranty` "Terms by tier" shows Egypt and UAE lists side by
  side to all visitors, so a UAE reader still sees "TAKAI 5" under the Egypt
  heading. Options: (a) keep both lists, just remove the equivalence — *default*;
  (b) make `/warranty` region-aware like the TAKAI table (show only the visitor's
  region, with the switch hint). (b) is a structural change to a spec'd page.
- **OQ-4 (item 4):** Dubai's new branch number `+971 55 205 4478` equals the current
  UAE regional WhatsApp digits. Confirm the UAE regional **call** line
  the old 050 call line in `regions.ts` also stays as-is (frozen with Egypt)?
  *Default: yes, whole file frozen.*
- **OQ-5 (item 5):** The asset is WebP, not SVG. Use it as-is (fine for a ~40px
  stat glyph) or do you want me to draw a clean inline SVG (red disc on white,
  4:3 or 3:2)? *Default: use your WebP; SVG on request.*
- **OQ-6 (item 1):** "Flag every string changed substantially" — threshold I'll use:
  restructured sentence, changed meaning, or changed a headline/CTA. Pure
  vocabulary swaps (يقي→يحمي) are listed as a count only. OK?

## PHASES & GATES
| Phase | Work | Halt condition | Unlocks |
|---|---|---|---|
| 15a | Items 2+3+6 (claims) + STRUCTURE-SPEC + claims guard | build/lint/guards green | commit `fix(claims): …` |
| 15b | Item 4 branches.ts (+ report regions.ts, stop) + item 5 flag | green + phone guard | commit `chore: …` |
| 15c | Item 1: CLAUDE.md rule, then ar.json rewrite by namespace | green + review list in this doc | commit(s) `copy(ar): …` |
| gate | Ibrahim reviews the substantive-change list; smoke pass | his word | push |

## GIT DISCIPLINE
Branch `feat/vp-feedback-round-1` off `main` (which is pushed, `3f52b78`). Local
commits only; imperative subjects; no trailers. Push/merge only on Ibrahim's word.

## SMOKE CRITERIA
- 15a: grep for `TAKAI 5` returns hits only in Egypt-scoped data; `altName` gone;
  no `made for us`/`خصيصا لنا`; claims guard passes; `/warranty`, `/services`,
  `/about`, `/` render both locales; lifetime qualifier still adjacent to every
  "lifetime" (Phase 14 checks 43/43).
- 15b: six numbers verified in `/branches` DOM + JSON-LD + wa.me links, all LTR;
  `regions.ts` byte-identical to `main`; no U+1F1E6–1F1FF in repo; flag image 200.
- 15c: ar.json key parity with en.json (script), no tashkeel, no phone digits, no
  clichés/classical constructions (grep list), banned-word list from Dr. Amer's
  bullets = 0 hits; review list published in this doc.

### Round 2 — second copy reviewer, filtered subset (2026-08-16, later)
Applied only what Ibrahim listed. Rejected items NOT applied (hero s5 «ما تملكه»,
positioning «لفئات أخرى», «فيها»→«تضم», «مشغولة بصبر»→«منفذة بعناية», «بدون»→«من دون»).
- **Critical scope fixes:** `services.index.sub` «اختر ما يناسبك»; `about.vmv.vision.body`
  «المرجع في حلول الحماية» + EN "reference in protection solutions"; `about.vmv.mission.body`
  «أفلام TAKAI اليابانية وأعلى مستوى تركيب» + EN "genuine Japanese TAKAI film with the highest
  standard of installation" (was "the finest … the finest" — claim fix, superlative).
- **Superlative guard rule** added to `check-claims.mjs` (best/finest/number one/أفضل/الأفضل/الأول
  on brand/product/quality/price; self-tested with an injected violation) + STRUCTURE-SPEC §1.
- **Shared-surface sweep (both locales, keys under nav/home non-slide/services.index/warranty/
  about/contact/footer/chrome/faq headings/booking title):**
  FIXED — `home.knowMore.title` («ما الذي يناسبك؟» / "Not sure what you need?"),
  `services.index.title` («الحماية المناسبة لك» / "Protection, matched to you"),
  `about.vmv.values.body` («وكل ما يدخل ورشتنا نعامله كأنه ملكنا» / "Everything in our workshop…").
  KEPT (deliberate, reported): `home.title` «حماية يابانية لسيارتك» — the exact phrasing Dr. Amer
  cited as the model of simple-and-specific; `about.cta.title` "Ready to protect your car?" — its
  CTA is /booking, which is vehicle-only by spec; `about.whoWeAre.body` "love of cars" (origin
  story) and `about.stats.cars` (a factual stat); `warranty.rows.transferable`, `warranty.qualifier`,
  `warranty.registration.steps.1` — the vehicle tier warranty (buildings has its own block);
  `nav.servicesPpf` (product name) and `nav.servicesHeatCars` (explicitly the cars variant);
  `about.journey.events.1` already says "cars and architectural facades". Footer/contact: no hits.
- **Minor phrasing** (6) applied as listed. **فيلم vs خامة:** product references → «فيلم»
  (`ppf.solutions.b1`, `about.documentary.sub`, `faq.whyJapanese.q`, `faq.whichBranch.a`,
  `franchise.get.6`); «خامة/خامات» kept where abstract (spec "Material" labels, «عيوب الخامة
  والتركيب», «خامات يابانية» on the index, vinyl wrap strings, «معيار الخامات»).
- **Logged, not removed** (ASSETS-NEEDED): 25,000 cars stat; Škoda/Kasrawy/Mansour partnerships.
- Green: typecheck, lint (0 errors), build 42/42, both guards, en/ar parity, no tashkeel.

### Pre-merge pass (2026-08-16, later)
- `home.title` neutralised per Ibrahim's (b): «سوباكوتو — حماية يابانية أصلية» /
  "SupaKoto — Genuine Japanese protection".
- Partnerships Škoda / Kasrawy / Mansour **confirmed by Ibrahim Mohamed 2026-08-16** —
  provenance in `content/partners.ts` (`PARTNERSHIP_CLAIMS`), ASSETS-NEEDED item closed;
  the 25,000-cars figure stays logged as needing a traceable source.
- Screenshot review surfaced `services.items.heat-isolation.benefit` "cooler cabin, **paint**
  protected from the sun" — same glass-film/paint blur as the approved OQ-2(a) hero fix;
  changed to "interior protected from the sun" / «وفرش محمي من الشمس» both locales.
- Combined-state verification on a fresh prod build: `smoke.mjs` 97/97 · `e2e-whatsapp-routing.mjs`
  16/16 · / and /services at 390 + 1440, ar + en: 8 screenshots, no console/page errors, all 4
  feature-tile images load at every size · `/warranty` gating: Egypt cookie → TAKAI 5 only,
  UAE cookie → SILVER only, both locales.
- Incident during the pass: a `next dev` on :3000 had overwritten `.next` under the running
  prod server (all `_next/static` 400, hydration stalled). Not a code fault; killed, rebuilt,
  re-ran → green. Reminder: never run `pnpm dev` and `pnpm start` from the same checkout.
