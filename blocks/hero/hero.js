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

/**
 * Converte um elemento img para svg.
 * @param {HTMLElement} picture
 */
function extractSVGfromPicture(picture) {
  const source = picture.querySelector('img').src.split('?')[0];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS(null, 'href', source);
  svg.appendChild(use);

  return svg;
}

/**
 * @param {Element} row
 * @returns {Element} Decorated link element.
 */
function decorateLogo(row) {
  const pictureEl = row.querySelector('picture');
  const hasSVG = pictureEl.querySelector('source[type="image/svg+xml"]') != null;

  const redirectUrl = row.lastElementChild.textContent.trim();
  const aEl = document.createElement('a');
  aEl.href = redirectUrl;
  aEl.title = 'bradesco';
  aEl.className = 'lp-bradesco';

  if (hasSVG) {
    const svg = extractSVGfromPicture(pictureEl);
    aEl.append(svg);
  } else {
    aEl.appendChild(pictureEl);
  }
  const div = document.createElement('div');
  div.id = 'topbar';
  div.className = 'lp-topbar';

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
  const srcDesktopBig = pictures[0].children[2];
  const imgDesktopFallback = pictures[0].lastElementChild;
  const srcMobile = pictures[1].children[2];
  srcDesktopBig.setAttribute('media', '(min-width: 720px)');
  srcMobile.setAttribute('media', '(max-width: 719px)');

  pictureEl.append(srcDesktopBig, srcMobile, imgDesktopFallback);
  pictureEl.id = 'hero-background';
  pictureEl.className = 'lp-video';

  return pictureEl;
}

/**
 * @param {Element} row
 * @returns {Element} Decorated Nav element.
 */
function decorateAnchor(row) {
  const anchorID = row.textContent.trim();
  const anchorEl = document.createElement('a');
  anchorEl.href = `#${anchorID}`;

  const nav = document.createElement('nav');
  nav.appendChild(anchorEl);
  nav.id = 'hero-anchor';

  return nav;
}

/**
 * @param {Element} row É uma div
 * @returns {string} 'logo', 'background' or 'anchor'
 */
function classifyRow(row) {
  // A div contém filhas picture?
  const firstCol = row.children[0];
  if (firstCol.children[0].matches('picture')) {
    // Pode ser tanto Logo, quanto o fundo.
    if (firstCol.nextElementSibling.children[0].matches('p')) {
      return 'logo';
    }
    return 'background';
  }
  if (firstCol.children[0].matches('p')) {
    return 'anchor';
  }
  return null;
}

/**
 * loads and decorates the hero, mainly the nav
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  // const divWrapper = document.createElement('div');
  // divWrapper.classList.add('lp-header');
  block.classList.add('lp-header');
  Object.values(block.children).forEach(
    (row, i) => {
      const rowType = classifyRow(row);
      if (i > 2) {
        // console.warn('The hero block can have the max of 3 columns');
        return;
      }
      let newElement = null;
      switch (rowType) {
        case 'logo':
          newElement = decorateLogo(row);
          break;
        case 'background':
          newElement = decorateBackground(row);
          break;
        case 'anchor': {
          newElement = decorateAnchor(row);
          break;
        }
        default:
        // console.warn('Could not classify block type');
      }
      // if (newElement != null) divWrapper.appendChild(newElement);
      if (newElement != null) row.replaceWith(newElement);
    },
  );
}
