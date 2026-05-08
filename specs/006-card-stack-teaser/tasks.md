---
description: "Task list for Card Stack Teaser block (006-card-stack-teaser)"
---

# Tasks: Card Stack Teaser

**Input**: Design documents from `/specs/006-card-stack-teaser/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/block-contract.md, quickstart.md

**Tests**: REQUIRED. Per Constitution Principle VI (TDD-Local Loop) and the project Playwright story-tests policy (`specs/002-playwright-story-tests/spec.md`), one Playwright test per user story is mandatory and must be written before implementation.

**Organization**: Tasks are grouped by user story so each can be implemented and validated independently against `http://localhost:3000/blocks/card-stack-teaser` (TDD-Local) and the feature-branch preview.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Different files, no in-phase dependency — safe to run in parallel.
- **[Story]**: US1 / US2 / US3 / US4 / US5 (matches spec.md priorities).
- File paths are absolute relative to the repo root.

## Path Conventions

Single AEM EDS block under `blocks/card-stack-teaser/`. Test file under `tests/`. No new top-level directories.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the empty block scaffold and the empty test file so later phases edit files that already exist.

- [X] T001 Create directory `blocks/card-stack-teaser/` and three empty files: `blocks/card-stack-teaser/_card-stack-teaser.json`, `blocks/card-stack-teaser/card-stack-teaser.js`, `blocks/card-stack-teaser/card-stack-teaser.css`.
- [X] T002 [P] Create empty Playwright spec file `tests/006-card-stack-teaser.ts` with the standard imports (`import { test, expect } from '@playwright/test';`) and a `test.describe('Card Stack Teaser', () => { ... })` shell — no tests yet (filled in per-story phases).
- [X] T003 [P] Verify `models/_section.json` already lists `"card-stack-teaser"` in the section filter (line ~81); if missing, add it. No edits to root `component-*.json` files (auto-merged).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the UE schema, push it, author the target page via MCP, and execute the Constitution Principle VII attachment fetch gate. Every user story depends on these completing.

**CRITICAL**: No user story work can begin until this phase is complete. Schema push BEFORE MCP authoring is mandatory (memory `feedback_aem_schema_push_before_authoring.md`).

- [X] T004 Author `blocks/card-stack-teaser/_card-stack-teaser.json` with the three top-level arrays (`definitions`, `models`, `filters`) per `specs/006-card-stack-teaser/contracts/block-contract.md` §1: block model fields (`title` richtext, `text` richtext, `cta` aem-content, `ctaText` text), card item model `card-stack-teaser-card` fields (`cardIcon` reference, `cardText` text required, `cardTheme` select with `white|black|dark-green|light-green`), filter `{ id: "card-stack-teaser", components: ["card-stack-teaser-card"] }`.
- [X] T005 Run `npm run build:json` to merge `_card-stack-teaser.json` into root `component-definition.json`, `component-models.json`, `component-filters.json` (do NOT hand-edit the root files).
- [X] T006 Stage + commit + push the schema partial and the three regenerated root files (commit `6860b9a`).
- [X] T007 MCP-author the target page at `/blocks/card-stack-teaser` (4 cards: white, black, dark-green, light-green; 2 with `cardIcon`).
- [X] T008 MCP-publish: `/content/facilita-eds-ue/blocks/card-stack-teaser`.
- [X] T009 Constitution VII attachment fetch gate. Both `css-desktop.txt` + `css-mobile.txt` fetched 200 + read whole-file.
- [X] T010 JS skeleton + decorate produces full DOM (covers US1/US2/US4 logic).
- [X] T011 CSS layout shell + mobile-first + desktop @1024px + theme tokens + advance animation.

**Checkpoint**: Schema is published, target page is authored + published, attachments are fetched and read, block renders an empty-but-structurally-correct DOM. All user-story phases can now begin.

---

## Phase 3: User Story 1 — Desktop layout with title/text/CTA + card stack (Priority: P1) MVP

**Goal**: Visitor on desktop sees half-image module: left column = title (top) + text + CTA (bottom); right column = card stack with at least 3 cards (icon + short text per card).

