# Phase 1 — Data Model: Stack Carousel Block

**Feature**: `003-stack-carousel` | **Date**: 2026-04-22

There is no persistent data store for this feature. "Data model" here means the **authoring model** exposed in Universal Editor via `_stack-carousel.json`, plus the **runtime model** held in-memory by the decorate function. Both shapes are captured below so the implementation contract is unambiguous.

---

## Entity 1 — Stack Carousel (block container)

The container placed by the author. Holds the companion copy plus an ordered list of `Stack Carousel Item` children.

### Authoring fields (UE model id: `stack-carousel`)

| Field | UE component | Value type | Required | Notes |
|---|---|---|---|---|
| `heading` | `richtext` | string | Yes | Section heading rendered in the left copy column (desktop) / top copy area (mobile). |
| `body` | `richtext` | string | No | Supporting paragraph under the heading. May include inline links. Renders only if authored. |
| `ctaLabel` | `text` | string | No | Visible label of the CTA button. If absent, CTA is not rendered (Edge Case). |
| `ctaLink` | `aem-content` | string | No | Target URL of the CTA. If absent, CTA is not rendered (Edge Case). |

The block definition registers `resourceType: core/franklin/components/block/v1/block`, `template.model: stack-carousel`, `template.filter: stack-carousel`.

### Children

Zero or more `Stack Carousel Item` children (see Entity 2). Author order determines front-to-back position at first render and the advance cycle order. **Upper bound: 6 items** (FR-015); exceeding this is out of scope for v1 — the UE model SHOULD expose this constraint via a model-level `maxItems: 6` hint where supported, and the reviewer checklist backs it up manually.

### Validation rules

