# Michal Roučka – manuál značky

Vizuální přehled: [`brand-board.html`](brand-board.html)

**Poziční věta:** Pro malé firmy z Plzně a okolí je Michal Roučka vývojář, který jim postaví web i aplikaci
na míru – srozumitelně, osobně a se spolehlivostí, jakou čekají od profesionála.

**Přívlastky:** spolehlivý · moderní · přátelský · profesionální, ale osobní

## 1. Logo

**Myšlenka:** ligatura „mr“, kde m a r sdílí jednu nohu (jeden člověk, celý projekt), a tečka – „domluveno,
hotovo“. Tečka je vepsaná pod rameno r se stejnou mezerou ke kmeni.

| Soubor | Použití |
|---|---|
| `logo/mr-symbol-negative.svg` | symbol na tmavém pozadí (výchozí web) |
| `logo/mr-symbol-positive.svg` | symbol na světlém pozadí, tisk |
| `logo/mr-horizontal-*.svg` | hlavička webu, e-mailový podpis |
| `logo/mr-stacked-*.svg` | čtvercové formáty, vizitka, sociální sítě |
| `logo/*-mono.svg` | jednobarevné verze (tečka bez akcentu) |
| `logo/mr-favicon.svg`, `web/*` | favicon, ikony, `site.webmanifest`, `head-snippet.html` |
| `motion/frame-*.svg` | storyboard animace tečka → kurzor |

**Negativ ≠ přebarvený pozitiv.** Světlé tvary na tmavém působí tučněji (iradiace), proto má negativ
tenčí řez písmen (Archivo wght 770 místo 800). Tečka má v obou verzích 44 % x-výšky – barevná tečka
opticky vystupuje, takže větší by na pozitivu působila těžce. Na tmavém pozadí vždy `negative`,
na světlém vždy `positive`.

- **Ochranná zóna:** 1 × průměr tečky na všech stranách.
- **Minimální velikost:** symbol 16 px (použij favicon soubor), horizontální lockup 120 px šířky.

## 2. Barvy

| Název | HEX | RGB | Role | Kontrast |
|---|---|---|---|---|
| Ink | `#0E0F11` | 14 15 17 | pozadí tmavého tématu, text světlého | 17,3 : 1 s Paper |
| Graphite | `#1B1D21` | 27 29 33 | plochy a karty na tmavém | Paper na ní 15,2 : 1 |
| Paper | `#F5F3EE` | 245 243 238 | pozadí světlého tématu, text tmavého | 17,3 : 1 s Ink |
| Ash | `#A09F99` | 160 159 153 | vedlejší text na tmavém | 7,2 : 1 na Ink |
| Ash Deep | `#64635E` | 100 99 94 | vedlejší text na světlém | 5,4 : 1 na Paper |
| Signal | `#FF6A3D` | 255 106 61 | akcent na tmavém: tečka, CTA, odkazy | 6,7 : 1 na Ink |
| Signal Deep | `#C2410C` | 194 65 12 | akcent na světlém | 4,7 : 1 na Paper |
| Chalk | `#FCFBF8` | 252 251 248 | plochy a karty ve světlém tématu | Ink 18,5 : 1 · Ash Deep 5,8 : 1 · Signal Deep 5,0 : 1 |
| Line | `#2A2D32` | 42 45 50 | oddělovače a okraje karet v tmavém | dekorativní |
| Line Light | `#DDD9D0` | 221 217 208 | oddělovače a okraje karet ve světlém | dekorativní |

**Plochy:** v obou tématech platí totéž pravidlo – karta je o krok blíž ke světlu než pozadí (Ink → Graphite, Paper → Chalk) a má okraj v barvě Line / Line Light.
**Okraje formulářových polí** musí mít kontrast ≥ 3 : 1 (WCAG 1.4.11) – použij Ash (tmavé) / Ash Deep (světlé), ne Line.

Tlačítko CTA: na tmavém pozadí Signal, text Ink (6,7 : 1); na světlém pozadí Signal Deep, text Paper (4,7 : 1) – Ink na Signal Deep má jen 3,7 : 1, nepoužívat.
Signal na Paper (2,6 : 1) **nepoužívat** – na světlém vždy Signal Deep.
Pro tisk nech CMYK/Pantone převést a nátiskovat v tiskárně.

## 3. Typografie

- **Nadpisy:** Archivo, šířka 125 (Expanded), váha 700–800
- **Text:** Archivo, šířka 100, váha 400–600
- Jeden variabilní soubor (osy `wdth`, `wght`), licence SIL Open Font License – volné i pro logo a komerční použití.
- Škála 1,25: 16 · 20 · 25 · 31 · 39 · 49 · 61 px. Fallback `system-ui, sans-serif`.
- Logo je převedené do křivek – nikdy ho nepsat písmem.

## 4. Prvek značky: tečka

Kulatá tečka v barvě Signal (Signal Deep ve světlém tématu) na konci hlavních nadpisů („Weby a aplikace pro malé firmy.“).
Ne znak `.` z písma (ten je v Archivu hranatý), ale samostatný kulatý prvek o průměru ~0,23 em sedící na účaří. Jen u nadpisů,
které jsou celou větou, a nejvýš jednou na obrazovku.

## 5. Pohyb: tečka → kurzor

1. 0–280 ms: tečka se roztáhne a zploští (ease-out)
2. podtržítko na účaří (šířka 46 % x-výšky) bliká v rytmu ~530 ms
3. po 3 bliknutích se vrátí do tečky

- Jen v hero sekci, jednou po načtení (volitelně hover na logo v hlavičce).
- `prefers-reduced-motion: reduce` → bez animace, statická tečka.
- Klidový stav loga je vždy „mr.“, nikdy „mr_“.

## 6. Téma webu

Výchozí tmavé, světlé podle `prefers-color-scheme`, ruční přepínač v patičce.

## 7. Nedělat

Nedeformovat a neotáčet · nebarvit písmena akcentem (akcent patří jen tečce) · nepřidávat stíny, obrysy,
přechody · nepřestavovat lockup · nepoužívat pozitiv na tmavém pozadí ani naopak.

## 8. Poznámky

- Ochrannou známku jsem neověřoval. Před větší investicí (tisk, polep) projdi rešerši (ÚPV, EUIPO, reverse image search).
- Zdrojová geometrie: ligatura je z písma Archivo (OFL), r sedí přesně na poslední nohu m, tečka je konstrukčně odvozená z vnitřního tvaru r.