**Independent Test**: Open `http://localhost:3000/blocks/card-stack-teaser` at viewport ≥1024px; confirm `.card-stack-teaser__copy` is left of `.card-stack-teaser__stack`, both halves equally wide; title above text above CTA in copy column; card stack visible on the right with N rendered `.card-stack-teaser__card` elements.

### Tests for User Story 1

- [X] T012 [US1] Test added in `tests/006-card-stack-teaser.ts`.

### Implementation for User Story 1

- [X] T013 [US1] Implement the half-image layout in `blocks/card-stack-teaser/card-stack-teaser.css` using `@media (min-width: 1024px)`: two-column grid (or flex) on `.card-stack-teaser__inner`, `__copy` left, `__stack` right, equal-width columns; full-width container at `.card-stack-teaser` (FR-001). Title at top of `__copy`, text below, CTA at bottom (use `margin-top: auto` or grid row positioning per FR-003). Use exact tokens / sizes from `css-desktop.txt` fetched in T009.
- [X] T014 [US1] In `blocks/card-stack-teaser/card-stack-teaser.js`, refine the decorate output to render the CTA as `<a class="card-stack-teaser__cta" href="${cta}">${ctaText}</a>` only when both `cta` AND `ctaText` are non-empty (FR-015 + Acceptance Scenario 1.2). When either is missing, omit the anchor — `__copy` shows only title and text.
- [X] T015 [US1] Run `npm run test:local -- tests/006-card-stack-teaser.ts` against `aem up` (`localhost:3000`) and iterate on T013/T014 until the US1 test passes green. Confirm no horizontal overflow at 1024px (SC-006).

**Checkpoint**: US1 alone is a deployable MVP — desktop visitor sees the teaser and the CTA path even though the carousel is not yet interactive.

---

## Phase 4: User Story 2 — Click/dot advances the card stack (Priority: P1)

**Goal**: Desktop carousel advances one position per click on the visible card OR on any dot. Animation: top card slides right then returns to the back of the stack. Cyclic. No retreat, no jump-to-index, no autoplay. Single-card instances suppress dots and ignore card clicks.

**Independent Test**: With the 4-card authored page, click the visible card → top card animates out and lands at position N-1, next card becomes top, active dot moves +1. Click any dot → same +1 advance. After Nth advance, cycle returns to card 0. Set `cardCount=1` (MCP `patch-aem-page-content` test instance) → no dots rendered; clicking the lone card triggers no animation.

### Tests for User Story 2

- [X] T016 [US2] Add `test('US2: carousel advances forward by one on card or dot click; cycles; single card disables advance', ...)` in `tests/006-card-stack-teaser.ts`. Cover Acceptance Scenarios 2.1–2.4: (a) initial dot at index 0 with `aria-current="true"`; (b) click `.card-stack-teaser__card[data-position="0"]` → after `transitionend`, the previously visible card has `data-position` = `cardCount-1` and the new top has `data-position="0"`; active dot moved +1; (c) click any dot → same +1 advance regardless of which dot; (d) advance past last card → wraps to 0; (e) for the single-card variant, assert `.card-stack-teaser__dots` is absent and clicking the card does NOT change `data-position`. Run — MUST FAIL.

### Implementation for User Story 2

- [X] T017 [US2] In `blocks/card-stack-teaser/card-stack-teaser.js`, render `.card-stack-teaser__dots` (one `<button type="button" class="card-stack-teaser__dot" aria-label="Avançar para o próximo card">` per card) only when `cardCount >= 2` (FR-005, FR-011). Set `aria-current="true"` on the dot whose index equals `currentIndex` (initial 0). Assign `data-position` to each card matching its initial index.
- [X] T018 [US2] In `card-stack-teaser.js`, implement the advance function: `currentIndex = (currentIndex + 1) % cardCount`; rewrite `data-position` on each card so the new top is `0` and the rest follow ascending; update `aria-current` on dots. Bind `click` on the visible top card AND on every dot — both call the same advance (FR-006). Bind `Enter`/`Space` on dots (native `<button>` already handles this) — no custom keyhandler. Skip the binding entirely when `cardCount < 2` (FR-011 + Acceptance Scenario 2.4).
- [X] T019 [US2] Add the in-flight click guard: a closure-scoped `pendingAdvance` boolean. While the CSS transition is running (between advance start and `transitionend` on the moving card), additional clicks set `pendingAdvance = true`; on `transitionend`, consume the flag with exactly one more advance (FR-017 / SC-005). One pending max — extra clicks during the same transition do not stack.
- [X] T020 [US2] In `blocks/card-stack-teaser/card-stack-teaser.css`, encode the advance animation: each `.card-stack-teaser__card` is positioned via `data-position` (use `transform: translate3d(...)` per position offset, plus `z-index` so position 0 is on top). The "top card" advance pose translates right and the card's `data-position` is then rewritten to `cardCount-1` so it ends at the back of the stack. Transition duration ≤ 400 ms (plan Performance Goals). Use the exact transform offsets / shadows / z-index ladder from `css-desktop.txt`.
- [X] T021 [US2] Run `npm run test:local -- tests/006-card-stack-teaser.ts` until US1 + US2 both pass. Manually exercise rapid double-click — visible card and dots must remain in sync (SC-005).

