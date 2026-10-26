# Portfolio – project conventions

Bilingual (CS/EN) presentation website through which Michal Roučka offers websites and web apps
to small businesses. Astro with static prerendering, Tailwind CSS v4, content collections;
the only server part will be the contact form action running as a Vercel Function.

- Design spec (what and why): `docs/superpowers/specs/2026-10-16-portfolio-design.md`
- Implementation plan (tasks 1–11, steps and tests): `docs/superpowers/plans/2026-10-16-portfolio.md`
- Issue texts: `docs/superpowers/issues.md` – the source of truth when it differs from GitHub
- Brand guidelines (colors, type, logo, motion): `brand/README.md`, `brand/brand-board.html`

## Repository layout

- `src/pages/` – thin page wrappers per locale (`en/` for English), they only render a page component
- `src/components/` – `.astro` components; `pages/` holds the shared page components
- `src/i18n/` – dictionaries (`cs.ts` is the source, `en.ts` must match its shape) and the translated route map
- `src/lib/` – plain TypeScript helpers with Vitest tests next to them
- `src/content/`, `src/content.config.ts` – content collections (services, case studies)
- `src/styles/global.css` – design tokens (`@theme`) and shared utilities
- `public/` – fonts, favicons, web manifest
- `brand/` – brand assets and their sources; the web uses copies in `public/` and inline SVG
- `scripts/` – build output checks
- `docs/superpowers/` – spec, plan, issue texts

## Commands

Node ≥ 22.22 (CI uses Node 24).

```
npm run dev            # dev server
npm run check          # astro check (types)
npm run lint           # ESLint
npm run format:check   # Prettier (npm run format to fix)
npm test               # Vitest
npm run build          # static build into dist/
npm run verify:dist    # checks the inline theme script in dist/ (run after build)
```

CI (`.github/workflows/ci.yml`) runs all of these except `dev` on every PR and push to `main`.
Run them before declaring a task done.

## Working mode

Mentor mode: Michal implements the tasks. Claude explains, reviews and, when asked how to proceed,
puts skeletons into the files – signatures and test cases with `TODO`s, not the implementation.
Write the implementation only when Michal explicitly asks for it.

## Git

- Branches `feat/…`, `fix/…`, `chore/…`, `docs/…`; Conventional Commits; PR into `main`.
- Claude may commit on a feature branch; push and PRs only when asked. Never commit to `main` directly.

## Working on an issue

Tasks are GitHub issues in `michroucka/portfolio` (milestones = phases). They already exist – do not create them again.

When given „#N“:

1. Read the issue (`gh issue view N` or section #N in `docs/superpowers/issues.md`) and the matching task in the plan.
2. Check its dependencies (“Závisí na”); if they are not done, say so before starting.
3. Summarize the plan (files, functions) and wait for confirmation before writing code.
4. After implementation, go through the “Hotovo, když” checklist and say what is and is not met.
5. If the implementation departs from the spec or the plan, update them too (the plan has notes per task, see task 4).

## Communication

Reply in Czech.

## Language

- **English** for everything that stays in the repository history or code:
  commit messages, branch names, PR titles and descriptions, code comments.
- **Czech** for everything that will not stay and is only to guide the user, i.e., the TODO comments that show the user what to do next.
- This applies even when the conversation, the plan (`docs/`) or older PRs are in Czech.
- User-facing texts live in the dictionaries (`src/i18n/cs.ts`, `src/i18n/en.ts`) – they are content, not comments.

## Comments

- Code should explain itself: descriptive names, small functions, types that carry the intent.
- Write a comment only when the code cannot say it – the _why_: a non-obvious constraint,
  a browser quirk, a link to a spec or the brand guidelines, a deliberate trade-off.
- No comments that restate what the code does, no commented-out code, no leftover `TODO`s
  without a concrete reason.