- **0 items**: Renders a copy-only layout (heading + optional body + optional CTA). No pile. Does not throw. *(Implementation note — the spec's FR-011 only mandates 1+, but a 0-item case is trivially the "copy with empty pile" state and should not break.)*
- **1 item**: Renders front-only, no back layers, click is a no-op (spec Edge Case: single item).
- **2 items**: Renders front + 1 back layer, advance swaps them (spec Edge Case: two items).
- **3–6 items**: Renders front + 2 back layers, extras rotate into the visible slots on advance (FR-014).
- **Missing optional item fields**: Item still renders; absent slot is omitted from the DOM (FR-011 / Edge Case).
- **Missing `ctaLabel` or `ctaLink`**: CTA button is not rendered; heading + body still render.

### State transitions (runtime)

Block-level state, held as closure variables inside `decorate(block)`:

- `frontIndex: number` — index of the item currently at the front. Starts at `0`. Always `0 ≤ frontIndex < N`.
- `isAdvancing: boolean` — guard flag. `true` while a phase-1/phase-2 animation is in flight. While `true`, all click / keyboard / dot activations return early.

Transitions:

```
idle --(click front OR Enter/Space on front OR dot click)--> advancing
advancing --(transitionend of phase-2)--> idle, frontIndex = (frontIndex ± delta + N) mod N
```

For pagination dots the `delta` is `min(deltaForward, deltaBackward)`, forward when tied (per D3).

---

## Entity 2 — Stack Carousel Item

A single card in the pile.

### Authoring fields (UE model id: `stack-carousel-item`)

| Field | UE component | Value type | Required | Notes |
|---|---|---|---|---|
| `title` | `richtext` | string | Yes | Card title, rendered as an `<h3>` inside the card. |
| `description` | `richtext` | string | No | Supporting text under the title. Omitted from DOM if absent. |
| `icon` | `reference` | string | No | Icon asset reference — same pattern as `carousel-card.icon` / `card.card-icon`. Rendered in the card header. |
| `bgColor` | `select` | string | Yes | One of `black`, `dark-green`, `bright-green`, `white`. Defaults to `white` if authoring produced an unexpected value. |

The item definition registers `resourceType: core/franklin/components/block/v1/block/item`, `template.model: stack-carousel-item`.

### Validation rules

- `bgColor` MUST be one of the four enum values; any other value falls back to `white` and the implementation MAY log a console warning in author mode only.
- `title` is required; an item with no title is malformed authoring — the block MAY render an empty `<h3>` to avoid a layout jump, but MUST NOT throw.
- `icon` and `description` are both optional and degrade gracefully (Edge Case: "Missing optional fields on an item").

### Relationships

- Belongs to exactly one `stack-carousel` block (via UE filter `stack-carousel → [stack-carousel-item]`).
- Has an implicit **position** attribute equal to its zero-based index within the block's child list; re-ordering in UE changes this index and therefore the cycle order (FR-005, Acceptance Scenario 3.3).

### Runtime representation

Each authored item is transformed into:

```html
<article
  class="stack-card"
  data-index="0"
  data-bg="dark-green"
  data-layer="front"       <!-- one of: front | back-1 | back-2 | hidden -->
  tabindex="0"              <!-- "-1" when data-layer != "front" -->
  role="button"
  aria-label="Avançar carrossel — <title>"
  aria-hidden="false"       <!-- "true" when data-layer != "front" -->
>
  <header>
    <i class="stack-card-icon"><!-- icon picture/img --></i>
    <h3><!-- title --></h3>
  </header>
  <p class="stack-card-description"><!-- description --></p>
</article>
```

Only the attributes of the current `front` card are interactive; siblings are made inert and hidden from AT until they rotate forward.

---

## Entity 3 — Runtime-only helper entities (not authored)

### Pagination dot

Rendered by the decorate function, one per authored item:

```html
<button
  class="stack-dot"
  type="button"
  data-target-index="0"
  aria-label="Ir para o card 1"
  aria-current="true"       <!-- only on the dot that matches frontIndex -->
>
  <span class="sr-only">Card 1</span>
</button>
```

Dots are re-derived from the items list on decorate; they are not authored entities.

### Container shape

```html
<div class="stack-carousel block" data-block-name="stack-carousel" ...>
  <div class="stack-carousel-inner">
    <div class="stack-carousel-copy">
      <h2><!-- heading --></h2>
      <div class="stack-carousel-body"><!-- body --></div>
      <a class="stack-carousel-cta button" href="..."><!-- ctaLabel --></a>
    </div>
    <div class="stack-carousel-pile" role="group" aria-roledescription="carrossel de cards">
      <article class="stack-card" ...></article>
      <!-- one per authored item; N cards total -->
    </div>
    <nav class="stack-pagination" aria-label="Selecionar card">
      <button class="stack-dot" ...></button>
      <!-- one per authored item -->
    </nav>
  </div>
</div>
```

The outer `.stack-carousel.block` element is supplied by AEM EDS; the decorate function replaces its children with the `stack-carousel-inner` structure.

---

## Invariants (enforced by implementation + tests)

| Invariant | Source | Verified by |
|---|---|---|
| Exactly one card has `data-layer="front"` at all times (outside the brief animation window). | D2 | US2 Playwright test |
| After N advances (N = item count), `frontIndex` returns to its initial value. | FR-005 | US1 Playwright test |
| The dot with `aria-current="true"` always corresponds to the card with `data-layer="front"`. | FR-006 | US1 Playwright test |
| Non-front cards are inert: `tabindex="-1"` AND `aria-hidden="true"`. | D8, FR-009 | US2 Playwright test |
| No horizontal overflow at 375 px or ≥1280 px. | FR-008 | US2 Playwright test |
| Activating an already-active dot does nothing (no animation, no state change). | FR-006 | US1 Playwright test |
| At most 3 cards visually painted at once (`front`, `back-1`, `back-2`). | FR-014 | US2 Playwright test (count assertions) |
| Item authoring cap is ≤ 6. | FR-015 | Documented in UE schema + manual reviewer check |