**Checkpoint**: Desktop carousel is fully interactive. Mobile is still unstyled — covered next.

---

## Phase 5: User Story 3 — Mobile sequential layout (Priority: P1)

**Goal**: Below 1024px, the block renders as a vertical sequence Title → Text → Cards (all visible) → CTA. No carousel, no dots, no advance animation.

**Independent Test**: Set viewport <1024px (e.g., 375px). Confirm DOM order rendered top-to-bottom is title, text, cards (each visible, none stacked), CTA. Confirm `.card-stack-teaser__dots` is hidden or not rendered. Confirm clicking a card does not change `data-position` on mobile.

### Tests for User Story 3

- [X] T022 [US3] Add `test('US3: mobile vertical sequence Title → Text → Cards → CTA without carousel', ...)` in `tests/006-card-stack-teaser.ts`. Set viewport 375×800; assert visual top-to-bottom order via `boundingBox().y` on `__title`, `__text`, each `__card`, `__cta`; assert all cards are visible (each `boundingBox().height > 0` and not overlapping siblings); assert `.card-stack-teaser__dots` is not visible (`toBeHidden` OR not in DOM); click a card and assert `data-position` is unchanged (no advance on mobile). MUST FAIL initially.

### Implementation for User Story 3

- [X] T023 [US3] In `blocks/card-stack-teaser/card-stack-teaser.css`, add the default (mobile-first) layout: `.card-stack-teaser__inner` is a single-column flex/grid with order Title → Text → Stack → CTA; `.card-stack-teaser__stack` lays cards out vertically (no overlap, no transforms); `.card-stack-teaser__dots` is `display: none` below 1024px. Use exact spacing/padding from `css-mobile.txt` fetched in T009.
- [X] T024 [US3] In `blocks/card-stack-teaser/card-stack-teaser.js`, gate the carousel binding on `window.matchMedia('(min-width: 1024px)').matches`. When the query is false, do NOT attach click listeners to cards or dots and do NOT initialise `data-position`-driven CSS state. Re-evaluate on `matchMedia` `change` event so a viewport resize from mobile→desktop attaches listeners (acceptable to attach once and noop if already initialised).
- [X] T025 [US3] Run `npm run test:local` at multiple viewports (375, 768, 1024, 1280) to confirm SC-007 (no re-authoring needed across viewports) and that the mobile and desktop tests both pass.

**Checkpoint**: All three P1 stories pass — block is functional on every supported viewport.

---

## Phase 6: User Story 4 — Per-card color themes (Priority: P2)

**Goal**: Each card renders the author-selected theme palette (`black`, `dark-green`, `light-green`, `white`); when the authored value is missing or unrecognised, fallback `white`. Themes apply to background, text, and icon tint of the card without affecting siblings or the rest of the teaser.

**Independent Test**: Authored page has 4 cards with one of each theme. Assert each card carries the matching `data-theme` and its rendered background and text colours match the palette declared in the CSS. With `cardTheme` cleared on a fifth card (or set to a bogus value), assert it renders as `white`.

### Tests for User Story 4

