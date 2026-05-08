# Implementation Plan: Card Stack Teaser

**Branch**: `006-card-stack-teaser` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-card-stack-teaser/spec.md`

## Summary

Half-image teaser block. Desktop: left column = title + text (top) + CTA (bottom); right column = animated card stack (icon + short text per card) with sequential-only advance via card click or dot click, cyclic, no autoplay. Mobile: vertical sequence Title → Text → Cards → CTA, no carousel. Per-card color theme (preto, verde-escuro, verde-claro, branco; default `branco`). Vanilla JS in `blocks/card-stack-teaser/`, scoped CSS, Universal Editor model with item-prefix grouping. Two attachment refs (`css-desktop.txt`, `css-mobile.txt`) drive final styling under Constitution Principle VII.

## Technical Context

**Language/Version**: Vanilla JS (ES2022) for block runtime; TypeScript 5.x for the Playwright spec only.
**Primary Dependencies**: `scripts/aem.js` utilities (`createOptimizedPicture`, etc.); `@playwright/test` for the spec. No new runtime dependencies (Constitution Principle II).
**Storage**: N/A — block reads authored DOM, no persisted state.
**Testing**: Playwright spec at `tests/006-card-stack-teaser.ts`. Local TDD via `npm run test:local` against `http://localhost:3000` (Constitution Principle VI).
**Target Platform**: Modern browsers (same baseline as the rest of the site); AEM EDS preview/live tiers.
**Project Type**: AEM EDS block (single self-contained module under `blocks/card-stack-teaser/`).
**Performance Goals**: Block decoration ≤ 5 ms on mid-range desktop; carousel advance animation ≤ 400 ms; runs in the Lazy phase (below the fold ok).
**Constraints**: No `!important`; no global selectors; no third-party JS (no Swiper); icons supplied by author as image/SVG via Universal Editor reference field; all interaction CSS-driven where possible (transform + transition).
**Scale/Scope**: 1 block, 1 item type (card), expected 3–6 cards per instance (edge cases: 1 card, 8+ cards).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Note |
|---|---|---|
| I. Block self-containment | PASS | One block at `blocks/card-stack-teaser/`. Repeatable cards modelled as a child item (`card-stack-teaser-card`) — no nested blocks. |
| II. Zero dependencies | PASS | Vanilla JS only. No Swiper. No new npm packages. |
| III. Performance-first (E-L-D) | PASS | Block decorates in the Lazy phase; the carousel advance uses CSS transform/transition; no work in the Eager phase. |
| IV. CSS scoping | PASS | All selectors scoped under `.card-stack-teaser` / `.card-stack-teaser-container`. Typography for richtext follows the `.card-stack-teaser p` pattern (per the Richtext-paragraph-scoping memory). |
| V. Universal Editor compliance | PASS | `_card-stack-teaser.json` provides `definitions`, `models`, `filters`. Block already registered under `models/_section.json` filters (line 81). Field names follow EDS conventions (`title`, `text`, `cta` + `ctaText`, `cardIcon`, item-prefix grouping). |
| VI. TDD-Local Loop | PASS | Playwright spec authored first; schema partial pushed before MCP authoring; page authored at `/blocks/card-stack-teaser`; local iteration via `aem up` + `npm run test:local`. |
| VII. Attachment Full-Context Pre-Analysis | PASS (gate to honour at /speckit-implement time) | `cacophony:meta` block in `spec.md` lists two non-image attachments: `css-desktop.txt` and `css-mobile.txt`. Both MUST be fetched via the `cacophony-fetch-attachment` skill and `Read` whole-file BEFORE any task that creates or edits `blocks/card-stack-teaser/card-stack-teaser.{js,css}`. Implementation must not begin if either fetch fails. |

No violations. Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/006-card-stack-teaser/
├── plan.md                 # This file (/speckit-plan output)
├── spec.md                 # Feature specification (already authored)
├── research.md             # Phase 0 output
├── data-model.md           # Phase 1 output (block + item content model)
├── quickstart.md           # Phase 1 output (run-the-feature instructions)
└── contracts/
    └── block-contract.md   # Phase 1 output (UE schema + DOM/render contract)
```

### Source Code (repository root)

```text
blocks/
└── card-stack-teaser/
    ├── _card-stack-teaser.json   # UE definitions/models/filters partial (NEW)
    ├── card-stack-teaser.js       # decorate(block) — DOM transform + carousel logic (NEW)
    └── card-stack-teaser.css      # Scoped styles + responsive breakpoint (NEW)

models/
└── _section.json                  # Already lists "card-stack-teaser" under filters (no edit needed)

component-definition.json          # Auto-merged by `npm run build:json` (do NOT hand-edit)
component-models.json              # Auto-merged
component-filters.json             # Auto-merged

tests/
└── 006-card-stack-teaser.ts       # Playwright spec, one test per user story (NEW)

specs/006-card-stack-teaser/       # Documentation (above)
```

**Structure Decision**: Single AEM EDS block under `blocks/card-stack-teaser/`. Repeatable card content modelled as a child item (`card-stack-teaser-card`) registered through the block's filter — no nested blocks, no new top-level directory. Section filter already includes `card-stack-teaser`; only the block partial is new.

## Complexity Tracking

> No constitutional violations. Section intentionally empty.

## Phase 0 — Outline & Research

Output: [research.md](./research.md). Decisions captured:

1. **Carousel mechanism** — CSS transform + class-toggled animation; queue at most one pending advance during transition; no third-party library.
2. **Mobile vs desktop split** — pure CSS via media query; same authored DOM, different layout; JS gates carousel listeners on `matchMedia('(min-width: 1024px)')`.
3. **Card theme palette** — four data-attribute themes on each card (`data-theme="black|dark-green|light-green|white"`); default `white` when missing.
4. **Richtext typography scoping** — title and card-stack-teaser body text styled via `.card-stack-teaser p` (NOT the wrapper) to avoid conflict with `styles/styles.css` (per memory).
5. **Accessibility** — dots are `<button>` elements with `aria-label` and `aria-current="true"` on the active dot; cards stay outside the tab order; Enter/Space on a dot triggers `advance()`.
6. **Attachment policy** — `css-desktop.txt` and `css-mobile.txt` are the styling source of truth; `/speckit-implement` MUST fetch both whole-file before editing JS/CSS.

## Phase 1 — Design & Contracts

Outputs:

- [data-model.md](./data-model.md) — entities (Block, Card, Dot, CTA, Theme), fields, validation, state.
- [contracts/block-contract.md](./contracts/block-contract.md) — Universal Editor schema sketch, authored DOM contract, decorated DOM contract, JS public surface (none — only `default decorate(block)`), CSS class hooks.
- [quickstart.md](./quickstart.md) — local-loop runbook (push schema → MCP author → aem up → npm run test:local).

Agent context update: see CLAUDE.md `<!-- SPECKIT START --> / <!-- SPECKIT END -->` block (now points at this plan).

## Re-evaluation — Constitution Check (post-design)

All seven principles still PASS after Phase 1 design. No new violations introduced; data model uses item-prefix grouping (Principle I), no new dependencies (II), block decoration runs in Lazy phase (III), CSS contract scoped (IV), JSON partial follows EDS conventions (V), TDD loop documented (VI), attachment-fetch gate restated for `/speckit-implement` (VII).
