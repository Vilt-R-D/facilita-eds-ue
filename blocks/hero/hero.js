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
 * @param {Element} row
 * @returns {Element} Decorated link element.
 */
function decorateLogo(row) {
  const pictureEl = row.querySelector('picture');
  const redirectUrl = row.lastElementChild.textContent.trim();
  const aEl = document.createElement('a');
  aEl.href = redirectUrl;
  aEl.appendChild(pictureEl);

  return aEl;
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
      if (newElement != null) row.replaceWith(newElement);
    },
  );
}
