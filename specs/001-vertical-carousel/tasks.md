# Tasks: Vertical Carousel

**Input**: Design documents from `/specs/001-vertical-carousel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated test suite in this project. Validation is manual via `aem up` (localhost:3000).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Create the block directory structure

- [x] T001 Create `blocks/vertical-carousel/` directory for block files

---

## Phase 2: Foundational (Universal Editor Configuration)

**Purpose**: UE configuration and section registration — MUST be complete before block implementation

**Why blocking**: The block cannot be authored or inserted into pages via Universal Editor without these files. The `npm run build:json` merge must succeed before any manual testing.

- [x] T002 [P] Create `blocks/vertical-carousel/_vertical-carousel.json` with component definitions (container `vertical-carousel` + item `vertical-carousel-item`), models (empty container model, item model with 6 fields: image, imageAlt, title, description, cta, ctaText), and filter (only `vertical-carousel-item` inside container) per `contracts/universal-editor.md`
- [x] T003 [P] Add `"vertical-carousel"` to the section filter `components` array in `models/_section.json`
- [x] T004 Run `npm run build:json` and verify root JSON files (`component-definition.json`, `component-models.json`, `component-filters.json`) include vertical-carousel entries

**Checkpoint**: Universal Editor configuration ready — block can be authored in UE after implementation

---

## Phase 3: User Story 1 + User Story 2 — Core Block (Priority: P1) MVP

**Goal**: Fully working vertical carousel with content display and slide navigation (prev/next buttons, keyboard arrows, touch/swipe). Each slide renders authored content (image, text, CTA) at full viewport height with smooth vertical transitions. Navigation controls disabled at boundaries.

**Independent Test**: Load a page with a vertical-carousel block containing 3+ authored items via `aem up`. Verify: (1) each slide renders its content correctly, (2) prev/next buttons navigate vertically with smooth animation, (3) keyboard arrows navigate slides, (4) touch swipe navigates on mobile, (5) controls are disabled at first/last slide, (6) single-item block shows no controls, (7) empty block renders nothing.

### Implementation

- [x] T005 [P] [US2] Create base styles for container (`height: 100vh`, `overflow: hidden`), slides (`height: 100vh`), and content layout (`.vc-slide-content` with image + `.vc-slide-text` with title, description, CTA) in `blocks/vertical-carousel/vertical-carousel.css`
- [x] T006 [US2] Implement `decorate()` function scaffold: extract slide children from flat AEM HTML structure, return early if zero children (empty state) in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T007 [US2] Build Swiper-compatible DOM (`.swiper.vc-swiper` > `.swiper-wrapper` > `.swiper-slide` per slide) and render each slide's content cells (image with `createOptimizedPicture`, alt text, title, description, CTA link with `.vc-cta` class) per DOM contract in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T008 [US2] Preserve Universal Editor instrumentation by calling `moveInstrumentation()` from `scripts/scripts.js` when restructuring each slide's DOM in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T009 [US1] Implement Swiper loading: check `window.Swiper` availability, dynamically load `scripts/swiper-bundle.js` via script element if not present, return a promise in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T010 [US1] Create navigation controls (`.vc-navigation` container with `vc-button-prev`/`vc-button-next` buttons and `aria-label` attributes) and initialize Swiper with vertical config (`direction: 'vertical'`, `slidesPerView: 1`, `spaceBetween: 0`, `speed: 500`, `keyboard: { enabled: true, onlyInViewport: true }`, `navigation` with DOM element refs) using DOM element reference (not CSS selector) per R-001/R-004 in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T011 [US1] Style navigation buttons (absolute positioning, brand styling) and disabled state (`.swiper-button-disabled` with `opacity: 0.35`, `pointer-events: none`) in `blocks/vertical-carousel/vertical-carousel.css`
- [x] T012 [US1] [US2] Add ARIA attributes per R-009: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Carrossel vertical"` on block root; `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide N de M"` on each slide; `aria-label="Slide anterior"` / `aria-label="Proximo slide"` on nav buttons in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T013 [US1] [US2] Handle single-item case per R-006: when only 1 slide, skip creating navigation controls, do not initialize Swiper (render as static content) in `blocks/vertical-carousel/vertical-carousel.js`

**Checkpoint**: Core block is fully functional — slides display authored content, vertical navigation works via buttons/keyboard/touch, controls disabled at boundaries, single-item and empty states handled. This is a shippable MVP.

---

## Phase 4: User Story 3 — Visual Navigation Indicators (Priority: P2)

**Goal**: Pagination dots communicate current slide position and total count, and are clickable for direct navigation.

**Independent Test**: Load a vertical-carousel with 5+ items. Verify: (1) pagination bullets appear at the bottom, (2) first bullet is active on load, (3) active bullet updates on navigation, (4) clicking a bullet jumps directly to that slide.

### Implementation

- [x] T014 [US3] Add pagination element (`.vc-pagination` div inside `.vc-navigation`) and add Swiper pagination config (`el: paginationEl`, `type: 'bullets'`, `clickable: true`) to the Swiper initialization in `blocks/vertical-carousel/vertical-carousel.js`
- [x] T015 [US3] Style pagination bullets (horizontal layout, centered at bottom, active state highlight, clickable cursor) in `blocks/vertical-carousel/vertical-carousel.css`

**Checkpoint**: Pagination indicators visible and functional — visitors can see position and click to navigate

---

## Phase 5: User Story 4 — Responsive Behavior (Priority: P2)

**Goal**: Carousel adapts gracefully to mobile (< 768px), tablet (768px–1023px), and desktop (1024px+) viewports with appropriately sized content and touch-friendly controls.

