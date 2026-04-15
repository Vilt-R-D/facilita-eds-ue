# Feature Specification: Vertical Carousel

**Feature Branch**: `001-vertical-carousel`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "vertical carousel — crie um block 'vertical-carousel' cada slide deve ser um item"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vertical Slide Navigation (Priority: P1)

A site visitor lands on a page that contains a vertical carousel. The carousel displays one slide at a time, stacked vertically. The visitor can navigate between slides by scrolling, swiping vertically (on touch devices), or clicking navigation controls. Each transition animates smoothly, revealing the next or previous item in the vertical stack.

**Why this priority**: This is the core interaction of the block — without vertical navigation between items, no other feature makes sense.

**Independent Test**: Can be fully tested by loading a page with a vertical-carousel block containing 3+ items and verifying that navigation moves through slides vertically with smooth transitions.

**Acceptance Scenarios**:

1. **Given** a vertical-carousel block with 4 items on the page, **When** the visitor clicks the "next" navigation control, **Then** the carousel smoothly transitions to display the next item, scrolling the content upward.
2. **Given** the carousel is displaying the last item, **When** the visitor clicks the "next" navigation control, **Then** the "next" control is disabled and no further forward navigation occurs. Similarly, the "previous" control is disabled when on the first item.
3. **Given** a touch-enabled device, **When** the visitor swipes upward on the carousel, **Then** the carousel transitions to the next item.
4. **Given** a touch-enabled device, **When** the visitor swipes downward on the carousel, **Then** the carousel transitions to the previous item.

---

### User Story 2 - Content Display per Slide (Priority: P1)

A content author creates a vertical-carousel block in Universal Editor. Each item (slide) is authored as a separate child element within the block. The block renders each item's authored content (text, images, links) faithfully inside its slide.

**Why this priority**: Content authoring and correct rendering is equally critical — the block must display what authors create.

**Independent Test**: Can be tested by authoring a vertical-carousel block with items containing different content combinations (image + text, text only, image + text + link) and verifying they render correctly.

**Acceptance Scenarios**:

1. **Given** an author adds a vertical-carousel block with 3 items in Universal Editor, **When** the page is previewed, **Then** each item appears as an individual slide within the vertical carousel.
2. **Given** an item contains an image and text, **When** the slide is displayed, **Then** both the image and text render in the correct layout within the slide.
3. **Given** the block has only 1 item, **When** the page is rendered, **Then** the single item displays without navigation controls (no arrows or indicators needed).

---

### User Story 3 - Visual Navigation Indicators (Priority: P2)

A site visitor sees visual indicators (such as dots or a progress bar) that communicate the current position within the carousel and the total number of slides. These indicators help the visitor understand where they are in the sequence.

**Why this priority**: Navigation indicators enhance usability but the carousel is functional without them.

**Independent Test**: Can be tested by loading a vertical-carousel with 5+ items and verifying that pagination indicators appear, highlight the current slide, and update as the visitor navigates.

**Acceptance Scenarios**:

1. **Given** a vertical-carousel with 5 items, **When** the page loads, **Then** pagination indicators are visible showing 5 positions with the first one highlighted as active.
2. **Given** the visitor navigates to the third item, **When** the transition completes, **Then** the third pagination indicator becomes active and the first is no longer highlighted.
3. **Given** a visitor clicks on the fourth pagination indicator, **When** the click is registered, **Then** the carousel transitions directly to the fourth item.

---

### User Story 4 - Responsive Behavior (Priority: P2)

The vertical carousel adapts gracefully to different screen sizes. On desktop, it occupies its designated layout area. On mobile, it remains usable with touch-friendly navigation and appropriately sized slides.

**Why this priority**: Responsive behavior is expected on a modern site but is secondary to core functionality.

**Independent Test**: Can be tested by resizing the browser or using device emulation to verify the carousel renders and navigates correctly at mobile, tablet, and desktop widths.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (1024px+), **When** the vertical carousel renders, **Then** slides display at full width within the block's container with visible navigation controls.
2. **Given** a mobile viewport (< 768px), **When** the vertical carousel renders, **Then** slides resize to fit the screen width and touch/swipe navigation works smoothly.

