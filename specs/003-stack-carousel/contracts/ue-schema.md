# Contract — Universal Editor Schema (`_stack-carousel.json`)

**Feature**: `003-stack-carousel` | **Date**: 2026-04-22

This contract pins the exact shape of the `_stack-carousel.json` partial that will be merged by `npm run build:json` into the root `component-definition.json`, `component-models.json`, and `component-filters.json`. Any change to this contract MUST be reflected in the partial and vice versa. Root-level JSON files are regenerated — **never edit them by hand** (Constitution V).

---

## Required partial structure

The partial MUST contain exactly these three top-level keys: `definitions`, `models`, `filters`.

### `definitions` (2 entries)

```json
{
  "definitions": [
    {
      "title": "Stack Carousel",
      "id": "stack-carousel",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Stack Carousel",
              "model": "stack-carousel",
              "filter": "stack-carousel"
            }
          }
        }
      }
    },
    {
      "title": "Stack Carousel Item",
      "id": "stack-carousel-item",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "Stack Carousel Item",
              "model": "stack-carousel-item"
            }
          }
        }
      }
    }
  ]
}
```

**Invariants**:
- Container definition MUST use `core/franklin/components/block/v1/block`.
- Item definition MUST use `core/franklin/components/block/v1/block/item`.
- Container's `template.filter` MUST equal `stack-carousel` (see `filters` below).

### `models` (2 entries)

```json
{
  "models": [
    {
      "id": "stack-carousel",
      "fields": [
        {
          "component": "richtext",
          "valueType": "string",
          "name": "heading",
          "label": "Título",
          "required": true
        },
        {
          "component": "richtext",
          "valueType": "string",
          "name": "body",
          "label": "Texto de apoio",
          "required": false
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "ctaLabel",
          "label": "Texto do botão",
          "required": false
        },
        {
          "component": "aem-content",
          "name": "ctaLink",
          "label": "Link do botão",
          "required": false
        }
      ]
    },
    {
      "id": "stack-carousel-item",
      "fields": [
        {
          "component": "richtext",
          "valueType": "string",
          "name": "title",
          "label": "Título do card",
          "required": true
        },
        {
          "component": "richtext",
          "valueType": "string",
          "name": "description",
          "label": "Texto do card",
          "required": false
        },
        {
          "component": "reference",
          "valueType": "string",
          "name": "icon",
          "label": "Ícone do card",
          "multi": false,
          "required": false
        },
        {
          "component": "select",
          "valueType": "string",
          "name": "bgColor",
          "label": "Cor de fundo do card",
          "required": true,
          "options": [
            { "name": "Preto", "value": "black" },
            { "name": "Verde escuro", "value": "dark-green" },
            { "name": "Verde claro", "value": "bright-green" },
            { "name": "Branco", "value": "white" }
          ]
        }
      ]
    }
  ]
}
```

**Invariants**:
- Field names MUST match these exact strings — the decorate function reads by position (cell order) but tests and authoring docs reference these names.
- Field order MUST match the order above — authored cells arrive in this order inside the block's child `<div>` table.
- `bgColor.options` MUST contain exactly these four options; adding new colors is a **minor** schema change and requires a plan update.

### `filters` (1 entry)

```json
{
  "filters": [
    {
      "id": "stack-carousel",
      "components": ["stack-carousel-item"]
    }
  ]
}
```

**Invariants**:
- The filter id MUST match the container definition's `template.filter`.
- `components` MUST contain **only** `stack-carousel-item` — no other block-items are valid children.

---

## Section filter registration (edit to `models/_section.json`)

Append `"stack-carousel"` to the `filters[0].components` array of `models/_section.json` (alphabetical placement preferred, not required). After this change, authors can drop the block into any section.

```diff
 {
   "id": "section",
   "components": [
     "text",
     "image",
     ...,
+    "stack-carousel",
     "teaser",
     "fale-com-a-bia"
   ]
 }
```

This is the **only** file outside `blocks/stack-carousel/` and `tests/` that this feature modifies.

---

## Automated regeneration

After editing `blocks/stack-carousel/_stack-carousel.json` (or `models/_section.json`), a committer runs `npm run build:json` — or lets the Husky pre-commit hook run it automatically when `_*.json` files are staged — to regenerate:

- `component-definition.json`
- `component-models.json`
- `component-filters.json`

Those three files MUST NOT be edited by hand (Constitution V).

---

## Validation checklist (applied by the reviewer before merge)

- [ ] `_stack-carousel.json` contains exactly two `definitions` and two `models` with the ids above.
- [ ] Container's `template.filter` == `stack-carousel`, filter entry lists exactly `["stack-carousel-item"]`.
- [ ] `bgColor` options are exactly the four values documented above.
- [ ] Root `component-definition.json`, `component-models.json`, `component-filters.json` regenerated by `npm run build:json` (not hand-edited).
- [ ] `models/_section.json` filter contains `"stack-carousel"`.
- [ ] Author can drop a `Stack Carousel` block into a section in UE and add `Stack Carousel Item` children inside it.
