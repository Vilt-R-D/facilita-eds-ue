import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.classList.add('container-chatbia-qrcode');
  const [iconDiv, titleDiv, subtitleDiv, descriptionDiv] = block.children;

  const chatBiaQrCode = document.createElement('div');
  chatBiaQrCode.id = 'chatbia-qrcode';

  const chatBiaOpen = document.createElement('div');
  const chatBiaOpenAnchor = document.createElement('a');
  chatBiaOpenAnchor.href = '#bia';
  const chatBiaOpenSvg = createOptimizedPicture(`${window.hlx.codeBasePath}/icons/chatbia-open.svg`);
  chatBiaOpenAnchor.appendChild(chatBiaOpenSvg);
  chatBiaOpenAnchor.title = 'Ativar Fale com a Bia';
  chatBiaOpen.appendChild(chatBiaOpenAnchor);
  chatBiaOpen.classList.add('chatbia-open');

  const chatBiaClose = document.createElement('div');
  const chatBiaCloseAnchor = document.createElement('a');
  chatBiaCloseAnchor.href = '#bia-close';
  const chatBiaCloseSvg = createOptimizedPicture(`${window.hlx.codeBasePath}/icons/chatbia-close.svg`);
  chatBiaCloseAnchor.appendChild(chatBiaCloseSvg);
  chatBiaCloseAnchor.title = 'Desativar Fale com a Bia';
  chatBiaClose.appendChild(chatBiaCloseAnchor);
  chatBiaClose.classList.add('chatbia-close');

  chatBiaQrCode.replaceChildren(chatBiaOpen, chatBiaClose);

  const containerBiaQrCode = document.createElement('div');
  containerBiaQrCode.classList.add('container-bia-qrcode');
  const title = titleDiv.children[0];
  title.children[0].classList.add('title');
  const subtitle = subtitleDiv.children[0];
  subtitle.children[0].classList.add('subtitle');
  const description = descriptionDiv.children[0];
  description.children[0].classList.add('description');
  containerBiaQrCode.replaceChildren(title, subtitle, iconDiv, description);

  block.replaceChildren(chatBiaQrCode, containerBiaQrCode);
}
