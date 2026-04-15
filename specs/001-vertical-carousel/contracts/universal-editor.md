# Contract: Universal Editor Configuration

**Feature**: 001-vertical-carousel | **Date**: 2026-04-15

This document defines the Universal Editor JSON contract for the vertical-carousel block. The actual `_vertical-carousel.json` file will implement this contract.

## Component Definitions

### Vertical Carousel (Container)

```json
{
  "title": "Vertical Carousel",
  "id": "vertical-carousel",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "Vertical Carousel",
          "model": "vertical-carousel",
          "filter": "vertical-carousel"
        }
      }
    }
  }
}
```

### Vertical Carousel Item (Slide)

```json
{
  "title": "Vertical Carousel Item",
  "id": "vertical-carousel-item",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block/item",
        "template": {
          "name": "Vertical Carousel Item",
          "model": "vertical-carousel-item"
        }
      }
    }
  }
}
```

## Component Models

### vertical-carousel (Container Model)

```json
{
  "id": "vertical-carousel",
  "fields": []
}
```

No container-level configuration fields. The carousel behavior is fixed per spec (no looping, 100vh slides, vertical direction).

### vertical-carousel-item (Item Model)

```json
{
  "id": "vertical-carousel-item",
  "fields": [
    {
      "component": "reference",
      "valueType": "string",
      "name": "image",
      "label": "Imagem",
      "multi": false
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "imageAlt",
      "label": "Texto alternativo da imagem"
    },
    {
      "component": "richtext",
      "valueType": "string",
      "name": "title",
      "label": "Título"
    },
    {
      "component": "richtext",
      "valueType": "string",
      "name": "description",
      "label": "Descrição"
    },
    {
      "component": "aem-content",
      "name": "cta",
      "label": "Link do CTA"
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "ctaText",
      "label": "Texto do CTA"
    }
  ]
}
```

## Component Filters

```json
{
  "id": "vertical-carousel",
  "components": ["vertical-carousel-item"]
}
```

Only `vertical-carousel-item` components are allowed inside a `vertical-carousel` container.

## Section Registration

The `vertical-carousel` component must be added to the section filter in `models/_section.json`:

```json
{
  "id": "section",
  "components": [
    "text", "image", "button", "title", "hero", "cards", "columns",
    "fragment", "carousel", "card-grid", "show-only", "app-teaser",
    "footer", "teaser", "fale-com-a-bia",
    "vertical-carousel"
  ]
}
```

## Conventions Followed

- Field naming: `image` + `imageAlt` (per constitution V)
- Field naming: `cta` + `ctaText` (per constitution V)
- Container `resourceType`: `core/franklin/components/block/v1/block`
- Item `resourceType`: `core/franklin/components/block/v1/block/item`
- Labels in Portuguese (site language)
- Filter auto-discovered via `../blocks/*/_*.json#/filters` glob in `models/_component-filters.json`
