# Portfolio web – návrh (design spec)

**Datum:** 2026-10-16
**Autor:** Michal Roučka
**Stav:** schváleno

---

## 1. Cíl a kontext

### Účel
Web, přes který Michal (student navazujícího magisterského studia, solo freelancer, živnost jako vedlejší činnost, okolí Plzně – malé město, které čtenáři nic neřekne, proto se na webu uvádí „okolí Plzně“) nabízí tvorbu webů
a webových aplikací malým firmám, které web nemají nebo mají zastaralý.

### Cílová skupina
Potenciální klienti – majitelé malých lokálních firem (ne recruiteři). Zajímá je výsledek
(víc zákazníků, méně administrativy, objednávky online), ne technologie.

### Hlavní akce návštěvníka
Ozvat se – kontaktní formulář, případně e-mail/telefon.

### Kritéria úspěchu
- Návštěvník do pár sekund pochopí, co Michal nabízí, pro koho a za kolik (orientačně).
- Web sám slouží jako ukázka kvality: rychlý, dobře vypadá na mobilu, dohledatelný na Googlu.
- Lighthouse ≥ 95 ve všech kategoriích (mobil).
- Plně funkční CZ i EN verze.

### Vedlejší cíl (učení)
- Naučit se stavět vícejazyčné weby (i18n) pořádně, včetně přeložených URL.
- Naučit se Astro jako nástroj pro produktovou řadu „prezentační web“
  (Next.js zůstává pro webové aplikace).

### Rozhodnutí o obsahu a značce
- **Ceny:** u každé služby orientační cena „od X Kč“ + „přesná cena po nezávazné konzultaci“.
- **Reference:** projekt Nohy v cajku (pedicure-web) jako case study, ne samostatná sekce recenzí.
  Citát majitelky salonu je součástí case study, podepsaný názvem salonu.
  Sekce „Reference“ se přidá až při 2–3 zakázkách.
- **Značka:** vystupování pod vlastním jménem + vlastní vizuální identita (monogram/logo, barvy, typografie).
- **Doména:** otevřená. K dispozici `michroucka.dev`; zvažuje se dokoupení čitelnější `.cz` domény.
- **Technické školní projekty** (InodeFS, Oko-Bere, …) na web nepatří.
- Patička bude obsahovat identifikační údaje podnikatele (IČO), jakmile bude živnost založena.

---

## 2. Struktura webu (sitemap)

```
/                         Home (one-pager)
  ├─ Hero                 – co, pro koho, CTA „Nezávazná konzultace"
  ├─ Služby               – 3 karty s cenou „od"
  ├─ Vybrané projekty     – 2–3 karty → case studies
  ├─ O mně                – fotka, studium, okolí Plzně, na čem si zakládám
  ├─ Jak spolupráce probíhá – 4–5 kroků (konzultace → návrh → vývoj → spuštění → podpora)
  └─ Kontakt              – formulář + e-mail/telefon

/projekty/[slug]          Case study
/ochrana-osobnich-udaju   Zásady zpracování osobních údajů (GDPR)
404
```

Mimo rozsah (YAGNI): blog, FAQ, samostatné stránky služeb, stránka pro vývojáře.

---

## 3. Tech stack

| Oblast | Volba |
|---|---|
| Framework | **Astro** (statický výstup + Cloudflare adapter pro Actions) |
| Styling | **Tailwind CSS v4** (Vite plugin), design tokeny přes `@theme` |
| Obsah | Astro **content collections** (MDX pro case studies, data collection pro služby) |
| Formulář | HTML `<form>` + **Astro Actions** |
| E-mail | **Resend** |
| Antispam | **Cloudflare Turnstile** + honeypot |
| Analytika | **Cloudflare Web Analytics** (bez cookies) |
| Hosting | **Cloudflare Workers** se statickými assety, nasazení přes Workers Builds |
| Testy | **Vitest** (unit) + kontroly při buildu |
| Kvalita | TypeScript strict, `astro check`, ESLint, Prettier (`prettier-plugin-astro`) |

Zamítnuté alternativy:
- Next.js + next-intl na Cloudflare přes OpenNext – zbytečně těžké pro obsahový web, vrstva adaptéru navíc.
- Next.js static export – nejhorší podpora i18n a formuláře.

---

## 4. Architektura a i18n

### Renderování
- Všechny stránky jsou **předrenderované při buildu** (statické HTML).
- Cloudflare adapter je nutný pouze pro Astro Action kontaktního formuláře, která běží na Workeru.

### Jazyky a URL
- `defaultLocale: "cs"`, `locales: ["cs", "en"]`, `prefixDefaultLocale: false`.
- **Přeložené segmenty URL:**

