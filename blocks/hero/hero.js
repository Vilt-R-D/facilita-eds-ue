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

import { getMetadata } from '../../scripts/aem.js';

/**
 * Converte um elemento img para svg.
 * @param {HTMLElement} picture
 */
function extractSVGfromPicture(picture) {
  const source = picture.querySelector('img').src.split('?')[0];
  const object = document.createElement('object');
  object.type = 'image/svg+xml';
  object.data = source;

  return object;
}

/**
 * @param {Element} row
 * @returns {Element} Decorated link element.
 */
function decorateLogo(row) {
  const isUniversalEditor = getMetadata('modified-time') !== '';

  const pictureEl = row.querySelector('picture');
  let hasSVG = pictureEl.querySelector('source[type="image/svg+xml"]') != null;
  hasSVG ||= pictureEl.querySelector('img[src*=".svg"]') != null;

  const redirectUrl = row.lastElementChild.textContent.trim();
  const aEl = document.createElement('a');
  aEl.href = redirectUrl;
  aEl.title = 'bradesco';
  aEl.className = 'lp-bradesco';

  if (hasSVG && !isUniversalEditor) {
    const svg = extractSVGfromPicture(pictureEl);
    aEl.append(svg);
  } else {
    aEl.appendChild(pictureEl);
  }
  const div = document.createElement('div');
  div.id = 'topbar';
  // div.className = 'lp-topbar';

  div.appendChild(aEl);

  return div;
}

/**
 * @param {Element} row
 * @returns {Element} Decorated Picture element.
 */
function decorateBackground(row) {
  const pictures = row.querySelectorAll('picture');
  const pictureEl = document.createElement('picture');
  // Pegar a imagem grande de desktop e a original como fallback. Também pegar a para celular.
  const isUniversalEditor = pictures[0].childElementCount <= 1;
  if (!isUniversalEditor) {
    const srcDesktopBig = pictures[0].children[2];
    const imgDesktopFallback = pictures[0].lastElementChild;
    srcDesktopBig.setAttribute('media', '(min-width: 720px)');
    // Se haver imagem para celular.
    if (pictures[1]) {
      const srcMobile = pictures[1].children[2];
      srcMobile.setAttribute('media', '(max-width: 719px)');
      pictureEl.append(srcDesktopBig, srcMobile, imgDesktopFallback);
    } else {
      pictureEl.append(srcDesktopBig, imgDesktopFallback);
    }
  } else {
    const imgDesktop = pictures[0].firstElementChild;
    [imgDesktop.src] = imgDesktop.src.split('?') ?? null;

    const imgMobile = pictures[1]?.firstElementChild;
    const srcMobile = document.createElement('source');
    srcMobile.setAttribute('media', '(max-width: 719px)');
    [srcMobile.srcset] = imgMobile?.src.split('?') ?? [''];
    pictureEl.append(srcMobile, imgDesktop);
  }

  pictureEl.id = 'hero-background';
  // pictureEl.className = 'lp-video';

  return pictureEl;
}

/**
 * @param {Element} row
 * @returns {Element} Decorated Nav element.
 */
function decorateAnchor(row) {
  const anchorID = row.textContent.trim();
  const anchorEl = document.createElement('a');
  const iconEl = document.createElement('i');
  anchorEl.href = `#${anchorID}`;

  const svgs = Array.from({ length: 2 }, () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS(null, 'href', '#arrow-min');
    svg.appendChild(use);
    return svg;
  });

  iconEl.append(...svgs);
  const nav = document.createElement('nav');
  anchorEl.appendChild(nav);
  nav.appendChild(iconEl);
  nav.id = 'hero-anchor';

  return anchorEl;
}

/**
 * loads and decorates the hero, mainly the nav
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const [rowAnchor, rowLogo, rowBackground] = block.children;
  const elementList = [
    decorateLogo(rowLogo),
    decorateBackground(rowBackground),
    decorateAnchor(rowAnchor),
  ];
  block.replaceChildren(...elementList);
}
