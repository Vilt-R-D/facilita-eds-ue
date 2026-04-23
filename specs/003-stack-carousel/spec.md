# Feature Specification: Stack Carousel Block

**Feature Branch**: `003-stack-carousel`
**Created**: 2026-04-22
**Status**: Draft
**Input**: User description: "stack-carousel — crie um block stack-carousel. cada slide deve ser um EDS item. deve ter um comportamento de 'pilha'. ao clicar em um slide, este é animado para a última posição, e o de trás vem pra frente. deve ser visualmente subentendido que é uma pilha."

## Clarifications

### Session 2026-04-22

- Q: What is the cap on visible back layers and the maximum authored items? → A: Cap visible layers at 3 total (1 front + 2 back); allow up to 6 authored items, with extras cycling into view as earlier cards move to the back.
- Q: On desktop, which side is the companion copy on relative to the stack? → A: Copy on the left, stack on the right (fixed, not author-configurable in v1).
- Q: Is the pagination indicator interactive, and if so how does it rotate? → A: Interactive — clicking/activating a pagination position jumps directly to that card in a single animation, using the shortest-path rotation (forward or backward, whichever is fewer steps; forward when tied).
- Q: What is the departure trajectory for the card being advanced? → A: Two-phase motion — the clicked card first slides to the right, passing above (in front of, z-axis) the other cards, then returns from the right and settles at the back of the pile as the new last layer. In parallel, the remaining cards advance one layer toward the front so that the new front card is in place by the time the animation completes.
- Q: What is the visual form of the pagination indicator? → A: A horizontal row of dots — one per authored item, rendered as accessible buttons; the dot that matches the current front card is visually distinct (filled/elongated pill), mirroring the pattern used by the existing `carousel` block.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Advance the stack by clicking the front card (Priority: P1)

A visitor landing on a page that contains the stack-carousel sees a pile of cards (one fully visible in front and the remaining cards peeking out behind, each one slightly smaller and offset to imply depth). When the visitor clicks the front card, that card animates out to the back of the pile and the card that was immediately behind it smoothly rises to the front, revealing its content. The pagination indicator updates to reflect which card is currently at the front. Repeating the click cycles the visitor through every card and eventually returns to the original front card.

**Why this priority**: This is the core interaction that defines the feature. Without it there is no carousel, only a static stack illustration. It is the minimum behavior required to ship a viable MVP and is what makes the block different from the existing `carousel` block.

**Independent Test**: Publish a page using the block with 4 authored items, load the feature preview URL, click the front card four times in a row, and confirm that each click brings a different card to the front in authored order, that after four clicks the original card is at the front again, and that the pagination indicator updates in sync.

**Acceptance Scenarios**:

1. **Given** a stack-carousel with 4 authored items has finished loading, **When** the visitor clicks the front (topmost) card, **Then** the clicked card visibly translates to the right (rendered in front of the other cards during this phase), then returns from the right and settles at the back of the pile, and the previously second card becomes the new front card by the time the animation completes.
2. **Given** the stack-carousel is displaying card N at the front, **When** the visitor clicks the front card, **Then** the pagination indicator highlights the position that corresponds to the new front card (N+1, or 1 when wrapping around).
3. **Given** the visitor has cycled through every card, **When** they click the front card one more time, **Then** the stack returns to its original front card without any visible gap, flicker, or re-layout.

---

### User Story 2 - Perceive the pile as a stack at a glance (Priority: P1)

Before interacting, the visitor immediately understands that the component is a pile of cards rather than a single card or a flat row of tiles. The back cards are visible as progressively smaller, offset shapes behind the front card; borders and subtle scaling/translation make each layer readable. On desktop the pile is shown on the right with the companion copy on the left; on mobile the cards are presented in a stacked arrangement below the copy, consistent with the mobile layout supplied by design.

**Why this priority**: The visual "pile" affordance is what invites the click. If the first impression does not read as a stack, the core interaction in User Story 1 is not discoverable and the feature loses its value.

**Independent Test**: Load the feature preview URL on a desktop viewport (≥1280px) and on a mobile viewport (375px) and confirm that at least two layers behind the front card are visible, each one offset and smaller than the one in front of it, with a clear front card that looks interactive.

**Acceptance Scenarios**:

1. **Given** a stack-carousel with at least 3 authored items, **When** the page finishes loading on a desktop viewport, **Then** the visitor sees one front card plus at least two back cards visually offset behind it, each back card smaller and further back than the one in front of it.
2. **Given** the page is loaded, **When** the visitor hovers the front card with a pointer device, **Then** the cursor indicates the card is clickable (affordance is explicit).
3. **Given** the page is loaded on a 375px mobile viewport, **When** the visitor scrolls the block into view, **Then** the cards render in the mobile stacked layout (full-width rounded cards) that matches the supplied design, without horizontal overflow.