- [X] T026 [US4] Add `test('US4: per-card themes render the correct palette and default to white', ...)` in `tests/006-card-stack-teaser.ts`. For each authored card, read `data-theme` and assert computed `background-color` matches the expected token from CSS (use `getComputedStyle` via `page.evaluate`). Add an assertion that a card without `cardTheme` (or with an invalid value) renders with `data-theme="white"`. MUST FAIL initially.

### Implementation for User Story 4

- [X] T027 [US4] In `blocks/card-stack-teaser/card-stack-teaser.js`, when building each `.card-stack-teaser__card`, read the `cardTheme` cell, normalise to one of the four allowed values (`black|dark-green|light-green|white`), and write it as `data-theme` on the card element. When the cell is empty or the value is not in the allowed set, set `data-theme="white"` (Clarification Q2 + Edge case "Tema de card inválido/ausente").
- [X] T028 [US4] In `blocks/card-stack-teaser/card-stack-teaser.css`, declare scoped CSS custom properties on `.card-stack-teaser__card[data-theme="black"|"dark-green"|"light-green"|"white"]` (`--cst-card-bg`, `--cst-card-fg`, `--cst-card-icon`) using the exact colour tokens from `css-desktop.txt` / `css-mobile.txt`. Apply them via `background`, `color`, and the icon tint rule on `.card-stack-teaser__icon`. Ensure each `data-theme` block is independent (no inheritance across cards).
- [X] T029 [US4] Run `npm run test:local` and confirm US1–US4 all pass on both desktop and mobile viewports (SC-003 — themes correct in both resolutions).

**Checkpoint**: Authoring flexibility complete; the four-theme palette is enforced and the default is deterministic.

---

## Phase 7: User Story 5 — CTA hover & focus affordance (Priority: P3)

**Goal**: Desktop visitor sees a distinct visual hover state on the CTA and a clearly visible focus ring when the CTA is reached via keyboard.

**Independent Test**: Hover the `.card-stack-teaser__cta` and observe a computed-style change (background or color) vs. the resting state. Tab to it and observe a focus outline / ring (not `outline: none`).

### Tests for User Story 5

- [X] T030 [US5] Add `test('US5: CTA hover and focus produce distinct visual states', ...)` in `tests/006-card-stack-teaser.ts`. Capture computed style (`background-color` or `color`) at rest, then call `page.locator('.card-stack-teaser__cta').hover()` and re-capture — assert at least one property changed. Then `focus()` the same locator and assert the computed `outline-style` is not `none` and/or `box-shadow` is set. MUST FAIL initially.

### Implementation for User Story 5

- [X] T031 [US5] In `blocks/card-stack-teaser/card-stack-teaser.css`, add `.card-stack-teaser__cta:hover` and `.card-stack-teaser__cta:focus-visible` rules using the project's existing button hover/focus tokens (do not introduce new global tokens; FR-015). Use values from `css-desktop.txt`.
- [X] T032 [US5] Run `npm run test:local` — confirm US1–US5 all green at `localhost:3000`.

**Checkpoint**: All five user stories pass independently against the local proxy.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Lint, parity, and final acceptance gates across the whole feature.