| CZ | EN |
|---|---|
| `/` | `/en/` |
| `/projekty/[slug]` | `/en/projects/[slug]` |
| `/ochrana-osobnich-udaju` | `/en/privacy` |

- **Žádný automatický redirect** podle jazyka prohlížeče. Jazyk volí uživatel přepínačem.
- Každá stránka má `hreflang` alternativy a `x-default` → CZ verze.
- Odkazy se generují přes helpery (`getRelativeLocaleUrl` + vlastní mapa přeložených cest),
  nikdy ručně skládanými stringy.

### Mapa přeložených cest
Centrální definice, která pro každou logickou stránku určuje cestu v obou jazycích.
Používá ji přepínač jazyka, `hreflang` i generování odkazů. Pokrytá unit testy.

### Stránky jako tenké obálky
Každá logická stránka má dva page soubory (jeden na jazyk), které pouze určí jazyk
a vykreslí sdílenou komponentu stránky. Žádná duplikace obsahu ani markupu.

---

## 5. Obsahový model

| Obsah | Umístění | Formát |
|---|---|---|
| UI texty, hero, proces spolupráce, o mně, chybové hlášky | slovník na jazyk (`cs.ts`, `en.ts`) | typovaný objekt; EN musí mít stejné klíče jako CZ (vynucuje TypeScript) |
| Služby | data collection | JSON/YAML, **jeden záznam na službu s oběma jazyky** (`title: { cs, en }` apod.) |
| Case studies | content collection | **MDX, složka na jazyk, stejný název souboru** (`projects/cs/nohy-v-cajku.mdx` ↔ `projects/en/nohy-v-cajku.mdx`) |

### Schéma služby
- `title`, `description` – lokalizované (`{ cs, en }`)
- `priceFrom` – kladné celé číslo (Kč)
- `features` – lokalizovaný seznam toho, co služba obsahuje
- `order` – pořadí zobrazení (celé číslo)

### Schéma case study (frontmatter)
- `title`, `summary` (jedna věta pro kartu)
- `cover` – obrázek přes `image()` (optimalizace při buildu)
- `type` – `web` | `web-app` | `app`
- `year` – rok realizace (celé číslo)
- `scope` – co vzniklo: `branding` | `website` | `booking` | `admin` | `local-seo`, popisky ve slovníku
- `tags` – technologie
- `liveUrl?`, `repoUrl?` – jen `http(s)` URL
- `featured: boolean` (výchozí `false`), `order` – celé číslo
- `testimonial?: { quote, author }`

Tělo MDX má pevnou kostru: **problém → řešení → výsledek → (branding) → screenshoty → technologie**.
Screenshoty jsou rozdělené do sekcí podle části projektu (u Nohou v cajku Web, Rezervace, Administrace).
Text je psaný jazykem klienta; technologie jsou sekundární vrstva.
Screenshoty admin rozhraní a rezervace pouze s dummy daty; web může být z produkce.

Stránka: pod coverem je pruh s fakty (rok, co vzniklo, odkazy), štítky technologií jsou v hlavičce.
Od `lg` sedí nadpisy sekcí v levé třetině a text vpravo v `max-w-prose`; obrázky a galerie jdou přes celou šířku.

### Kontrola párování
Při buildu se ověří, že každá case study existuje v obou jazycích a že se pár neliší v nelokalizovaných
polích (`cover`, `type`, `year`, `scope`, `tags`, `liveUrl`, `repoUrl`, `featured`, `order`). Pokud ne, build selže
s výčtem slugů a polí.
Kontrola běží tam, kde se generují stránky case studies (`getStaticPaths`, Úkol 7 plánu);
funkce `assertProjectTranslations` (s `findMissingTranslations` a `findMismatchedFields`) je v `src/lib/projects.ts`.

---

## 6. Komponenty a styling

```
layouts/
  BaseLayout        – <head>, SEO meta, hreflang, Header, Footer
components/
  Header, Footer, LanguageSwitcher
  sections/         – Hero, Services, FeaturedProjects, Process, About, Contact
  cards/            – ServiceCard, ProjectCard
  mdx/              – Gallery, Quote
```

- Komponenty jsou `.astro`. Žádný React ani UI knihovna.
- JavaScript na klientu pouze: Turnstile widget, mobilní menu (malý inline skript nebo `<details>`).
- Přepínač jazyka jsou obyčejné odkazy (0 JS).
- **Vizuální identita** je hotová – viz `brand/README.md` a `brand/brand-board.html`
  (logo „mr.“, paleta Ink/Graphite/Paper/Ash/Signal, písmo Archivo ve dvou šířkách).
  Barvy a fonty budou definované jako tokeny v `@theme`.
- **Témata:** výchozí tmavé; světlé podle `prefers-color-scheme`; ruční přepínač v patičce.
  Každý barevný token má hodnotu pro obě témata (viz manuál značky).