---

### User Story 3 - Author a stack-carousel in Universal Editor (Priority: P2)

A content author opens Universal Editor, drops a `stack-carousel` block into a section, and adds individual `stack-carousel-item` children. For each item they can set title, description, icon (or icon-style identifier), and background color/theme. They can also set the companion copy shown next to the stack (heading, supporting paragraph, and a CTA button with label and link). Reordering items in the editor changes the order cards appear in the pile.

**Why this priority**: The block has no value unless authors can produce content with it in the tool they already use. It is P2 rather than P1 because an engineer-authored demo page on the preview branch is enough to validate User Stories 1 and 2, but the feature is not considered done until authors can create instances.

**Independent Test**: In Universal Editor on the feature preview branch, add a `stack-carousel` to an empty section, add at least three items with distinct titles, descriptions, and background colors, save, publish to preview, and confirm the rendered page matches the authored order and content.

**Acceptance Scenarios**:

1. **Given** an author is editing a page in Universal Editor, **When** they insert a `stack-carousel` block, **Then** the block accepts one or more `stack-carousel-item` children and also accepts the companion heading, body, and CTA fields.
2. **Given** the author has added items A, B, C in that order, **When** they publish the page, **Then** card A renders at the front, B behind A, and C behind B, matching the authored order.
3. **Given** the author reorders the items, **When** they re-publish, **Then** the new front-to-back order on the live page matches the new authored order.

---

### Edge Cases

- **Single item authored**: The block renders the one card with no back layers and the interaction is effectively disabled (clicking does nothing visible, or cycles the same card back to front with no visible change).
- **Two items authored**: The pile shows one front card and one back card; clicking swaps them; the interaction still works but with only two positions.
- **Many items (up to the 6-item cap)**: At most 3 cards are rendered visibly at any time (1 front + 2 back). Items beyond the third position exist in the cycle but are not painted as distinct back layers; they rotate into the visible back-layer slots as earlier cards move to the back. Authoring more than 6 items is not supported in v1.
- **Animation interrupted by a rapid second click**: The in-flight animation completes or cleanly cancels; the stack never ends up in an inconsistent state where two cards overlap in the same position or the pagination indicator disagrees with the visible front card.
- **Keyboard and screen-reader users**: The front card is reachable via Tab and can be activated with Enter/Space to advance the stack, matching the mouse-click behavior; non-front cards are not tab stops and are hidden from or deprioritized by assistive tech until they become the front card.
- **Reduced motion preference**: When the visitor has `prefers-reduced-motion: reduce` set, the card change happens with a minimal or instant transition instead of the full animation.
- **Missing optional fields on an item**: If an item is authored without an icon or description, the layout degrades gracefully and the card still renders without visual artifacts.
- **CTA link missing**: The block still renders the companion copy; the CTA button is hidden (not rendered) rather than linking to nowhere.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST expose a new block named `stack-carousel` that authors can place inside any content section.
- **FR-002**: The block MUST accept an ordered list of child items (each item authored as an EDS item within the block), where each item carries at minimum a title and a description and optionally an icon/icon identifier and a background color/theme identifier.
- **FR-003**: The block MUST render the items as a visual pile: one front card fully visible, with additional back cards rendered behind the front one, each back card visibly offset and smaller than the card in front of it, so the composition reads as a stack.
- **FR-004**: Clicking (or activating via keyboard on) the front card MUST animate that card to the last position of the pile using a two-phase trajectory: (phase 1) the card translates to the right, rendered above the other cards in stacking order; (phase 2) the card returns from the right and settles at the back of the pile as the new last layer. While the clicked card is moving, the remaining cards MUST advance one layer toward the front in parallel, so that the card previously in second position is the new front card by the time the full animation completes. The full two-phase motion MUST fit within the performance budget defined in SC-003.
- **FR-005**: The cycling order MUST match the authored order: after advancing the stack N times (where N is the number of items), the front card MUST be identical to the initial front card.
- **FR-006**: The block MUST display a pagination indicator as a horizontal row of dots — one dot per authored item — showing which position in the sequence is currently at the front. The dot matching the current front card MUST be visually distinct from the others (e.g., filled or elongated pill), and this active-state MUST update on every advance. Each dot MUST be rendered as an accessible button (clickable via pointer and activatable via keyboard): activating a dot MUST bring the corresponding card to the front in a single animation, using the shortest-path rotation (forward or backward, whichever requires fewer advance steps; forward when tied). Activating the dot that is already at the front MUST be a no-op. The indicator styling MUST be consistent with the pattern used by the existing `carousel` block.
- **FR-007**: The block MUST accept a companion copy group (heading, supporting paragraph, and an optional CTA with label and link) to be rendered to the left of the pile on desktop (copy column on the left, stack column on the right) and above the pile on mobile, consistent with the supplied design references. The left/right arrangement is fixed in v1 and is not author-configurable.
- **FR-008**: The block MUST render correctly at the two design breakpoints supplied (375px mobile and ≥1280px desktop) without horizontal overflow and with card sizes, colors, border radii, and typography consistent with the supplied CSS references.
- **FR-009**: The block MUST remain operable with a keyboard alone: the front card MUST be reachable via Tab, and Enter or Space on the front card MUST advance the stack by one position. Each pagination indicator position MUST also be keyboard-reachable via Tab and activatable via Enter or Space to jump to that card (per FR-006).
- **FR-010**: The block MUST respect the `prefers-reduced-motion` preference by substantially reducing or eliminating the transition animation when the user has opted out of motion.
- **FR-011**: The block MUST handle 1-item and 2-item configurations without visual defects (no stray back layers for a single item; no broken swap for two items).
- **FR-012**: Each card's background color MUST be author-configurable per item. Authors MUST be able to pick from a predefined set that includes at minimum the four colors shown in the design reference (black, dark green `#238662`, bright green `#38B160`, and white).
- **FR-013**: The block MUST ship with a Playwright test file under `tests/003-stack-carousel.ts` containing one comprehensive test per user story in this spec, consistent with the repository's testing policy defined in `specs/002-playwright-story-tests/spec.md`.
- **FR-014**: The block MUST render at most 3 cards as visible layers at any time (1 front + up to 2 back), regardless of how many items are authored. Items beyond the visible cap MUST still participate in the advance cycle, rotating into the visible back-layer slots as earlier cards move to the back.
- **FR-015**: Authors MUST be limited to a maximum of 6 `stack-carousel-item` children per block in v1. Exceeding this limit is out of scope and not required to render correctly.

