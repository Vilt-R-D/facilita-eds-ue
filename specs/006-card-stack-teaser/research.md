# Phase 0 Research — Card Stack Teaser

All `NEEDS CLARIFICATION` slots in plan.md were resolvable from the spec, the constitution, and existing project conventions. This file captures the supporting decisions.

## D1. Carousel mechanism

- **Decision**: Vanilla JS + CSS transform/transition. The block keeps an internal `currentIndex`, sets a `--active-index` CSS custom property (or class) on the stack, and the CSS handles the animation of each card based on its `data-position` (computed JS-side per click). One advance per click; while a transition is in flight, additional clicks set a single `pending` flag that fires once on `transitionend`.
- **Rationale**: Constitution Principle II forbids new dependencies; Principle III prefers cheap, GPU-accelerated work in the Lazy phase. CSS-driven animation gives 60 fps without a library and is easy to disable on mobile.
- **Alternatives considered**:
  - **Swiper** — already legacy in `scripts/main.js`; constitution explicitly forbids adding more usages.
  - **`Element.animate()` (WAAPI)** — works but adds branching for older browsers; not needed since the spec only asks for a simple "out to the right and back" animation.

## D2. Desktop vs mobile split

- **Decision**: Single authored DOM; layout swaps via `@media (min-width: 1024px)`. JS attaches dot/click listeners only when `window.matchMedia('(min-width: 1024px)').matches` is true at decorate time and re-checks on `change`.
- **Rationale**: Spec FR-004 mandates a non-carousel, vertical sequence on mobile; spec SC-007 requires no re-authoring across viewports. CSS-only layout swap is the cheapest option.
- **Alternatives considered**:
  - **JS reflow per viewport** — heavier and unnecessary; CSS already handles it.
  - **Two block variants** — would force authors to duplicate content. Rejected.

## D3. Card theme palette

- **Decision**: Four themes encoded as `data-theme` values on each rendered card: `black`, `dark-green`, `light-green`, `white`. Theme tokens declared once in `card-stack-teaser.css` as scoped CSS custom properties (`--cst-card-bg`, `--cst-card-fg`, `--cst-card-icon`). Default fallback applied JS-side when the authored value is missing or unrecognised: `white`.
- **Rationale**: Spec FR-013 + Clarification Q2 fix the closed list and the default. Data-attribute themes keep selectors flat and inside the block, satisfying Principle IV.
- **Alternatives considered**:
  - **CSS classes per theme (`.card--black` etc.)** — equivalent; data-attribute chosen for parity with the authored field value (one-to-one mapping is easier to read).
  - **Inline style overrides per card** — rejected, would couple JS to specific colours and break design-system token reuse.

## D4. Richtext typography scoping

- **Decision**: Style `<p>` elements emitted by the title and text richtext fields via `.card-stack-teaser p` (and any nested heading via `.card-stack-teaser h2/h3` only when needed). The wrapper itself receives layout-only styles.
- **Rationale**: Memory `feedback_richtext_paragraph_scoping.md` already records this rule for AEM EDS blocks: typography on the wrapper conflicts with `styles/styles.css`. This block therefore avoids the wrapper-level font/size declarations.
- **Alternatives considered**:
  - **Wrapper-level typography** — explicitly rejected by the memory and reproducible by inspecting `.section h2` cascade in `styles/styles.css`.

## D5. Accessibility model

- **Decision**:
  - Dots are `<button type="button">` elements inside a `<div role="tablist">`-style container, each with `aria-label="Avançar para o próximo card"` and the active dot carries `aria-current="true"`.
  - Cards in the stack are NOT focusable (`tabindex="-1"`, no native button) — clicking advances on mouse, but keyboard navigation goes through the dots only.
  - Enter / Space activate the focused dot via the native `<button>` semantics — no custom key handler needed.
- **Rationale**: Spec Clarification Q5 + FR-020 explicitly fix this contract.
- **Alternatives considered**:
  - **Cards as `<button>`** — rejected because it would duplicate the avance affordance and complicate the tab order.
  - **Dots as `<a>`** — rejected because they don't navigate; `<button>` is the correct semantic.

## D6. Attachment-handling policy (Constitution VII)

- **Decision**: Implementation tasks for `card-stack-teaser.js` and `card-stack-teaser.css` MUST be preceded by a `cacophony-fetch-attachment` call for each of the two attachments listed in the `cacophony:meta` block of `spec.md`:
  - `css-desktop.txt` (id `f777c771-2e76-4c84-af9b-f0a8e5c7d1c6`)
  - `css-mobile.txt` (id `09b19915-c033-43c8-bd07-60342d4aa03b`)
- Each fetched file is loaded with a single whole-file `Read` (no `offset` / `limit`) and its contents take precedence over inferred styling.
- **Rationale**: Constitution Principle VII (NON-NEGOTIABLE). Hard-gate: a fetch failure blocks the implementation phase; the model reports the failed attachment names verbatim.
- **Alternatives considered**: None — the principle has no fail-soft branch.

## D7. CTA implementation

- **Decision**: CTA is a single field pair on the block (`cta` = `aem-content` link, `ctaText` = plain text). The decorate function emits `<a class="card-stack-teaser-cta" href="…">…</a>` and inherits styling from the project's existing button tokens. No new button block is introduced.
- **Rationale**: Spec FR-015 + Assumption "the CTA usa o componente/estilo de botão do projeto"; AEM EDS naming convention (`cta` + `ctaText`) is documented in CLAUDE.md.
- **Alternatives considered**:
  - **Reuse the standalone `button` block via item filter** — adds authoring complexity and forces a separate component for what spec describes as part of the teaser.

## D8. Performance phase

- **Decision**: The block decorates during the Lazy phase. No assets loaded in Eager. Any icon `<picture>` uses `createOptimizedPicture` if the authored field returns a raster image; SVG references load as-is.
- **Rationale**: The teaser is below the fold for a typical landing page; Principle III mandates Lazy-phase decoration unless eager is required.
- **Alternatives considered**: None — eager phase reserved for the first section.
