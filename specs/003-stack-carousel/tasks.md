# Tasks: Stack Carousel Block

**Input**: Design documents from `/specs/003-stack-carousel/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ue-schema.md ✅, contracts/dom-contract.md ✅, quickstart.md ✅

**Tests**: Tests ARE included — FR-013 in spec.md requires `tests/003-stack-carousel.ts` with one comprehensive Playwright test per user story, per the policy in `specs/002-playwright-story-tests/spec.md`.

**Organization**: Tasks are grouped by user story (US1, US2, US3) so each story can be implemented and tested independently.

## Format: `- [ ] [TaskID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps task to US1 / US2 / US3 from `spec.md`
- Every task description includes an absolute-from-repo-root file path

## Path Conventions

Single-project AEM EDS boilerplate layout (already in place):

- Block code: `blocks/stack-carousel/{stack-carousel.js,stack-carousel.css,_stack-carousel.json}`
- Section filter registration: `models/_section.json`
- Playwright spec: `tests/003-stack-carousel.ts`
- Regenerated (never hand-edited): `component-definition.json`, `component-models.json`, `component-filters.json`

---

## Phase 1: Setup

**Purpose**: Create the block folder and empty scaffold files so later tasks can edit them.

- [X] T001 Create the block directory and three empty scaffold files: `blocks/stack-carousel/stack-carousel.js`, `blocks/stack-carousel/stack-carousel.css`, `blocks/stack-carousel/_stack-carousel.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Deliver the rendering substrate (UE schema merged into root JSON, section filter registration, and the base `decorate()` that produces the DOM contract shape without animation or interaction). All three user stories depend on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Implement the Universal Editor partial exactly per `specs/003-stack-carousel/contracts/ue-schema.md` (two `definitions`, two `models`, one `filters` entry; field names / order / `bgColor` options must match the contract verbatim) in `blocks/stack-carousel/_stack-carousel.json`
- [X] T003 [P] Append the string `"stack-carousel"` to the `filters[0].components` array in `models/_section.json` so authors can drop the block into any section
- [X] T004 Run `npm run build:json` from the repo root to regenerate `component-definition.json`, `component-models.json`, and `component-filters.json`, then verify the `stack-carousel` entry appears in each (depends on T002 + T003)
- [X] T005 Implement the base `decorate(block)` in `blocks/stack-carousel/stack-carousel.js`: export `default async function decorate(block)`, read the authored cells (heading, body, ctaLabel, ctaLink, plus per-item title/description/icon/bgColor) in UE cell order, build the decorated DOM exactly per `specs/003-stack-carousel/contracts/dom-contract.md` §1 (`.stack-carousel-inner` → `.stack-carousel-copy` + `.stack-carousel-pile` + `.stack-pagination`), set `data-index` / `data-bg` / `data-layer` (one `front`, up to two `back-1`/`back-2`, rest `hidden`) / `tabindex` / `aria-hidden` / `role="button"` / `aria-label` on each `.stack-card`, render `.stack-dot` buttons with `data-target-index` and `aria-current` on the front one, call `moveInstrumentation` from `scripts/scripts.js` for each preserved node, omit CTA when `ctaLabel` or `ctaLink` is absent, omit pagination when `N < 2`, handle 0/1/2-item edge cases per the dom-contract §3 — no click/keyboard handlers yet, no animation
- [X] T006 Implement the base CSS scaffold scoped under `.stack-carousel.block` in `blocks/stack-carousel/stack-carousel.css` (4-space indent): container grid/flex, `.stack-carousel-inner`, `.stack-carousel-copy` (heading typography, body paragraph, CTA button reusing existing `styles/styles.css` variables), `.stack-carousel-pile` relative positioning context, `.stack-card` base shape (border-radius, padding, typography), `.stack-pagination` row, `.stack-dot` reset + base dot shape, and an `.sr-only` utility local to the block (visually-hidden pattern) — no layer positioning, no animation, no breakpoint layout yet

**Checkpoint**: After Phase 2, the block renders in UE and on the preview site as a static, un-styled pile structure with authored content in the correct DOM positions. User story work can now begin.

---

## Phase 3: User Story 1 - Advance the stack by clicking the front card (Priority: P1) 🎯 MVP

**Goal**: Clicking (or pressing Enter/Space on) the front card advances the pile with a two-phase animation (front card slides right above the pile, then returns to the back while the remaining cards advance one layer forward). Pagination dots update in sync and can jump directly to any card via shortest-path rotation.

**Independent Test**: Load `/blocks/stack-carousel` (demo page with ≥ 4 authored items), capture the initial front-card text, click the front card four times, assert each click brings a different card to the front in authored order, that after four clicks the original card is back at the front, and that the dot with `aria-current="true"` always matches the current front card. Also assert clicking a distant dot jumps in a single animation (shortest path), and that activating the already-active dot is a no-op.

### Implementation for User Story 1

- [X] T007 [US1] Implement the front-card advance state machine in `blocks/stack-carousel/stack-carousel.js`: closure state (`frontIndex`, `isAdvancing`); attach `click` and `keydown` (Enter/Space) listeners to the current front card; on activation guard with `isAdvancing`, set it `true`, apply `data-phase="advancing-out"` to the outgoing card, rotate `data-layer` values across siblings one step forward (`back-1` → `front`, `back-2` → `back-1`, first `hidden` → `back-2`, outgoing → `hidden`) on the next animation frame, listen for `transitionend` on `transform` to enter phase 2 (`data-phase="advancing-in"` + `data-layer="back-2"` on outgoing), listen for the second `transitionend` to clear `data-phase`, update `frontIndex`, refresh `tabindex` / `aria-hidden` / `aria-label` on all cards, update `aria-current` on the matching dot, `focus()` the new front card iff the advance was keyboard-initiated, finally set `isAdvancing = false` (contract: `specs/003-stack-carousel/contracts/dom-contract.md` §2.1; research: D1, D2, D8)
- [X] T008 [US1] Implement the pagination-dot jump handler in `blocks/stack-carousel/stack-carousel.js`: attach `click` listeners to each `.stack-dot`; read `data-target-index`, no-op when it equals `frontIndex`, otherwise compute `deltaForward = (targetIndex - frontIndex + N) % N` and `deltaBackward = N - deltaForward`, run a single forward animation rotating by `deltaForward` steps when `deltaForward <= deltaBackward` (forward when tied) else run a single mirrored backward animation by `deltaBackward` steps, reuse the guard/state/ARIA refresh logic from T007, update `aria-current` to the activated dot (contract §2.2; research: D3) — depends on T007
- [X] T009 [US1] Add the advance-animation CSS rules in `blocks/stack-carousel/stack-carousel.css`: transitions on `transform` / `opacity` / `z-index` for `.stack-card` keyed off `data-layer` and `data-phase`; phase-1 rule for `.stack-card[data-phase="advancing-out"]` (translate right, z-index above pile); phase-2 rule for `.stack-card[data-phase="advancing-in"]` (return-from-right + settle-at-back); mirrored rules for the backward-jump case; timing budgeted under the SC-003 600 ms cap; `@media (prefers-reduced-motion: reduce) { .stack-carousel.block .stack-card { transition-duration: 0.01ms !important; } }` per research D7 / FR-010
- [X] T010 [US1] Add the `test('US1: advance the stack by clicking the front card', ...)` block in `tests/003-stack-carousel.ts` that navigates to `BASE_URL + '/blocks/stack-carousel'` and asserts every US1 Acceptance Scenario in a single test: Scenario 1.1 (click front → transient `data-phase="advancing-out"` observed, then clicked card ends at `data-layer="hidden"` or last-back and previously-second card ends at `data-layer="front"`); Scenario 1.2 (after click, `.stack-dot[aria-current="true"]` matches the new front card's index); Scenario 1.3 (click 4 times on a 4-item demo → front-card text rotates through all items in authored order and returns to the starting card with no duplicate / no gap); plus pagination-dot shortest-path assertion (click a distant dot → the targeted card becomes `front` in a single animation) and no-op assertion (click the already-active dot → `frontIndex` unchanged, no `data-phase` observed). Selectors MUST follow `specs/003-stack-carousel/contracts/dom-contract.md` §4

**Checkpoint**: User Story 1 is fully functional and testable independently against the branch preview. Note that the two-phase motion will only be *visually* meaningful once US2's layer-positioning CSS (T011–T013) is in place; T010's assertions rely on `data-layer` / `data-phase` / `aria-current` which are correct without visual polish.

---

## Phase 4: User Story 2 - Perceive the pile as a stack at a glance (Priority: P1)

**Goal**: Before interacting, the visitor instantly reads the component as a pile of cards (front card fully visible; two back cards visibly offset and smaller behind it). On desktop (≥ 1280 px) the copy is on the left and the pile on the right; on mobile (375 px) the copy is above the pile; no horizontal overflow at either breakpoint.

**Independent Test**: Load the demo page at 1440 × 900 and assert exactly one `[data-layer="front"]`, exactly one `[data-layer="back-1"]`, exactly one `[data-layer="back-2"]` are visible; front card has `cursor: pointer`. Reload at 375 × 667 and assert copy is above pile, cards are full-width within the container, and `document.documentElement.scrollWidth ≤ window.innerWidth`.

### Implementation for User Story 2

- [X] T011 [US2] Add the layer-positioning CSS in `blocks/stack-carousel/stack-carousel.css` so the pile reads as a stack at rest: rules for `.stack-card[data-layer="front"]` (scale 1, z-index top, full opacity, `cursor: pointer`), `[data-layer="back-1"]` (subtle scale-down + translate-y offset, lower z-index), `[data-layer="back-2"]` (further scale-down + larger offset, lowest visible z-index), `[data-layer="hidden"]` (`visibility: hidden`, `pointer-events: none`, z-index 0); ensure exactly 3 layers are visible for N ≥ 3 items (FR-014) and degrades gracefully for N = 1 / N = 2 per `specs/003-stack-carousel/contracts/dom-contract.md` §3
- [X] T012 [US2] Add the `bgColor` palette rules in `blocks/stack-carousel/stack-carousel.css`: `.stack-carousel.block .stack-card[data-bg="black"]`, `[data-bg="dark-green"]` (`#238662`), `[data-bg="bright-green"]` (`#38B160`), `[data-bg="white"]` (`#FFFFFF`) with contrast-aware text color per palette (FR-012, research D4); reuse existing color/spacing custom properties from `styles/styles.css` where available before introducing new ones
- [X] T013 [US2] Add the responsive layout CSS in `blocks/stack-carousel/stack-carousel.css`: mobile-first base (copy above pile, full-width rounded cards — 16 px border-radius per spec, no horizontal overflow) and `@media (min-width: 1280px)` desktop override (two-column grid/flex: copy on the left, pile on the right; fixed arrangement per clarification; 24 px border-radius per spec); background `#E6E6E6` and Aeonik Pro typography per spec Assumptions (FR-007, FR-008)
- [X] T014 [US2] Add the `test('US2: perceive the pile as a stack at a glance', ...)` block in `tests/003-stack-carousel.ts` that navigates twice: at 1440 × 900 assert Scenario 2.1 (exactly one `[data-layer="front"]`, exactly one `[data-layer="back-1"]`, exactly one `[data-layer="back-2"]`, all three visible) + Scenario 2.2 (front card has computed `cursor: pointer`) + invariants (non-front cards have `tabindex="-1"` and `aria-hidden="true"`, at most 3 painted layers); at 375 × 667 assert Scenario 2.3 (mobile stacked layout, `document.documentElement.scrollWidth <= window.innerWidth`). Selectors MUST follow dom-contract §4

**Checkpoint**: User Stories 1 AND 2 together deliver the full MVP visual + interaction experience on the branch preview. US1's visual animation (T009) now has the correct rest-state geometry to animate from / to.

---

## Phase 5: User Story 3 - Author a stack-carousel in Universal Editor (Priority: P2)

**Goal**: A content author can drop a `Stack Carousel` block into a section in Universal Editor, add 1–6 `Stack Carousel Item` children with distinct titles / descriptions / icons / bgColors, set the companion heading + body + CTA, reorder items, and see the rendered page match the authored front-to-back order.

**Independent Test**: In Universal Editor on the branch preview, add a `stack-carousel` to an empty section, add three items (Card A / Card B / Card C with distinct bgColors), save and publish to preview, confirm A renders at the front, B behind A, C behind B; reorder to C/A/B and re-publish, confirm the new order is reflected. Playwright asserts the rendering-parity portion against a pre-authored demo page.

### Implementation for User Story 3

- [X] T015 [US3] Verify `blocks/stack-carousel/_stack-carousel.json` (from T002) matches the reviewer checklist in `specs/003-stack-carousel/contracts/ue-schema.md` §Validation: two definitions, two models (ids `stack-carousel` + `stack-carousel-item`), filter entry `{ id: "stack-carousel", components: ["stack-carousel-item"] }`, exact `bgColor` options (`black`, `dark-green`, `bright-green`, `white`), and re-run `npm run build:json` to confirm the regenerated root JSON files include the new block
- [ ] T016 [US3] Author the demo page on the branch preview at `/blocks/stack-carousel` (published via UE on branch `003-stack-carousel`) containing one `stack-carousel` instance with three items titled `Card A`, `Card B`, `Card C` in that order, each with a distinct `bgColor` from the four-value palette (covering at least `black`, `dark-green`, `bright-green`), plus authored heading + body + CTA — this is the fixture URL that every Playwright test in `tests/003-stack-carousel.ts` navigates to; document any UE-author-only screenshots in the PR description
- [X] T017 [US3] Add the `test('US3: authored order renders and cycles correctly', ...)` block in `tests/003-stack-carousel.ts` that navigates to `BASE_URL + '/blocks/stack-carousel'` and asserts every US3 Acceptance Scenario: Scenario 3.1 (the rendered block contains N `.stack-card` articles — one per authored item — and N `.stack-dot` buttons, matching the demo page's 3 items), Scenario 3.2 (initial `[data-layer="front"]` text matches `Card A`, `[data-layer="back-1"]` text matches `Card B`, `[data-layer="back-2"]` text matches `Card C`), Scenario 3.3 (clicking the front card once brings `Card B` to the front, again brings `Card C`, again wraps back to `Card A` — i.e. cycle order matches the authored order); UE drag-and-drop reordering is covered by T016 + the manual reviewer step in `specs/003-stack-carousel/quickstart.md` §Reviewer

**Checkpoint**: All three user stories are independently functional and Playwright-tested against the branch preview.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify lint cleanliness, run the full Playwright suite, and perform the manual pre-merge perf + a11y checks from `specs/003-stack-carousel/quickstart.md` §Reviewer.

- [X] T018 [P] Run `npm run lint` (or `npm run lint:fix`) at repo root and resolve any ESLint / Stylelint issues in `blocks/stack-carousel/stack-carousel.js` and `blocks/stack-carousel/stack-carousel.css` (ensure `.js` import extensions, Unix line endings, 2-space JS indent, 4-space CSS indent)
- [ ] T019 [P] Run the feature's Playwright suite against the branch preview: `BASE_URL=https://003-stack-carousel--facilita-eds-ue--vilt-r-d.aem.page npm test -- tests/003-stack-carousel.ts` — all three tests (US1, US2, US3) MUST pass; attach the passing log to the PR description
- [ ] T020 Manual performance spot-check per `specs/003-stack-carousel/quickstart.md` §Reviewer — Performance: DevTools Performance recording of one advance on the branch preview shows total duration ≤ 600 ms and ≥ 30 fps during the transition (SC-003, contract §6); document the result in the PR
- [ ] T021 Manual accessibility spot-check per `specs/003-stack-carousel/quickstart.md` §Reviewer — Accessibility: verify in DevTools that after an advance only the new front card has `tabindex="0"` and non-front cards have `tabindex="-1"` + `aria-hidden="true"`, dots are real `<button>` with the active one carrying `aria-current="true"`, Enter/Space on the front card advances, Tab order is logical, OS-level reduced motion makes the advance near-instant with state still correct (FR-009, FR-010, contract §5)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → No dependencies; start immediately.
- **Phase 2 (Foundational)** → Depends on Phase 1. BLOCKS all user stories.
- **Phase 3 (US1)** → Depends on Phase 2. Shares `stack-carousel.js` + `stack-carousel.css` with Phase 4 (US2).
- **Phase 4 (US2)** → Depends on Phase 2. Can run in parallel with Phase 3 by two different developers, but file-level coordination is required because both phases edit `stack-carousel.js` and `stack-carousel.css`. The **recommended single-developer order** is Phase 4 before Phase 3 so US1's animation (T009) animates between the layer geometries defined by US2 (T011).
- **Phase 5 (US3)** → Depends on Phase 2 for the UE schema (T002) and Phase 4 for the rendered visual (demo page screenshot review); T015 and T017 can run once Phase 2 completes; T016 (demo page authoring) blocks the Playwright test execution in Phase 6 (T019).
- **Phase 6 (Polish)** → Depends on all P1 and P2 user stories being complete.

### Task-Level Dependencies

- T004 depends on T002 + T003 (both partial files must exist before `build:json` merges them).
- T005 depends on T004 (schema must be registered before the decorate function has a UE contract to honor).
- T006 can run in parallel with T005 (different files).
- T007 depends on T005 (base decorate must emit the DOM contract before handlers can be wired).
- T008 depends on T007 (pagination handler reuses the state machine built in T007).
- T009 depends on T006 (base CSS scaffold must exist before animation rules target it).
- T010 depends on T007 + T008 (test assertions exercise both handlers).
- T011 / T012 / T013 depend on T006 (all edit the same CSS file; sequential within US2).
- T014 depends on T011 + T012 + T013.
- T015 depends on T002 + T004.
- T016 depends on T015 (UE schema must be registered and published before the author can place the block).
- T017 depends on T016 (Playwright test targets the demo page fixture).
- T019 depends on T010 + T014 + T017 + T016 (all three tests must be in place and the demo page must be live).

### Parallel Opportunities

- **Setup + start of Foundational**: T002 and T003 edit different files — run them in parallel.
- **Within Foundational**: T005 (JS) and T006 (CSS) can run in parallel.
- **Between P1 stories (US1 & US2)**: can be assigned to two developers but coordinate writes to `stack-carousel.js` and `stack-carousel.css` (lock on a branch per sub-phase, or serialize CSS edits).
- **Between P1 and P2**: once Phase 2 is complete, US3's T015 (schema verification) and the US1 / US2 implementation tasks can proceed in parallel.
- **Polish**: T018 (lint) and T019 (Playwright) can run in parallel; T020 and T021 are manual and can be performed while CI runs.

---

## Parallel Example: Foundational Phase

```bash
# Launch T002 and T003 together (different files, no dependency):
Task: "Implement the UE partial in blocks/stack-carousel/_stack-carousel.json"
Task: "Append 'stack-carousel' to models/_section.json filters[0].components"
# Then run T004 (depends on both), then T005 + T006 in parallel.
```

## Parallel Example: After Foundational

```bash
# Developer A — US1 (P1 MVP):
Task: "T007 [US1] Advance state machine in blocks/stack-carousel/stack-carousel.js"

# Developer B — US2 (P1):
Task: "T011 [US2] Layer-positioning CSS in blocks/stack-carousel/stack-carousel.css"
# CSS edits between A and B must serialize once A starts T009.
```

---

## Implementation Strategy

### MVP First (US1 + US2 together — both P1)

Both P1 stories are part of the minimum viable shipment (spec says US1 without US2 is "just a static stack illustration"; US2 without US1 is "a static pile that does nothing").

1. Complete Phase 1 (Setup) — T001.
2. Complete Phase 2 (Foundational) — T002 → T003 → T004 → T005 → T006.
3. Complete Phase 4 (US2) — T011 → T012 → T013 → T014. *(Do US2 first so US1's animation has the correct rest-state geometry to animate between.)*
4. Complete Phase 3 (US1) — T007 → T008 → T009 → T010.
5. **STOP and VALIDATE**: run `npm test -- tests/003-stack-carousel.ts` against the branch preview; manual click-through at 1280 px + 375 px. Ship as MVP demo.

### Incremental Delivery

1. Setup + Foundational → block structure exists in UE and preview.
2. Add US2 → static pile renders correctly at both breakpoints; US2 Playwright test green.
3. Add US1 → pile advances on click / keyboard / dot jump; US1 Playwright test green. **MVP shipped.**
4. Add US3 → UE authoring validated end-to-end; demo page published; US3 Playwright test green.
5. Polish → lint + full suite + manual perf/a11y spot-checks → ready to merge into `develop` and then `main`.

### Parallel Team Strategy

With two engineers:

1. Both complete Setup + Foundational together (one drives T002–T005, the other T006).
2. Engineer A: Phase 3 (US1) — stack-carousel.js handlers + animation CSS + US1 test.
3. Engineer B: Phase 4 (US2) — layer-positioning CSS + palette + responsive layout + US2 test.
4. Serialize concurrent CSS writes on a shared branch (B finishes their CSS before A adds transition rules on top).
5. Either engineer owns Phase 5 (US3) — primarily an authoring + test task.

---

## Validation

### Task count

- Phase 1 Setup: **1** task (T001)
- Phase 2 Foundational: **5** tasks (T002–T006)
- Phase 3 US1: **4** tasks (T007–T010)
- Phase 4 US2: **4** tasks (T011–T014)
- Phase 5 US3: **3** tasks (T015–T017)
- Phase 6 Polish: **4** tasks (T018–T021)
- **Total: 21 tasks.**

### Per-story task count

- US1: 4 tasks (T007, T008, T009, T010) — advance state machine, dot-jump handler, animation CSS, Playwright test.
- US2: 4 tasks (T011, T012, T013, T014) — layer positioning, bgColor palette, responsive layout, Playwright test.
- US3: 3 tasks (T015, T016, T017) — schema verification, demo-page authoring, Playwright test.

### Independent test criteria (restated from spec.md)

- **US1**: 4 items → 4 clicks cycle through all items and return to the start; pagination dot in sync; distant-dot jump in a single animation; click-on-active is a no-op. (SC-001, SC-005)
- **US2**: At ≥ 1280 px, exactly 3 visible layers; front card is `cursor: pointer`; at 375 px, no horizontal overflow and copy above pile. (SC-002)
- **US3**: Demo page with items `Card A`, `Card B`, `Card C` renders in that authored order (A front, B back-1, C back-2) and cycles in the same order on advance. (SC-004)

### Parallel opportunities identified

- T002 ↔ T003 (different files).
- T005 ↔ T006 (different files).
- Phase 3 ↔ Phase 4 (different developers, same files — requires coordination, not free parallelism).
- T018 ↔ T019 (lint vs. Playwright).

### Suggested MVP scope

US1 + US2 together (both P1). US3 (P2) can follow in the same PR or a short-lived follow-up — the UE schema (T002) is already shipped in Phase 2, so only T016 + T017 remain to close out US3.

### Format validation

Every task above:

- ✅ Starts with `- [ ]`.
- ✅ Has a sequential TaskID (T001–T021).
- ✅ Has a `[P]` marker only when parallelizable (T002, T003, T018, T019).
- ✅ Has a `[Story]` label on exactly the user-story-phase tasks (T007–T017). Setup (T001), Foundational (T002–T006), and Polish (T018–T021) tasks intentionally have no story label.
- ✅ References at least one exact file path.

---

## Notes

- **Tests are required, not optional**, because `spec.md` FR-013 + the policy in `specs/002-playwright-story-tests/spec.md` mandate one comprehensive Playwright test per user story under `tests/003-stack-carousel.ts`.
- **Only two files outside the block folder are touched**: `models/_section.json` (T003) and `tests/003-stack-carousel.ts` (T010, T014, T017) — plus the auto-regenerated root JSON files (T004, T015). No other repo-wide changes.
- **No new npm dependencies** are introduced — this is enforced by Principle II and verified in T018.
- Commit after each task or logical group; the `after_tasks` extension hook will offer to auto-commit after this tasks file is generated.
- Stop at any checkpoint (end of Phase 3, 4, 5) to validate the current story independently on the branch preview before proceeding.
