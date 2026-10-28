# Issues – zdroj textů

Texty GitHub issues v repu `michroucka/portfolio`. Při rozporu s GitHubem platí tento soubor.
Úlohy #7–#13 odpovídají úkolům 5–11 z [plánu](plans/2026-10-16-portfolio.md) – podrobné kroky
a testy jsou tam, issue je neopakuje. #14–#17 jsou otevřené body
[specu § 10](specs/2026-10-16-portfolio-design.md).

Implementuje Michal sám (mentor režim), Claude radí, dává kostry a dělá review.

## Přehled

| # | Název | Milestone | Labely | Závisí na |
|---|---|---|---|---|
| #7 | Content collections – služby a case studies | Obsah a stránky | enhancement | – |
| #8 | Sekce homepage | Obsah a stránky | enhancement | #7 |
| #9 | Stránky case studies a MDX komponenty | Obsah a stránky | enhancement | #7 |
| #10 | Kontaktní formulář (Astro Action) | Kontaktní formulář | enhancement | #8 |
| #11 | Animace loga v hero | Dokončení a spuštění | enhancement | #8 |
| #12 | GDPR stránka, sitemap, robots, strukturovaná data | Dokončení a spuštění | enhancement | – |
| #13 | Nasazení na Vercel a finální kontrola | Dokončení a spuštění | enhancement | #9, #10, #11, #12 |
| #14 | Doména | Dokončení a spuštění | external | – |
| #15 | Finální texty (sekce, case study, GDPR) | Dokončení a spuštění | content | – |
| #16 | Ceny služeb | Dokončení a spuštění | content | – |
| #17 | IČO v patičce | Dokončení a spuštění | external | – |

#14–#17 záměrně nic neblokují: kód se staví s pracovními texty a placeholdery, nasazení (#13)
běží na preview URL s testovacím odesílatelem Resend.

---

## #7 Content collections – služby a case studies

Milestone: Obsah a stránky · Assignee: michroucka · Labely: enhancement

**Závisí na:** – · **Blokuje:** #8, #9

### Záměr

Služby a case studies jako typovaný obsah, ze kterého čte homepage i stránky projektů (spec § 5).

### Kontext

Úkol 5 plánu. Rozpracováno na větvi `feat/content`: kostry `src/content.config.ts`,
`src/content/services.yaml`, `src/lib/projects.ts` a `src/lib/projects.test.ts` s `TODO`.

### Co udělat

1. Schémata `services` (`file()` loader) a `projects` (`glob()` nad `projects/**/*.mdx`) podle spec § 5.
2. Testy `projects.test.ts` → implementace `projects.ts` (jazyk a slug z id, filtr podle jazyka, `featured`, řazení, chybějící překlady).
3. Naplnit `services.yaml` (3 služby, ceny placeholder) a case study `nohy-v-cajku` v obou jazycích.

### Soubory

**Vytvořit**

- `src/content/projects/{cs,en}/nohy-v-cajku.mdx` – case study s kostrou problém → řešení → výsledek → screenshoty → technologie
- `src/assets/projects/…` – cover a screenshoty (admin jen s dummy daty)

**Upravit**

- `src/content.config.ts` – schémata kolekcí
- `src/content/services.yaml` – tři služby
- `src/lib/projects.ts`, `src/lib/projects.test.ts` – pomocné funkce a testy

### Na co si dát pozor

- Lokalizovaná hodnota `{ cs, en }` odvozená z `locales`, aby chybějící překlad byl chyba buildu.
- Neznámý jazyk nebo chybějící slug v id má vyhodit chybu, ne vrátit `undefined`.
- Testy pracují s ručně sestavenými záznamy, ne se skutečnou kolekcí.

### Výsledek

Kolekce `services` a `projects` jsou typované a pomocné funkce otestované.

### Jak otestovat

