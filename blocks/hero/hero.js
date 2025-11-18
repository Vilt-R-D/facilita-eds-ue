/**
 * O Hero é composto de 2 linhas:
 *  - Informações da logo:
 *    - Imagem.
 *    - Link de Redirecionamento.
 *  - Informações do fundo:
 *    - Imagem (Obrigatório)
 *    - Imagem para celular
 *  - Informações sobre a ancora
 *    - Ancora
*/

import { createOptimizedPicture } from '../../scripts/aem.js';
import createSkeleton from '../../scripts/vilt.js';

/**
 * @param {Element} row
 * @returns {Element} Decorated link element.
 */
function decorateLogo(row) {
  row.id = 'topbar';
  const isUE = row.dataset.aueResource != null;
  const [pictureCol, urlCol] = [...row.children];
  if (!isUE) {
    const optimizedPic = createOptimizedPicture(pictureCol.firstElementChild.lastElementChild.src.split('?')[0]);
    pictureCol.firstChild.replaceWith(optimizedPic);
    pictureCol.lastElementChild.lastElementChild.fetchPriority = 'high';
  }
  if (urlCol.children.length !== 0) {
    pictureCol.remove();
    const anchor = urlCol.querySelector('a');
    if (anchor) {
      anchor.innerHTML = '';
      anchor.appendChild(pictureCol.firstChild);
    }
  }
  return row;
}

/**
 * @param {Element} row
 * @returns {Element} Decorated Picture element.
 */
function decorateBackground(row) {
  const isUE = row.dataset.aueResource != null;
  row.id = 'hero-container';
  const [desktopPicture, mobilePicture] = [...row.children].map((columns) => columns.querySelector('picture'));
  if (desktopPicture) {
    if (isUE) {
      desktopPicture.id = 'hero-background';
      desktopPicture.className = 'desktop-only';
      if (mobilePicture) {
        mobilePicture.className = 'mobile-only';
        mobilePicture.id = 'hero-background';
      }
      return row;
    }
    const optimizedPicDesktop = createOptimizedPicture(desktopPicture.lastElementChild.src, '', true);
    optimizedPicDesktop.id = 'hero-background';
    if (mobilePicture) {
      const optimizedPicMobile = createOptimizedPicture(mobilePicture.lastElementChild.src, '', true);
      const mobileSource = optimizedPicMobile.children[2];
      mobileSource.media = '(max-width: 600px)';
      optimizedPicDesktop.prepend(mobileSource);
      row.lastElementChild.remove();
    }
    row.firstElementChild.replaceWith(optimizedPicDesktop);
    return row;
  }
  row.appendChild(createSkeleton('500px', '1800px'));
  return row;
}

/**
 * @param {Element} row
 * @returns {Element | null} Decorated Nav element.
 */
function decorateAnchor(row) {
  const col = row.firstElementChild;
  if (col.children.length === 0) {
    return row;
  }
  const anchor = col.querySelector('a');
  anchor.innerHTML = '';
  const iconEl = document.createElement('i');
  const svgs = Array.from({ length: 2 }, () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS(null, 'href', '#arrow-min');
    svg.appendChild(use);
    return svg;
  });

  iconEl.append(...svgs);
  const nav = document.createElement('nav');
  anchor.appendChild(nav);
  nav.appendChild(iconEl);
  nav.id = 'hero-anchor';
  row.replaceChildren(nav);
  return row;
}

/**
 * loads and decorates the hero, mainly the nav
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const [rowAnchor, rowLogo, rowBackground] = block.children;
  decorateAnchor(rowAnchor);
  decorateLogo(rowLogo);
  decorateBackground(rowBackground);
}
