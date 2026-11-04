# andrea-giardini

Sito personale/portfolio costruito con **Astro**.

## Stack e struttura

- Framework: Astro (`.astro/`, `dist/` come output di build)
- Sorgenti in `src/`, asset statici in `public/`
- Deploy: configurazione `nginx/` e Docker (`.dockerignore` presente)
- Tooling: Prettier (`.prettierrc.cjs`), EditorConfig, npm

## Note per Claude

- Le regole globali (workflow, memoria, task, report) vivono in `~/.claude/CLAUDE.md` e non vanno ripetute qui.
- Convenzioni specifiche del repo: `.claude/rules/workspace-conventions.md`.
- `node_modules/`, `dist/` e `.astro/` sono artefatti: non modificarli a mano.
