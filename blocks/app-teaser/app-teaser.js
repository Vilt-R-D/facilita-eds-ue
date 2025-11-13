import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the hero, mainly the nav
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  block.classList.add('lp-openaccount');
  const lpContainer = document.createElement('div');
  lpContainer.classList.add('lp-container');

  const [titleDiv, textDiv, linkOneDiv, linkOneImgDiv, linkTwoDiv, linkTwoImgDiv,
    imgDiv, qrCodeTextDiv, qrCodeDiv] = block.children;
  const lpBanner = document.createElement('div');
  lpBanner.classList.add('lp-banner');

  const header = document.createElement('header');
  const title = titleDiv.textContent.trim();
  const h2 = document.createElement('h2');
  h2.textContent = title;

  const text = textDiv.textContent.trim();
  const h3 = document.createElement('h3');
  h3.textContent = text;

  const lpAction = document.createElement('div');
  lpAction.classList.add('lp-action');

  const linkOne = linkOneDiv.querySelector('a');
  const linkOneImg = linkOneImgDiv.querySelector('picture');
  linkOne.replaceChildren(linkOneImg);

  const linkTwo = linkTwoDiv.querySelector('a');
  const linkTwoImg = linkTwoImgDiv.querySelector('picture');
  linkTwo.replaceChildren(linkTwoImg);

  lpAction.replaceChildren(linkOne, linkTwo);
  header.replaceChildren(h2, h3, lpAction);

  const figure = document.createElement('figure');
  const figCaption = document.createElement('figcaption');

  const img = imgDiv.querySelector('picture');
  const qrCode = qrCodeDiv.querySelector('picture');
  const qrCodeText = qrCodeTextDiv.textContent.trim();
  const small = document.createElement('small');
  small.textContent = qrCodeText;
  figCaption.replaceChildren(small);
  figCaption.appendChild(qrCode);

  figure.replaceChildren(img, figCaption);

  const i = document.createElement('i');
  const svg = createOptimizedPicture('icons/stripes-min.svg');
  i.replaceChildren(svg);

  lpBanner.replaceChildren(header, figure, i);
  lpContainer.replaceChildren(lpBanner);
  block.replaceChildren(lpContainer);
}
