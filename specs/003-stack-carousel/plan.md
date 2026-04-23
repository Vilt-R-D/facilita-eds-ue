# Implementation Plan: Stack Carousel Block

**Branch**: `003-stack-carousel` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-stack-carousel/spec.md`

## Summary

Deliver a new AEM EDS block named `stack-carousel` that renders a pile of cards with a two-phase advance animation (the front card slides right in front of the stack, then returns to the back) and a horizontal pagination dot-row (one dot per authored item) mirroring the existing `carousel` block. The block hosts a companion copy column (heading, body, CTA) to the left of the stack on desktop and above the stack on mobile. Items are authored as block-child components (`stack-carousel-item`, following the existing `carousel` / `card-grid` pattern), 1–6 items per block, at most 3 layers visible at a time (1 front + 2 back). The block runs in the Lazy phase, introduces no new npm dependencies, respects `prefers-reduced-motion`, is fully keyboard-operable, and ships with one Playwright test per user story at `tests/003-stack-carousel.ts`.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES modules with explicit `.js` imports) for `blocks/stack-carousel/stack-carousel.js`; TypeScript 5.x (Playwright-bundled) for `tests/003-stack-carousel.ts`.
**Primary Dependencies**: None added. Uses existing `@adobe/aem-cli` (dev), `@playwright/test` (tests), and framework utilities from `scripts/aem.js` / `scripts/scripts.js` (e.g., `moveInstrumentation`).
**Storage**: N/A. Block state (current front index, animation in-flight flag) lives in DOM attributes and closure state inside the `decorate()` function; no persistence.
**Testing**: `@playwright/test` at `tests/003-stack-carousel.ts` — one `test(...)` per User Story (3 stories → 3 tests), each asserting every Acceptance Scenario listed under its story. Targets the feature-branch preview pre-merge (`https://003-stack-carousel--facilita-eds-ue--vilt-r-d.aem.page/blocks/stack-carousel`) and the `develop` preview post-merge.
**Target Platform**: Modern evergreen browsers served by AEM EDS preview/live (`*.aem.page` / `*.aem.live`). Breakpoints: 375 px mobile, ≥1280 px desktop per spec.
**Project Type**: Single-project AEM Edge Delivery Services site (boilerplate pattern).
**Performance Goals**: E-L-D compliant — block decorates in the Lazy phase; no assets loaded eagerly. Advance animation completes in <600 ms and maintains ≥30 fps on mid-range hardware (SC-003). LCP for the host page MUST NOT regress vs. the current preview.
**Constraints**: Constitution I (block self-containment, no nesting outside `blocks/stack-carousel/`, `decorate()` may not mutate DOM outside its block); II (no new npm packages); III (Lazy-phase work only, no heavy network/JS eager); IV (CSS scoped under `.stack-carousel.block`, 4-space indent, reuse `styles/styles.css` variables first); V (valid `_stack-carousel.json` with `definitions`, `models`, `filters`; `models/_section.json` filter updated to register `stack-carousel`).
**Scale/Scope**: 1–6 authored items per block instance (FR-015); at most 3 visible layers (FR-014). One block, one item child type, one new Playwright spec file (3 tests), one `models/_section.json` filter entry appended.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Block Self-Containment | Block lives under `blocks/stack-carousel/{stack-carousel.js,stack-carousel.css,_stack-carousel.json}`. No other blocks nested inside it. Items are expressed via the `core/franklin/components/block/v1/block/item` resource type with a `stack-carousel-item` filter entry — the same pattern already used by `carousel` and `card-grid`. `decorate()` only mutates its own block element (plus read-only access to `window.hlx.codeBasePath` for sprite path, as other blocks do). | ✅ Pass |
| II. Zero Dependencies | No new npm packages. Animation via native CSS transitions + `requestAnimationFrame`; pagination via plain DOM buttons; no motion libraries. `.docs/Pacotes Nodes.md` requires no new entry. | ✅ Pass |
| III. Performance-First Loading (E-L-D) | Block is below-the-fold in any realistic placement and is decorated during Lazy. CSS is loaded via the standard block loader (`loadBlock` pulls `stack-carousel.css`). No work in `loadEager`. No additional fonts, scripts, or network calls. Icons reuse the existing SVG sprite loaded by `scripts/delayed.js`. | ✅ Pass |
| IV. CSS Scoping | All selectors live under `.stack-carousel.block`. 4-space indent. Before adding new custom properties the implementation MUST check `styles/styles.css` (colors, radii, spacing). No `!important` except to override legacy global rules if truly unavoidable (documented in-file if used). | ✅ Pass |
| V. Universal Editor Compliance | `_stack-carousel.json` provides `definitions` (block + block/item), `models` (container + item), `filters` (stack-carousel → [stack-carousel-item]). Root `component-*.json` files are regenerated by `npm run build:json` — never edited by hand. `models/_section.json` filter array gets `"stack-carousel"` appended so authors can drop the block into any section. Block `resourceType` is `core/franklin/components/block/v1/block`; item is `.../block/item`. | ✅ Pass |

**Result**: All gates pass. No entries required in Complexity Tracking.

**Post-Design Re-evaluation (after Phase 1)**: The Phase 0 decisions (D1–D10 in `research.md`) and the Phase 1 contracts (`contracts/ue-schema.md`, `contracts/dom-contract.md`, `data-model.md`) introduce no new dependencies, no eager-phase work, no cross-block DOM access, and no hand-edits to generated root JSON. The only file touched outside `blocks/stack-carousel/` and `tests/` is `models/_section.json`, and the edit is a single filter-list append — the canonical mechanism for registering a new block (Principle V). All five gates remain satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/003-stack-carousel/
├── plan.md              # This file
├── research.md          # Phase 0 output — design decisions for animation, DOM strategy, UE fields
├── data-model.md        # Phase 1 output — block/item models + authoring constraints
├── quickstart.md        # Phase 1 output — author + developer + reviewer quickstart
├── contracts/
│   ├── ue-schema.md     # UE authoring contract (definitions/models/filters shape)
│   └── dom-contract.md  # Decorated DOM contract (classes, data-attrs, ARIA, keyboard)
├── checklists/
│   └── requirements.md  # (pre-existing — spec quality checklist)
└── spec.md              # Feature spec (input)
# tasks.md is produced by /speckit.tasks, not here.
```

### Source Code (repository root)

```text
blocks/
└── stack-carousel/
    ├── stack-carousel.js       # decorate(block) — reads authored DOM, builds stack markup,
    │                            # wires click/keyboard/pagination, handles prefers-reduced-motion
    ├── stack-carousel.css      # Scoped styles (.stack-carousel.block { ... }); mobile + desktop
    └── _stack-carousel.json    # UE partial (definitions, models, filters) — merged by build:json

models/
└── _section.json               # EDITED — append "stack-carousel" to the section filter's components

tests/
└── 003-stack-carousel.ts       # Playwright — 3 tests (US1, US2, US3), one per user story

# Regenerated automatically by the pre-commit hook (never edited by hand):
component-definition.json
component-models.json
component-filters.json
```

**Structure Decision**: Use the standard single-project AEM EDS boilerplate layout already in place. The new feature contributes exactly one new block directory (`blocks/stack-carousel/`), one edited file (`models/_section.json` — filter registration only), and one new Playwright spec (`tests/003-stack-carousel.ts`). No new top-level directories, no new build steps, no new tooling. This matches the layout of every other block in the repo (e.g., `blocks/carousel/`, `blocks/card-grid/`, `blocks/teaser/`) and keeps Principle I (self-containment) intact.

## Complexity Tracking

> No Constitution Check violations — table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)* | — | — |
