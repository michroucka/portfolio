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
**Issues:** úkoly 5–11 a otevřené body jsou GitHub issues `michroucka/portfolio`, texty v `docs/superpowers/issues.md`
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

**Stav:** hotovo – PR #1

**Soubory:** vytvořit kostru Astra v kořeni `portfolio/`, `.gitignore`, `.prettierrc`, `eslint.config.js`,
`vitest.config.ts`, `.github/workflows/ci.yml`.

- [x] `git init`, první commit se stávajícím `docs/` a `brand/` (předtím zkontroluj `.gitignore` – `.DS_Store`, `.idea/`, `node_modules/`, `dist/`, `.wrangler/`, `.env*`).
- [x] Vytvoř Astro projekt (`npm create astro@latest`, šablona „minimal“, TypeScript **strict**) do existující složky.
- [x] Přidej integrace `@astrojs/mdx`, `@astrojs/sitemap` a Tailwind v4 přes `npx astro add` (Tailwind se v Astru přidává jako Vite plugin). Docs: https://docs.astro.build/en/guides/styling/#tailwind
- [x] Nastav Prettier + `prettier-plugin-astro`, ESLint s `eslint-plugin-astro`.
- [x] Nastav Vitest přes `getViteConfig` z `astro/config` (https://docs.astro.build/en/guides/testing/#vitest). Napiš jeden triviální test, ať vidíš, že běh funguje.
- [x] Skripty v `package.json`: `dev`, `build`, `preview`, `check` (`astro check`), `lint`, `format`, `test`.
- [x] CI workflow: na každý PR spustit `check`, `lint`, `test`, `build`.
- [x] **Ověření:** `npm run check && npm run lint && npm test && npm run build` projde.
- [x] Commit: `chore: scaffold Astro project with tooling and CI`

### Úkol 2: Design tokeny, písmo a témata

**Stav:** hotovo – PR #3 (plocha a okraje pro světlé téma: PR #2)

**Soubory:** `src/styles/global.css`, `public/fonts/` (Archivo woff2 + `OFL.txt`), `src/lib/theme.ts`,
`src/lib/theme.test.ts`, `src/components/ThemeScript.astro`, `src/components/ThemeToggle.astro`.

**Produkuje:** CSS tokeny barev a písma pro obě témata; funkci, která z uloženého výběru a systémové preference určí téma;
přepínač tématu.

- [x] Test `theme.test.ts` – funkce pro určení tématu:
  - bez uložené volby a se systémovou preferencí tmavou → `dark`
  - bez uložené volby a se systémovou preferencí světlou → `light`
  - uložená volba `dark` přebije světlý systém → `dark` (a obráceně)
  - neplatná uložená hodnota (např. `"blue"`) se ignoruje → rozhoduje systém
- [x] Spusť test, ověř, že selže.
- [x] Implementuj funkci v `src/lib/theme.ts` (vstup: uložená hodnota nebo nic + boolean „systém chce světlé“; výstup: `"dark" | "light"`).
- [x] Test projde.
- [x] Tokeny v `global.css` přes `@theme` (https://tailwindcss.com/docs/theme): sémantické názvy (pozadí, plocha, text, text vedlejší, akcent), hodnoty pro tmavé téma jako výchozí, přepsání pro světlé přes atribut na `<html>` (např. `data-theme="light"`). Hodnoty viz `brand/README.md` § 2.
- [x] `@font-face` pro Archivo z `public/fonts/` s rozsahy os `wdth 62 125` a `wght 100 900`, `font-display: swap`. Zvaž subset na latin + latin-ext.
- [x] `ThemeScript.astro`: malý **inline** skript v `<head>`, který před prvním vykreslením nastaví atribut tématu (jinak hrozí bliknutí – viz Review bod 2). Musí používat stejnou logiku jako `theme.ts`.
- [x] `ThemeToggle.astro`: tlačítko (s přístupným popiskem v obou jazycích), které přepne téma a uloží volbu do `localStorage` (obal do `try/catch`).
- [x] **Ověření:** dočasná testovací stránka – přepni systém na světlý, obnov stránku: žádné bliknutí tmavé; přepínač funguje a přežije reload.
- [x] Commit: `feat: design tokens, self-hosted Archivo and theme switching`

### Úkol 3: i18n jádro – konfigurace, slovníky, mapa cest

**Stav:** hotovo – PR #4

**Soubory:** `astro.config.mjs`, `src/i18n/cs.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`, `src/i18n/routes.ts`,
`src/i18n/routes.test.ts`.

**Produkuje:**
- typ jazyka (`"cs" | "en"`) a seznam jazyků,
- funkci, která vrátí slovník pro jazyk,
- mapu logických stránek (`home`, `project`, `privacy`) → cesta v každém jazyce,
- funkci „cesta pro stránku v jazyce“ (stránka, jazyk, volitelné parametry jako `slug`) → řetězec,
- funkci „alternativy“ (stránka, parametry) → cesta pro každý jazyk; ji používá přepínač jazyka i `hreflang`.

- [x] V `astro.config.mjs` nastav `i18n` podle Globálních omezení a `trailingSlash` na jednu hodnotu (rozhodni `always` nebo `never` a drž se jí – Review bod 3). `site` zatím placeholder.
- [x] `cs.ts` jako zdroj pravdy; `en.ts` typově vázaný na tvar `cs.ts`, aby chybějící klíč byl chyba TypeScriptu. Zatím jen klíče pro navigaci a patičku.
- [x] Testy `routes.test.ts`:
  - `home` → `/` (cs) a `/en/` (en)
  - `project` se slugem `nohy-v-cajku` → `/projekty/nohy-v-cajku/` a `/en/projects/nohy-v-cajku/` (koncové lomítko podle tvé volby)
  - `privacy` → `/ochrana-osobnich-udaju/` a `/en/privacy/`
  - alternativy pro `project` vrátí obě cesty se stejným slugem
  - `project` bez slugu → vyhodí chybu (ne tichý řetězec `undefined`)
  - každá vrácená cesta končí lomítkem podle zvolené konvence (Review bod 3)
- [x] Spusť testy, ověř, že selžou.
- [x] Implementuj `routes.ts` (pro výchozí jazyk můžeš stavět na `getRelativeLocaleUrl` z `astro:i18n`; vlastní mapa řeší přeložené segmenty).
- [x] Testy projdou, `astro check` projde.
- [x] Commit: `feat: i18n config, typed dictionaries and translated route map`

### Úkol 4: Layout, hlavička, patička, SEO hlava, 404

**Stav:** hotovo – PR #5

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
  - Logo: `viewBox` oříznutý o ochrannou zónu (zarovnání s layoutem), ochrannou zónu drží odsazení `pageContainer`.
  - Rok v © je napevno (`siteDetails.launchYear`) – v © se píše rok prvního zveřejnění, nemusí se aktualizovat.
- *Nad rámec plánu:*
  - `src/lib/site.ts` – údaje o webu (e-mail, telefon, IČO, rok) a `pageContainer` (sdílený sloupec obsahu: `max-w-7xl` + vodorovný okraj; v úkolu 6 nahradil `pagePaddingX`).
  - Typografická škála z manuálu (`--text-*` v `@theme`, výchozí velikosti Tailwindu vypnuté) – využije Úkol 6.
  - Utilita `link-underline` (podtržení přijede zleva, odjede doprava) pro navigaci, patičku a přepínač jazyka.
  - Logo v hlavičce: při hoveru se tečka promění v blikající kurzor a jméno mu ustoupí (`dot-cursor-hover`, `name-push-hover` v `global.css`).
- *Odchylka od manuálu (§ 5):* při hoveru na logo kurzor bliká, dokud je na něm myš (ne jen 3×) – tvar je přes `transition`, aby se po odjetí plynule vrátil do tečky. „3 bliknutí a zpět“ platí pro hero (Úkol 9). Rytmus blikání je 530 ms svítí / 530 ms zhasnuto.

### Úkol 5: Content collections – služby a case studies

**Issue:** #7 · **Milestone:** Obsah a stránky

**Soubory:** `src/content.config.ts`, `src/content/services.yaml` (nebo JSON), `src/content/projects/cs/nohy-v-cajku.mdx`,
`src/content/projects/en/nohy-v-cajku.mdx`, `src/assets/projects/…` (cover a screenshoty), `src/lib/projects.ts`,
`src/lib/projects.test.ts`.

**Produkuje:** kolekce `services` a `projects`; funkci, která z kolekce vrátí projekty pro jazyk seřazené podle `order`
(volitelně jen `featured`); funkci, která ze seznamu záznamů najde slugy chybějící v některém jazyce.

- [x] Schéma `services` přesně podle spec § 5 (lokalizované `title`, `description`, `features`; `priceFrom` číslo; `order`). Pro jeden soubor s více záznamy použij `file()` loader. Docs: https://docs.astro.build/en/guides/content-collections/#built-in-loaders
- [x] Schéma `projects` podle spec § 5 (`cover` přes `image()`, `type` jako enum `web | web-app | app`, volitelné `liveUrl`, `repoUrl`, `testimonial`). `glob()` loader nad `projects/**/*.mdx`.
- [x] Testy `projects.test.ts` (na ručně sestavených záznamech, ne na skutečné kolekci):
  - z id `cs/nohy-v-cajku` se správně odvodí jazyk `cs` a slug `nohy-v-cajku`
  - pár `cs/x` + `en/x` → žádné chybějící slugy
  - jen `cs/x` → hlásí `x` jako chybějící v `en`
  - řazení podle `order` vzestupně; filtr `featured` vrátí jen označené
- [x] Spusť testy, selžou → implementuj `projects.ts` → projdou.
- [ ] Kontrola párování při buildu: zavolej funkci hledání chybějících slugů tam, kde se generují stránky case studies (Úkol 7) a při nálezu vyhoď chybu s výčtem slugů.
- [x] Naplň `services.yaml` třemi službami (ceny zatím placeholder – spec § 10) a jednu case study v obou jazycích s kostrou problém → řešení → výsledek → screenshoty → technologie (texty mohou být zatím pracovní).
- [ ] **Ověření:** `astro check` + `npm test` projdou; dočasně smaž EN soubor → build spadne se srozumitelnou hláškou; vrať zpět.
- [ ] Commit: `feat: content collections for services and case studies`

**Poznámky k provedení** (větev `feat/content`):

- *Rozhodnutí:*
  - Lokalizované pole přes `z.record(z.enum(locales), …)` – v Zodu 4 vyžaduje všechny klíče, takže nový jazyk shodí build u každého chybějícího překladu.
  - `priceFrom` je kladné celé číslo, `order` celé číslo (spec § 5 upravena). `featured` má výchozí `false`, `liveUrl`/`repoUrl` validuje `z.url({ protocol: /^https?$/ })` – samotné `z.url()` pustí i `javascript:` nebo překlep `htps:`.
  - `parseProjectId` vyhodí chybu při neznámém jazyku, chybějícím jazyku nebo slugu i při víc než dvou segmentech (`cs/blog/x` – podsložka by jinak tiše vytvořila kolizi slugů). Hláška obsahuje celé id.
  - `getProjectsForLocale` určuje jazyk přes `parseProjectId` (pravidla pro id na jednom místě) a nemutuje vstup (`toSorted`).
  - Služby: prezentační web / web s rezervacemi / aplikace na míru (shodně se selectem formuláře, spec § 7). Ceny placeholder.
  - Case study bez `testimonial` – klientka je z rodiny, citace by nebyla nezávislá (spec § 1: sekce Reference až při 2–3 zakázkách). Online rezervace a SMS jsou popsané jako spuštěné, ověří se v Úkolu 11.
  - Screenshoty adminu převzaté z `pedicure-web/docs/screenshots` (vzorová data). Cover je zatím `calendar.png`, nahradí ho screenshot veřejného webu (`home.png`, 1280×960 @2x) spolu s `home-phone.png` a `booking.png`.
- *Přesunuto do Úkolu 7:* kontrola párování při buildu a ověření „smaž EN soubor → build spadne“ – bez stránek case studies není kde `findMissingTranslations` volat.

### Úkol 6: Sekce homepage

**Issue:** #8 · **Milestone:** Obsah a stránky

**Soubory:** `src/components/sections/{Hero,Services,FeaturedProjects,Process,About,Contact}.astro`,
`src/components/cards/{ServiceCard,ProjectCard}.astro`, `src/components/pages/HomePage.astro`, doplnění slovníků.

**Konzumuje:** kolekce a pomocné funkce (Úkol 5), mapu cest (Úkol 3).

- [x] Komponenta pro **kulatou tečku značky** (`src/components/BrandDot.astro`): ne znak `.` z písma (ten je hranatý), ale prvek s kulatým tvarem v barvě akcentu, průměr ~0,23 em, přesně na účaří (`brand/README.md` § 4). Pro čtečky obrazovky musí věta pořád končit tečkou – rozmysli, jak (vizuálně skrytý text vs. `aria-hidden`).
- [x] `Hero`: nadpis jako celá věta zakončená `BrandDot`, podnadpis, CTA „Nezávazná konzultace“ (kotva na kontakt) a vedlejší CTA „Ukázky práce“.
- [x] `Services` + `ServiceCard`: data z kolekce, cena formátovaná podle jazyka (`Intl.NumberFormat`, „od 15 000 Kč“ / „from CZK 15,000“), věta „přesná cena po nezávazné konzultaci“. Pod kartami řádek „Potřebujete něco jiného? Pojďme se pobavit.“ s odkazem na kontakt – text ze slovníku, ne čtvrtý záznam v kolekci (nemá cenu ani `features`, rozbil by schéma). Čtvrtou kartu zamítnuto: překrývala by se s „Aplikací na míru“ a 3 + 1 se hůř skládá do mřížky.
- [x] `FeaturedProjects` + `ProjectCard`: jen `featured`, seřazené; cover přes `<Image>`; odkaz z mapy cest; štítek `type`.
- [x] `Process`: 4–5 kroků ze slovníku (konzultace → návrh → vývoj → spuštění → podpora).
- [x] `About`: krátký text, fotka přes `<Image>`, okolí Plzně.
- [x] `Contact`: zatím jen sekce s nadpisem a e-mailem/telefonem; formulář přijde v Úkolu 8.
- [x] Každá sekce má `id` pro kotvy z hlavičky a nadpis `<h2>`; na stránce je jediný `<h1>` (v Hero).
- [ ] **Ověření:** obě jazykové verze homepage na mobilu (375 px) i desktopu, obě témata; žádný text natvrdo mimo slovník (zkontroluj EN verzi, jestli v ní nezůstala čeština).
- [ ] Commit: `feat: homepage sections`

**Poznámky k provedení** (větev `feat/homepage`):

- *Rozhodnutí:*
  - `formatPrice` (`src/lib/price.ts`) formátuje přes `Intl.NumberFormat` s holým `cs` / `en` a výchozím `currencyDisplay`: angličtina nemá pro korunu symbol, takže vypíše „CZK“, kdežto `"code"` by v češtině ukázal „CZK“ místo „Kč“. V EN zůstávají koruny – fakturuje se v Kč a EN verze cílí na cizince podnikající v ČR.
  - Cena i s předponou „od“ / „from“ je ve `whitespace-nowrap`: nezlomitelné mezery z Intl nepokryjí mezeru za předponou ze šablony.
  - `BrandDot` obaluje poslední slovo nadpisu (slot + `whitespace-nowrap`), aby tečka nezůstala sama na novém řádku; čtečky dostanou `sr-only` tečku. Nadpis se dělí přes `splitLastWord` (`src/lib/text.ts`), takže slovník drží celou větu; nezlomitelná mezera není hranice slova.
  - `Section.astro` sjednocuje `<section id>` (typ `Section` ze `sections.ts`), `<h2>` a `aria-labelledby`. Šířka 125 a váha nadpisů jsou v `@layer base`, velikosti zůstávají v markupu.
  - Tlačítka jako utility `button` / `button-primary` / `button-secondary` v `global.css` (fungují na `<a>` i `<button>` pro úkol 8). Obrys sekundárního je Ash / Ash Deep – Line má na Ink jen ~1,4 : 1.
  - Karta projektu: odkazem je jen nadpis, `::after` ho roztáhne přes kartu. Cover má `alt=""`, název je hned vedle.
  - Obsah je omezený na `max-w-7xl` (1280 px): `pagePaddingX` nahradil `pageContainer` (`mx-auto w-full max-w-7xl px-6`) v hlavičce, mobilním menu, `<main>` i patičce. Okraj patičky zůstává přes celou šířku, kontejner je vnitřní `div`.
  - Fotka v About je `src/assets/about/portrait.jpg` (1600 px, zmenšený originál), texty sekcí jsou pracovní (#15).
- *Otevřené:* odkaz z karty projektu vede na stránku case study, která vznikne až v úkolu 7.

### Úkol 7: Stránky case studies a MDX komponenty

**Issue:** #9 · **Milestone:** Obsah a stránky

**Soubory:** `src/pages/projekty/[slug].astro`, `src/pages/en/projects/[slug].astro`,
`src/components/pages/ProjectPage.astro`, `src/components/mdx/{Gallery,Quote}.astro`.

**Konzumuje:** kolekci `projects` a funkce z Úkolu 5, mapu cest z Úkolu 3.

- [ ] Obě page obálky generují `getStaticPaths` jen z projektů svého jazyka a před tím spustí kontrolu párování (Úkol 5).
- [ ] `ProjectPage`: titulek, typ, cover, tělo MDX (předej MDX komponenty `Gallery` a `Quote`), štítky technologií, odkazy `liveUrl`/`repoUrl` pokud existují, `testimonial` pokud existuje, CTA na kontakt.
- [ ] SEO: titulek a popis z frontmatteru, `og:image` = cover, alternativy přes mapu cest s parametrem `slug`.
- [ ] `Gallery`: mřížka obrázků přes `<Image>` s povinným `alt`. `Quote`: `<figure>` + `<blockquote>` + `<figcaption>`.
- [ ] **Ověření:** `/projekty/nohy-v-cajku/` a `/en/projects/nohy-v-cajku/` se vyrenderují, přepínač jazyka mezi nimi funguje, hreflang ukazuje na protějšek.
- [ ] Commit: `feat: case study pages with MDX components`

**Převzato z review Úkolu 5** (nálezy, které patří sem):

- [ ] **Shoda nelokalizovaných polí:** `cover`, `type`, `tags`, `liveUrl`, `repoUrl`, `featured` a `order` jsou v CS i EN souboru zvlášť a nic nehlídá, že se shodují. Ke kontrole párování přidej kontrolu, že se pár v těchto polích neliší (jinak build selže s výčtem slugů a polí). Alternativa: tato pole brát jen z výchozího jazyka – rozhodni před implementací.
- [ ] **Unikátní `order`:** při shodě rozhoduje pořadí načtení souborů, takže se pořadí může lišit mezi jazyky nebo stroji. Buď kontrola unikátnosti při buildu, nebo druhé řadicí kritérium (slug) v `getProjectsForLocale` + test.
- [ ] **Testy `findMissingTranslations`:** doplnit víc chybějících slugů najednou, chybějící slugy v obou jazycích (`cs` bez `a`, `en` bez `b`) a prázdný vstup – na úplném výčtu stojí chybová hláška buildu.
- [ ] **Cover vs. screenshoty:** cover `calendar.png` je zároveň v sekci Screenshoty, na stránce projektu se zobrazí dvakrát. Až přijde `home.png` (viz Úkol 5), zmizí to samo; jinak cover v `ProjectPage` nezobrazuj nebo ho vyřaď ze sekce Screenshoty.

### Úkol 8: Kontaktní formulář (Astro Action)

**Issue:** #10 · **Milestone:** Kontaktní formulář

**Soubory:** `src/actions/index.ts`, `src/lib/contact/schema.ts`, `src/lib/contact/spam.ts`,
`src/lib/contact/turnstile.ts`, `src/lib/contact/mail.ts`, testy `src/lib/contact/*.test.ts`,
`src/components/sections/Contact.astro`, `astro.config.mjs` (adapter + `env.schema`).

**Produkuje:** Zod schéma formuláře; funkci kontroly spamu (honeypot + časová kontrola); funkci ověření Turnstile tokenu;
funkci sestavení a odeslání e-mailu; action `contact`; mapování chyb na klíče slovníku.

- [ ] Přidej `@astrojs/cloudflare` adapter. Stránky zůstávají předrenderované; homepage s formulářem musí umět zobrazit výsledek akce – nastuduj, jak se v Astru čte výsledek form action (`Astro.getActionResult`) a co to znamená pro prerender té stránky. Docs: https://docs.astro.build/en/guides/actions/#call-actions-from-an-html-form-action – **tohle si spolu projdeme před implementací.**
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

**Issue:** #11 · **Milestone:** Dokončení a spuštění

**Soubory:** `src/components/sections/Hero.astro` (nebo samostatná `HeroMark.astro`), CSS v komponentě.

- [ ] Velká značka „mr.“ v hero jako inline SVG, kde tečka je samostatný element, který jde animovat.
- [ ] *(Připraveno v Úkolu 4: `@keyframes dot-cursor` a třída `animate-dot-cursor` v `global.css` – tečka jako `<rect>` s `--dot`/`--baseline`, převod kruhu viz `dotToRect` v `Logo.astro`. V hero ji stačí spustit po načtení.)*
- [ ] Animace podle `brand/README.md` § 5: 0–280 ms tečka → podtržítko (ease-out), blikání ~530 ms, 3 bliknutí, návrat do tečky. Jednou po načtení. Nastuduj CSS `@keyframes` a animovatelné vlastnosti SVG (u `<rect>` jdou animovat `width`, `height`, `rx` přes CSS v moderních prohlížečích; alternativa je `transform: scale`). **Než začneš, projdeme koncept spolu.**
- [ ] `@media (prefers-reduced-motion: reduce)` → žádná animace, statická tečka.
- [ ] Klidový stav je vždy tečka (i když animace neproběhne nebo se přeruší).
- [ ] **Ověření:** v DevTools zapni emulaci reduced motion → bez animace; v obou tématech odpovídá barva tečky (Signal / Signal Deep).
- [ ] Commit: `feat: hero logo dot-to-cursor animation`

### Úkol 10: GDPR stránka, sitemap, robots, strukturovaná data

**Issue:** #12 · **Milestone:** Dokončení a spuštění

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

**Issue:** #13 · **Milestone:** Dokončení a spuštění

**Soubory:** `wrangler.jsonc` (podle docs adaptéru), případně úprava `astro.config.mjs`.

- [ ] Projdi https://docs.astro.build/en/guides/deploy/cloudflare/ a nastav projekt pro Workers se statickými assety.
- [ ] Propoj GitHub repo přes Workers Builds (https://developers.cloudflare.com/workers/ci-cd/builds/): `main` → produkce, větve → preview.
- [ ] Nastav proměnné prostředí a secrets v Cloudflare (produkce i preview).
- [ ] Zapni Cloudflare Web Analytics.
- [ ] **Ověření na preview URL:** Lighthouse (mobil) ≥ 95 ve všech kategoriích na `/`, `/en/` a jedné case study; formulář odešle e-mail; obě témata; přepínač jazyka na všech stránkách; 404.
- [ ] **Pravdivost obsahu:** case study Nohy v cajku popisuje online rezervace a SMS připomínky jako spuštěné (psáno dopředu v Úkolu 5). Před spuštěním ověř, že na pedikurakralovice.cz opravdu běží, jinak text uprav. Zkontroluj taky ceny služeb (placeholder) a cover (`home.png` místo `calendar.png`).
- [ ] Commit + PR → merge do `main`.

---

## Mimo tento plán (blokováno otevřenými body spec § 10)

- Doména (a s ní `site`, ověření domény v Resend, produkční e-mail) – #14
- Finální texty (sekce, case study, GDPR) – #15
- Ceny služeb – #16
- IČO v patičce – #17
