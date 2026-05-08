# Block Contract — Card Stack Teaser

This document fixes the schema, the authored DOM shape, the decorated DOM shape, and the public surface that other parts of the project (especially the Playwright spec and AEM EDS) can rely on.

## 1. Universal Editor schema (sketch)

The implementation must produce `blocks/card-stack-teaser/_card-stack-teaser.json` with three top-level arrays. Concrete content below is a reference shape — the `_*.json` is the source of truth post-implementation.

```jsonc
{
  "definitions": [
    {
      "title": "Card Stack Teaser",
      "id": "card-stack-teaser",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Card Stack Teaser",
              "model": "card-stack-teaser",
              "filter": "card-stack-teaser"
            }
          }
        }
      }
    },
    {
      "title": "Card",
      "id": "card-stack-teaser-card",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "Card",
              "model": "card-stack-teaser-card"
            }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "card-stack-teaser",
      "fields": [
        { "component": "richtext", "valueType": "string", "name": "title",   "label": "Título", "required": true },
        { "component": "richtext", "valueType": "string", "name": "text",    "label": "Texto",  "required": true },
        { "component": "aem-content",                       "name": "cta",     "label": "Link do CTA" },
        { "component": "text",     "valueType": "string", "name": "ctaText", "label": "Texto do CTA" }
      ]
    },
    {
      "id": "card-stack-teaser-card",
      "fields": [
        { "component": "reference", "valueType": "string", "name": "cardIcon", "label": "Ícone do Card" },
        { "component": "richtext", "valueType": "string", "name": "cardLabel", "label": "Texto do Card", "required": true },
        {
          "component": "select",    "valueType": "string", "name": "cardTheme", "label": "Tema do Card",
          "options": [
            { "name": "Branco",       "value": "white" },
            { "name": "Preto",        "value": "black" },
            { "name": "Verde Escuro", "value": "dark-green" },
            { "name": "Verde Claro",  "value": "light-green" }
          ]
        }
      ]
    }
  ],
  "filters": [
    { "id": "card-stack-teaser", "components": ["card-stack-teaser-card"] }
  ]
}
```

Section filter registration is already present in `models/_section.json` (line 81) — no change needed.

## 2. Authored DOM (input to `decorate`)

Universal Editor delivers the block as a flat `<div>` table. Field order in the partial determines column order; item-prefix grouping puts each card in its own row.

```html
<div class="card-stack-teaser block" data-block-name="card-stack-teaser">
  <!-- Block-level fields, one row per field group: -->
  <div>
    <div><!-- title richtext output --><p><strong>…</strong></p></div>
    <div><!-- text  richtext output --><p>…</p></div>
    <div><!-- cta   --><a href="/path">/path</a></div>
    <div><!-- ctaText --> Saiba mais </div>
  </div>
  <!-- One row per card item: -->
  <div>
    <div><!-- cardIcon  --><picture>…</picture></div>
    <div><!-- cardText  --> Texto curto </div>
    <div><!-- cardTheme --> black </div>
  </div>
  <div>
    <div><picture>…</picture></div>
    <div>…</div>
    <div>dark-green</div>
  </div>
  <!-- … N cards -->
</div>
```

`decorate(block)` must NOT assume any wrapping tag inside the per-field `<div>` cells beyond what richtext / `aem-content` / `reference` produce.

## 3. Decorated DOM (output)

```html
<div class="card-stack-teaser block" data-block-name="card-stack-teaser">
  <div class="card-stack-teaser__inner">
    <div class="card-stack-teaser__copy">
      <div class="card-stack-teaser__title">…</div>
      <div class="card-stack-teaser__text">…</div>
      <a class="card-stack-teaser__cta" href="/path">Saiba mais</a>
    </div>
    <div class="card-stack-teaser__stack" aria-roledescription="card stack">
      <div class="card-stack-teaser__card" data-theme="black"       data-position="0">
        <i class="card-stack-teaser__icon"><img src="…" alt=""></i>
        <p class="card-stack-teaser__card-text">Texto curto</p>
      </div>
      <div class="card-stack-teaser__card" data-theme="dark-green"  data-position="1">…</div>
      <!-- … -->
      <div class="card-stack-teaser__dots" role="group" aria-label="Navegação dos cards">
        <button type="button" class="card-stack-teaser__dot" aria-label="Avançar para o próximo card" aria-current="true"></button>
        <button type="button" class="card-stack-teaser__dot" aria-label="Avançar para o próximo card"></button>
        <!-- … one per card -->
      </div>
    </div>
  </div>
</div>
```

Notes:

- `data-position` is rewritten on each advance: position `0` is the visible top card.
- `aria-current="true"` moves to the dot matching the current top card.
- The `__dots` container is omitted entirely when `cardCount < 2` (FR-011).
- The `__stack` container is omitted entirely when `cardCount === 0` (Edge case "0 cards").

## 4. JavaScript public surface

```js
// blocks/card-stack-teaser/card-stack-teaser.js
export default async function decorate(block) { /* … */ }
```

- Default export only. No module-level state, no global side effects.
- `decorate` does not return a value the framework consumes; AEM EDS only checks for completion.
- All listeners attach to elements inside `block`; nothing is added to `document` or `window` except an optional `matchMedia` listener for the desktop/mobile boundary, which must be torn down on block removal (acceptable to leave for the page lifetime since blocks are not currently dismounted).

## 5. CSS contract

- File `blocks/card-stack-teaser/card-stack-teaser.css` is loaded automatically by the framework when the block is decorated.
- All rules MUST be scoped under `.card-stack-teaser` (or `.card-stack-teaser-container` for section-level wrapper layout, mirroring `.section.app-teaser-container`).
- Typography for richtext output uses `.card-stack-teaser p` — never the wrapper directly (prevents conflict with `.section h2` in `styles/styles.css`).
- The desktop/mobile breakpoint is `@media (min-width: 1024px)` (matches `styles/styles.css` `.desktop-only` / `.mobile-only` boundary at the 1023/1024 split).
- Theme palette tokens are declared as scoped CSS custom properties on `.card-stack-teaser__card[data-theme="…"]`. Concrete colour values come from the attachments at implementation time (Principle VII).

## 6. Test contract (Playwright)

Spec file: `tests/006-card-stack-teaser.ts`. One `test(...)` per user story in `spec.md` (currently five — US1 through US5). Tests target `${BASE_URL}/blocks/card-stack-teaser`. The locator strategy uses the block class hooks declared above (`__copy`, `__cta`, `__stack`, `__card`, `__dots`, `__dot`) plus visible role queries for accessibility assertions.

## 7. Out of scope (explicit)

- No swiper, no third-party carousel.
- No backwards advance, no dot-as-jump, no autoplay.
- No new CSS variables in `styles/styles.css` (block-scoped only).
- No edits to root-level `component-*.json` files (auto-merged from the partial).
