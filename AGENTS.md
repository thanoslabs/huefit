# HueFit agent guidance

## Purpose

HueFit is a privacy-first, static browser application for personal colour recommendations. The application is currently a foundation shell; do not describe planned analysis features as implemented.

## Stack

- React, TypeScript, Vite and Tailwind CSS.
- Vitest, ESLint and Prettier.
- No application backend, accounts, database or image persistence.
- Documentation is Markdown in `docs/`, published through nebula-md.

## Workflow

- Use versions pinned in `.tool-versions` (mise/asdf).
- Work on a feature branch and submit a PR; never push directly to `main`.
- Before pushing, run `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
- Keep business logic in pure TypeScript modules separate from React.
- Keep all photo processing in browser memory; no third-party photo transfer, telemetry containing photos, or persistent image storage.
- Treat 12-season classification as subjective guidance. Preserve original images, show uncertainty, and support manual corrections.
- Update docs and tests when behavior changes.
- Preserve existing GitHub Actions release automation, CODEOWNERS and nebula-md docs.
- Releases use bare `X.Y.Z` SemVer tags; PR labels major/minor/patch control bumps.
