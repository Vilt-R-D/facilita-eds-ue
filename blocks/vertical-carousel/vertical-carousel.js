import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Garante que o Swiper está carregado.
 * Se window.Swiper já existe, resolve imediatamente.
 * Caso contrário, carrega o script swiper-bundle.js dinamicamente.
 * @returns {Promise<void>}
 */
function ensureSwiper() {
  if (window.Swiper) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${window.hlx.codeBasePath}/scripts/swiper-bundle.js`;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Constrói o conteúdo de um slide a partir das células originais do AEM.
 * @param {Element} row - Elemento <div> filho do bloco (uma "linha" do AEM)
 * @param {number} index - Índice do slide (0-based)
 * @param {number} total - Total de slides
 * @returns {Element} - O elemento .swiper-slide pronto
 */
function buildSlide(row, index, total) {
  const cells = [...row.children];
  const [pictureCell, altCell, titleCell, descCell, ctaCell, ctaTextCell] = cells;

  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `Slide ${index + 1} de ${total}`);

  const content = document.createElement('div');
  content.classList.add('vc-slide-content');

  // Imagem
  if (pictureCell) {
    const img = pictureCell.querySelector('img');
    if (img) {
      const altText = altCell?.textContent?.trim() || '';
      const isUE = row.dataset.aueResource != null;
      if (!isUE) {
        const optimized = createOptimizedPicture(img.src, altText, false);
        content.appendChild(optimized);
      } else {
        const picture = pictureCell.querySelector('picture');
        if (picture) {
          img.alt = altText;
          content.appendChild(picture);
        }
      }
    }
  }

  // Texto (título, descrição, CTA)
  const textWrapper = document.createElement('div');
  textWrapper.classList.add('vc-slide-text');

  if (titleCell) {
    const titleContent = titleCell.innerHTML.trim();
    if (titleContent) textWrapper.appendChild(titleCell.firstElementChild || titleCell);
  }

  if (descCell) {
    const descContent = descCell.innerHTML.trim();
    if (descContent) textWrapper.appendChild(descCell.firstElementChild || descCell);
  }

  // CTA: só renderiza se ambos cta e ctaText existem
  if (ctaCell && ctaTextCell) {
    const link = ctaCell.querySelector('a');
    const ctaText = ctaTextCell.textContent?.trim();
    if (link && ctaText) {
      const cta = document.createElement('a');
      cta.href = link.href;
      cta.classList.add('vc-cta');
      cta.textContent = ctaText;
      textWrapper.appendChild(cta);
    }
  }

  if (textWrapper.children.length > 0) {
    content.appendChild(textWrapper);
  }

  slide.appendChild(content);

  // Preservar instrumentação do Universal Editor
  moveInstrumentation(row, slide);

  return slide;
}

/**
 * Decora o bloco vertical-carousel.
 * @param {Element} block - Elemento raiz do bloco
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Atributos ARIA no bloco raiz
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Carrossel vertical');

  // Estrutura Swiper
  const swiperContainer = document.createElement('div');
  swiperContainer.classList.add('swiper', 'vc-swiper');

  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');

  // Construir slides
  rows.forEach((row, i) => {
    const slide = buildSlide(row, i, rows.length);
    swiperWrapper.appendChild(slide);
  });

  swiperContainer.appendChild(swiperWrapper);

  // Caso de slide único: sem navegação, sem Swiper
  if (rows.length === 1) {
    block.replaceChildren(swiperContainer);
    return;
  }

  // Navegação (prev/next + paginação)
  const navigation = document.createElement('div');
  navigation.classList.add('vc-navigation');

  const prevBtn = document.createElement('button');
  prevBtn.classList.add('vc-button-prev');
  prevBtn.setAttribute('aria-label', 'Slide anterior');
  prevBtn.innerHTML = '<span class="vc-nav-icon">&#8249;</span>';

  const paginationEl = document.createElement('div');
  paginationEl.classList.add('vc-pagination');

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('vc-button-next');
  nextBtn.setAttribute('aria-label', 'Próximo slide');
  nextBtn.innerHTML = '<span class="vc-nav-icon">&#8250;</span>';

  navigation.appendChild(prevBtn);
  navigation.appendChild(paginationEl);
  navigation.appendChild(nextBtn);

  swiperContainer.appendChild(navigation);
  block.replaceChildren(swiperContainer);

  // Carregar e inicializar Swiper
  await ensureSwiper();

  // eslint-disable-next-line no-new
  new window.Swiper(swiperContainer, {
    direction: 'vertical',
    slidesPerView: 1,
    spaceBetween: 0,
    allowTouchMove: true,
    simulateTouch: true,
    speed: 500,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    pagination: {
      el: paginationEl,
      type: 'bullets',
      clickable: true,
    },
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
  });
}
