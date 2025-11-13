import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the hero, mainly the nav
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const [filtersDiv, ...cards] = block.children;
  block.classList.add('lp-others');
  block.classList.add('lp-container');
  block.setAttribute('data-filter', 0);

  const filters = filtersDiv.querySelector('p')?.textContent.split(',');
  filtersDiv.classList.add('lp-filters');
  const filtersH3 = document.createElement('h3');
  filtersH3.textContent = 'Filtrar';
  const filtersUL = document.createElement('ul');

  filters.forEach((filter, index) => {
    const filterLI = document.createElement('li');

    const anchor = document.createElement('a');
    anchor.title = `filtra ${filter}`;
    anchor.setAttribute('data-filter', index);
    anchor.innerHTML = filter;
    // eslint-disable-next-line no-script-url
    anchor.href = 'javascript:;';

    filterLI.appendChild(anchor);
    filtersUL.appendChild(filterLI);
  });

  filtersDiv.replaceChildren(filtersH3, filtersUL);

  const lpCards = document.createElement('div');
  lpCards.classList.add('lp-cards');
  const linkIcon = createOptimizedPicture('icons/saiba-mais.svg');
  const linkSpan = document.createElement('span');
  linkSpan.textContent = 'Saiba mais ';
  linkSpan.appendChild(linkIcon.cloneNode(true));
  linkSpan.classList.add('saiba-mais-mobile', 'hidden-md', 'hidden-lg');

  cards.forEach((card) => {
    const [iconDiv, titleDiv, textDiv, linkDiv, tagDiv] = card.children;

    const tag = tagDiv.textContent;
    const article = document.createElement('article');
    article.classList.add('lp-card');
    article.setAttribute('data-filter', filters.indexOf(tag));

    const header = document.createElement('header');
    const headerIcon = document.createElement('i');
    const iconPicture = iconDiv.querySelector('picture');
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = titleDiv.textContent;
    headerIcon.appendChild(iconPicture);
    header.replaceChildren(headerIcon, headerTitle);

    const text = textDiv.children;

    const link = linkDiv.querySelector('a');
    link.replaceChildren(linkSpan.cloneNode(true));

    article.replaceChildren(header, ...text, link);
    lpCards.appendChild(article);
  });

  block.replaceChildren(filtersDiv, lpCards);
}
