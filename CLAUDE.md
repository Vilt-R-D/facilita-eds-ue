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
- **Run tests against local `aem up` (TDD inner loop):** `npm run test:local` (requires `aem up` running and a published target page at `/blocks/<feature-slug>` — see Constitution Principle VI)
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
- **TDD inner loop (block features):** Per Constitution Principle VI, block work runs a local red→green loop: write the Playwright spec first, **commit + push the block's `_<name>.json` plus merged `component-*.json` to the feature branch** (skip if no schema change), author the target page at `/blocks/<feature-slug>` via the `aem-content` MCP (`create-aem-page` → `patch-aem-page-content` → `publish-aem-content`), run `aem up`, then iterate with `npm run test:local` against `localhost:3000`.

## Active Technologies
- TypeScript 5.x for test files (`tests/*.ts`). Node.js 18 LTS or newer for the Playwright runner. The existing application code remains vanilla JavaScript — TypeScript is scoped to the `tests/` tree. + `@playwright/test` (latest stable 1.x) as the only new devDependency. Playwright bundles its own TypeScript toolchain; no separate `typescript` / `ts-node` package is required for test authoring. (002-playwright-story-tests)
- N/A. Tests operate over HTTP against AEM EDS preview URLs; no persisted state in the test project. (002-playwright-story-tests)

## Recent Changes
- Constitution v1.3.0 → v1.4.0: Added Principle VII (Attachment Full-Context Pre-Analysis, NON-NEGOTIABLE). Source of truth for attachment refs is the `<!-- cacophony:meta ... -->` JSON block in `spec.md` (not the `**Input**` regex). Every attachment — image or non-image (TXT/CSS/HTML/JSON/MD) — MUST be fetched via the `cacophony-fetch-attachment` skill and loaded with a single whole-file `Read` (no `offset`/`limit`) BEFORE any task that creates or modifies `blocks/<feature-slug>/<feature-slug>.{js,css}`. Hard gate: fetch failure blocks the implementation phase. Post-implementation parity check: authored content at `/blocks/<feature-slug>` is verified against attachment text/links/paths via `aem-content` MCP (`get-aem-page-content`, `get-aem-page-content-definition`, `get-aem-page-metadata`); mismatches are fixed authored-side via `patch-aem-page-content` + re-publish, runs as the final step of Principle VI Phase V. Removed: `visual-refs` extension (`.specify/extensions/visual-refs/`), its `after_tasks` hook entry in `.specify/extensions.yml`, and the `speckit-visual-prepend-task` / `speckit-visual-refs-prepend-task` skills. `tasks.md` no longer carries a synthetic `## Phase 0: Visual Context` block.
- 002-playwright-story-tests: Added TypeScript 5.x for test files (`tests/*.ts`). Node.js 18 LTS or newer for the Playwright runner. The existing application code remains vanilla JavaScript — TypeScript is scoped to the `tests/` tree. + `@playwright/test` (latest stable 1.x) as the only new devDependency. Playwright bundles its own TypeScript toolchain; no separate `typescript` / `ts-node` package is required for test authoring.

<!-- SPECKIT START -->
Active feature plan: [specs/003-speckit-visual-hooks/plan.md](specs/003-speckit-visual-hooks/plan.md). For additional context about technologies to be used, project structure, shell commands, and other important information, read the current plan.
<!-- SPECKIT END -->
