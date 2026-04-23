import { moveInstrumentation } from '../../scripts/scripts.js';

const VALID_BG = ['black', 'dark-green', 'bright-green', 'white'];

function readCellHtml(cell) {
  if (!cell) return '';
  return cell.innerHTML.trim();
}

function readCellText(cell) {
  if (!cell) return '';
  return cell.textContent.trim();
}

function readCellLink(cell) {
  if (!cell) return '';
  const anchor = cell.querySelector('a');
  if (anchor?.getAttribute('href')) return anchor.getAttribute('href');
  return readCellText(cell);
}

function plainText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent.trim();
}

function buildCard(itemEl, index) {
  const [titleCell, descriptionCell, iconCell, bgColorCell] = itemEl.children;

  const titleHtml = readCellHtml(titleCell);
  const descriptionHtml = readCellHtml(descriptionCell);
  const rawBg = readCellText(bgColorCell);
  const bg = VALID_BG.includes(rawBg) ? rawBg : 'white';

  const article = document.createElement('article');
  article.className = 'stack-card';
  article.dataset.index = String(index);
  article.dataset.bg = bg;
  article.setAttribute('role', 'button');
  article.setAttribute('aria-label', `Avançar carrossel — ${plainText(titleHtml)}`);

  const header = document.createElement('header');
  header.className = 'stack-card-header';

  const iconPicture = iconCell?.querySelector('picture, img');
  if (iconPicture) {
    const iconWrap = document.createElement('i');
    iconWrap.className = 'stack-card-icon';
    iconWrap.append(iconPicture);
    header.append(iconWrap);
  }

  const titleEl = document.createElement('h3');
  titleEl.className = 'stack-card-title';
  titleEl.innerHTML = titleHtml;
  header.append(titleEl);

  article.append(header);

  if (descriptionHtml) {
    const descEl = document.createElement('div');
    descEl.className = 'stack-card-description';
    descEl.innerHTML = descriptionHtml;
    article.append(descEl);
  }

  moveInstrumentation(itemEl, article);
  return article;
}

function layerForOffset(offset, total) {
  if (offset === 0) return 'front';
  if (offset === 1 && total >= 2) return 'back-1';
  if (offset === 2 && total >= 3) return 'back-2';
  return 'hidden';
}

function applyLayers(cards, frontIndex) {
  const total = cards.length;
  cards.forEach((card, i) => {
    const offset = (i - frontIndex + total) % total;
    const layer = layerForOffset(offset, total);
    card.dataset.layer = layer;
    if (layer === 'front') {
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-hidden', 'false');
    } else {
      card.setAttribute('tabindex', '-1');
      card.setAttribute('aria-hidden', 'true');
    }
  });
}

function applyDots(dots, frontIndex) {
  dots.forEach((dot, i) => {
    if (i === frontIndex) {
      dot.setAttribute('aria-current', 'true');
      dot.classList.add('is-active');
    } else {
      dot.removeAttribute('aria-current');
      dot.classList.remove('is-active');
    }
  });
}

