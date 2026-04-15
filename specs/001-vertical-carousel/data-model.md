# Data Model: Vertical Carousel

**Feature**: 001-vertical-carousel | **Date**: 2026-04-15

## Entities

### 1. Vertical Carousel (Container)

The parent block element that wraps all slides and orchestrates the carousel behavior.

| Property | Type | Description |
|----------|------|-------------|
| `block` | DOM Element | The block root element with class `vertical-carousel` |
| `children` | NodeList | Authored slide items (each `<div>` child = one slide) |
| `swiperInstance` | Swiper | The Swiper.js instance managing transitions |

**AEM EDS authored structure** (flat HTML delivered by the framework):
```html
<div class="vertical-carousel block" data-block-name="vertical-carousel">
  <div><!-- slide 1 row --><div><!-- slide 1 content cells --></div></div>
  <div><!-- slide 2 row --><div><!-- slide 2 content cells --></div></div>
  <div><!-- slide 3 row --><div><!-- slide 3 content cells --></div></div>
</div>
```

**Decorated structure** (after `decorate()` transforms the DOM):
```html
<div class="vertical-carousel block" data-block-name="vertical-carousel"
     role="region" aria-roledescription="carousel" aria-label="Carrossel vertical">
  <div class="swiper vc-swiper">
    <div class="swiper-wrapper">
      <div class="swiper-slide" role="group" aria-roledescription="slide" aria-label="Slide 1 de 3">
        <div class="vc-slide-content">
          <picture>...</picture>
          <div class="vc-slide-text">
            <h2>Title</h2>
            <p>Description</p>
            <a href="..." class="vc-cta">CTA Text</a>
          </div>
        </div>
      </div>
      <!-- more slides -->
    </div>
    <div class="vc-navigation">
      <button class="vc-button-prev" aria-label="Slide anterior">‹</button>
      <div class="vc-pagination"></div>
      <button class="vc-button-next" aria-label="Próximo slide">›</button>
    </div>
  </div>
</div>
```

**Validation rules**:
- If `children.length === 0`: render nothing (empty state, no errors)
- If `children.length === 1`: render single slide without navigation or pagination
- If `children.length >= 2`: render full carousel with navigation and pagination

**State transitions**:
```
[initialized] → decorate() → [decorated] → Swiper init → [active]
                                                          ↓
                                              [slide N] ←→ [slide N±1]
                                              (prev/next/swipe/keyboard/click)
```

### 2. Vertical Carousel Item (Slide)

An individual content unit within the carousel. Each slide displays authored content within a full-viewport-height area.

| Field | UE Component | valueType | Required | Description |
|-------|-------------|-----------|----------|-------------|
| `image` | `reference` | `string` | No | Slide background/hero image |
| `imageAlt` | `text` | `string` | No | Alt text for the image |
| `title` | `richtext` | `string` | No | Slide heading (supports rich text) |
| `description` | `richtext` | `string` | No | Slide body text (supports rich text) |
| `cta` | `aem-content` | — | No | Call-to-action link URL |
| `ctaText` | `text` | `string` | No | Call-to-action button label |

**AEM EDS cell mapping** (how authored fields become HTML cells):
```
Row N (slide N):
  Cell 0: image → <picture> element
  Cell 1: imageAlt → text node (used as alt attribute)
  Cell 2: title → <h2> or rich text HTML
  Cell 3: description → <p> or rich text HTML
  Cell 4: cta → <a> element
  Cell 5: ctaText → text node (used as link text)
```

**Validation rules**:
- All fields are optional — a slide can contain any combination
- If `image` is present but `imageAlt` is empty, the image renders with `alt=""`
- If `cta` is present but `ctaText` is empty, the link is not rendered
- If `ctaText` is present but `cta` is empty, the text is not rendered as a link

## Relationships

```
Vertical Carousel (1) ──contains──► (0..N) Vertical Carousel Item
```

- A carousel contains zero or more items
- Items exist only within a carousel (enforced by UE filter)
- Items are ordered — position determines slide sequence
- Each item renders independently — no inter-slide dependencies
