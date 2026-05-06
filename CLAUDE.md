# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Facilita EDS is a Brazilian fintech site built on **Adobe Experience Manager Edge Delivery Services (AEM EDS)** with Universal Editor (XWalk) integration. It follows the AEM Boilerplate pattern: content authored in AEM is delivered via a block-based component system.

## Commands

- **Local dev:** `aem up` (requires `@adobe/aem-cli` installed globally — serves at http://localhost:3000)
- **Lint all:** `npm run lint`
- **Lint JS only:** `npm run lint:js`
- **Lint CSS only:** `npm run lint:css`
- **Auto-fix lint:** `npm run lint:fix`
- **Merge block JSON configs:** `npm run build:json` (also runs automatically on pre-commit when `_*.json` files are staged)
- **Run tests (develop preview, default):** `npm test`
- **Run tests against develop regression gate (explicit):** `npm run test:develop`
- **Run tests against a feature-branch preview (pre-merge gate):** `BASE_URL=https://<branch>--facilita-eds-ue--vilt-r-d.aem.page npm test`
- **Run a single feature's tests:** `npm test -- tests/<full-spec-dir-name>.ts`
- **One-time browser install (per machine):** `npx playwright install chromium` (required only when a test uses a `page` fixture; this feature's own meta-tests do not)

## Architecture

### Three-Phase Loading (E-L-D)

`scripts/scripts.js` orchestrates the page lifecycle:

1. **Eager (`loadEager`):** Decorates the DOM, loads the first section and critical CSS — optimized for LCP.
2. **Lazy (`loadLazy`):** Loads remaining sections and `lazy-styles.css`.
3. **Delayed (`loadDelayed`):** After 3s, loads `delayed.js` (GTM, SVG icon sprites) to avoid impacting UX.

### Block System

Each block lives in `blocks/{name}/` with up to three files:

- `{name}.js` — exports `default async function decorate(block)` which receives the block's DOM element.
- `{name}.css` — scoped styles for the block.
- `_{name}.json` — Universal Editor configuration (component definitions, models, filters).

The `_*.json` files are never consumed directly at runtime. A Husky pre-commit hook (`npm run build:json`) merges all `_*.json` partials from `blocks/` and `models/` into the three root-level files: `component-definition.json`, `component-models.json`, `component-filters.json`. **Do not edit these root JSON files manually.**

### Key Scripts

| File | Role |
|---|---|
| `scripts/aem.js` | Adobe framework utilities: `sampleRUM`, `loadCSS`, `loadSection`, `decorateBlocks`, `createOptimizedPicture`, `getMetadata`, etc. |
| `scripts/scripts.js` | Page lifecycle (E-L-D phases), `decorateMain`, exports `moveInstrumentation` for Universal Editor support |
| `scripts/main.js` | Legacy behaviors (Swiper carousel, modal video, cookie UI) — loaded synchronously via import in `scripts.js` |
| `scripts/delayed.js` | Phase D: GTM init, SVG icon sprite loading |
| `scripts/gtm.js` | Google Tag Manager setup |
| `scripts/vilt.js` | VILT-specific utility (skeleton loader) |

### Environments

URL pattern: `https://<branch>--facilita-eds-ue--vilt-r-d.aem.<page|live>`

- **Preview:** `https://main--facilita-eds-ue--vilt-r-d.aem.page`
- **Live:** `https://main--facilita-eds-ue--vilt-r-d.aem.live`

## Conventions

- **Language:** Code in English, comments in Portuguese.
- **Imports:** Always include `.js` extension in import paths (enforced by ESLint).
- **Line breaks:** Unix-style (`\n`) enforced by ESLint.
- **Indentation:** 2 spaces for JS/JSON, 4 spaces for CSS.
- **Dependencies:** Avoid adding new npm packages. If one is added, document the justification in `.docs/Pacotes Nodes.md`.
- **CSS scoping:** Style only within your own block — do not reach outside block boundaries. Reference existing CSS variables in `styles/styles.css` before defining new ones.
- **Branching:** Work on feature branches, PR into `main`. The `develop` branch merges into `main`.
- **Testing:** Every new feature MUST contribute one Playwright test file at `tests/<full-spec-dir-name>.ts` containing one comprehensive test per user story in its paired `spec.md`. Tests target `https://<branch>--facilita-eds-ue--vilt-r-d.aem.page/blocks/<feature-slug>` — feature-branch preview pre-merge (acceptance gate) and `develop` preview post-merge (regression gate). Enforcement is manual via the PR reviewer checklist. Full policy: `specs/002-playwright-story-tests/spec.md`. Reviewer checklist: `specs/002-playwright-story-tests/contracts/reviewer-checklist.md`. Quickstart: `specs/002-playwright-story-tests/quickstart.md`.

## Active Technologies
- TypeScript 5.x for test files (`tests/*.ts`). Node.js 18 LTS or newer for the Playwright runner. The existing application code remains vanilla JavaScript — TypeScript is scoped to the `tests/` tree. + `@playwright/test` (latest stable 1.x) as the only new devDependency. Playwright bundles its own TypeScript toolchain; no separate `typescript` / `ts-node` package is required for test authoring. (002-playwright-story-tests)
- N/A. Tests operate over HTTP against AEM EDS preview URLs; no persisted state in the test project. (002-playwright-story-tests)
- Speckit `visual-refs` extension under `.specify/extensions/visual-refs/` declares the `after_tasks` hook `speckit.visual.prepend-task`. The hook is LLM-driven — implemented as the Claude skill `.claude/skills/speckit-visual-prepend-task/SKILL.md` (no shell scripts, no new npm dependencies). It injects a `## Phase 0: Visual Context` section into `tasks.md` from PNG/SVG refs found in `spec.md`'s `**Input**` line so `/speckit-implement` walks the references before any feature task. (003-speckit-visual-hooks)

## Recent Changes
- 003-speckit-visual-hooks: Added the mandatory speckit hook `after_tasks` (`speckit.visual.prepend-task`) under `.specify/extensions/visual-refs/`. The hook is fully LLM-driven via the Claude skill at `.claude/skills/speckit-visual-prepend-task/SKILL.md`. It scans the `**Input**` line of `spec.md` for PNG/SVG references and injects a `## Phase 0: Visual Context` section before `## Phase 1:` of `tasks.md` (renumbering existing T-IDs to free `T001..TK`) so `/speckit-implement` loads each image into context before any feature task. Fail-soft: `/speckit-tasks` reports SUCCESS and any failure surfaces as a stderr warning.
- 002-playwright-story-tests: Added TypeScript 5.x for test files (`tests/*.ts`). Node.js 18 LTS or newer for the Playwright runner. The existing application code remains vanilla JavaScript — TypeScript is scoped to the `tests/` tree. + `@playwright/test` (latest stable 1.x) as the only new devDependency. Playwright bundles its own TypeScript toolchain; no separate `typescript` / `ts-node` package is required for test authoring.

<!-- SPECKIT START -->
Active feature plan: [specs/003-speckit-visual-hooks/plan.md](specs/003-speckit-visual-hooks/plan.md). For additional context about technologies to be used, project structure, shell commands, and other important information, read the current plan.
<!-- SPECKIT END -->
