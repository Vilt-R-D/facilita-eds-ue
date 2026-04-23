# Contract — Decorated DOM & Runtime Interface

**Feature**: `003-stack-carousel` | **Date**: 2026-04-22

This contract fixes the DOM structure, class names, `data-*` attributes, ARIA roles, and keyboard behaviour produced by `blocks/stack-carousel/stack-carousel.js`. The Playwright tests (`tests/003-stack-carousel.ts`) bind to these selectors — changing any of them is a contract change and requires updating the tests in lockstep.

---

## 1. Container after `decorate(block)` returns

```html
<div class="stack-carousel block" data-block-name="stack-carousel" ... (attrs set by AEM EDS) ...>
  <div class="stack-carousel-inner">

    <!-- 1a. Copy column (rendered iff heading present; CTA rendered iff both ctaLabel AND ctaLink present) -->
    <div class="stack-carousel-copy">
      <h2 class="stack-carousel-heading"><!-- heading richtext --></h2>
      <div class="stack-carousel-body"><!-- body richtext, optional --></div>
      <a class="stack-carousel-cta button" href="<ctaLink>"><!-- ctaLabel --></a>
    </div>

    <!-- 1b. Pile column -->
    <div class="stack-carousel-pile" role="group" aria-roledescription="carrossel de cards">
      <!-- Exactly one <article> per authored item; DOM order preserved across advances -->
      <article
        class="stack-card"
        data-index="0"
        data-bg="dark-green"
        data-layer="front"
        tabindex="0"
        role="button"
        aria-label="Avançar carrossel — <plain-text title>"
        aria-hidden="false"
      >
        <header class="stack-card-header">
          <i class="stack-card-icon"><!-- picture/img from icon field, omitted if absent --></i>
          <h3 class="stack-card-title"><!-- title richtext --></h3>
        </header>
        <div class="stack-card-description"><!-- description richtext, omitted if absent --></div>
      </article>
      <!-- ...N-1 more articles... -->
    </div>

    <!-- 1c. Pagination (rendered iff N ≥ 2; single-item blocks omit it) -->
    <nav class="stack-pagination" aria-label="Selecionar card">
      <button
        class="stack-dot"
        type="button"
        data-target-index="0"
        aria-label="Ir para o card 1"
        aria-current="true"
      >
        <span class="sr-only">Card 1</span>
      </button>
      <!-- ...N-1 more buttons... -->
    </nav>

  </div>
</div>
```

### Required attributes by position

| Element | Attribute | Values / constraints |
|---|---|---|
| `.stack-card` | `data-index` | `0 .. N-1`, matches authored order |
| `.stack-card` | `data-bg` | `black` \| `dark-green` \| `bright-green` \| `white` |
| `.stack-card` | `data-layer` | `front` \| `back-1` \| `back-2` \| `hidden` — exactly one `front` always |
| `.stack-card` | `data-phase` | **Transient only** — present while the card is mid-advance; values: `advancing-out`, `advancing-in`. Absent in idle state. |
| `.stack-card[data-layer="front"]` | `tabindex` | `0` |
| `.stack-card:not([data-layer="front"])` | `tabindex` | `-1` |
| `.stack-card:not([data-layer="front"])` | `aria-hidden` | `true` |
| `.stack-dot` | `data-target-index` | `0 .. N-1` |
| `.stack-dot[aria-current="true"]` | exactly one | Matches current `frontIndex` |

---

## 2. Interaction contract

### 2.1 Click / Enter / Space on the front card

1. If `isAdvancing` is `true`, return early.
2. Set `isAdvancing = true`.
3. On the front card: set `data-phase="advancing-out"`, then on the next animation frame set `data-layer="hidden"` (this triggers CSS that runs phase 1 — translate to the right, z-index above the pile).
4. Simultaneously rotate the other cards' `data-layer` values one step forward (`back-1` → `front`, `back-2` → `back-1`, first `hidden` → `back-2`).
5. When `transitionend` fires on the outgoing card for the `transform` property (phase 1 end), set `data-phase="advancing-in"` and re-apply `data-layer="back-2"` (this triggers phase 2 — return from the right and settle at the back).
6. When `transitionend` fires for phase 2, remove `data-phase`, update `frontIndex`, update `aria-current` on the matching dot, update `tabindex`/`aria-hidden` on all cards.
7. If the advance was triggered by keyboard activation, call `.focus()` on the new front card (D8).
8. Set `isAdvancing = false`.