- [X] T033 [P] Run `npm run lint` — fix any ESLint or Stylelint findings under `blocks/card-stack-teaser/` and `tests/006-card-stack-teaser.ts`. No `!important`, no global selectors, imports include `.js` extension.
- [X] T034 Parity check: theme palette in authored cards (`white|black|dark-green|light-green`) matches the four card backgrounds in `css-desktop.txt` / `css-mobile.txt` (#FFFFFF, #000000, #238662, #38B160). No textual/link tokens in attachment to compare.
- [X] T035 Preview gate green: 5/5 tests pass on `https://006-card-stack-teaser--facilita-eds-ue--vilt-r-d.aem.page/blocks/card-stack-teaser`.
- [X] T036 DoD: localhost ✓, preview ✓, 5 US ✓, parity ✓, schema partial + merged root JSON pushed ✓, no new npm dep ✓, no hand-edits to root `component-*.json` ✓, no new variable in `styles/styles.css` ✓.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 must finish before T010/T011 (those edit files T001 creates). T002/T003 are [P].
- **Foundational (Phase 2)**: T004 → T005 → T006 → T007 → T008 (each strictly serial: schema must merge before commit, push must land before MCP create, content patch before publish). T009 (attachment fetch) can run in parallel with T004–T008 since it has no dependency on either; placed in Phase 2 because Phase 3+ implementation tasks depend on its output. T010/T011 depend on T001 (files exist) and T009 (attachments fetched per Principle VII).
- **User Stories (Phase 3+)**: All depend on Phase 2 completion. Within each story: test task is written FIRST and MUST be observed failing before the corresponding implementation tasks land (Constitution VI red→green).
- **Polish (Phase 8)**: T033 can run any time after Phase 7. T034/T035 depend on all user stories being implemented.

### User Story Dependencies

- **US1 (P1)**: Foundational only.
- **US2 (P1)**: Builds on US1's decorated DOM (cards exist, CTA exists). Tests still validate independently — single-card edge case in T016 exercises the FR-011 branch even without US3/US4/US5.
- **US3 (P1)**: Independent of US2 — mobile path explicitly skips the carousel binding.
- **US4 (P2)**: Independent of US2/US3 — themes apply to whichever card layout is rendered.
- **US5 (P3)**: Independent — touches only the `.card-stack-teaser__cta` selector.

### Within Each User Story

- Test task FIRST (write `test(...)`, run it, observe red).
- Then implementation tasks in the order CSS → JS or JS → CSS depending on the phase (US1 starts with CSS layout; US2 starts with JS state machine; US3 starts with CSS media query; US4 splits JS normalisation + CSS palette; US5 is CSS-only).
- Re-run `npm run test:local` after each implementation task; commit when green.

### Parallel Opportunities

- T002 and T003 in Phase 1 are [P].
- T009 (attachment fetch) parallel to T004–T008 inside Phase 2.
- Across stories, US3 / US4 / US5 implementation can be parallelised by different developers once US1 lands (US2 shares JS state with US1's decorate; coordinate edits).
- T033 (lint) can run in parallel with T034 (parity) and T035 (preview run).

---

## Parallel Example: Phase 2 startup

```bash
# Run schema authoring serially (T004 → T005 → T006 → T007 → T008),
# but kick off attachment fetch in parallel:
Task: "T009 — fetch css-desktop.txt + css-mobile.txt via cacophony-fetch-attachment"

# Once T008 completes AND T009 completes, scaffold:
Task: "T010 — author JS skeleton in blocks/card-stack-teaser/card-stack-teaser.js"
Task: "T011 — author CSS skeleton in blocks/card-stack-teaser/card-stack-teaser.css"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 → Phase 2 complete.
2. Phase 3 (US1).
3. Stop — visitor on desktop sees the teaser with title/text/CTA and a static stack. Demo as MVP if needed.

### Incremental Delivery (recommended)

1. Setup + Foundational → block renders an empty shell on the published preview.
2. Add US1 → desktop layout — demoable, no carousel yet.
3. Add US2 → carousel interactive — full desktop behaviour.
4. Add US3 → mobile vertical — full responsive behaviour.
5. Add US4 → themed cards — visual variety.
6. Add US5 → CTA polish — affordance.
7. Polish — parity check + preview gate → merge.

### Solo Strategy

Execute the phases in numeric order. Re-run `npm run test:local -- tests/006-card-stack-teaser.ts` after every implementation task; commit at every green checkpoint.

---

## Notes

- All [Story] tasks edit the same three files (`blocks/card-stack-teaser/card-stack-teaser.js`, `…/card-stack-teaser.css`, `tests/006-card-stack-teaser.ts`) — across-story implementation is rarely safe to fully parallelise without coordination on those files.
- `_card-stack-teaser.json` is hand-edited (T004); root `component-*.json` files are auto-merged by `npm run build:json` (T005) and the Husky pre-commit hook — never hand-edit them.
- Constitution VII gate (T009) is non-negotiable — Phase 3+ MUST NOT begin if either attachment fetch fails.
- Memory `feedback_aem_schema_push_before_authoring.md`: T006 (commit + push schema) happens BEFORE T007 (MCP create-page) — not after.
- Memory `feedback_richtext_paragraph_scoping.md`: typography on `.card-stack-teaser p`, never on the wrapper.
