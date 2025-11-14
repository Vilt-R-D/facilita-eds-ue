export default function decorate(block) {
  const [textDiv, qrImgDiv, qrTxtDiv, linkDiv, disclaimerDiv, ...icons] = block.children;

  block.parentElement.classList.add('lp-authorize', 'lp-container');
  block.classList.add('lp-banner');

  const headerEl = document.createElement('header');
  headerEl.append(textDiv);

  const actionDiv = document.createElement('div');
  actionDiv.classList.add('lp-action');

  const qrDiv = document.createElement('div');

  const qrTxtEl = qrTxtDiv.querySelector('p');
  if (qrTxtEl) {
    const smallEl = document.createElement('small');
    smallEl.textContent = qrTxtEl.textContent;
    qrTxtDiv.replaceChildren(smallEl);
  }

  qrDiv.append(qrTxtDiv, qrImgDiv);
  qrDiv.classList.add('lp-qrcode');

  linkDiv.classList.add('lp-btn');
  actionDiv.append(qrDiv);
  const anchorEl = linkDiv.querySelector('a');
  if (anchorEl) {
    actionDiv.append(linkDiv);
  } else {
    linkDiv.remove();
  }

  disclaimerDiv.classList.add('txt-seguranca');
  headerEl.append(actionDiv, disclaimerDiv);

  const gridEl = document.createElement('figure');
  for (let i = 0; i < 4; i += 1) {
    if (i === 0) {
      const gridBoxEl = document.createElement('div');
      gridBoxEl.classList.add('lp-step');
      const spanEl = document.createElement('span');
      spanEl.textContent = 'Oi BIA ;)';
      gridBoxEl.append(spanEl);
      gridEl.append(gridBoxEl);
    } else if (icons[i - 1]) {
      icons[i - 1].classList.add('lp-step');
      gridEl.append(icons[i - 1]);
    } else {
      const gridBoxEl = document.createElement('div');
      gridBoxEl.classList.add('lp-step');
      gridEl.append(gridBoxEl);
    }
  }

  block.append(headerEl, gridEl);
}
