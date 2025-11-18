/**
 * loads and decorates the hero, mainly the nav
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  block.parentElement.parentElement.classList.add('lp-facilities');
  const cards = [...block.children];

  const dialog = document.createElement('dialog');
  dialog.classList.add('lp-modalvideo');
  const modalAnchor = document.createElement('a');
  modalAnchor.classList.add('lp-modalclose');
  modalAnchor.textContent = 'X';

  const modalDiv = document.createElement('div');
  modalDiv.id = 'yt-player';

  const modalIframe = document.createElement('iframe');
  modalIframe.width = '520';
  modalIframe.height = '315';
  modalIframe.allowFullscreen = 'true';

  modalDiv.replaceChildren(modalIframe);
  dialog.replaceChildren(modalAnchor, modalDiv);

  const lpSwiper = document.createElement('div');
  lpSwiper.classList.add('lp-swiper');

  const lpContainer = document.createElement('div');
  lpContainer.classList.add('lp-container');
  lpContainer.classList.add('swiper-container');

  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');
  swiperWrapper.replaceChildren(...cards);

  const navPagination = document.createElement('div');
  navPagination.classList.add('nav-pagination');

  const leftButton = document.createElement('button');
  leftButton.classList.add('brad-btn', 'brad-btn-icon', 'swiper-button-prev');
  const leftButtonEm = document.createElement('em');
  leftButtonEm.classList.add('btn-icon', 'i', 'icon-ui-chevron-left');
  leftButton.replaceChildren(leftButtonEm);

  const bradPagination = document.createElement('div');
  bradPagination.classList.add('brad-pagination', 'swiper-pagination-clickable', 'swiper-pagination-bullets', 'swiper-pagination-horizontal');

  const rightButton = document.createElement('button');
  rightButton.classList.add('brad-btn', 'brad-btn-icon', 'swiper-button-next');
  const rightButtonEm = document.createElement('em');
  rightButtonEm.classList.add('btn-icon', 'i', 'icon-ui-chevron-right');
  rightButton.replaceChildren(rightButtonEm);

  navPagination.replaceChildren(leftButton, bradPagination, rightButton);

  cards.forEach((c) => {
    const [pictureDiv, youtubeLinkDiv, iconDiv, cardTitleDiv, lpActions, cardLinkDiv,
      qrCodeDiv] = c.children;

    // Youtuber link is a required attribute.
    // If it's not present, then cards was not properly authored.
    if (!youtubeLinkDiv.querySelector('a')) return;
    const youtubeLink = youtubeLinkDiv.querySelector('a').href;

    const cardAnchor = cardLinkDiv.querySelector('a');

    c.classList.add('swiper-slide');
    const lpSlide = document.createElement('div');
    lpSlide.classList.add('lp-slide');

    lpActions.children[0].classList.add('desk-only');
    const buttonText = lpActions.children[0].textContent.replace(' pelo app', '');
    const buttonSpan = document.createElement('span');
    buttonSpan.textContent = buttonText;
    cardAnchor.replaceChildren(buttonSpan);
    cardAnchor.classList.add('mobile-only');
    cardAnchor.target = '_blank';
    cardAnchor.title = buttonText.toLowerCase();

    lpActions.classList.add('lp-actions');
    lpActions.replaceChildren(cardAnchor, ...lpActions.children);

    const picture = pictureDiv.querySelector('picture');
    const pictureFigure = document.createElement('figure');
    const figureCaption = document.createElement('figcaption');
    const youtubeAnchor = document.createElement('a');
    const youtubeVideoId = youtubeLink.includes('/embed/') ? youtubeLink.split('/embed/')[1] : '';
    const youtubeVideoTitle = cardTitleDiv.textContent.trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replaceAll(' ', '-');
    youtubeAnchor.setAttribute('data-video-id', youtubeVideoId);
    youtubeAnchor.setAttribute('aria-label', youtubeVideoTitle);
    youtubeAnchor.href = `#${youtubeVideoTitle}`;

    const icon = document.createElement('i');
    const iconImgEl = document.createElement('img');
    iconImgEl.setAttribute('src', `${window.hlx.codeBasePath}/icons/play-btn-min.svg`);
    icon.replaceChildren(iconImgEl);

    figureCaption.replaceChildren(youtubeAnchor, icon);

    pictureFigure.classList.add('lp-videocard');
    pictureFigure.replaceChildren(picture, figureCaption);

    const article = document.createElement('article');
    article.classList.add('lp-content');
    const header = document.createElement('header');
    header.style.minHeight = 'fit-content';
    const i = document.createElement('i');
    i.replaceChildren(iconDiv.querySelector('img'));
    const h3 = document.createElement('h3');
    const cardTitle = cardTitleDiv.children;
    h3.replaceChildren(...cardTitle);
    header.replaceChildren(i, h3);
    article.replaceChildren(header);

    const qrCode = qrCodeDiv.querySelector('picture');
    const qrCodeFigure = document.createElement('figure');
    qrCodeFigure.classList.add('lp-qrcode');
    qrCodeFigure.classList.add('desk-only');
    qrCodeFigure.replaceChildren(qrCode);

    lpSlide.replaceChildren(lpActions, pictureFigure, article, qrCodeFigure);
    c.replaceChildren(lpSlide);
  });

  lpContainer.replaceChildren(swiperWrapper, navPagination);
  lpSwiper.replaceChildren(lpContainer);
  block.replaceChildren(lpSwiper, dialog);
}
