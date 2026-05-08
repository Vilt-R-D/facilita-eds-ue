import { moveInstrumentation } from '../../scripts/scripts.js';

const ALLOWED_THEMES = ['white', 'black', 'dark-green', 'light-green'];

export default async function decorate(block) {
  const allRows = [...block.children];
  // Card rows têm 2+ células (cardText + theme, opcional cardIcon).
  // Block-level rows são single-cell.
  const cardStart = allRows.findIndex((row) => row.children.length > 1);
  const blockRows = cardStart === -1 ? allRows : allRows.slice(0, cardStart);
  const cardRows = cardStart === -1 ? [] : allRows.slice(cardStart);

  const titleRow = blockRows[0];
  const textRow = blockRows[1];
  const ctaRow = blockRows[2];

  const inner = document.createElement('div');
  inner.className = 'card-stack-teaser__inner';

  const copy = document.createElement('div');
  copy.className = 'card-stack-teaser__copy';

  const titleEl = document.createElement('div');
  titleEl.className = 'card-stack-teaser__title';
  if (titleRow) {
    const cell = titleRow.firstElementChild;
    if (cell) while (cell.firstChild) titleEl.appendChild(cell.firstChild);
  }
  copy.appendChild(titleEl);

  const textEl = document.createElement('div');
  textEl.className = 'card-stack-teaser__text';
  if (textRow) {
    const cell = textRow.firstElementChild;
    if (cell) while (cell.firstChild) textEl.appendChild(cell.firstChild);
  }
  copy.appendChild(textEl);

  // CTA — só renderiza quando há anchor com href e texto
  if (ctaRow) {
    const ctaCell = ctaRow.firstElementChild;
    const ctaAnchor = ctaCell?.querySelector('a');
    const ctaHref = ctaAnchor?.getAttribute('href') || '';
    const ctaText = ctaAnchor?.textContent.trim() || '';
    if (ctaHref && ctaText) {
      const cta = document.createElement('a');
      cta.className = 'card-stack-teaser__cta';
      cta.href = ctaHref;
      cta.textContent = ctaText;
      copy.appendChild(cta);
    }
  }

  inner.appendChild(copy);

  const cardCount = cardRows.length;
  let stack = null;
  const cards = [];

  if (cardCount > 0) {
    stack = document.createElement('div');
    stack.className = 'card-stack-teaser__stack';
    stack.setAttribute('aria-roledescription', 'card stack');

    cardRows.forEach((row, index) => {
      const cells = [...row.children];
      const themeCell = cells[cells.length - 1];
      const cardTextCell = cells[cells.length - 2];
      const iconCell = cells.length > 2 ? cells[0] : null;

      const card = document.createElement('div');
      card.className = 'card-stack-teaser__card';
      card.setAttribute('data-position', String(index));

      const themeRaw = themeCell?.textContent.trim() || '';
      const theme = ALLOWED_THEMES.includes(themeRaw) ? themeRaw : 'white';
      card.setAttribute('data-theme', theme);

      const iconEl = document.createElement('i');
      iconEl.className = 'card-stack-teaser__icon';
      const iconMedia = iconCell?.querySelector('picture, img, svg');
      if (iconMedia) iconEl.appendChild(iconMedia);
      card.appendChild(iconEl);

      const cardLabelEl = document.createElement('div');
      cardLabelEl.className = 'card-stack-teaser__card-text';
      if (cardTextCell) {
        while (cardTextCell.firstChild) cardLabelEl.appendChild(cardTextCell.firstChild);
      }
      card.appendChild(cardLabelEl);

      moveInstrumentation(row, card);
      stack.appendChild(card);
      cards.push(card);
    });

    inner.appendChild(stack);
  }

  block.replaceChildren(inner);

  if (cardCount < 2 || !stack) return;

  const dots = document.createElement('div');
  dots.className = 'card-stack-teaser__dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Navegação dos cards');

  const dotEls = [];
  for (let i = 0; i < cardCount; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'card-stack-teaser__dot';
    dot.setAttribute('aria-label', 'Avançar para o próximo card');
    if (i === 0) dot.setAttribute('aria-current', 'true');
    dots.appendChild(dot);
    dotEls.push(dot);
  }
  stack.appendChild(dots);

  let currentIndex = 0;
  let advancing = false;
  let pendingAdvance = false;

  const desktopMql = window.matchMedia('(min-width: 1024px)');

  function applyPositions() {
    cards.forEach((card, originalIndex) => {
      const offset = (originalIndex - currentIndex + cardCount) % cardCount;
      card.setAttribute('data-position', String(offset));
    });
    dotEls.forEach((dot, i) => {
      if (i === currentIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function advance() {
    if (!desktopMql.matches) return;
    if (advancing) {
      pendingAdvance = true;
      return;
    }
    advancing = true;
    const leavingCard = cards.find((c) => c.getAttribute('data-position') === '0');
    currentIndex = (currentIndex + 1) % cardCount;

    if (!leavingCard) {
      applyPositions();
      advancing = false;
      return;
    }

    let done = false;
    const onEnd = (e) => {
      if (e && e.propertyName && e.propertyName !== 'transform') return;
      if (done) return;
      done = true;
      leavingCard.classList.remove('is-leaving');
      leavingCard.removeEventListener('transitionend', onEnd);
      applyPositions();
      advancing = false;
      if (pendingAdvance) {
        pendingAdvance = false;
        advance();
      }
    };

    leavingCard.addEventListener('transitionend', onEnd);
    leavingCard.classList.add('is-leaving');
    setTimeout(onEnd, 600);
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.getAttribute('data-position') === '0') advance();
    });
  });
  dotEls.forEach((dot) => {
    dot.addEventListener('click', advance);
  });

  applyPositions();
}
