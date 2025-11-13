function extractRceTags(element) {
  return [...element.firstElementChild.children];
}

export default function decorate(block) {
  const [titleDiv, textDiv, qrImgDiv, qrTxtDiv, linkDiv, disclaimerDiv] = block.children;

  block.parentElement.classList.add('lp-authorize', 'lp-container');

  block.classList.add('lp-banner');

  const headerEl = document.createElement('header');
  extractRceTags(titleDiv).forEach((el) => headerEl.append(el));
  extractRceTags(textDiv).forEach((el) => headerEl.append(el));

  const actionDiv = document.createElement('div');
  actionDiv.classList.add('lp-action');

  const qrPictureEl = qrImgDiv.querySelector('picture');
  const qrTxtEl = qrTxtDiv.querySelector('p');
  const smallEl = document.createElement('small');
  smallEl.textContent = qrTxtEl.textContent;

  const qrDiv = document.createElement('div');
  qrDiv.classList.add('lp-qrcode');
  qrDiv.append(smallEl, qrPictureEl);

  const anchorEl = linkDiv.querySelector('a');
  anchorEl.classList.add('lp-btn');

  actionDiv.append(anchorEl, qrDiv);
  headerEl.append(actionDiv);

  extractRceTags(disclaimerDiv).forEach((el) => {
    if (el.tagName === 'P') el.classList.add('txt-seguranca');
    headerEl.append(el);
  });

  const biaGridEl = document.createElement('figure');
  for (let i = 0; i < 4; i += 1) {
    const boxEl = document.createElement('div');
    boxEl.classList.add('lp-step');
    const iEl = document.createElement('i');
    boxEl.append(iEl);
    const svgEl = document.createElement('svg');
    iEl.append(svgEl);
    biaGridEl.append(boxEl);
    if (i === 0) {
      const spanEl = document.createElement('span');
      spanEl.textContent = 'Oi BIA ;)';
      iEl.append(spanEl);
    }
  }

  block.replaceChildren(headerEl, biaGridEl);
}
