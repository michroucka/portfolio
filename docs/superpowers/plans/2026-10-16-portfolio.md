# Portfolio web – implementační plán

> **Režim provedení:** implementuje Michal sám (mentor režim). Claude radí, vysvětluje a dělá review po každém úkolu.
> Plán záměrně neobsahuje kód: u každého kroku je *co* a *kde*, u testů *co ověřují*. Signatury v TS nebo kostry
> testů doplní Claude na vyžádání. Kroky používají checkboxy (`- [ ]`) pro sledování postupu.

**Cíl:** Dvojjazyčný (CZ/EN) prezentační web, přes který Michal nabízí tvorbu webů a aplikací malým firmám.

**Architektura:** Astro se statickým předrenderováním všech stránek; jediná serverová část je Astro Action kontaktního
formuláře běžící na Cloudflare Workeru. i18n přes vestavěný routing Astra + vlastní mapu přeložených cest. Obsah
v content collections, UI texty ve typovaných slovnících.

**Tech stack:** Astro, `@astrojs/cloudflare`, `@astrojs/mdx`, `@astrojs/sitemap`, Tailwind CSS v4 (Vite plugin),
Zod (`astro/zod`), Resend, Cloudflare Turnstile, Vitest, ESLint, Prettier + `prettier-plugin-astro`.

**Spec:** `docs/superpowers/specs/2026-10-16-portfolio-design.md`
**Značka:** `brand/README.md`, `brand/brand-board.html`

## Globální omezení

- `defaultLocale: "cs"`, `locales: ["cs", "en"]`, `prefixDefaultLocale: false`; žádný automatický redirect podle jazyka.
- Přeložené cesty: `/` ↔ `/en/`, `/projekty/[slug]` ↔ `/en/projects/[slug]`, `/ochrana-osobnich-udaju` ↔ `/en/privacy`.
- Odkazy nikdy ručně skládanými stringy – vždy přes mapu cest / `getRelativeLocaleUrl`.
- Komponenty `.astro`, žádný React ani UI knihovna. Klientský JS jen: Turnstile, mobilní menu, přepínač tématu, animace loga.
- Barvy jen z palety: Ink `#0E0F11`, Graphite `#1B1D21`, Paper `#F5F3EE`, Ash `#A09F99`, Ash Deep `#64635E`,
  Signal `#FF6A3D`, Signal Deep `#C2410C`, Chalk `#FCFBF8` (plocha ve světlém), Line `#2A2D32` / Line Light `#DDD9D0`
  (okraje). Signal na Paper se nepoužívá. Okraje formulářových polí Ash / Ash Deep (≥ 3 : 1).
- Písmo: Archivo (variabilní, osy `wdth`, `wght`), self-hosted, `font-display: swap`; nadpisy `wdth` 125, text `wdth` 100.
- Téma: výchozí tmavé, světlé podle `prefers-color-scheme`, ruční přepínač v patičce.
- Logo: tmavé téma → `brand/logo/*-negative.svg`, světlé → `*-positive.svg`.
- Obrázky jen přes `astro:assets`. Lighthouse ≥ 95 (mobil) ve všech kategoriích.
- TypeScript strict; `astro check`, lint a testy musí projít před každým commitem do `main`.

## Na co se zaměřit při review (není pokryto „šťastnou cestou“)

1. **Odeslání formuláře bez JS / bez Turnstile tokenu** → uživatel uvidí srozumitelnou chybu s odkazem na e-mail, ne pád ani prázdnou stránku. *(test v Úkolu 8)*
2. **Bliknutí špatného tématu při načtení** (uživatel má světlý systém nebo ručně zvolené světlé téma) → stránka se rovnou vykreslí ve správném tématu. *(test v Úkolu 2 + ruční kontrola)*
3. **Lomítko na konci URL** (`/en` vs `/en/`, `/projekty/x` vs `/projekty/x/`) → jedna kanonická podoba; canonical, hreflang i odkazy z mapy cest ji používají shodně. *(test v Úkolu 3)*
4. **Vstup s diakritikou, mezerami a velkými písmeny** (`  Jiří Šťastný `, `Jana@Example.CZ`) → po chybě jiného pole se hodnoty vrátí do formuláře beze změny; e-mail projde validací po oříznutí mezer. *(test v Úkolu 8)*
5. **Selhání Resend API** (síť, neplatný klíč) → obecná chyba + fallback „napište mi přímo na e-mail“, žádný únik detailu chyby do HTML. *(test v Úkolu 8)*

