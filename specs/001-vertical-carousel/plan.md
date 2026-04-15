# Implementation Plan: Vertical Carousel

**Branch**: `001-vertical-carousel` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-vertical-carousel/spec.md`

## Summary

Create a `vertical-carousel` AEM EDS block that displays authored slides in a full-viewport-height vertical carousel using the existing Swiper.js library. Each slide occupies 100vh, transitions use vertical translate animation, and navigation is provided via prev/next controls, pagination dots, touch/swipe gestures, and keyboard arrows. The block integrates with Universal Editor following the existing container + item pattern.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES6+), CSS3
**Primary Dependencies**: Swiper.js (already bundled at `scripts/swiper-bundle.js`), AEM EDS framework (`scripts/aem.js`)
**Storage**: N/A (content delivered from AEM author)
**Testing**: No automated test suite. Manual testing via `aem up` (localhost:3000) and preview environments.
**Target Platform**: Web — all modern browsers, responsive 320px–1920px+
**Project Type**: AEM EDS block component (web)
**Performance Goals**: No perceptible loading delay vs pages without the carousel (SC-005)
**Constraints**: Must reuse existing Swiper.js (no new dependencies), respect E-L-D loading phases, 100vh slides, no auto-play, no looping
**Scale/Scope**: Single block component with 2-tier hierarchy (container + item slides)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Block Self-Containment | ✅ PASS | Block lives in `blocks/vertical-carousel/` with 3 files. `decorate(block)` only modifies its own DOM. Slides are items (not nested blocks). |
| II | Zero Dependencies | ✅ PASS | Reuses existing Swiper.js already loaded by `scripts/main.js`. No new npm packages. |
| III | Performance-First Loading (E-L-D) | ✅ PASS | Block JS/CSS loaded by standard `loadBlock()` in the appropriate phase. Swiper already lazy-loaded by `main.js`. No early-phase resource loading. |
| IV | CSS Scoping | ✅ PASS | All styles scoped to `.vertical-carousel` selector. Will reuse existing CSS variables from `styles/styles.css`. No `!important`. |
| V | Universal Editor Compliance | ✅ PASS | `_vertical-carousel.json` provides definitions, models, filters. Follows container + item pattern (like `carousel` → `carousel-card`). `resourceType` set correctly. Section filter updated. |

**Gate result: PASS** — No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-vertical-carousel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Universal Editor JSON contract)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
blocks/vertical-carousel/
├── vertical-carousel.js     # Block decoration logic + Swiper init
├── vertical-carousel.css    # Scoped styles (100vh slides, nav, pagination)
└── _vertical-carousel.json  # UE definitions, models, filters

models/_section.json             # Updated: add "vertical-carousel" to section filter
scripts/main.js                  # Updated: add vertical Swiper init (or block self-initializes)
```

**Structure Decision**: Standard AEM EDS block structure — single `blocks/vertical-carousel/` directory with JS, CSS, and JSON partial. The block follows the same pattern as the existing `carousel` block with a container + item hierarchy. Swiper initialization is handled within the block's `decorate()` function using a DOM element reference to avoid conflicts with the existing horizontal carousel config in `main.js`.

## Complexity Tracking

> No violations to justify — all constitution principles are satisfied.
