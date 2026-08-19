import type { ServiceId } from "./services";

/**
 * Customer testimonials — HARVESTED VERBATIM from the V2 site
 * (`supakoto-Website_V2_Prod/src/data/testimonials.ts`, 30 entries, all
 * rated 5, no dates, no explicit source field; the names/branches are the
 * V2 attributions — they read as Google reviews but V2 never stated that).
 *
 * Rules (Ibrahim, 2026-08-19): nothing invented, nothing "improved". Each
 * entry has exactly one ORIGINAL language (`original`); the other language
 * is a faithful translation of that text, marked `translated`. Quotes are
 * customer speech, so the white-Arabic register does not apply to the
 * originals (Egyptian / Gulf dialect stays as written); translations INTO
 * Arabic use plain white Arabic.
 *
 * V2 #18 (mohamed elseman) is intentionally NOT in this file: its text
 * ("the best protection of my car") trips the superlative claims guard,
 * and the guard is not edited to make copy pass. Recorded in the Phase-18
 * report for Ibrahim's call.
 *
 * Service tags are inferred from the text (the V2 file had none); `[]`
 * means the review doesn't name a specific service.
 */
export type TestimonialSource = "v2-site";

export type Testimonial = {
  /** V2 id, kept for traceability back to the harvest. */
  id: number;
  name: string;
  /** content/branches.ts id. */
  branch: string;
  /** Service(s) the review speaks about; [] = general. */
  services: ServiceId[];
  rating: 1 | 2 | 3 | 4 | 5;
  /** V2 carried no dates. */
  date?: string;
  /** Which language the customer actually wrote in. */
  original: "ar" | "en";
  text: { ar: string; en: string };
  source: TestimonialSource;
  /** Anything Ibrahim should know before it ships (mismatches, product names). */
  note?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ebraheem A",
    branch: "dubai",
    services: ["heat-isolation"],
    rating: 5,
    original: "ar",
    source: "v2-site",
    text: {
      ar: "السلام عليكم انصح فيه بقوه من توصل لين تستلم سيارتك الشغل والمعامله ممتازه وأسعارهم بالمتناول شكرا أستاذ عمر و شريف ومش قصور بالباقي اخترت ٥٠٪؜ عزل الحراره ممتاز وواضح من الداخل",
      en: "Peace be upon you. I strongly recommend them — from the moment you arrive until you collect your car, the work and the treatment are excellent, and their prices are reasonable. Thank you Mr. Omar and Sherif, and no less to the rest of the team. I chose the 50% heat isolation — excellent, and clear from the inside.",
    },
  },
  {
    id: 2,
    name: "nithin premnath",
    branch: "dubai",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I recently had a full PPF applied to my Mazda CX-60 by the Supakoto team in Dubai, and I’m thoroughly impressed with the entire experience. The quality of the work is flawless — the finish is seamless, and the attention to detail is clearly visible from every angle. Special credit to Sherif and Hisham, who were incredibly helpful throughout the process. I highly recommend Supakoto for anyone considering PPF in Dubai. Outstanding service from start to finish!",
      ar: "ركّبت مؤخرًا فيلم حماية كامل (PPF) على سيارتي مازدا CX-60 عند فريق سوباكوتو في دبي، والتجربة كلها أبهرتني. جودة العمل بلا أخطاء — التشطيب متصل بلا فواصل، والاهتمام بالتفاصيل واضح من كل زاوية. شكر خاص لشريف وهشام اللذين ساعداني كثيرًا طوال العملية. أنصح بسوباكوتو بشدة لكل من يفكر في تركيب PPF في دبي. خدمة ممتازة من البداية إلى النهاية!",
    },
  },
  {
    id: 3,
    name: "Mohamed Taha",
    branch: "dubai",
    services: ["ppf"],
    rating: 5,
    original: "ar",
    source: "v2-site",
    text: {
      ar: "بعد دراسة ومقارنة لأغلب مراكز الـ PPF في السوق لمدة شهر تقريبًا، قررت التعامل مع SUPA KOTO بناءً على تواصل الأستاذ عمر المحترم الذي كان صبورًا وواضحًا وصادقًا في توضيح الفروقات وطمأنني بجودة الخدمة – وقد كان عند وعده. سلمت لهم سيارتي وسيارة أخي، ووجدت احترافية عالية، دقة في التفاصيل، ومعاملة راقية من كل الطاقم، وعلى رأسهم الأستاذ شريف مدير الفرع، والأستاذ هشام. المنتج المستخدم ياباني بجودة ممتازة والنتيجة النهائية رائعة، وأنصح بالتعامل معهم.",
      en: "After about a month of studying and comparing most of the PPF centres on the market, I decided to go with SUPA KOTO because of my contact with the respected Mr. Omar, who was patient, clear and honest in explaining the differences and reassured me about the quality of the service — and he kept his word. I handed over my car and my brother's car, and found high professionalism, precision in the details, and refined treatment from the whole crew, led by Mr. Sherif, the branch manager, and Mr. Hisham. The product used is Japanese, of excellent quality, and the final result is wonderful. I recommend dealing with them.",
    },
  },
  {
    id: 4,
    name: "Hany Fathy",
    branch: "dubai",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I had a great experience with Supa Koto, they made my Avatr look fantastic. Highly recommended. Special thanks to Mr. Sherif and all the staff.",
      ar: "تجربتي مع سوباكوتو كانت رائعة، جعلوا سيارتي أفاتر تبدو مذهلة. أنصح بهم بشدة. شكر خاص للأستاذ شريف ولكل فريق العمل.",
    },
  },
  {
    id: 5,
    name: "Hassan Adam",
    branch: "dubai",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Very professional and great work. Also good after sale follow up — highly recommend.",
      ar: "احترافية عالية وعمل رائع. ومتابعة جيدة بعد البيع أيضًا — أنصح بهم بشدة.",
    },
  },
  {
    id: 6,
    name: "Engy Ibrahim",
    branch: "dubai",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Original 100% and after sales service is perfect with annual check ups and maintenance 👌",
      ar: "أصلي 100% وخدمة ما بعد البيع ممتازة، مع فحص وصيانة سنوية 👌",
    },
  },
  {
    id: 7,
    name: "mohamed fishar",
    branch: "dubai",
    services: [],
    rating: 5,
    original: "ar",
    source: "v2-site",
    text: {
      ar: "شركة ممتازة والاسعار أقل بكتير من الشركات الأخرى وفريق العمل متمكن وأعلى كفاءة وجودة وسرعة. أنصح بالتعامل معهم.",
      en: "An excellent company, with prices much lower than other companies, and a capable team with the highest efficiency, quality and speed. I recommend dealing with them.",
    },
    note: "Mentions prices being lower than competitors — brand framing avoids price talk; not placed on any page.",
  },
  {
    id: 8,
    name: "Ahmed El Hariry",
    branch: "dubai",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Had a great experience and a great service with the place and with Hesham. The details and the service are brilliant.",
      ar: "تجربة رائعة وخدمة رائعة مع المكان ومع هشام. التفاصيل والخدمة ممتازة.",
    },
  },
  {
    id: 9,
    name: "Michaelangelo D'Sa",
    branch: "dubai",
    services: ["ppf", "heat-isolation"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I had done a month of research, which included reading about PPF and the options I had here in Dubai. I even visited the 3 companies shortlisted for the job. I decided to use Supakoto purely due to the fact that Japan quality goes without question, and moreover, I managed to get the Ramadan deal that was on offer. This also included complete window tinting. After meeting up with Mr Hisham, I was convinced that I would not be disappointed. On the day I received my 2025 Lexus nx350h from the showroom, I drove directly to Al quoz and handed my car to Mr Hisham. It took almost a week, but the final outcome was nice.",
      ar: "قمت ببحث استمر شهرًا، شمل القراءة عن PPF والخيارات المتاحة لي هنا في دبي. وزرت حتى الشركات الثلاث التي رشحتها للمهمة. قررت التعامل مع سوباكوتو فقط لأن الجودة اليابانية لا تحتاج إلى نقاش، وفوق ذلك حصلت على عرض رمضان الذي كان متاحًا. وشمل ذلك أيضًا تظليل النوافذ بالكامل. بعد لقائي بالأستاذ هشام اقتنعت أنني لن أُخذل. في اليوم الذي استلمت فيه سيارتي لكزس NX350h موديل 2025 من المعرض، قدت مباشرة إلى القوز وسلّمت سيارتي للأستاذ هشام. استغرق الأمر نحو أسبوع، لكن النتيجة النهائية كانت جميلة.",
    },
    note: "Mentions a Ramadan deal — not placed on any page.",
  },
  {
    id: 10,
    name: "Mahmoud Fathy",
    branch: "zayed",
    services: [],
    rating: 5,
    original: "ar",
    source: "v2-site",
    text: {
      ar: "انا سعيد بتجربتي مع سوباكوتو … ان شاءالله تتكرر في السيارات القادمة … مستوى عالي من الاحترافية والمهنية في التعامل و الدقة في المواعيد والاسعار مناسبة جدا وكذلك المصداقية في المنتج من خلال التاكيد على انه اصلي بالسريال من الشركة المصنعة و كذلك المتابعة وخدمة ما بعد البيع …. كل شئ كان ممتازت",
      en: "I'm happy with my experience with Supakoto… God willing it will be repeated with the next cars… A high level of professionalism in how they deal with you, punctuality with appointments, very reasonable prices, and credibility in the product — confirmed as genuine by the serial number from the manufacturer — as well as the follow-up and after-sales service…. Everything was excellent.",
    },
  },
  {
    id: 11,
    name: "Ahmed Ali",
    branch: "maadi",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I recently had a protection Film for 2 Cars in New Cairo Branch.They really have an excellent Professional Team and a very good customer service. A very good after sale follow up. I am very satisfied with their provided service. A big thank you to Mr Mohamed - The Branch Manager for handling all the issues.",
      ar: "ركّبت مؤخرًا فيلم حماية لسيارتين في فرع القاهرة الجديدة. لديهم فعلًا فريق محترف ممتاز وخدمة عملاء جيدة جدًا. ومتابعة جيدة جدًا بعد البيع. أنا راضٍ جدًا عن الخدمة التي قدموها. شكر كبير للأستاذ محمد، مدير الفرع، على التعامل مع كل الأمور.",
    },
    note: "V2 tags this review to Maadi but the text says New Cairo branch.",
  },
  {
    id: 12,
    name: "Alber Wadea",
    branch: "zayed",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I recently had a PPF installed on my vehicle, and I couldn't be more impressed with the quality of service and the final result. From start to finish, the team demonstrated top-tier professionalism, attention to detail, and deep product knowledge. The consultation was clear and informative—they explained the different film options, coverage areas, and long-term benefits, helping me choose the best package for my needs. The installation itself was meticulous. The film was applied seamlessly, with no bubbles, visible edges, or imperfections. You can barely tell it's there, but the protection is immediately noticeable. What truly stood out was the pride the team took in their work. They treated my car with care as if it were their own. I was also impressed with the turnaround time and the follow-up instructions to ensure the film cures properly.",
      ar: "ركّبت مؤخرًا فيلم حماية PPF على سيارتي، وأعجبتني جودة الخدمة والنتيجة النهائية إلى أقصى حد. من البداية إلى النهاية أظهر الفريق احترافية من الطراز الأول، واهتمامًا بالتفاصيل، ومعرفة عميقة بالمنتج. كانت الاستشارة واضحة ومفيدة — شرحوا خيارات الفيلم المختلفة ومناطق التغطية والفوائد على المدى الطويل، وساعدوني على اختيار الباقة الأنسب لاحتياجاتي. التركيب نفسه كان دقيقًا للغاية. وُضع الفيلم بسلاسة، بلا فقاعات ولا حواف ظاهرة ولا عيوب. بالكاد تلاحظ وجوده، لكن الحماية واضحة فورًا. ما لفت انتباهي حقًا هو اعتزاز الفريق بعمله. عاملوا سيارتي بعناية كأنها سيارتهم. وأعجبتني أيضًا سرعة الإنجاز وتعليمات المتابعة لضمان تماسك الفيلم بشكل صحيح.",
    },
  },
  {
    id: 13,
    name: "Amel Fathy",
    branch: "maadi",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I had a protection film as well as internal protection 3 months ago. I was really impressed by the quality of the products and the professionality of the staff.The results were outstanding. And what is really special is their after sale follow up every now and then to check on the film and if I have any comments ❤️comments ❤️ To sum up, I am totally satisfied with the service and I highly recommend them to everyone.",
      ar: "ركّبت فيلم حماية وحماية داخلية أيضًا قبل 3 أشهر. أعجبتني حقًا جودة المنتجات واحترافية فريق العمل. النتائج كانت ممتازة. والمميز فعلًا هو متابعتهم بعد البيع من وقت لآخر للاطمئنان على الفيلم وإن كانت لديّ أي ملاحظات ❤️ باختصار، أنا راضية تمامًا عن الخدمة وأنصح بهم الجميع بشدة.",
    },
  },
  {
    id: 14,
    name: "Mohamed Samy",
    branch: "tagamoa",
    services: [],
    rating: 5,
    original: "ar",
    source: "v2-site",
    text: {
      ar: "من أحسن التجارب اللي مريت بيها بصراحة بعد مقارنة بين كذا شركة. اخترت شركة Supa Koto بناءً على ترشيحات كتير وفعلاً كانوا قد التوقعات. فريق العمل محترم جدًا وملتزم من أول ما تواصلت معاهم لحد ما استلمت العربية، كل حاجة كانت ماشية بسلاسة ومنظمة جدًا. خامات ممتازة حسيت إني واخد قيمة حقيقية مقابل اللي دفعتُه. الأستاذ محمد سويلم قمة في الذوق والرُقي وخلاني مرتاح جدًا في التعامل معاهم. استلمت العربية قبل الميعاد وده خلاني أحترمهم أكتر. تجربة محترمة وأنصح أي حد بيهم.",
      en: "Honestly one of the best experiences I've had, after comparing several companies. I chose Supa Koto based on many recommendations and they truly lived up to expectations. The team is very respectful and committed, from my first contact until I collected the car — everything ran smoothly and was very well organised. Excellent materials; I felt I got real value for what I paid. Mr. Mohamed Swelam is the height of courtesy and class and made me very comfortable dealing with them. I received the car ahead of schedule, which made me respect them even more. A respectable experience and I recommend them to anyone.",
    },
  },
  {
    id: 15,
    name: "Amr Othman",
    branch: "tagamoa",
    services: ["ppf", "heat-isolation"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I would like to thank Mr. Mohamed Swelam and Mr. Ramy for their incredible professionalism and friendly attitude. Professional Service: The team was highly professional, ensuring top-quality service and attention to detail. They offer a diverse range of protective and thermal insulation films, selecting the best option for my car. Expert Recommendations: Their knowledge and expertise helped me choose the most suitable film for my needs. Respectful & Courteous Staff: The customer service was exceptional, with respectful and polite interactions throughout the process. Great Hospitality: From the moment I arrived, they provided a warm welcome and made the experience enjoyable. Highly Recommended: I would definitely recommend them to anyone looking for car paint protection films.",
      ar: "أود أن أشكر الأستاذ محمد سويلم والأستاذ رامي على احترافيتهما المذهلة وتعاملهما الودود. خدمة احترافية: كان الفريق محترفًا للغاية، وحرص على جودة عالية للخدمة واهتمام بالتفاصيل. يقدمون مجموعة متنوعة من أفلام الحماية والعزل الحراري، واختاروا الخيار الأنسب لسيارتي. توصيات خبيرة: ساعدتني معرفتهم وخبرتهم على اختيار الفيلم الأنسب لاحتياجاتي. فريق محترم ومهذب: خدمة العملاء كانت استثنائية، بتعامل محترم ومهذب طوال العملية. حفاوة رائعة: منذ لحظة وصولي استقبلوني بترحيب دافئ وجعلوا التجربة ممتعة. أنصح بهم بشدة: سأرشحهم بالتأكيد لكل من يبحث عن أفلام حماية طلاء السيارات.",
    },
  },
  {
    id: 16,
    name: "Ahmed Gaber",
    branch: "tagamoa",
    services: ["ppf", "heat-isolation"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Great customer relation management & high quality products and service. Amazing heat isolation as well. Just recieved my car from them after film protection and heat isolation installation with them with 10 years warranty. Hope they continue to offer great quality along the coming years ISA.",
      ar: "إدارة رائعة لعلاقات العملاء ومنتجات وخدمة عالية الجودة. وعزل حراري مذهل أيضًا. استلمت سيارتي منهم للتو بعد تركيب فيلم الحماية والعزل الحراري عندهم مع ضمان 10 سنوات. أتمنى أن يستمروا في تقديم الجودة الرائعة في السنوات القادمة إن شاء الله.",
    },
    note: "States a 10-year warranty — customer's words, not a site claim; warranty copy on the site stays tier-scoped.",
  },
  {
    id: 17,
    name: "Ahmed Gado",
    branch: "tagamoa",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Thank you Supa Koto for providing high-quality protection films for your car. It was a great experience with your products, and I am grateful for your excellent service. Supa Koto is my favorite company for protection films. Their products are of high quality and prove to be effective in protecting cars. Thank you for your great service. I highly recommend Supa Koto Protection Film Company. I used their products for my car and the results were great. Thank you for your excellent products.",
      ar: "شكرًا سوباكوتو على أفلام الحماية عالية الجودة للسيارة. كانت تجربة رائعة مع منتجاتكم، وأنا ممتن لخدمتكم الممتازة. سوباكوتو هي شركتي المفضلة لأفلام الحماية. منتجاتهم عالية الجودة وأثبتت فعاليتها في حماية السيارات. شكرًا على خدمتكم الرائعة. أنصح بشدة بشركة سوباكوتو لأفلام الحماية. استخدمت منتجاتهم لسيارتي وكانت النتائج رائعة. شكرًا على منتجاتكم الممتازة.",
    },
  },
  {
    id: 19,
    name: "Mohamed Elleithy",
    branch: "tagamoa",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Outstanding Service and Top-Quality Product at Supakoto. I recently had my car protected with Takai Steel Plus film at Supakoto, and I couldn't be more impressed with the entire experience. From start to finish, the team demonstrated professionalism, patience, and genuine care. A special thanks to Mr. Mohamed Sweilm, who went above and beyond by patiently answering all my questions and even showing me the full installation process. His knowledge and friendly attitude made me feel confident and well-informed every step of the way. I also want to highlight Mr. Ramy, whose attention to detail and commitment to quality ensured that the car was delivered in perfect condition. He personally inspected the work more than once to make sure everything was flawless. The Takai Steel Plus film itself is of excellent quality — the finish looks incredible and gives me peace of mind knowing that my car is protected. Highly recommended for anyone who values premium service, high-quality products, and a truly professional team!",
      ar: "خدمة متميزة ومنتج بجودة عالية في سوباكوتو. حميت سيارتي مؤخرًا بفيلم تاكاي ستيل بلس في سوباكوتو، وأعجبتني التجربة كلها إلى أقصى حد. من البداية إلى النهاية أظهر الفريق احترافية وصبرًا واهتمامًا حقيقيًا. شكر خاص للأستاذ محمد سويلم الذي بذل جهدًا إضافيًا وأجاب بصبر عن كل أسئلتي، بل وأراني عملية التركيب كاملة. معرفته وتعامله الودود جعلاني أشعر بالثقة وأعرف كل خطوة. وأود أيضًا أن أشيد بالأستاذ رامي، الذي ضمن اهتمامه بالتفاصيل والتزامه بالجودة تسليم السيارة في حالة مثالية. فحص العمل بنفسه أكثر من مرة للتأكد من أن كل شيء بلا عيوب. فيلم تاكاي ستيل بلس نفسه بجودة ممتازة — المظهر مذهل ويمنحني راحة البال بأن سيارتي محمية. أنصح به بشدة لكل من يقدّر الخدمة الراقية والمنتجات عالية الجودة والفريق المحترف فعلًا!",
    },
    note: "Names a product line (\"Takai Steel Plus\") that V6 does not list — customer's words; not placed on any page until Ibrahim confirms.",
  },
  {
    id: 20,
    name: "Unis elassal",
    branch: "tagamoa",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I would like to thank Supa Koto team, specially Mr Mohamed Swelam for warm hospitality and professionalism. I already made almost 7 cars until now since 2022 and they have super after sales service. Highly recommended.",
      ar: "أود أن أشكر فريق سوباكوتو، وخاصة الأستاذ محمد سويلم، على حسن الضيافة والاحترافية. ركّبت عندهم نحو 7 سيارات حتى الآن منذ 2022، وخدمة ما بعد البيع لديهم ممتازة. أنصح بهم بشدة.",
    },
  },
  {
    id: 21,
    name: "rami ashraf",
    branch: "tagamoa",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Highly recommended place for film car protection — everything is perfect: the material, treatment, and the staff. I would like to thank Mr. Mohamed Swelam and Mr. Ramy for their incredible professionalism and friendly attitude. The car came out perfect and ahead of schedule and the service after sale is perfect.",
      ar: "مكان أنصح به بشدة لحماية السيارة بالأفلام — كل شيء مثالي: الخامة والتعامل وفريق العمل. أود أن أشكر الأستاذ محمد سويلم والأستاذ رامي على احترافيتهما المذهلة وتعاملهما الودود. خرجت السيارة مثالية وقبل الموعد، وخدمة ما بعد البيع ممتازة.",
    },
  },
  {
    id: 22,
    name: "Amr Shawky",
    branch: "tagamoa",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I’d like to extend my sincere thanks to the entire team at Supa Koto for their exceptional service and unwavering commitment to quality control. From the very beginning, the experience was smooth and professional—even during the initial sales process with Enjyu, who was incredibly helpful and knowledgeable. A very special thank you goes out to Swelam, the Operations Manager, whose attention to detail were clearly reflected in the outstanding execution and overall professionalism of the team. Everyone I interacted with was kind, decent, and conducted themselves with the highest level of professionalism. It was truly a pleasure working with Supa Koto, and I highly recommend them to anyone seeking quality and reliability.",
      ar: "أود أن أتقدم بخالص الشكر لفريق سوباكوتو بأكمله على خدمتهم الاستثنائية والتزامهم الثابت بمراقبة الجودة. منذ البداية كانت التجربة سلسة واحترافية — حتى في مرحلة البيع الأولى مع إنجي، التي كانت متعاونة جدًا وعلى دراية. شكر خاص جدًا لسويلم، مدير العمليات، الذي انعكس اهتمامه بالتفاصيل بوضوح في التنفيذ المتميز والاحترافية العامة للفريق. كل من تعاملت معه كان لطيفًا ومحترمًا وتصرف بأعلى درجات الاحترافية. كان العمل مع سوباكوتو ممتعًا حقًا، وأنصح بهم بشدة لكل من يبحث عن الجودة والموثوقية.",
    },
  },
  {
    id: 23,
    name: "Mohamed Galaa",
    branch: "tagamoa",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Honestly, Supa Koto has become my recommended provider for anyone who is interested in the PPF. The material exceeds expectations. They are taking care of every inch of the car. Thanks, Supa Koto.",
      ar: "بصراحة، أصبحت سوباكوتو الجهة التي أرشحها لكل من يهتم بفيلم الحماية PPF. الخامة تفوق التوقعات. يعتنون بكل شبر في السيارة. شكرًا سوباكوتو.",
    },
  },
  {
    id: 24,
    name: "Mina Jack",
    branch: "tagamoa",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "More than excellent whether in car protection or after sale service. Had two major incidents and car is like brand new fully protected. Strongly recommend this place for even higher professionalism.",
      ar: "أكثر من ممتاز، سواء في حماية السيارة أو في خدمة ما بعد البيع. تعرضت لحادثين كبيرين والسيارة كأنها جديدة تمامًا ومحمية بالكامل. أنصح بشدة بهذا المكان لاحترافيته العالية.",
    },
  },
  {
    id: 25,
    name: "Hazem Nagy",
    branch: "maadi",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I had PPF and various other services at this place. They are the real deal, perfect in every way. Special thanks to Mr Mohammed Sweilam and Ms Effat for the wonderful customer experience. The car was done earlier than expected and I have zero comments. Amazing experience.",
      ar: "ركّبت PPF وخدمات أخرى متنوعة في هذا المكان. هم الاختيار الحقيقي، مثاليون من كل النواحي. شكر خاص للأستاذ محمد سويلم والأستاذة عفت على تجربة العملاء الرائعة. أُنجزت السيارة قبل الموعد المتوقع وليست لديّ أي ملاحظات. تجربة مذهلة.",
    },
  },
  {
    id: 26,
    name: "Mohamed Fadel",
    branch: "maadi",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "It was such an amazing experience, the service was more than excellent starting from the customer service offering all the required details and clear explanation. When I visited the store (5th settlement) the team was very helpful and decent, they offered me the best for my car with a great discount. They have a very professional follow up and after sales. I highly recommend.",
      ar: "كانت تجربة مذهلة، والخدمة أكثر من ممتازة بدءًا من خدمة العملاء التي قدمت كل التفاصيل المطلوبة وشرحًا واضحًا. عندما زرت الفرع (التجمع الخامس) كان الفريق متعاونًا ومحترمًا جدًا، وقدموا لي الأنسب لسيارتي مع خصم كبير. لديهم متابعة وخدمة ما بعد بيع احترافية جدًا. أنصح بهم بشدة.",
    },
    note: "V2 tags this to Maadi but the text says 5th Settlement; mentions a discount — not placed on any page.",
  },
  {
    id: 27,
    name: "Yousef Baghdady",
    branch: "maadi",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "Had a great experience with Supakoto when I installed PPF film on my car. The team was very professional, explained everything clearly, and the quality of the work really shows. The film was applied perfectly — no bubbles, no edges showing, just a super clean finish.",
      ar: "تجربتي مع سوباكوتو كانت رائعة عندما ركّبت فيلم PPF على سيارتي. الفريق محترف جدًا، شرحوا كل شيء بوضوح، وجودة العمل ظاهرة فعلًا. وُضع الفيلم بشكل مثالي — بلا فقاعات ولا حواف ظاهرة، مجرد تشطيب نظيف تمامًا.",
    },
  },
  {
    id: 28,
    name: "Mariam Saeid",
    branch: "maadi",
    services: [],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "It was such an amazing experience, the service was excellent starting from the customer service offering me all the details needed. They also offered me lots of offers to choose from. When I visited the store Mr. Tarek was very helpful and decent; he offered me the best for my car with a great discount. They have high quality materials with expert finishing. I highly recommend.",
      ar: "كانت تجربة مذهلة، والخدمة ممتازة بدءًا من خدمة العملاء التي قدمت لي كل التفاصيل اللازمة. وعرضوا عليّ أيضًا الكثير من العروض للاختيار من بينها. عندما زرت الفرع كان الأستاذ طارق متعاونًا ومحترمًا جدًا؛ قدّم لي الأنسب لسيارتي مع خصم كبير. لديهم خامات عالية الجودة مع تشطيب خبير. أنصح بهم بشدة.",
    },
    note: "Mentions offers and a discount — not placed on any page.",
  },
  {
    id: 29,
    name: "sh elfeki",
    branch: "maadi",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I was completely impressed with their professionalism and customer service. High quality films are consistently outstanding which clearly appear on my car, exceeding my expectations with their friendly respectable team and nice place easy to reach. All the thanks for the consistent follow up 🙏🏻🙏🏻🙏🏻.",
      ar: "أعجبتني تمامًا احترافيتهم وخدمة العملاء لديهم. الأفلام عالية الجودة متميزة باستمرار، وهذا واضح على سيارتي، وفاقت توقعاتي مع فريقهم الودود المحترم ومكانهم الجميل سهل الوصول. كل الشكر على المتابعة المستمرة 🙏🏻🙏🏻🙏🏻.",
    },
  },
  {
    id: 30,
    name: "Esraa Ibrahim",
    branch: "maadi",
    services: ["ppf"],
    rating: 5,
    original: "en",
    source: "v2-site",
    text: {
      en: "I make protection film at Maadi branch and it was a very wise decision. All the staff is very professional, respectful and helpful, specially Mr Tarek. I asked him millions of questions about protection and about my car and he responded gently and tried to help me in every situation when I scratched my car or had any incident. So thank you to all Maadi staff at Maadi branch, really appreciated.",
      ar: "ركّبت فيلم حماية في فرع المعادي وكان قرارًا حكيمًا جدًا. كل فريق العمل محترف ومحترم ومتعاون جدًا، وخاصة الأستاذ طارق. سألته ملايين الأسئلة عن الحماية وعن سيارتي فأجاب بلطف وحاول مساعدتي في كل موقف عندما خدشت سيارتي أو تعرضت لأي حادث. فشكرًا لكل فريق فرع المعادي، أقدّر ذلك حقًا.",
    },
  },
];