- `npm run check` a `npm test` projdou.
- Dočasně smazat EN soubor case study → build spadne se srozumitelnou hláškou (kontrolu párování zapojí #9).

### Hotovo, když

- [ ] schémata odpovídají spec § 5
- [ ] testy podle úkolu 5 plánu projdou
- [ ] `services.yaml` má 3 služby, case study existuje v obou jazycích
- [ ] dokumentace odpovídá implementaci

---

## #8 Sekce homepage

Milestone: Obsah a stránky · Assignee: michroucka · Labely: enhancement

**Závisí na:** #7 · **Blokuje:** #10, #11

### Záměr

One-pager, ze kterého návštěvník během pár sekund pochopí, co Michal nabízí, pro koho a za kolik (spec § 1–2).

### Kontext

Úkol 6 plánu. Typografická škála a `pageContainer` (dříve `pagePaddingX`, `src/lib/site.ts`) už existují z úkolu 4.
Kotvy sekcí v hlavičce bere `src/lib/sections.ts`.

### Co udělat

1. `BrandDot.astro` – kulatá tečka značky (brand/README.md § 4).
2. Sekce Hero, Services, FeaturedProjects, Process, About, Contact (zatím bez formuláře) a karty ServiceCard, ProjectCard.
3. Zapojit do `HomePage.astro`, texty doplnit do slovníků.

### Soubory

**Vytvořit**

- `src/components/BrandDot.astro`
- `src/components/sections/{Hero,Services,FeaturedProjects,Process,About,Contact}.astro`
- `src/components/cards/{ServiceCard,ProjectCard}.astro`

**Upravit**

- `src/components/pages/HomePage.astro` – skládá sekce
- `src/i18n/cs.ts`, `src/i18n/en.ts` – texty sekcí

### Na co si dát pozor

- Věta zakončená `BrandDot` musí pro čtečky pořád končit tečkou.
- Cena přes `Intl.NumberFormat` podle jazyka („od 15 000 Kč“ / „from CZK 15,000“).
- Jediný `<h1>` (Hero), každá sekce má `id` a `<h2>`; žádný text natvrdo mimo slovník.

### Výsledek

Homepage v obou jazycích zobrazuje všechny sekce s daty z kolekcí.

### Jak otestovat

- Obě jazykové verze na 375 px i desktopu, v obou tématech; EN verze bez češtiny.

### Hotovo, když

- [ ] všechny sekce podle úkolu 6 plánu
- [ ] kotvy z hlavičky vedou na sekce
- [ ] `npm run check`, `npm run lint`, `npm test`, `npm run build` projdou
- [ ] dokumentace odpovídá implementaci

---

## #9 Stránky case studies a MDX komponenty

Milestone: Obsah a stránky · Assignee: michroucka · Labely: enhancement

**Závisí na:** #7 · **Blokuje:** #13

### Záměr

Case study jako ukázka práce pro klienta, v obou jazycích na přeložených URL (spec § 2, § 5).

### Kontext

Úkol 7 plánu. Cesty `/projekty/[slug]/` ↔ `/en/projects/[slug]/` už generuje `src/i18n/routes.ts`.

### Co udělat

1. Tenké obálky `[slug].astro` v obou jazycích s `getStaticPaths` a kontrolou párování z #7.
2. `ProjectPage.astro` – titulek, typ, cover, tělo MDX, štítky, odkazy, testimonial, CTA.
3. MDX komponenty `Gallery` a `Quote`.

### Soubory

**Vytvořit**

- `src/pages/projekty/[slug].astro`, `src/pages/en/projects/[slug].astro`
- `src/components/pages/ProjectPage.astro`
- `src/components/mdx/{Gallery,Quote}.astro`

### Na co si dát pozor

- Chybějící překlad case study musí shodit build s výčtem slugů.
- `og:image` = cover, alternativy přes mapu cest s parametrem `slug`.

### Výsledek

`/projekty/nohy-v-cajku/` a `/en/projects/nohy-v-cajku/` se vyrenderují a odkazují na sebe navzájem.

### Jak otestovat

- `npm run build`, v `dist/` zkontrolovat obě stránky: hreflang a přepínač jazyka vedou na protějšek.

### Hotovo, když

- [ ] obě stránky se vyrenderují, přepínač jazyka funguje
- [ ] kontrola párování shodí build při chybějícím překladu
- [ ] dokumentace odpovídá implementaci

---

## #10 Kontaktní formulář (Astro Action)

Milestone: Kontaktní formulář · Assignee: michroucka · Labely: enhancement

**Závisí na:** #8 · **Blokuje:** #13

### Záměr

Hlavní akce návštěvníka – ozvat se. Formulář pošle e-mail Michalovi přes Resend (spec § 7).

### Kontext

Úkol 8 plánu. Jediná serverová část webu (Vercel adapter). Před implementací projít spolu,
jak `Astro.getActionResult` souvisí s prerenderem homepage.

### Co udělat

1. Adapter `@astrojs/vercel` a `env.schema` (tajné klíče, site key, cílová adresa).
2. Testy a implementace `schema`, `spam`, `turnstile`, `mail` v `src/lib/contact/`.
3. Action `contact` a formulář v `Contact.astro`, chyby přeložené přes slovníky.

### Soubory

**Vytvořit**

- `src/actions/index.ts`
- `src/lib/contact/{schema,spam,turnstile,mail}.ts` + `*.test.ts`

**Upravit**

- `src/components/sections/Contact.astro` – formulář
- `astro.config.mjs` – adapter, `env.schema`
- `src/i18n/cs.ts`, `src/i18n/en.ts` – popisky a chybové hlášky

### Na co si dát pozor

- Odeslání bez JS / bez Turnstile tokenu → srozumitelná chyba s e-mailem (review bod 1).
- Po chybě se vrátí hodnoty s diakritikou beze změny, e-mail projde po oříznutí mezer (review bod 4).
- Selhání Resend → obecná chyba bez detailu v HTML (review bod 5).
- Spam navenek vypadá jako úspěch.

### Výsledek

Formulář odešle e-mail s `reply-to` zákazníka a všechny chybové stavy podle spec § 7 fungují.

### Jak otestovat

- `npm test` (testy podle úkolu 8 plánu).
- Lokálně s testovacími klíči Turnstile a testovacím odesílatelem Resend: úspěch, chyba validace, vypnutý JS.

### Hotovo, když

- [ ] testy schema/spam/turnstile/mail projdou
- [ ] ruční ověření tří scénářů výše
- [ ] dokumentace odpovídá implementaci

---

## #11 Animace loga v hero

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: enhancement

**Závisí na:** #8 · **Blokuje:** #13

### Záměr

Velká značka „mr.“ v hero, jejíž tečka se jednou po načtení promění v blikající kurzor (brand/README.md § 5).

### Kontext

Úkol 9 plánu. `@keyframes dot-cursor` a `animate-dot-cursor` v `src/styles/global.css` jsou připravené
z úkolu 4, převod kruhu na `<rect>` viz `dotToRect` v `Logo.astro`. Koncept projít spolu před implementací.

### Co udělat

1. Inline SVG značky v hero s tečkou jako samostatným elementem.
2. Spustit animaci po načtení: 0–280 ms tečka → podtržítko, 3 bliknutí po ~530 ms, návrat.

### Soubory

**Upravit**

- `src/components/sections/Hero.astro` (nebo nový `HeroMark.astro`)

### Na co si dát pozor

- `prefers-reduced-motion: reduce` → statická tečka.
- Klidový stav je vždy tečka, i když se animace přeruší.

### Výsledek

Po načtení homepage tečka v hero jednou zabliká jako kurzor a vrátí se.

### Jak otestovat

- DevTools: emulace reduced motion → bez animace; v obou tématech barva Signal / Signal Deep.

### Hotovo, když

- [x] animace podle manuálu značky, jen jednou
- [x] reduced motion respektován
- [x] dokumentace odpovídá implementaci

---

## #12 GDPR stránka, sitemap, robots, strukturovaná data

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: enhancement

**Závisí na:** – · **Blokuje:** #13

### Záměr

Právní stránka k formuláři a dohledatelnost na Googlu (spec § 8).

### Kontext

Úkol 10 plánu. Finální text GDPR je #15 – tady stačí kostra. `site` v `astro.config.mjs`
je placeholder do vyřešení domény (#14).

### Co udělat

1. GDPR stránka v obou jazycích (správce, účel, právní titul, doba uchování, práva, kontakt).
2. Sitemap s i18n, `robots.txt`, JSON-LD `ProfessionalService`, výchozí OG obrázek 1200 × 630.

### Soubory

**Vytvořit**

- `src/pages/ochrana-osobnich-udaju.astro`, `src/pages/en/privacy.astro`
- `src/components/pages/PrivacyPage.astro`
- `src/components/JsonLd.astro`
- `src/pages/robots.txt.ts` (endpoint, adresa sitemapy podle `site`), `public/og-default-{cs,en}.png`
- `src/lib/sitemap.ts`, `src/lib/structured-data.ts` (+ testy)

**Upravit**

- `astro.config.mjs` – sitemap i18n

### Na co si dát pozor

- Odkaz na GDPR z patičky už existuje – cesta musí sedět s `routes.ts`.

### Výsledek

GDPR stránka v obou jazycích, sitemap s jazykovými alternativami a validní JSON-LD.

### Jak otestovat

- `dist/sitemap-index.xml` obsahuje všechny stránky s `xhtml:link`; JSON-LD projde https://validator.schema.org/.

### Hotovo, když

- [x] vše z úkolu 10 plánu
- [x] dokumentace odpovídá implementaci

---

## #13 Nasazení na Vercel a finální kontrola

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: enhancement

**Závisí na:** #9, #10, #11, #12 · **Blokuje:** –

### Záměr

Web běží na Vercelu, `main` → produkce, větve → preview (spec § 9).

### Kontext

Úkol 11 plánu. Bez domény (#14) jde nasadit na `*.vercel.app` a formulář testovat s testovacím odesílatelem Resend.

### Co udělat

1. Projekt na Vercelu (Pro), propojení přes Git integraci.
2. Proměnné prostředí a secrets (Production i Preview), Vercel Web Analytics.
3. Finální kontrola na preview URL.

### Soubory

**Upravit**

- `astro.config.mjs` – Web Analytics v adaptéru

### Na co si dát pozor

- Secrets nepatří do repa.
- Preview chrání Deployment Protection – Lighthouse proti preview URL měř přihlášený nebo s bypassem.

### Výsledek

Preview i produkce se nasazují automaticky z GitHubu.

### Jak otestovat

- Lighthouse (mobil) ≥ 95 ve všech kategoriích na `/`, `/en/` a jedné case study; formulář odešle e-mail; obě témata; přepínač jazyka; 404.

### Hotovo, když

- [x] nasazení z `main` i z PR funguje
- [x] kontrola výše projde
- [x] dokumentace odpovídá implementaci

---

## #14 Doména

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: external

**Závisí na:** – · **Blokuje:** –

### Záměr

Vybrat a koupit doménu – je potřeba pro `site`, ověření domény v Resend a produkční e-mail (spec § 10).

### Kontext

K dispozici `michroucka.dev`, zvažuje se čitelnější `.cz` doména.

**Rozhodnuto:** `michalroucka.cz` (WEDOS), kanonická je `www.michalroucka.cz` a kořenová doména na ni přesměrovává. `michroucka.dev` se nenapojuje a nechá se vypršet. Pošta Seznam Email Profi.

### Co udělat

1. Rozhodnout a koupit doménu, napojit na Vercel.
2. Nastavit `site` v `astro.config.mjs`.
3. Ověřit doménu v Resend (DNS) a přepnout odesílatele z testovacího.
4. Založit e-mail na vlastní doméně a nahradit jím gmail v `siteDetails.email` (`src/lib/site.ts`) – adresa na vlastní doméně působí na zákazníky důvěryhodněji.

### Hotovo, když

- [x] `site` má skutečnou doménu
- [x] Resend posílá z ověřené domény
- [x] Web ukazuje e-mail na vlastní doméně

---

## #15 Finální texty (sekce, case study, GDPR)

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: content

**Závisí na:** – · **Blokuje:** –

### Záměr

Nahradit pracovní texty finálními v obou jazycích (spec § 10).

### Co udělat

1. Texty sekcí homepage ve slovnících `src/i18n/cs.ts`, `src/i18n/en.ts`.
2. Case study Nohy v cajku (CZ + EN) včetně citátu majitelky salonu.
3. Text GDPR (ověřit právní titul oprávněný zájem bez checkboxu).

### Hotovo, když

- [ ] žádný pracovní text v obou jazycích
- [ ] citát odsouhlasený majitelkou salonu

---

## #16 Ceny služeb

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: content

**Závisí na:** – · **Blokuje:** –

### Záměr

Konkrétní částky „od“ pro jednotlivé služby (spec § 1, § 10).

### Co udělat

1. Rozhodnout ceny a zapsat `priceFrom` do `src/content/services.yaml`.

### Hotovo, když

- [ ] všechny služby mají skutečnou cenu místo placeholderu

---

## #17 IČO v patičce

Milestone: Dokončení a spuštění · Assignee: michroucka · Labely: external

**Závisí na:** – · **Blokuje:** –

### Záměr

Patička obsahuje identifikační údaje podnikatele, jakmile bude založena živnost (spec § 1).

### Co udělat

1. Po založení živnosti vyplnit `siteDetails.legal` (`src/lib/site.ts`): `ico`, `registeredOffice`, `isVatPayer`. Teď je `undefined`, takže patička a GDPR stránka blok skrývají; po vyplnění ho zobrazí.

### Hotovo, když

- [ ] IČO je vidět v patičce v obou jazycích