---

### Edge Cases

- What happens when the block contains zero items? The block should render nothing (empty state) without errors.
- What happens when all items have very different content heights? The carousel normalizes all slides to the same height, preventing layout shift during transitions.
- What happens if the page has multiple vertical-carousel blocks? Each instance should operate independently.
- What happens during rapid consecutive navigation (fast clicking/swiping)? Transitions should queue or debounce, not break the carousel state.

## Clarifications

### Session 2026-04-15

- Q: Should the carousel loop (wrap from last to first) or stop at ends? → A: Stop at ends — disable prev/next controls at boundaries.
- Q: What height strategy should the carousel container use? → A: Full viewport height (100vh — each slide fills the screen).
- Q: How should variable-height slides be handled? → A: Normalize all slides to the same height (consistent, prevents layout shift).
- Q: What transition animation type between slides? → A: Slide (vertical translate — content moves up/down).
- Q: Where should pagination indicators be placed? → A: Bottom (horizontal dots below the carousel, matching existing pattern).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The block MUST render as a vertical carousel where items transition along the vertical axis (top-to-bottom / bottom-to-top) using a slide (translate) animation. Each slide MUST occupy the full viewport height (100vh).
- **FR-002**: Each child element authored within the block MUST be treated as an individual slide.
- **FR-003**: The carousel MUST display one slide at a time as the active/visible item.
- **FR-004**: The carousel MUST provide navigation controls (previous/next) to move between slides. Controls MUST be disabled (not hidden) when at the first or last slide respectively (no looping).
- **FR-005**: The carousel MUST support touch/swipe gestures for vertical navigation on touch-enabled devices.
- **FR-006**: The carousel MUST include pagination indicators (horizontal bullet dots) positioned at the bottom of the carousel, matching the existing carousel pattern, showing the current position and total number of slides.
- **FR-007**: Transitions between slides MUST use a smooth vertical slide (translate) animation.
- **FR-008**: The carousel MUST be responsive, adapting to mobile, tablet, and desktop viewports.
- **FR-009**: The carousel MUST be keyboard-accessible (arrow keys for navigation).
- **FR-010**: When the carousel has only one item, navigation controls and pagination indicators MUST be hidden.
- **FR-011**: The block MUST follow the same conventions and structure as existing blocks on the site, integrating consistently with the project's component system.
- **FR-012**: The block MUST be configurable via Universal Editor with a component definition, model, and filter.

### Key Entities

- **Vertical Carousel (container)**: The parent block element that wraps all slides and provides the carousel behavior. Container height: 100vh. Attributes: navigation style, pagination visibility. Loop: disabled (stops at ends).
- **Slide (item)**: An individual content unit within the carousel. Each slide can contain authored content such as images, text, and links. Represents one "step" in the vertical sequence. All slides are normalized to the same height (100vh) regardless of content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can navigate through all slides using controls, keyboard, or touch gestures without encountering errors or broken states.
- **SC-002**: Slide transitions complete smoothly, with no visible content jumps or layout shifts during navigation.
- **SC-003**: The carousel renders correctly and remains fully navigable on viewports from 320px to 1920px wide.
- **SC-004**: Content authors can add, remove, and reorder items within the vertical carousel using Universal Editor with no manual code editing required.
- **SC-005**: Pages containing the vertical carousel load without additional perceptible delay compared to pages without it.

## Assumptions

- The vertical carousel will reuse the existing Swiper library already loaded by the project (via `scripts/main.js`), as it supports vertical orientation natively.
- Slides will support the same content types available in other AEM EDS blocks (text, images, links) — no new content types are needed.
- The carousel does not auto-play (no automatic slide transitions). Manual navigation only.
- Looping is disabled: the carousel stops at the first and last slides, with navigation controls disabled at boundaries (consistent with the existing horizontal carousel which also does not loop).
- The block follows the same authoring pattern as the existing carousel block: a parent container definition with child item definitions in the Universal Editor configuration.
- Accessibility follows WCAG 2.1 AA standards, consistent with the rest of the site.
