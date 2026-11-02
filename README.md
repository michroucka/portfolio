# Portfolio – Michal Roučka

Dvojjazyčný (CZ/EN) prezentační web, přes který Michal Roučka nabízí tvorbu webů a webových aplikací
malým firmám z Plzně a okolí. Astro se statickým předrenderováním, Tailwind CSS v4, content collections.

## Prostředí

Node.js ≥ 22.22 (CI běží na Node 24), npm.

```
npm ci
npm run dev
```

| příkaz                | co dělá                                                   |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | vývojový server                                           |
| `npm run check`       | kontrola typů (`astro check`)                             |
| `npm run lint`        | ESLint                                                    |
| `npm run format`      | Prettier – naformátuje soubory (`format:check` jen ověří) |
| `npm test`            | unit testy (Vitest), `npm run test:watch` ve watch režimu |
| `npm run build`       | statický build do `dist/`                                 |
| `npm run preview`     | náhled buildu                                             |
| `npm run verify:dist` | ověří inline skript tématu v `dist/` (po buildu)          |

CI (`.github/workflows/ci.yml`) na každém PR spouští `check`, `lint`, `format:check`, `test`, `build`
a `verify:dist`.

## Dokumentace

- [Návrh webu](docs/superpowers/specs/2026-10-16-portfolio-design.md) – cíl, struktura, stack, obsahový model
- [Implementační plán](docs/superpowers/plans/2026-10-16-portfolio.md) – úkoly 1–11
- [Issues](docs/superpowers/issues.md) – texty úloh na GitHubu
- [Manuál značky](brand/README.md) – logo, barvy, typografie, animace
- [CLAUDE.md](CLAUDE.md) – konvence projektu

## Nasazení

Vercel přes Git integraci: push do `main` → produkce na https://www.michalroucka.cz, větve a PR → preview URL.
Kontaktní formulář běží jako Vercel Function (region `fra1`).