### Key Entities *(include if feature involves data)*

- **Stack Carousel Block**: The container placed by authors. Holds the companion copy (heading, body, CTA label, CTA link) and an ordered list of stack items.
- **Stack Carousel Item**: A single card in the pile. Attributes: position (inherited from author order), title, description, optional icon/icon identifier, background color/theme identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the feature preview URL, a visitor can cycle through every card in a stack-carousel with 4 items and return to the original front card in 4 clicks or fewer, with no visual glitch on any click. (Verifiable by the Story 1 Playwright test.)
- **SC-002**: At first render, the block is visually recognized as a pile: at least 3 distinct card layers are visible (1 front + 2 back) for any authored list of 3 or more items, on both the 375px and ≥1280px reference viewports.
- **SC-003**: The card advance animation feels smooth on a mid-range laptop: the transition completes in under 600ms and does not drop below 30 frames per second during the animation.
- **SC-004**: A content author can publish a new stack-carousel with 3 items (copy + cards + CTA) in Universal Editor in under 10 minutes without needing engineering help, and the published page matches the authored order and content exactly.
- **SC-005**: Keyboard-only visitors and visitors with reduced-motion preference can reach and advance through every card; the pagination indicator remains in sync in both modes. (Verifiable by the Story 1 / Story 2 Playwright tests with the reduced-motion emulation.)

## Assumptions

- The block is rendered by the existing AEM EDS decoration pipeline (`scripts.js` → `decorateBlocks` → `blocks/stack-carousel/stack-carousel.js`), consistent with every other block in the repository; no new build tooling is required.
- Authoring uses the standard Universal Editor (XWalk) mechanism already used by the other blocks, configured via a `_stack-carousel.json` partial that is merged into the root component JSON files by the existing `npm run build:json` step.
- The visual specification in the referenced CSS snippets (mobile 375px and desktop ≥1280px) is the source of truth for sizes, colors (`#000000`, `#238662`, `#38B160`, `#FFFFFF`, background `#E6E6E6`), border radii (16px mobile / 24px desktop), and typography (Aeonik Pro). The supported range for v1 is 1 to 6 authored items, with at most 3 cards visible at once (1 front + 2 back) per FR-014 / FR-015.
- "Clicking a slide" (from the user input) means clicking the currently front-most card. Clicking a back card is out of scope for v1 (the click target is the front card only). If later requested, the behavior can extend naturally.
- Icons are referenced by identifier and rendered via the existing SVG sprite loaded by `scripts/delayed.js`. No new icon asset pipeline is needed; authors pick from available identifiers.
- Tests target the feature preview URL `https://003-stack-carousel--facilita-eds-ue--vilt-r-d.aem.page/blocks/stack-carousel` pre-merge and the `develop` preview post-merge, in line with the policy in `specs/002-playwright-story-tests/spec.md`.
- Analytics/tracking of card advances is out of scope for v1 unless/until GTM events are explicitly requested.