- **Logo podle tématu:** v tmavém tématu soubory `negative`, ve světlém `positive` (opticky korigované, ne přebarvené).
- **Animace loga:** v hero sekci se tečka jednou po načtení promění v blikající podtržítko (kurzor)
  a vrátí se zpět; při `prefers-reduced-motion` bez animace.

---

## 7. Kontaktní formulář

### Pole
- jméno (povinné)
- e-mail (povinný)
- telefon (volitelný)
- zájem o službu – select: prezentační web / web + systém / aplikace na míru / jiné
- zpráva (povinná)
- honeypot (skryté pole)
- Turnstile token

Pod formulářem: informace o zpracování osobních údajů s odkazem na GDPR stránku
(bez checkboxu – právní titul oprávněný zájem; ověřit při psaní textu GDPR).

### Tok
1. Uživatel odešle `<form method="POST" action={actions.contact}>` (funguje i bez klientského JS
   kromě Turnstile).
2. Action `contact` (`accept: 'form'`):
   1. Zod validace vstupu
   2. antispam: honeypot + časová kontrola + ověření Turnstile tokenu na serveru
   3. odeslání e-mailu **Michalovi** přes Resend, `reply-to` = e-mail zákazníka
3. Stránka se vykreslí znovu s potvrzením, nebo s chybami u polí a zachovanými hodnotami.

### Záměrně vynecháno
- databáze (záznamem je e-mail)
- automatická odpověď zákazníkovi (riziko zneužití formuláře k rozesílání spamu)

### Chybové stavy
| Situace | Odezva |
|---|---|
| neplatný vstup | chyba u konkrétního pole, přeložená přes slovník (mapování Zod chyb na klíče) |
| detekovaný spam | navenek úspěch (bez zpětné vazby pro bota), e-mail se neodešle |
| selhání Resend / Turnstile API | obecná chyba + fallback „napište mi přímo na e-mail“ |

### Konfigurace
- `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` – tajné, v proměnných prostředí Cloudflare.
- Turnstile site key – veřejný.
- Všechny proměnné definované typově přes `astro:env` (chybějící proměnná = chyba).
- Resend vyžaduje ověřenou doménu (DNS) – **doména musí být vyřešena před spuštěním formuláře**.
  Do té doby testování s testovací adresou Resend.

---

## 8. SEO, výkon, analytika, přístupnost

### SEO
- Na každé stránce `<title>`, `meta description`, `canonical`, `hreflang` + `x-default`.
- Open Graph: výchozí obrázek; case studies používají svůj `cover`.
- `@astrojs/sitemap` s i18n konfigurací, `robots.txt`.
- JSON-LD `ProfessionalService` (jméno, oblast působení Plzeň a okolí, kontakt).
- `site` v `astro.config` závisí na doméně – do té doby placeholder.
- Mimo kód: založit Google Business Profile.

### Výkon
- Cíl Lighthouse ≥ 95 (mobil) ve všech kategoriích.
- Obrázky výhradně přes `astro:assets` (`<Image>`, `<Picture>`).
- Self-hosted fonty, max. 2 řezy, `font-display: swap`. Žádné externí font CDN.

### Analytika
- Cloudflare Web Analytics (bez cookies → není potřeba cookie lišta).

### Přístupnost
- `lang` na `<html>` podle jazyka
- sémantické HTML, skip link
- formulář: `<label>` u každého pole, chyby přes `aria-describedby`, výsledek přes `aria-live`
- viditelné focus stavy, kontrast WCAG AA

---

## 9. Testování, nástroje, nasazení

### Testy
| Co | Jak |
|---|---|
| mapa přeložených cest / přepínač jazyka | Vitest (unit) |
| Zod schéma formuláře, honeypot, časová kontrola | Vitest (unit) |
| párování CZ ↔ EN case studies | kontrola při buildu |
| úplnost slovníku | TypeScript |

E2E testy (Playwright) zatím ne – ruční průchod preview URL před mergem.

### Nástroje
- TypeScript strict, `astro check`, ESLint, Prettier (`prettier-plugin-astro`).
- Git + GitHub repozitář (projekt zatím není git repozitář).

### Nasazení
- Cloudflare Workers se statickými assety, propojení s GitHub přes **Workers Builds**:
  push do `main` → produkce, větve/PR → preview URL.
- GitHub Actions na každém PR: `astro check`, lint, testy, build.

---

## 10. Otevřené body

- **Doména** – výběr a nákup; blokuje ověření domény v Resend a hodnotu `site`.
- **Texty** – obsah sekcí, case study Nohy v čajku (CZ + EN), citát majitelky salonu, text GDPR.
- **Ceny** – konkrétní částky „od“ pro jednotlivé služby.
- **IČO v patičce** – po založení živnosti.
