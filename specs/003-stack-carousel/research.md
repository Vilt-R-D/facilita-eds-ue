# Phase 0 — Research: Stack Carousel Block

**Feature**: `003-stack-carousel` | **Date**: 2026-04-22

The spec (post-`/speckit.clarify`) carries **no remaining `[NEEDS CLARIFICATION]` markers** — the five clarifying questions (visible-layer cap, desktop stack/copy arrangement, pagination interactivity + rotation rule, departure trajectory, pagination visual form) were resolved in the 2026-04-22 session. This document therefore focuses on the *technology/implementation decisions* required to satisfy those clarified requirements under the constraints of the Facilita EDS constitution (no new deps, Lazy-phase loading, scoped CSS, UE compliance).

Each decision follows the **Decision / Rationale / Alternatives considered** format.

---

## D1 — Animation technique for the two-phase advance motion

**Decision**: Drive the advance animation entirely with **CSS transitions** triggered by class / `data-*` attribute changes, orchestrated from JavaScript using `requestAnimationFrame` and listening for `transitionend` to chain phase 2 after phase 1 and to release an "in-flight" lock. Each card gets a `data-layer` attribute (`front`, `back-1`, `back-2`, `hidden`) and a transient `data-phase` attribute (`advancing-out`, `advancing-in`) applied only while the clicked card is mid-animation. The remaining cards' `data-layer` value is updated at the same tick, so their transitions run in parallel with the clicked card's two-phase motion.

**Rationale**:
- Zero JS animation libraries → satisfies Principle II.
- CSS `transform` + `opacity` animations stay on the compositor thread, which is the recommended path to hit the ≥30 fps / <600 ms target in SC-003 on mid-range hardware.
- `data-layer` / `data-phase` attributes keep the state machine explicit, inspectable in DevTools, and testable with Playwright selectors (`[data-layer="front"]`).
- `prefers-reduced-motion` can be honoured by a single `@media` block that zeroes `transition-duration` — no JS branch required.
- Rapid successive clicks are handled by a single `isAdvancing` closure flag — while true, click handlers return early (spec Edge Case: "Animation interrupted by a rapid second click").

**Alternatives considered**:
- **Web Animations API (`element.animate(...)`)**: More programmatic control, but adds complexity around cancellation and cross-element choreography; offers no performance advantage over CSS transitions for this use case.
- **A third-party library (GSAP, Motion One, Framer Motion)**: Rejected — violates Principle II (no new npm packages) and the spec's visual needs are well within CSS transition capabilities.
- **`setInterval` / manual per-frame transforms**: Rejected — runs on the main thread, worse frame pacing, and harder to reason about than declarative CSS.

---

## D2 — DOM strategy for the visible-layer cap (1 front + up to 2 back, FR-014)

**Decision**: Render **all** authored items as `<article class="stack-card">` elements inside a single positioned container, but only three of them carry a visible `data-layer` value at any time (`front`, `back-1`, `back-2`); the rest carry `data-layer="hidden"`. Hidden cards are kept in the DOM (so they can participate in the cycle and in focus order assertions) but placed with `visibility: hidden; pointer-events: none;` and stacked beneath `back-2` with `z-index: 0`. Advancing rotates the `data-layer` values across the list in O(n) without reordering the DOM.

**Rationale**:
- Keeping DOM order stable avoids layout thrash and DOM-reorder flicker during the animation.
- A single source of truth (`data-layer`) drives CSS positioning, `z-index`, `aria-hidden`, and `tabindex` — no separate flags.
- Hidden cards stay pre-decorated, so the 4th / 5th / 6th authored item appears instantly the moment it rotates into a visible slot.
- Trivially inspectable by tests: `await expect(page.locator('[data-layer="front"]')).toHaveText(...)`.

**Alternatives considered**:
- **Render only the visible three and swap DOM nodes on advance**: Rejected — would re-mount cards, costing authoring identity (Universal Editor instrumentation) and forcing repeated `moveInstrumentation` calls; also loses the author's original order for accessibility traversal.
- **Virtual-scroll / clone cards**: Rejected — unnecessary complexity for a ≤6-item cap (FR-015).

