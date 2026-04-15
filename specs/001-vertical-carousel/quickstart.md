# Quickstart: Vertical Carousel

**Feature**: 001-vertical-carousel | **Date**: 2026-04-15

## Prerequisites

- Node.js installed
- `@adobe/aem-cli` installed globally (`npm install -g @adobe/aem-cli`)
- Repository cloned and on the `001-vertical-carousel` branch

## Local Development

```bash
# Instalar dependências
npm install

# Iniciar servidor local
aem up
# Acesse http://localhost:3000
```

## Files to Create

### 1. `blocks/vertical-carousel/vertical-carousel.js`

Block decoration logic. Key responsibilities:
- Extract slide children from the flat AEM HTML structure
- Build Swiper-compatible DOM (`.swiper` > `.swiper-wrapper` > `.swiper-slide`)
- Add ARIA attributes for accessibility
- Load Swiper.js if not already available (`window.Swiper` check)
- Initialize Swiper with `direction: 'vertical'` config
- Handle single-item case (no navigation/pagination)
- Move Universal Editor instrumentation attributes with `moveInstrumentation()`

```javascript
// Estrutura básica do decorate
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const slides = [...block.children];
  if (slides.length === 0) return;

  // 1. Construir estrutura Swiper
  // 2. Transformar cada slide
  // 3. Adicionar navegação (se > 1 slide)
  // 4. Adicionar atributos ARIA
  // 5. Carregar Swiper se necessário
  // 6. Inicializar Swiper com direction: 'vertical'
}
```

### 2. `blocks/vertical-carousel/vertical-carousel.css`

Scoped styles. Key aspects:
- `.vertical-carousel` container: `height: 100vh; overflow: hidden`
- `.swiper-slide`: `height: 100vh` (all slides same height)
- Navigation buttons: absolute positioned, styled per brand
- Pagination dots: horizontal at bottom
- Responsive: media query at 768px and 1024px
- Disabled state: `.swiper-button-disabled { opacity: 0.35; pointer-events: none }`

### 3. `blocks/vertical-carousel/_vertical-carousel.json`

Universal Editor configuration:
- **Definitions**: `vertical-carousel` (container) + `vertical-carousel-item` (item)
- **Models**: Empty container model, item model with 6 fields (image, imageAlt, title, description, cta, ctaText)
- **Filters**: Only `vertical-carousel-item` allowed inside `vertical-carousel`

See `contracts/universal-editor.md` for the full JSON schema.

## Files to Modify

### 4. `models/_section.json`

Add `"vertical-carousel"` to the section filter's `components` array so the block can be inserted into sections via Universal Editor.

## Key Patterns to Follow

### Swiper Initialization (self-contained in block)

```javascript
// Verificar se Swiper já está carregado
function ensureSwiper() {
  if (window.Swiper) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `${window.hlx.codeBasePath}/scripts/swiper-bundle.js`;
    script.onload = resolve;
    document.body.appendChild(script);
  });
}
```

### Image Optimization

```javascript
// Usar createOptimizedPicture para imagens (exceto no Universal Editor)
const isUE = slide.dataset.aueResource != null;
if (!isUE) {
  const img = pictureCell.querySelector('img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, altText, false);
    pictureCell.querySelector('picture').replaceWith(optimized);
  }
}
```

### Universal Editor Instrumentation

```javascript
// Mover atributos data-aue-* ao reestruturar o DOM
moveInstrumentation(originalSlideDiv, newSwiperSlideDiv);
```

## Validation Checklist

- [ ] `aem up` — block renders with 3+ slides
- [ ] Vertical navigation works (prev/next buttons)
- [ ] Touch/swipe works on mobile (vertical direction)
- [ ] Keyboard arrows navigate slides
- [ ] Pagination dots show current position and are clickable
- [ ] Controls disabled at first/last slide (no looping)
- [ ] Single slide: no controls shown
- [ ] Empty block: nothing rendered, no errors
- [ ] Responsive: works at 320px, 768px, 1024px, 1920px
- [ ] `npm run lint` passes
- [ ] `npm run build:json` generates correct root JSON files
