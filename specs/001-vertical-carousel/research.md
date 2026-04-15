# Research: Vertical Carousel

**Feature**: 001-vertical-carousel | **Date**: 2026-04-15

## R-001: Swiper Initialization Strategy

**Decision**: Initialize Swiper within the block's `decorate()` function using a DOM element reference (not a CSS selector string).

**Rationale**: The existing horizontal carousel in `scripts/main.js` uses `new Swiper('.swiper-container', {...})` which targets ALL elements matching that selector. If the vertical carousel also used `.swiper-container`, it would receive the horizontal config (multiple `slidesPerView`, `spaceBetween: 16`, horizontal direction). By passing a DOM element reference directly — `new Swiper(containerEl, {...})` — each instance gets its own config with zero risk of selector collision.

**Alternatives considered**:
- *Modify `main.js` to handle both carousels*: Violates Constitution Principle I (block self-containment) and increases coupling.
- *Use a different CSS class selector (e.g., `.vc-swiper`)*: Works but is fragile — another future `waitForElement` could still match. DOM element reference is the safest approach.

## R-002: Swiper Library Loading

**Decision**: The block will check for `window.Swiper` availability. If not present, it dynamically loads `scripts/swiper-bundle.js` before initialization. If present, it initializes immediately.

**Rationale**: Swiper (v10.3.1) is loaded lazily by `main.js` only when `.swiper-container` is detected on the page. When a page has the vertical carousel but NOT the horizontal carousel, Swiper won't be loaded by `main.js`. The block must handle this case. Using the `loadScript` utility from `scripts/aem.js` provides a promise-based approach consistent with the EDS framework.

**Alternatives considered**:
- *Always rely on `main.js` to load Swiper*: Fails when there's no horizontal carousel on the page. Would require modifying `main.js` (breaks self-containment).
- *Bundle a separate Swiper copy*: Adds unnecessary weight and violates Zero Dependencies principle.

## R-003: CSS Class Names for Swiper DOM

**Decision**: Use Swiper 10.x default class names (`swiper`, `swiper-wrapper`, `swiper-slide`) scoped inside the `.vertical-carousel` block selector, plus custom classes for navigation/pagination (`vc-button-prev`, `vc-button-next`, `vc-pagination`).

**Rationale**: Swiper 10.x defaults to `.swiper` (not `.swiper-container`). Using the standard classes means Swiper's built-in CSS applies correctly. Custom classes for nav/pagination prevent `main.js` from accidentally binding to them (it targets `.swiper-button-prev`, `.swiper-button-next`, `.brad-pagination`).

**Alternatives considered**:
- *Reuse `.swiper-container`, `.swiper-button-prev`, etc.*: High risk of conflict with `main.js` event binding and initialization.
- *All custom classes*: Requires overriding Swiper's internal class config — more brittle.

## R-004: Vertical Swiper Configuration

**Decision**: Use the following Swiper configuration for vertical mode:

```javascript
{
  direction: 'vertical',
  slidesPerView: 1,
  spaceBetween: 0,
  allowTouchMove: true,
  simulateTouch: true,
  speed: 500,
  keyboard: { enabled: true, onlyInViewport: true },
  pagination: { el: paginationEl, type: 'bullets', clickable: true },
  navigation: { nextEl: nextBtnEl, prevEl: prevBtnEl },
}
```

**Rationale**: `direction: 'vertical'` is Swiper's native vertical mode — it handles touch/swipe on the vertical axis, translates slides along Y, and disables nav buttons at boundaries (adds `swiper-button-disabled` class). `slidesPerView: 1` ensures one full-viewport slide at a time. `keyboard.onlyInViewport: true` prevents keyboard capture when the carousel is off-screen. `speed: 500` provides smooth transitions without being sluggish.