---

## D3 — Pagination indicator (FR-006) — visual + interaction model

**Decision**: Render the indicator as a `<nav class="stack-pagination" aria-label="Selecionar card">` containing one `<button class="stack-dot">` per authored item. The dot that matches the current front index gets `aria-current="true"` (and a matching `.is-active` class) so CSS can style it as an elongated pill, mirroring the existing `carousel` block's `.swiper-pagination-bullet-active` pattern. Clicking / activating a dot computes `deltaForward = (targetIndex − frontIndex + N) mod N` and `deltaBackward = N − deltaForward`; the block advances forward if `deltaForward ≤ deltaBackward` (forward when tied, per clarification) and otherwise runs a single backward animation (mirrored two-phase motion: the front card slides *left* under the stack and re-emerges from the back as the new front is the previous `back-1`). Clicking the already-active dot is a no-op.

**Rationale**:
- Dots-only (no prev/next arrows) is what the clarification committed to and visually matches the reference `carousel` block.
- A single-animation jump to any position (vs. chained advances) matches the clarified UX.
- Shortest-path rotation (forward-when-tied) is deterministic and easy to test.
- Real `<button>` elements give keyboard accessibility and focus outlines for free.

**Alternatives considered**:
- **Chained single-step advances until we reach the target**: Rejected — clarified as the wrong UX; it would take up to N × 600 ms.
- **Only forward rotation (no backward)**: Rejected — violates the "shortest path" clarification.
- **Plain `<a href="#">` links**: Rejected — buttons are semantically correct for in-page state changes.

---

## D4 — Per-item background color field (FR-012)