---

### Úkol 1: Repozitář, kostra projektu a nástroje

**Soubory:** vytvořit kostru Astra v kořeni `portfolio/`, `.gitignore`, `.prettierrc`, `eslint.config.js`,
`vitest.config.ts`, `.github/workflows/ci.yml`.

- [ ] `git init`, první commit se stávajícím `docs/` a `brand/` (předtím zkontroluj `.gitignore` – `.DS_Store`, `.idea/`, `node_modules/`, `dist/`, `.wrangler/`, `.env*`).
- [ ] Vytvoř Astro projekt (`npm create astro@latest`, šablona „minimal“, TypeScript **strict**) do existující složky.
- [ ] Přidej integrace `@astrojs/mdx`, `@astrojs/sitemap` a Tailwind v4 přes `npx astro add` (Tailwind se v Astru přidává jako Vite plugin). Docs: https://docs.astro.build/en/guides/styling/#tailwind
- [ ] Nastav Prettier + `prettier-plugin-astro`, ESLint s `eslint-plugin-astro`.
- [ ] Nastav Vitest přes `getViteConfig` z `astro/config` (https://docs.astro.build/en/guides/testing/#vitest). Napiš jeden triviální test, ať vidíš, že běh funguje.
- [ ] Skripty v `package.json`: `dev`, `build`, `preview`, `check` (`astro check`), `lint`, `format`, `test`.
- [ ] CI workflow: na každý PR spustit `check`, `lint`, `test`, `build`.
- [ ] **Ověření:** `npm run check && npm run lint && npm test && npm run build` projde.
- [ ] Commit: `chore: scaffold Astro project with tooling and CI`

### Úkol 2: Design tokeny, písmo a témata

**Soubory:** `src/styles/global.css`, `public/fonts/` (Archivo woff2 + `OFL.txt`), `src/lib/theme.ts`,
`src/lib/theme.test.ts`, `src/components/ThemeScript.astro`, `src/components/ThemeToggle.astro`.

**Produkuje:** CSS tokeny barev a písma pro obě témata; funkci, která z uloženého výběru a systémové preference určí téma;
přepínač tématu.

- [ ] Test `theme.test.ts` – funkce pro určení tématu:
  - bez uložené volby a se systémovou preferencí tmavou → `dark`
  - bez uložené volby a se systémovou preferencí světlou → `light`
  - uložená volba `dark` přebije světlý systém → `dark` (a obráceně)
  - neplatná uložená hodnota (např. `"blue"`) se ignoruje → rozhoduje systém
- [ ] Spusť test, ověř, že selže.
- [ ] Implementuj funkci v `src/lib/theme.ts` (vstup: uložená hodnota nebo nic + boolean „systém chce světlé“; výstup: `"dark" | "light"`).
- [ ] Test projde.
- [ ] Tokeny v `global.css` přes `@theme` (https://tailwindcss.com/docs/theme): sémantické názvy (pozadí, plocha, text, text vedlejší, akcent), hodnoty pro tmavé téma jako výchozí, přepsání pro světlé přes atribut na `<html>` (např. `data-theme="light"`). Hodnoty viz `brand/README.md` § 2.
- [ ] `@font-face` pro Archivo z `public/fonts/` s rozsahy os `wdth 62 125` a `wght 100 900`, `font-display: swap`. Zvaž subset na latin + latin-ext.
- [ ] `ThemeScript.astro`: malý **inline** skript v `<head>`, který před prvním vykreslením nastaví atribut tématu (jinak hrozí bliknutí – viz Review bod 2). Musí používat stejnou logiku jako `theme.ts`.
- [ ] `ThemeToggle.astro`: tlačítko (s přístupným popiskem v obou jazycích), které přepne téma a uloží volbu do `localStorage` (obal do `try/catch`).
- [ ] **Ověření:** dočasná testovací stránka – přepni systém na světlý, obnov stránku: žádné bliknutí tmavé; přepínač funguje a přežije reload.
- [ ] Commit: `feat: design tokens, self-hosted Archivo and theme switching`

### Úkol 3: i18n jádro – konfigurace, slovníky, mapa cest

**Soubory:** `astro.config.mjs`, `src/i18n/cs.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`, `src/i18n/routes.ts`,
`src/i18n/routes.test.ts`.

**Produkuje:**
- typ jazyka (`"cs" | "en"`) a seznam jazyků,
- funkci, která vrátí slovník pro jazyk,
- mapu logických stránek (`home`, `project`, `privacy`) → cesta v každém jazyce,
- funkci „cesta pro stránku v jazyce“ (stránka, jazyk, volitelné parametry jako `slug`) → řetězec,
- funkci „alternativy“ (stránka, parametry) → cesta pro každý jazyk; ji používá přepínač jazyka i `hreflang`.

- [ ] V `astro.config.mjs` nastav `i18n` podle Globálních omezení a `trailingSlash` na jednu hodnotu (rozhodni `always` nebo `never` a drž se jí – Review bod 3). `site` zatím placeholder.
- [ ] `cs.ts` jako zdroj pravdy; `en.ts` typově vázaný na tvar `cs.ts`, aby chybějící klíč byl chyba TypeScriptu. Zatím jen klíče pro navigaci a patičku.
- [ ] Testy `routes.test.ts`:
  - `home` → `/` (cs) a `/en/` (en)
  - `project` se slugem `nohy-v-cajku` → `/projekty/nohy-v-cajku/` a `/en/projects/nohy-v-cajku/` (koncové lomítko podle tvé volby)
  - `privacy` → `/ochrana-osobnich-udaju/` a `/en/privacy/`
  - alternativy pro `project` vrátí obě cesty se stejným slugem
  - `project` bez slugu → vyhodí chybu (ne tichý řetězec `undefined`)
  - každá vrácená cesta končí lomítkem podle zvolené konvence (Review bod 3)
- [ ] Spusť testy, ověř, že selžou.
- [ ] Implementuj `routes.ts` (pro výchozí jazyk můžeš stavět na `getRelativeLocaleUrl` z `astro:i18n`; vlastní mapa řeší přeložené segmenty).
- [ ] Testy projdou, `astro check` projde.
- [ ] Commit: `feat: i18n config, typed dictionaries and translated route map`

### Úkol 4: Layout, hlavička, patička, SEO hlava, 404

**Soubory:** `src/layouts/BaseLayout.astro`, `src/components/Seo.astro`, `src/components/Header.astro`,
`src/components/LanguageSwitcher.astro`, `src/components/Logo.astro`, `src/components/Footer.astro`,
`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/404.astro`, `src/components/pages/HomePage.astro`.

**Konzumuje:** tokeny a `ThemeScript`/`ThemeToggle` (Úkol 2), slovníky a mapu cest (Úkol 3).

- [x] `BaseLayout` přijímá jazyk, titulek, popis, logickou stránku + parametry (kvůli alternativám) a volitelný OG obrázek. Nastaví `lang` na `<html>`, vloží `ThemeScript`, skip link „Přeskočit na obsah“, `Header`, `<main id="…">`, `Footer`.
- [x] `Seo.astro`: `<title>`, `meta description`, `canonical`, `hreflang` pro oba jazyky + `x-default` → CZ, Open Graph (`og:title`, `og:description`, `og:image`, `og:locale`). Docs: https://developers.google.com/search/docs/specialty/international/localized-versions
- [x] `Logo.astro`: inline SVG z `brand/logo/` – negativ pro tmavé, pozitiv pro světlé téma (přepínání přes CSS podle atributu tématu, ne přes JS). Přístupný název „Michal Roučka“.
- [x] `LanguageSwitcher`: obyčejné odkazy z funkce alternativ, aktuální jazyk označený `aria-current`.
- [x] `Header`: logo (odkaz na home v aktuálním jazyce), navigace na sekce homepage (kotvy), přepínač jazyka, mobilní menu (`<details>` nebo malý skript).
- [x] `Footer`: kontakt, odkaz na GDPR stránku, `ThemeToggle`, místo pro IČO (zatím skryté / prázdné).
- [x] Tenké stránky `index.astro` a `en/index.astro` – jen určí jazyk a vykreslí `HomePage` (zatím jen nadpis).
- [x] `404.astro` – jednoduchá dvojjazyčná stránka s odkazem domů v obou jazycích.
- [x] Favicon a ikony: zkopíruj `brand/web/*` do `public/` a obsah `head-snippet.html` vlož do layoutu.
- [x] **Ověření:** `npm run build`, v `dist/` zkontroluj u `/` i `/en/`: správné `lang`, canonical a hreflang ukazují na sebe navzájem, přepínač vede na protějšek. Klávesnicí projdi hlavičku (viditelný focus, skip link funguje).
- [x] Commit: `feat: base layout with SEO head, header, footer and 404`

**Poznámky k provedení** (větev `feat/layout`):

- *Rozhodnutí:*
  - Mobilní menu je `<dialog>` přes celou obrazovku (`showModal()` – fokus zůstane v menu, Escape zavře). Zavírací animace přes `transition-behavior: allow-discrete` na `display`/`overlay`; poloha a layout dialogu proto nesmí záviset na `[open]` (`fixed inset-0`, `flex-col` napořád, jen `open:flex`). Odkazy v menu naskakují postupně (`--index` + `transition-delay` jen při otevírání).
  - Ikona menu `MenuIcon.astro` je vlastní (dvě hranaté čáry, spodní kratší), morf do křížku jen přes CSS uvnitř otevřeného dialogu.
  - Přepínač jazyka: zkratky „CS · EN“ (ne vlajky), autonyma v `languageNames` (`i18n/index.ts`). Je v hlavičce (desktop, oddělený svislou čárou), v mobilním menu i v patičce. Bez `page` (404) se nevykreslí.
  - `page` je v `BaseLayout`/`Seo`/`Header`/`Footer` volitelné – bez něj žádný canonical/hreflang/`og:url`, přidá se `noindex`. Využívá 404.
  - Logo: `viewBox` oříznutý o ochrannou zónu (zarovnání s layoutem), ochrannou zónu drží odsazení `pagePaddingX`.
  - Rok v © je napevno (`siteDetails.launchYear`) – v © se píše rok prvního zveřejnění, nemusí se aktualizovat.
- *Nad rámec plánu:*
  - `src/lib/site.ts` – údaje o webu (e-mail, telefon, IČO, rok) a `pagePaddingX` (sdílený vodorovný okraj).
  - Typografická škála z manuálu (`--text-*` v `@theme`, výchozí velikosti Tailwindu vypnuté) – využije Úkol 6.
  - Utilita `link-underline` (podtržení přijede zleva, odjede doprava) pro navigaci, patičku a přepínač jazyka.
  - Logo v hlavičce: při hoveru se tečka promění v blikající kurzor a jméno mu ustoupí (`dot-cursor-hover`, `name-push-hover` v `global.css`).
- *Odchylka od manuálu (§ 5):* při hoveru na logo kurzor bliká, dokud je na něm myš (ne jen 3×) – tvar je přes `transition`, aby se po odjetí plynule vrátil do tečky. „3 bliknutí a zpět“ platí pro hero (Úkol 9). Rytmus blikání je 530 ms svítí / 530 ms zhasnuto.

### Úkol 5: Content collections – služby a case studies

**Soubory:** `src/content.config.ts`, `src/content/services.yaml` (nebo JSON), `src/content/projects/cs/nohy-v-cajku.mdx`,
`src/content/projects/en/nohy-v-cajku.mdx`, `src/assets/projects/…` (cover a screenshoty), `src/lib/projects.ts`,
`src/lib/projects.test.ts`.

**Produkuje:** kolekce `services` a `projects`; funkci, která z kolekce vrátí projekty pro jazyk seřazené podle `order`
(volitelně jen `featured`); funkci, která ze seznamu záznamů najde slugy chybějící v některém jazyce.

- [ ] Schéma `services` přesně podle spec § 5 (lokalizované `title`, `description`, `features`; `priceFrom` číslo; `order`). Pro jeden soubor s více záznamy použij `file()` loader. Docs: https://docs.astro.build/en/guides/content-collections/#built-in-loaders
- [ ] Schéma `projects` podle spec § 5 (`cover` přes `image()`, `type` jako enum `web | web-app | app`, volitelné `liveUrl`, `repoUrl`, `testimonial`). `glob()` loader nad `projects/**/*.mdx`.
- [ ] Testy `projects.test.ts` (na ručně sestavených záznamech, ne na skutečné kolekci):
  - z id `cs/nohy-v-cajku` se správně odvodí jazyk `cs` a slug `nohy-v-cajku`
  - pár `cs/x` + `en/x` → žádné chybějící slugy
  - jen `cs/x` → hlásí `x` jako chybějící v `en`
  - řazení podle `order` vzestupně; filtr `featured` vrátí jen označené
- [ ] Spusť testy, selžou → implementuj `projects.ts` → projdou.
- [ ] Kontrola párování při buildu: zavolej funkci hledání chybějících slugů tam, kde se generují stránky case studies (Úkol 7) a při nálezu vyhoď chybu s výčtem slugů.
- [ ] Naplň `services.yaml` třemi službami (ceny zatím placeholder – spec § 10) a jednu case study v obou jazycích s kostrou problém → řešení → výsledek → screenshoty → technologie (texty mohou být zatím pracovní).
- [ ] **Ověření:** `astro check` + `npm test` projdou; dočasně smaž EN soubor → build spadne se srozumitelnou hláškou; vrať zpět.
- [ ] Commit: `feat: content collections for services and case studies`

### Úkol 6: Sekce homepage

**Soubory:** `src/components/sections/{Hero,Services,FeaturedProjects,Process,About,Contact}.astro`,
`src/components/cards/{ServiceCard,ProjectCard}.astro`, `src/components/pages/HomePage.astro`, doplnění slovníků.

**Konzumuje:** kolekce a pomocné funkce (Úkol 5), mapu cest (Úkol 3).

- [ ] Komponenta pro **kulatou tečku značky** (`src/components/BrandDot.astro`): ne znak `.` z písma (ten je hranatý), ale prvek s kulatým tvarem v barvě akcentu, průměr ~0,23 em, přesně na účaří (`brand/README.md` § 4). Pro čtečky obrazovky musí věta pořád končit tečkou – rozmysli, jak (vizuálně skrytý text vs. `aria-hidden`).
- [ ] `Hero`: nadpis jako celá věta zakončená `BrandDot`, podnadpis, CTA „Nezávazná konzultace“ (kotva na kontakt) a vedlejší CTA „Ukázky práce“.
- [ ] `Services` + `ServiceCard`: data z kolekce, cena formátovaná podle jazyka (`Intl.NumberFormat`, „od 15 000 Kč“ / „from CZK 15,000“), věta „přesná cena po nezávazné konzultaci“.
- [ ] `FeaturedProjects` + `ProjectCard`: jen `featured`, seřazené; cover přes `<Image>`; odkaz z mapy cest; štítek `type`.
- [ ] `Process`: 4–5 kroků ze slovníku (konzultace → návrh → vývoj → spuštění → podpora).
- [ ] `About`: krátký text, fotka přes `<Image>`, Plzeň.
- [ ] `Contact`: zatím jen sekce s nadpisem a e-mailem/telefonem; formulář přijde v Úkolu 8.
- [ ] Každá sekce má `id` pro kotvy z hlavičky a nadpis `<h2>`; na stránce je jediný `<h1>` (v Hero).
- [ ] **Ověření:** obě jazykové verze homepage na mobilu (375 px) i desktopu, obě témata; žádný text natvrdo mimo slovník (zkontroluj EN verzi, jestli v ní nezůstala čeština).
- [ ] Commit: `feat: homepage sections`

### Úkol 7: Stránky case studies a MDX komponenty

**Soubory:** `src/pages/projekty/[slug].astro`, `src/pages/en/projects/[slug].astro`,
`src/components/pages/ProjectPage.astro`, `src/components/mdx/{Gallery,Quote}.astro`.

**Konzumuje:** kolekci `projects` a funkce z Úkolu 5, mapu cest z Úkolu 3.

- [ ] Obě page obálky generují `getStaticPaths` jen z projektů svého jazyka a před tím spustí kontrolu párování (Úkol 5).
- [ ] `ProjectPage`: titulek, typ, cover, tělo MDX (předej MDX komponenty `Gallery` a `Quote`), štítky technologií, odkazy `liveUrl`/`repoUrl` pokud existují, `testimonial` pokud existuje, CTA na kontakt.
- [ ] SEO: titulek a popis z frontmatteru, `og:image` = cover, alternativy přes mapu cest s parametrem `slug`.
- [ ] `Gallery`: mřížka obrázků přes `<Image>` s povinným `alt`. `Quote`: `<figure>` + `<blockquote>` + `<figcaption>`.
- [ ] **Ověření:** `/projekty/nohy-v-cajku/` a `/en/projects/nohy-v-cajku/` se vyrenderují, přepínač jazyka mezi nimi funguje, hreflang ukazuje na protějšek.
- [ ] Commit: `feat: case study pages with MDX components`

### Úkol 8: Kontaktní formulář (Astro Action)

**Soubory:** `src/actions/index.ts`, `src/lib/contact/schema.ts`, `src/lib/contact/spam.ts`,
`src/lib/contact/turnstile.ts`, `src/lib/contact/mail.ts`, testy `src/lib/contact/*.test.ts`,
`src/components/sections/Contact.astro`, `astro.config.mjs` (adapter + `env.schema`).

**Produkuje:** Zod schéma formuláře; funkci kontroly spamu (honeypot + časová kontrola); funkci ověření Turnstile tokenu;
funkci sestavení a odeslání e-mailu; action `contact`; mapování chyb na klíče slovníku.

- [ ] Přidej `@astrojs/cloudflare` adapter. Stránky zůstávají předrenderované; homepage s formulářem musí umět zobrazit výsledek akce – nastuduj, jak se v Astru čte výsledek form action (`Astro.getActionResult`) a co to znamená pro prerender té stránky. Docs: https://docs.astro.build/en/guides/actions/#call-actions-from-an-html-form-action — **tohle si spolu projdeme před implementací.**
- [ ] `env.schema` v configu: `RESEND_API_KEY` a `TURNSTILE_SECRET_KEY` jako server secret, Turnstile site key jako public client proměnná, cílová adresa e-mailu jako server proměnná. Docs: https://docs.astro.build/en/guides/environment-variables/#type-safe-environment-variables
- [ ] Testy `schema.test.ts`:
  - platný vstup projde; telefon může chybět
  - prázdné jméno / e-mail / zpráva → chyba u konkrétního pole
  - neplatný e-mail → chyba u pole e-mail
  - `"  Jana@Example.CZ "` projde (oříznutí mezer) – Review bod 4
  - `service` mimo povolené hodnoty (`presentation`, `web-system`, `custom-app`, `other`) → chyba
  - příliš dlouhá zpráva (zvol limit, např. 5 000 znaků) → chyba
- [ ] Testy `spam.test.ts`:
  - vyplněný honeypot → spam
  - odesláno dřív než 3 s od zobrazení formuláře → spam
  - chybějící nebo nečíselný časový údaj → spam
  - prázdný honeypot a 10 s → není spam
- [ ] Testy `turnstile.test.ts` (s podvrženým `fetch`):
  - odpověď `success: true` → ověřeno
  - `success: false` → neověřeno
  - chybějící token → neověřeno **bez** volání sítě – Review bod 1
  - síťová chyba → rozlišitelná od „neověřeno“ (vede na obecnou chybu, ne na tichý úspěch)
- [ ] Testy `mail.test.ts` (s podvrženým Resend klientem):
  - e-mail jde na cílovou adresu, `reply-to` = e-mail zákazníka, předmět obsahuje jméno a službu
  - chyba Resend → funkce vrátí neúspěch bez detailu chyby určeného pro uživatele – Review bod 5
- [ ] Každá sada: spusť → selže → implementuj → projde.
- [ ] Action `contact` (`accept: 'form'`): validace → spam (navenek úspěch, nic se neodešle) → Turnstile → e-mail. Chybové stavy přesně podle spec § 7.
- [ ] `Contact.astro`: `<form method="POST" action={actions.contact}>`, `<label>` u každého pole, honeypot skrytý pro lidi i čtečky, skryté pole s časem zobrazení, Turnstile widget; po chybě vrácené hodnoty v polích (Review bod 4), chyby u polí přes `aria-describedby`, výsledek v oblasti s `aria-live`; pod formulářem věta s odkazem na GDPR stránku.
- [ ] Překlad chyb: Zod kódy → klíče ve slovnících obou jazyků.
- [ ] **Ověření:** lokálně s testovacími klíči Turnstile (https://developers.cloudflare.com/turnstile/troubleshooting/testing/) a testovacím odesílatelem Resend: úspěch, chyba validace (hodnoty zůstanou), vypnutý JS (srozumitelná chyba + e-mail).
- [ ] Commit: `feat: contact form with validation, spam protection and email delivery`

### Úkol 9: Animace loga v hero

**Soubory:** `src/components/sections/Hero.astro` (nebo samostatná `HeroMark.astro`), CSS v komponentě.

- [ ] Velká značka „mr.“ v hero jako inline SVG, kde tečka je samostatný element, který jde animovat.
- [ ] *(Připraveno v Úkolu 4: `@keyframes dot-cursor` a třída `animate-dot-cursor` v `global.css` – tečka jako `<rect>` s `--dot`/`--baseline`, převod kruhu viz `dotToRect` v `Logo.astro`. V hero ji stačí spustit po načtení.)*
- [ ] Animace podle `brand/README.md` § 5: 0–280 ms tečka → podtržítko (ease-out), blikání ~530 ms, 3 bliknutí, návrat do tečky. Jednou po načtení. Nastuduj CSS `@keyframes` a animovatelné vlastnosti SVG (u `<rect>` jdou animovat `width`, `height`, `rx` přes CSS v moderních prohlížečích; alternativa je `transform: scale`). **Než začneš, projdeme koncept spolu.**
- [ ] `@media (prefers-reduced-motion: reduce)` → žádná animace, statická tečka.
- [ ] Klidový stav je vždy tečka (i když animace neproběhne nebo se přeruší).
- [ ] **Ověření:** v DevTools zapni emulaci reduced motion → bez animace; v obou tématech odpovídá barva tečky (Signal / Signal Deep).
- [ ] Commit: `feat: hero logo dot-to-cursor animation`

### Úkol 10: GDPR stránka, sitemap, robots, strukturovaná data

**Soubory:** `src/pages/ochrana-osobnich-udaju.astro`, `src/pages/en/privacy.astro`, `src/components/pages/PrivacyPage.astro`,
`public/robots.txt`, `src/components/JsonLd.astro`, výchozí OG obrázek `public/og-default.png`, `astro.config.mjs` (sitemap i18n).

- [ ] GDPR stránka v obou jazycích (text je otevřený bod spec § 10 – zatím kostra: správce, účel, právní titul, doba uchování, práva subjektu, kontakt).
- [ ] Sitemap s i18n volbou, aby obsahovala jazykové alternativy. Docs: https://docs.astro.build/en/guides/integrations-guide/sitemap/#i18n
- [ ] `robots.txt` s odkazem na sitemap.
- [ ] JSON-LD `ProfessionalService` (jméno, oblast Plzeň a okolí, kontakt, URL) na homepage obou jazyků.
- [ ] Výchozí OG obrázek 1200 × 630 v barvách značky (můžeš vyjít z brand boardu).
- [ ] **Ověření:** `dist/sitemap-index.xml` obsahuje všechny stránky obou jazyků s `xhtml:link` alternativami; JSON-LD projde https://validator.schema.org/.
- [ ] Commit: `feat: privacy page, sitemap, robots and structured data`

### Úkol 11: Nasazení na Cloudflare a finální kontrola

**Soubory:** `wrangler.jsonc` (podle docs adaptéru), případně úprava `astro.config.mjs`.

- [ ] Projdi https://docs.astro.build/en/guides/deploy/cloudflare/ a nastav projekt pro Workers se statickými assety.
- [ ] Propoj GitHub repo přes Workers Builds (https://developers.cloudflare.com/workers/ci-cd/builds/): `main` → produkce, větve → preview.
- [ ] Nastav proměnné prostředí a secrets v Cloudflare (produkce i preview).
- [ ] Zapni Cloudflare Web Analytics.
- [ ] **Ověření na preview URL:** Lighthouse (mobil) ≥ 95 ve všech kategoriích na `/`, `/en/` a jedné case study; formulář odešle e-mail; obě témata; přepínač jazyka na všech stránkách; 404.
- [ ] Commit + PR → merge do `main`.

---

## Mimo tento plán (blokováno otevřenými body spec § 10)

Doména (a s ní `site`, ověření domény v Resend, produkční e-mail), finální texty a ceny, IČO v patičce.