### 2.2 Click / Enter / Space on a pagination dot

1. If `isAdvancing` is `true`, return early.
2. Read `targetIndex = parseInt(event.currentTarget.dataset.targetIndex, 10)`.
3. If `targetIndex === frontIndex`, return (no-op).
4. Compute `deltaForward = (targetIndex − frontIndex + N) mod N`, `deltaBackward = N − deltaForward`.
5. If `deltaForward ≤ deltaBackward`, run the **forward** single-advance animation (same as 2.1) but rotate by `deltaForward` steps atomically; else run the **backward** mirrored animation rotating by `deltaBackward` steps. Single animation, not chained — the outgoing / incoming cards are the direct source and target of the jump.
6. Post-animation, update `frontIndex = targetIndex`, `aria-current` on the new dot, `tabindex`/`aria-hidden` on cards.

### 2.3 Reduced motion

`@media (prefers-reduced-motion: reduce)` forces near-zero transition durations (see research D7). The state machine above is unchanged.

---

## 3. Edge-case contract

| Case | Required behaviour |
|---|---|
| **0 items** | Render copy column only; omit pile and pagination entirely. |
| **1 item** | Render the one card with `data-layer="front"`. Omit pagination. Click/keyboard on it is a no-op (the handler sees N === 1 and returns). |
| **2 items** | Render both; one `front`, one `back-1`. No `back-2`. Advance swaps them via the two-phase animation. Pagination has 2 dots. |
| **N ≥ 3 items** | Render all N cards in DOM; exactly one `front`, one `back-1`, one `back-2`, rest `hidden`. Pagination has N dots. |
| **Missing icon** | Omit `<i class="stack-card-icon">`. |
| **Missing description** | Omit `<div class="stack-card-description">`. |
| **Missing `ctaLabel` or `ctaLink`** | Omit `<a class="stack-carousel-cta">`. |
| **Unknown `bgColor` value** | Treat as `white` (no crash). |
| **Rapid second click during animation** | Ignored (guarded by `isAdvancing`). |

---

## 4. Selectors available to Playwright (stable API)

The tests in `tests/003-stack-carousel.ts` MAY use:

- `.stack-carousel.block` — the block root.
- `.stack-card[data-layer="front"]` — the single currently-front card.
- `.stack-card[data-layer="back-1"]`, `.stack-card[data-layer="back-2"]` — back layers.
- `.stack-card[data-layer="hidden"]` — non-painted cards.
- `.stack-card[data-phase="advancing-out"]` / `[data-phase="advancing-in"]` — transient animation-state assertions.
- `.stack-dot[aria-current="true"]` — the currently-active dot.
- `.stack-dot[data-target-index="<n>"]` — a specific dot.
- `.stack-carousel-heading`, `.stack-carousel-body`, `.stack-carousel-cta`, `.stack-pagination`.

Tests MUST NOT rely on:
- Specific `<div>` nesting levels before decoration completes (AEM renders authoring tables before JS runs).
- Inline styles for colors or transforms (these are CSS-driven).
- Class name substrings not listed above.

---

## 5. Accessibility contract

- The pile has `role="group"` and `aria-roledescription="carrossel de cards"`.
- The front card has `role="button"` + `tabindex="0"`; it MUST be activatable by mouse click, Enter, and Space.
- Non-front cards have `tabindex="-1"` and `aria-hidden="true"`.
- Pagination dots are native `<button type="button">` elements with descriptive `aria-label`s and, on the active dot, `aria-current="true"`.
- After a keyboard-initiated advance, focus MUST move to the new front card (D8).
- The `sr-only` class used on dot inner text MUST be defined (either in block CSS or by reusing an existing utility from `styles/styles.css`).

---

## 6. Performance contract

- LCP on a page hosting only this block MUST NOT regress by more than 50 ms vs. an empty-section control (measured on the feature preview in DevTools Performance panel).
- Advance animation total duration ≤ 600 ms (SC-003).
- During the animation, `performance.now()` deltas sampled at each `requestAnimationFrame` MUST be ≤ 33 ms for ≥ 90 % of frames (≥ 30 fps, SC-003). This is not asserted by Playwright but is a manual pre-merge check.
- No synchronous network calls from `decorate()`.
