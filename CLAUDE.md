# Portfolio – project conventions

## Language

- **English** for everything that stays in the repository history or code:
  commit messages, branch names, PR titles and descriptions, code comments.
- This applies even when the conversation, the plan (`docs/`) or older PRs are in Czech.
- User-facing texts live in the dictionaries (`src/i18n/cs.ts`, `src/i18n/en.ts`) – they are content, not comments.

## Comments

- Code should explain itself: descriptive names, small functions, types that carry the intent.
- Write a comment only when the code cannot say it – the _why_: a non-obvious constraint,
  a browser quirk, a link to a spec or the brand guidelines, a deliberate trade-off.
- No comments that restate what the code does, no commented-out code, no leftover `TODO`s
  without a concrete reason.