export default async function decorate(block) {
  const rows = [...block.children];
  // Campos de container (heading, body, ctaLabel, ctaLink) → primeiras 4 linhas.
  const [headingRow, bodyRow, ctaLabelRow, ctaLinkRow, ...itemRows] = rows;

  const headingHtml = readCellHtml(headingRow);
  const bodyHtml = readCellHtml(bodyRow);
  const ctaLabel = readCellText(ctaLabelRow);
  const ctaLink = readCellLink(ctaLinkRow);

  const inner = document.createElement('div');
  inner.className = 'stack-carousel-inner';

  const copy = document.createElement('div');
  copy.className = 'stack-carousel-copy';

  if (headingHtml) {
    const h = document.createElement('h2');
    h.className = 'stack-carousel-heading';
    h.innerHTML = headingHtml;
    copy.append(h);
  }

  if (bodyHtml) {
    const b = document.createElement('div');
    b.className = 'stack-carousel-body';
    b.innerHTML = bodyHtml;
    copy.append(b);
  }

  if (ctaLabel && ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'stack-carousel-cta button';
    cta.href = ctaLink;
    cta.textContent = ctaLabel;
    copy.append(cta);
  }

  inner.append(copy);

  const cards = itemRows.map((row, i) => buildCard(row, i));
  const N = cards.length;

  let pile = null;
  let dots = [];

  if (N > 0) {
    pile = document.createElement('div');
    pile.className = 'stack-carousel-pile';
    pile.setAttribute('role', 'group');
    pile.setAttribute('aria-roledescription', 'carrossel de cards');
    cards.forEach((c) => pile.append(c));
    inner.append(pile);
  }

  if (N >= 2) {
    const pagination = document.createElement('nav');
    pagination.className = 'stack-pagination';
    pagination.setAttribute('aria-label', 'Selecionar card');

    dots = cards.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'stack-dot';
      dot.dataset.targetIndex = String(i);
      dot.setAttribute('aria-label', `Ir para o card ${i + 1}`);
      const label = document.createElement('span');
      label.className = 'sr-only';
      label.textContent = `Card ${i + 1}`;
      dot.append(label);
      pagination.append(dot);
      return dot;
    });

    inner.append(pagination);
  }

  block.replaceChildren(inner);

  if (N === 0) return;

  let frontIndex = 0;
  applyLayers(cards, frontIndex);
  applyDots(dots, frontIndex);

  if (N < 2) return;

  let isAdvancing = false;

  function refreshAriaLabels() {
    cards.forEach((card) => {
      const titleEl = card.querySelector('.stack-card-title');
      const label = titleEl ? titleEl.textContent.trim() : '';
      card.setAttribute('aria-label', `Avançar carrossel — ${label}`);
    });
  }

  function advance({ steps = 1, direction = 'forward', fromKeyboard = false }) {
    if (isAdvancing || steps <= 0) return;
    isAdvancing = true;

    const total = cards.length;
    const outgoing = cards[frontIndex];
    const newFrontIndex = direction === 'forward'
      ? (frontIndex + steps) % total
      : (frontIndex - steps + total) % total;

    const outPhase = direction === 'forward' ? 'advancing-out' : 'advancing-out-back';
    const inPhase = direction === 'forward' ? 'advancing-in' : 'advancing-in-back';

    // Fase 1: desliza o card de frente para o lado (acima do pile no z-axis).
    outgoing.dataset.phase = outPhase;

    // No próximo frame, gira as layers de todos os cards para a nova ordem.
    // A regra CSS de data-phase sobrepõe a posição do outgoing durante a animação.
    requestAnimationFrame(() => {
      frontIndex = newFrontIndex;
      applyLayers(cards, frontIndex);
      applyDots(dots, frontIndex);
    });

    let phaseOneDone = false;
    let finished = false;

    const finalize = (listener) => {
      if (finished) return;
      finished = true;
      if (listener) outgoing.removeEventListener('transitionend', listener);
      delete outgoing.dataset.phase;
      refreshAriaLabels();
      if (fromKeyboard) {
        cards[frontIndex].focus();
      }
      isAdvancing = false;
    };

    const onTransitionEnd = (event) => {
      if (event.target !== outgoing) return;
      if (event.propertyName !== 'transform') return;

      if (!phaseOneDone) {
        phaseOneDone = true;
        // Fase 2: retorna do lado para a nova posição de repouso.
        outgoing.dataset.phase = inPhase;
        return;
      }

      finalize(onTransitionEnd);
    };

    outgoing.addEventListener('transitionend', onTransitionEnd);

    // Safety: garante conclusão mesmo se transitionend não disparar
    // (ex.: reduced motion muito agressivo, navegador oculto em aba).
    setTimeout(() => finalize(onTransitionEnd), 900);
  }

  // Clique no card de frente (delegado no pile).
  pile.addEventListener('click', (event) => {
    const card = event.target.closest('.stack-card');
    if (!card || card.dataset.layer !== 'front') return;
    advance({ steps: 1, direction: 'forward', fromKeyboard: false });
  });

  // Ativação por teclado (Enter/Space) no card de frente.
  pile.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.stack-card');
    if (!card || card.dataset.layer !== 'front') return;
    event.preventDefault();
    advance({ steps: 1, direction: 'forward', fromKeyboard: true });
  });

  // Salto via dot de paginação (menor caminho; forward empata em forward).
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      if (isAdvancing) return;
      const target = parseInt(dot.dataset.targetIndex, 10);
      if (target === frontIndex) return;
      const total = cards.length;
      const deltaForward = (target - frontIndex + total) % total;
      const deltaBackward = total - deltaForward;
      if (deltaForward <= deltaBackward) {
        advance({ steps: deltaForward, direction: 'forward', fromKeyboard: false });
      } else {
        advance({ steps: deltaBackward, direction: 'backward', fromKeyboard: false });
      }
    });
  });
}