**Alternatives considered**:
- *Custom vanilla JS scroll-snap implementation*: Would avoid Swiper dependency but requires reimplementing touch handling, momentum, keyboard nav, pagination, and boundary detection. Much more code with more bugs.
- *CSS `scroll-snap-type: y mandatory`*: Native but lacks pagination indicators, boundary-aware nav buttons, and programmatic navigation. No disabled state for controls.

## R-005: 100vh Slide Height Strategy

**Decision**: Set both the Swiper container and each slide to `height: 100vh`. Use `overflow: hidden` on the container to clip off-screen slides.

**Rationale**: The spec requires full-viewport-height slides (clarification session). Swiper in vertical mode with `slidesPerView: 1` and fixed height naturally handles this. All slides are normalized to the same height, preventing layout shift (per edge case requirement).

**Alternatives considered**:
- *`100dvh` (dynamic viewport height)*: Better for mobile (accounts for browser chrome), but browser support is slightly narrower. Could be added as a progressive enhancement via `height: 100vh; height: 100dvh;`.

## R-006: Single-Item Behavior

**Decision**: Check `block.children.length` after decoration. If only 1 item, hide navigation controls and pagination by not creating those elements. Set `allowTouchMove: false` on the Swiper config.

**Rationale**: FR-010 requires hiding controls when there's a single item. The simplest approach is to conditionally skip creating nav/pagination DOM when only one slide exists. This also avoids initializing Swiper unnecessarily for a single static slide.

**Alternatives considered**:
- *Always create controls, hide with CSS*: Adds unnecessary DOM and requires CSS-only detection of slide count. JS-based approach is cleaner.

## R-007: Navigation Boundary Behavior

**Decision**: Rely on Swiper's built-in boundary handling. By default (no `loop: true`), Swiper disables navigation at boundaries by adding the `swiper-button-disabled` class to prev/next buttons.

**Rationale**: The spec explicitly requires "stop at ends — disable prev/next controls at boundaries" (clarification session). This is Swiper's default behavior — no extra code needed. The CSS will style the disabled state (reduced opacity, no pointer events).

**Alternatives considered**: None needed — Swiper's default matches the requirement exactly.

## R-008: Debouncing Rapid Navigation

**Decision**: Rely on Swiper's built-in transition locking. Swiper ignores navigation inputs during an active transition by default.

**Rationale**: The edge case requirement says "Transitions should queue or debounce, not break the carousel state." Swiper's `speed: 500` transition duration naturally gates inputs — new slide transitions don't fire until the current animation completes.

**Alternatives considered**:
- *Custom debounce wrapper*: Unnecessary since Swiper handles this natively.

## R-009: Accessibility (WCAG 2.1 AA)

**Decision**: Add ARIA attributes to the carousel: `role="region"`, `aria-roledescription="carousel"`, `aria-label` on the container. Each slide gets `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide X of N"`. Navigation buttons get descriptive `aria-label` attributes. Pagination bullets are clickable with keyboard focus.

**Rationale**: FR-009 requires keyboard accessibility and the spec assumes WCAG 2.1 AA compliance. Swiper provides keyboard navigation but ARIA attributes must be added manually. The carousel ARIA pattern follows WAI-ARIA Authoring Practices.

**Alternatives considered**: None — ARIA attributes are the standard approach.

## R-010: Universal Editor Item Model Fields

**Decision**: The vertical-carousel-item model will have these fields: `image` (reference), `imageAlt` (text), `title` (richtext), `description` (richtext), `cta` (aem-content), `ctaText` (text).

**Rationale**: The spec says slides support "images, text, and links" — these 6 fields cover the common content combinations. Field naming follows the AEM EDS conventions from the constitution (`image` + `imageAlt`, `cta` + `ctaText`). The model is intentionally simpler than the horizontal carousel-card (which has 9 fields for its specific video/QR use case).

**Alternatives considered**:
- *Replicate the carousel-card model*: Overly specific — the vertical carousel has different content needs.
- *Fewer fields (image + text only)*: Too restrictive — authors need CTA links for actionable slides.
