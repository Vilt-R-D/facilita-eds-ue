# Contract: DOM Structure

**Feature**: 001-vertical-carousel | **Date**: 2026-04-15

This document defines the DOM contract between the AEM EDS framework (input) and the vertical-carousel block's `decorate()` function (output).

## Input: Authored HTML from AEM

The AEM EDS framework delivers the block as a flat table-like structure:

```html
<div class="vertical-carousel">
  <!-- Slide 1 -->
  <div>
    <div><picture><img src="/media/slide1.jpg"></picture></div>
    <div>Alt text for slide 1</div>
    <div><h2>Slide 1 Title</h2></div>
    <div><p>Slide 1 description text.</p></div>
    <div><a href="/page-link">Link</a></div>
    <div>CTA Label</div>
  </div>
  <!-- Slide 2 -->
  <div>
    <div><picture><img src="/media/slide2.jpg"></picture></div>
    <div>Alt text for slide 2</div>
    <div><h2>Slide 2 Title</h2></div>
    <div><p>Slide 2 description text.</p></div>
    <div><a href="/another-link">Link</a></div>
    <div>Another CTA</div>
  </div>
</div>
```

Each top-level `<div>` child = one slide row.
Each nested `<div>` child = one field cell (in model field order).

## Output: Decorated DOM

After `decorate(block)` transforms the structure:

```html
<div class="vertical-carousel block" data-block-name="vertical-carousel"
     role="region" aria-roledescription="carousel" aria-label="Carrossel vertical">
  <div class="swiper vc-swiper">
    <div class="swiper-wrapper">

      <div class="swiper-slide" role="group" aria-roledescription="slide"
           aria-label="Slide 1 de 2">
        <div class="vc-slide-content">
          <picture>
            <source type="image/webp" srcset="..." media="(min-width: 600px)">
            <source type="image/webp" srcset="...">
            <img src="/media/slide1.jpg" alt="Alt text for slide 1" loading="lazy">
          </picture>
          <div class="vc-slide-text">
            <h2>Slide 1 Title</h2>
            <p>Slide 1 description text.</p>
            <a href="/page-link" class="vc-cta">CTA Label</a>
          </div>
        </div>
      </div>

      <div class="swiper-slide" role="group" aria-roledescription="slide"
           aria-label="Slide 2 de 2">
        <div class="vc-slide-content">
          <picture>...</picture>
          <div class="vc-slide-text">
            <h2>Slide 2 Title</h2>
            <p>Slide 2 description text.</p>
            <a href="/another-link" class="vc-cta">Another CTA</a>
          </div>
        </div>
      </div>

    </div>

    <!-- Navigation (hidden when single slide) -->
    <div class="vc-navigation">
      <button class="vc-button-prev" aria-label="Slide anterior">
        <span class="vc-nav-icon">&#8249;</span>
      </button>
      <div class="vc-pagination"></div>
      <button class="vc-button-next" aria-label="Próximo slide">
        <span class="vc-nav-icon">&#8250;</span>
      </button>
    </div>
  </div>
</div>
```

## CSS Class Reference

| Class | Element | Purpose |
|-------|---------|---------|
| `.vertical-carousel` | Block root | Main block selector (auto-added by framework) |
| `.vc-swiper` | Swiper container | Swiper initialization target |
| `.swiper-wrapper` | Slides wrapper | Required by Swiper |
| `.swiper-slide` | Individual slide | Required by Swiper |
| `.vc-slide-content` | Slide inner wrapper | Layout container for image + text |
| `.vc-slide-text` | Text container | Groups title, description, CTA |
| `.vc-cta` | CTA link | Call-to-action styling |
| `.vc-navigation` | Nav container | Groups prev/pagination/next |
| `.vc-button-prev` | Previous button | Swiper navigation target |
| `.vc-button-next` | Next button | Swiper navigation target |
| `.vc-pagination` | Pagination dots | Swiper pagination target |
| `.vc-nav-icon` | Arrow icon span | Chevron icon inside nav buttons |
| `.swiper-button-disabled` | Nav buttons (auto) | Added by Swiper at boundaries |

## ARIA Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Block root | `role` | `region` |
| Block root | `aria-roledescription` | `carousel` |
| Block root | `aria-label` | `Carrossel vertical` |
| Each slide | `role` | `group` |
| Each slide | `aria-roledescription` | `slide` |
| Each slide | `aria-label` | `Slide {n} de {total}` |
| Prev button | `aria-label` | `Slide anterior` |
| Next button | `aria-label` | `Próximo slide` |