/* ---------- placement ---------- */

/**
 * Curated placements. Selection criteria (2026-08-19): named, attributed,
 * no price / discount / deal talk, no product names V6 doesn't carry,
 * branch mix. Everything else stays in the file for Ibrahim's review.
 */
export const HOME_TESTIMONIAL_IDS = [2, 27, 14, 10] as const;
export const ABOUT_TESTIMONIAL_IDS = [3, 22, 13] as const;

/** Per service page, 2 each. Vehicle services only; building/marine/surface have no reviews. */
export const SERVICE_TESTIMONIAL_IDS: Partial<Record<ServiceId, readonly number[]>> = {
  ppf: [12, 21],
  "heat-isolation": [1, 16],
  // No colour-change / nano-ceramic reviews exist in the V2 set — general
  // (service-agnostic) reviews are shown there instead.
  "colour-change": [24, 6],
  "nano-ceramic": [5, 20],
};

export function byIds(ids: readonly number[]): Testimonial[] {
  return ids
    .map((id) => testimonials.find((t) => t.id === id))
    .filter((t): t is Testimonial => Boolean(t));
}

export function forService(id: ServiceId): Testimonial[] {
  return byIds(SERVICE_TESTIMONIAL_IDS[id] ?? []);
}

/** Mean rating + count over a set (used for the visible aggregate and JSON-LD). */
export function aggregate(list: Testimonial[]): { rating: number; count: number } {
  if (list.length === 0) return { rating: 0, count: 0 };
  const sum = list.reduce((a, t) => a + t.rating, 0);
  return { rating: Math.round((sum / list.length) * 10) / 10, count: list.length };
}
