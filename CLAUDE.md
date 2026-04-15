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

There is no test suite in this project.

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

## Active Technologies
- Vanilla JavaScript (ES6+), CSS3 + Swiper.js (already bundled at `scripts/swiper-bundle.js`), AEM EDS framework (`scripts/aem.js`) (001-vertical-carousel)
- N/A (content delivered from AEM author) (001-vertical-carousel)

## Recent Changes
- 001-vertical-carousel: Added Vanilla JavaScript (ES6+), CSS3 + Swiper.js (already bundled at `scripts/swiper-bundle.js`), AEM EDS framework (`scripts/aem.js`)