**Independent Test**: Resize browser or use device emulation at 320px, 768px, 1024px, 1920px widths. Verify carousel renders correctly, slides fill available space, navigation controls are accessible, and touch/swipe works at all breakpoints.

### Implementation

- [x] T016 [US4] Add responsive styles with media queries at 768px and 1024px breakpoints for slide content layout, navigation control sizing, pagination positioning, and font scaling in `blocks/vertical-carousel/vertical-carousel.css`
- [x] T017 [US4] Add progressive enhancement for mobile viewport height (`height: 100vh; height: 100dvh`) on container and slides in `blocks/vertical-carousel/vertical-carousel.css`

**Checkpoint**: Carousel responsive across all target viewports (320px–1920px+)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all files

- [x] T018 Run `npm run lint` and fix any linting issues in `blocks/vertical-carousel/vertical-carousel.js` and `blocks/vertical-carousel/vertical-carousel.css`
- [x] T019 Run `npm run build:json` to verify final merged JSON output includes all vertical-carousel entries
- [x] T020 Run manual validation per `specs/001-vertical-carousel/quickstart.md` checklist using `aem up` at localhost:3000

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (directory exists) — BLOCKS all user stories
- **US1 + US2 (Phase 3)**: Depends on Phase 2 — core block implementation
- **US3 (Phase 4)**: Depends on Phase 3 — adds pagination to existing Swiper init
- **US4 (Phase 5)**: Depends on Phase 3 — adds responsive CSS (can run in parallel with Phase 4)
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 + US2 (P1)**: Can start after Foundational (Phase 2) — tightly coupled, share the same JS and CSS files
- **US3 (P2)**: Depends on US1+US2 completion — extends Swiper config and navigation DOM
- **US4 (P2)**: Depends on US1+US2 completion — extends CSS only. Can run in **parallel** with US3

### Within Phase 3 (US1 + US2)

- T005 (CSS) can run in parallel with T006 (JS scaffold) — different files
- T006 → T007 → T008: sequential (DOM transformation builds incrementally)
- T009 (Swiper loading) can start after T007 (DOM structure exists)
- T010 depends on T009 (Swiper must be loadable before init)
- T011 (nav CSS) can run in parallel with T010 (nav JS) — different files
- T012 (ARIA) depends on T007 + T010 (DOM and nav must exist)
- T013 (single-item) depends on T010 (must have full init to conditionally skip)

### Parallel Opportunities

- T002 and T003 (Phase 2): different JSON files, no dependencies
- T005 (CSS) and T006 (JS): different files in Phase 3
- T011 (nav CSS) and T010 (nav JS): different files
- Phase 4 (US3) and Phase 5 (US4): independent enhancements, can run concurrently

---

## Parallel Example: Phase 2 (Foundational)

```text
# These two tasks can run in parallel (different files):
Task T002: "Create _vertical-carousel.json in blocks/vertical-carousel/"
Task T003: "Add vertical-carousel to section filter in models/_section.json"

# Then sequentially:
Task T004: "Run npm run build:json and verify output" (depends on T002 + T003)
```

## Parallel Example: Phase 3 (Core Block)

```text
# CSS and JS scaffold can run in parallel:
Task T005: "Create base styles in vertical-carousel.css"
Task T006: "Implement decorate() scaffold in vertical-carousel.js"

# Nav CSS and nav JS can run in parallel:
Task T010: "Create navigation controls and init Swiper in vertical-carousel.js"
Task T011: "Style navigation buttons in vertical-carousel.css"
```

## Parallel Example: Phase 4 + Phase 5

```text
# US3 and US4 can run in parallel after Phase 3:
Task T014-T015: "Add pagination (US3) in vertical-carousel.js + .css"
Task T016-T017: "Add responsive styles (US4) in vertical-carousel.css"
```

---

## Implementation Strategy

### MVP First (Phase 1 → 2 → 3)

1. Complete Phase 1: Setup (create directory)
2. Complete Phase 2: Foundational (UE config + section filter + build:json)
3. Complete Phase 3: US1 + US2 (core block with navigation and content)
4. **STOP and VALIDATE**: Test block with 3+ slides via `aem up` — verify navigation, content, edge cases
5. This is a shippable MVP — carousel works with prev/next, keyboard, touch

### Incremental Delivery

1. Setup + Foundational → UE config ready
2. US1 + US2 → Core block works → **MVP shipped**
3. US3 → Pagination dots added → Enhanced navigation UX
4. US4 → Responsive polish → Full cross-device support
5. Polish → Lint clean, JSON verified, full checklist passed

### Single Developer Flow (Recommended)

Since all code lives in 3 files (`vertical-carousel.js`, `.css`, `_vertical-carousel.json`) + 1 modification (`_section.json`):

1. Phase 1 + 2: Setup and UE config (quick, ~5 min)
2. Phase 3: Core block — build JS and CSS together incrementally
3. Phase 4 + 5: Add pagination and responsive in the same pass
4. Phase 6: Lint, build, validate

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [US*] label maps task to specific user story for traceability
- US1 and US2 are combined in Phase 3 because they share the same files and are both P1
- Swiper is initialized via DOM element reference (not CSS selector) to avoid conflicts with existing horizontal carousel — see R-001
- Block must self-load Swiper when `window.Swiper` is unavailable — see R-002
- Custom CSS classes (`vc-*`) prevent conflicts with existing carousel in `main.js` — see R-003
- No auto-play, no looping — Swiper's default boundary behavior matches spec — see R-007/R-008
- Comments in Portuguese, code in English — per project conventions