**Decision**: Use a `select` (single-select) UE field named `bgColor` on the `stack-carousel-item` model with exactly four predefined options: `black` (#000000), `dark-green` (#238662), `bright-green` (#38B160), `white` (#FFFFFF). The decorate function reads the option value from the authored `<p>` inside the corresponding child `<div>` and writes it onto the card as `data-bg="black|dark-green|bright-green|white"`. CSS selectors like `.stack-carousel.block .stack-card[data-bg="dark-green"] { background: #238662; color: #fff; }` then apply the palette — no inline styles, no hex-to-contrast logic in JS.

**Rationale**:
- Restricting to the four designed tokens prevents authors from entering arbitrary (and likely off-brand) colors, and keeps FR-012 testable.
- A UE `select` renders as a dropdown in the author UI, which is the clearest affordance for a closed palette.
- Storing the token as a `data-*` attribute keeps contrast-aware text color as a pure CSS concern.

**Alternatives considered**:
- **Free-text hex field**: Rejected — lets authors ship off-brand colors; no compile-time validation; harder to test.
- **Boolean "dark/light" toggle**: Rejected — the spec explicitly names four colors; a boolean cannot express four states.
- **Per-item CSS class like `.bg-dark-green`**: Functionally equivalent, but `data-bg` keeps the class list clean for other future modifiers.

---

## D5 — Icon field (FR-002 / Assumptions)

**Decision**: Use a UE `reference` field of type `string` named `icon` on the `stack-carousel-item` model, identical to the `carousel-card.icon` and `card.card-icon` fields already in the repo. Authors pick from the existing icon set (the `icons/` directory served by AEM). The decorate function reads the authored `<picture>` / `<img>` from that cell and relocates it into the card's header, following the pattern in `blocks/card-grid/card-grid.js`. No new sprite pipeline; no new asset loading.

**Rationale**:
- Consistency with `carousel-card.icon` and `card.card-icon` is the strongest factor — authors already know this pattern.
- The SVG sprite is loaded in the Delayed phase by `scripts/delayed.js`, so no eager cost is introduced.
- Missing icon is handled by rendering the card without the icon slot (spec Edge Case).

**Alternatives considered**:
- **Closed list of icon names (select field)**: Rejected — it would require maintaining an allow-list in the JSON and would lag any new icon added to the sprite.
- **Custom upload per card**: Rejected — breaks the SVG sprite convention and bloats page weight.

---

## D6 — Companion copy (heading / body / CTA) — authored on block or as items?

**Decision**: Author the companion copy **directly on the block container model** (`stack-carousel`), not as a child item. Fields: `heading` (richtext), `body` (richtext), `ctaLabel` (text), `ctaLink` (aem-content). The decorate function extracts these four cells from the first authored rows, renders them into a `<div class="stack-carousel-copy">` column, and the `stack-carousel-item` children populate a sibling `<div class="stack-carousel-pile">` column. CTA button renders only when both `ctaLabel` and `ctaLink` are present (FR-008 / Edge Case: "CTA link missing" → CTA hidden, block still renders).

**Rationale**:
- There is exactly **one** copy group per block, so an item-based representation would be misleading to authors.
- Putting copy on the container mirrors how the existing `teaser` block organizes its container-level fields.
- Keeps the item model cleanly focused on card content (title / description / icon / bgColor).

**Alternatives considered**:
- **Separate first child item with type `stack-carousel-copy`**: Rejected — authors would have to learn another item type and the invariant "exactly one copy item" would be enforced in JS rather than in the model itself.
- **Put copy in a separate sibling block**: Rejected — violates Principle I (self-containment of the authored experience) and removes the single-drag-in-UE authoring flow described in Story 3.

---

## D7 — `prefers-reduced-motion` handling (FR-010)

**Decision**: Handle reduced motion **in CSS only**, with a `@media (prefers-reduced-motion: reduce) { ... }` block inside `stack-carousel.css` that sets `.stack-card { transition-duration: 0.01ms !important; }` on all animated properties. The JS orchestration is unchanged (it still emits the same class/attr changes and still waits for `transitionend`), but the transition completes almost instantaneously, producing the "minimal or instant" visual the clarification calls for. No JS reads `matchMedia` — the single source of truth is the OS-level preference.

**Rationale**:
- Keeps animation policy expressed in one file (CSS) and one place (the `@media` block) — easy to audit.
- `transitionend` still fires on a near-zero-duration transition, so the in-flight lock and phase chaining remain correct.
- No JS behaviour divergence → no second code path to test.

**Alternatives considered**:
- **`matchMedia('(prefers-reduced-motion: reduce)')` branching in JS**: Rejected — two code paths; harder to test; offers no benefit here.
- **No reduced-motion handling (ignore the preference)**: Rejected — violates FR-010 and is inaccessible.

---

## D8 — Keyboard interaction model (FR-009)

**Decision**:
- The front card is rendered as `<article tabindex="0" role="button" aria-label="Avançar carrossel — <title do card front>">` so it is a single Tab stop and can be activated with `Enter` or `Space`. Non-front cards get `tabindex="-1"` and `aria-hidden="true"`.
- Each pagination dot is a native `<button>` element, natively reachable by Tab and activatable by Enter/Space. No custom key handler is required for dots.
- When the advance animation starts, focus remains on the front card; once the animation ends (`transitionend`), the new front card element reclaims its interactive attributes and — if the user initiated the advance by keyboard — receives `focus()` so continued Tab/Enter cycling works without a focus-lost-in-space moment.

**Rationale**:
- `role="button"` + Enter/Space activation is the standard ARIA pattern for a clickable non-button element. The card visually has more content than a native `<button>` can wrap cleanly (title, description, icon), so wrapping the whole article in a button is awkward; `role="button"` is the documented alternative.
- Moving focus to the new front card after a keyboard-initiated advance prevents the "focus lost" issue where the old front card has become inert.
- Using native `<button>` for dots avoids any custom key handling there.

**Alternatives considered**:
- **Wrap the entire card in a `<button>`**: Rejected — the card contains a heading + paragraph + icon; nesting them inside a native button has known styling friction and some screen-reader implementations flatten inner structure.
- **Always move focus after a mouse advance too**: Rejected — would steal focus unexpectedly when a mouse user has clicked elsewhere mid-animation.

---

## D9 — Loading phase for the block (Principle III)

**Decision**: The block participates in the default block-loading pipeline — it is decorated during `loadLazy` by the generic `loadBlocks` machinery in `scripts/scripts.js`. `stack-carousel.css` is loaded by `loadBlock` on demand. No eager imports. No font-file or image preloading beyond what AEM EDS `createOptimizedPicture` already handles (we don't use it for cards; icons reuse the sprite loaded in Delayed).

**Rationale**:
- The stack-carousel is typically placed below the hero — it is never the LCP element. Shipping it eager would only waste LCP budget.
- Every other block in the repo (`carousel`, `card-grid`, `teaser`) follows the same default, which keeps the page lifecycle predictable.

**Alternatives considered**:
- **Eager decoration**: Rejected — no user-facing benefit, clear LCP regression risk.

---

## D10 — Test strategy for `tests/003-stack-carousel.ts`

**Decision**: Three Playwright tests (US1 / US2 / US3), each a single `test(...)` block asserting **every** Acceptance Scenario under its story (comprehensive, not representative — per the clarified policy in `specs/002-playwright-story-tests/spec.md`):

- **US1 — Advance by click**: Navigate to `/blocks/stack-carousel`, capture the initial `[data-layer="front"]` text, click the front card four times, assert pagination `aria-current` and front-card text rotate in authored order and return to the start after four clicks. Also assert the transient `data-phase="advancing-out"` is observed on the clicked card during the animation.
- **US2 — Pile is visually a stack**: Navigate at two viewport sizes (375 × 667 and 1440 × 900). For each, assert `locator('[data-layer="front"]')` is visible exactly once, `locator('[data-layer="back-1"]').count() === 1`, `locator('[data-layer="back-2"]').count() === 1` (for a ≥3-item demo page), assert the front card has `cursor: pointer`, and assert no horizontal scrollbar appears (`document.documentElement.scrollWidth ≤ window.innerWidth`).
- **US3 — Authoring**: Given this is an end-user rendering gate (we can't drive Universal Editor from Playwright in this repo), the test asserts **rendering parity with the authored order** on the branch preview: given the demo page uses items `A, B, C` in that order, `aria-current` starts on index 0 and cycling visits B then C then A. The UE drag-and-drop interaction is covered manually by the reviewer (consistent with Story 3's "Independent Test").

**Rationale**:
- One test per user story is the convention mandated by the constitution (Principle: E2E tests) and by `002-playwright-story-tests`.
- Asserting every Acceptance Scenario per story is the clarified "comprehensive coverage" policy.
- `data-layer` and `data-phase` attributes (per D1 / D2) give the tests stable, semantic selectors without coupling to CSS classes.

**Alternatives considered**:
- **One test per Acceptance Scenario**: Rejected — violates the 1:1 story-to-test mapping enforced by 002-playwright-story-tests.
- **Screenshot / visual regression**: Rejected — out of scope for the current test policy; no tooling for golden images.
- **Drive Universal Editor authoring from Playwright**: Rejected — no current fixture for UE auth; Story 3's Independent Test documents a manual gate.

---

## Summary of inputs / outputs resolved

- All five clarifications from the 2026-04-22 session are reflected in the decisions above (D1/D3 pagination; D2 visible-layer cap; D6 desktop arrangement; D1 two-phase trajectory).
- Every spec FR has a concrete implementation decision behind it: FR-001 → block scaffold; FR-002/FR-012 → D4+D5; FR-003 → D2; FR-004 → D1; FR-005 → cycle-order invariant enforced by D2; FR-006 → D3; FR-007 → D6; FR-008 → scoped CSS at both breakpoints (standard); FR-009 → D8; FR-010 → D7; FR-011 → D2 (hidden slots absorb the degenerate cases); FR-013 → D10; FR-014/FR-015 → D2 + UE `maxSize` constraint documented in `contracts/ue-schema.md`.

No `NEEDS CLARIFICATION` markers remain. Ready for Phase 1.
