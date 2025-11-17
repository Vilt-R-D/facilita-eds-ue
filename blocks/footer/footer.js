/* eslint-disable no-script-url */
import { createOptimizedPicture } from '../../scripts/aem.js';

function chunkArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}

function getBaseLetter(str) {
  if (str === 'Bradesco Shop') return 's';

  return str[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function groupAndSortAnchors(arr) {
  const map = new Map();

  arr.forEach((anchor) => {
    const str = anchor.textContent.trim();
    if (str.length === 0) return;

    const baseLetter = getBaseLetter(str);

    if (!map.has(baseLetter)) {
      map.set(baseLetter, []);
    }
    map.get(baseLetter).push(anchor);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    // eslint-disable-next-line no-unused-vars
    .map(([_, chunk]) => chunk);
}

function getSocialMediaIcon(str) {
  const valids = ['facebook', 'instagram', 'linkedin', 'tiktok', 'x', 'youtube'];
  const socialMedia = str.toLowerCase();

  if (!valids.includes(socialMedia)) return null;

  const extension = socialMedia === 'x' ? 'png' : 'svg';
  const icon = createOptimizedPicture(`${window.hlx.codeBasePath}/icons/${socialMedia}.${extension}`);

  return icon;
}

function getCookiesCTA() {
  const cookieCta = document.createElement('div');
  cookieCta.id = 'cookie-cta';

  const cookiesDiv = document.createElement('div');
  cookiesDiv.id = 'cookies';
  cookiesDiv.className = 'cookies js-cookie is-hidden is-hidden';
  cookiesDiv.style.display = 'block';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'cookies__content';

  const descriptionDiv = document.createElement('div');
  descriptionDiv.className = 'cookies__description';
  const descriptionP = document.createElement('p');
  descriptionP.innerHTML = 'Usamos cookies pra oferecer a melhor experiência, analisar o uso de nosso site e direcionar conteúdos e anúncios personalizados. Pra mais informações, consulte nossa <a href="/seguranca/seguranca-da-informacao/privacidade.shtm" target="_blank" style="text-decoration: underline !important">Diretiva de Privacidade</a>.';
  descriptionDiv.appendChild(descriptionP);

  const ctaDiv = document.createElement('div');
  ctaDiv.className = 'cookies__cta';

  const rejectBtn = document.createElement('a');
  rejectBtn.role = 'button';
  rejectBtn.title = 'Rejeitar cookies não necessários';
  rejectBtn.className = 'c-btn rejeitar';
  rejectBtn.id = 'rejeitarCookiesNaoNecessarios';
  rejectBtn.textContent = 'Rejeitar cookies não necessários';

  const configBtn = document.createElement('a');
  configBtn.role = 'button';
  configBtn.title = 'Configurar cookies';
  configBtn.className = 'c-btn configurar js-configurar';
  configBtn.textContent = 'Configurar cookies';

  const acceptBtn = document.createElement('a');
  acceptBtn.role = 'button';
  acceptBtn.title = 'Aceitar cookies';
  acceptBtn.className = 'c-btn aceitar js-aceitar';
  acceptBtn.id = 'aceitarCookies';
  acceptBtn.textContent = 'Aceitar cookies';

  const closeSpan = document.createElement('span');
  closeSpan.className = 'cookies__closed js-fechar hidden';
  closeSpan.title = 'Fechar';
  closeSpan.textContent = 'x';

  ctaDiv.append(rejectBtn, configBtn, acceptBtn, closeSpan);
  contentDiv.append(descriptionDiv, ctaDiv);
  cookiesDiv.appendChild(contentDiv);
  cookieCta.appendChild(cookiesDiv);

  return cookieCta;
}

function getCookieModal() {
  const cookieModal = document.createElement('div');
  cookieModal.id = 'cookie-modal';

  const overlayDiv = document.createElement('div');
  overlayDiv.id = 'js-modal';
  overlayDiv.className = 'c-overlay';

  const modalDiv = document.createElement('div');
  modalDiv.className = 'c-modal c-modal--radius c-modal--shadow';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'c-closed';
  closeBtn.title = 'Fechar';
  closeBtn.textContent = 'X';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'c-modal__header';
  const headerH1 = document.createElement('h1');
  headerH1.textContent = 'Selecione os cookies que você quer aceitar';
  const headerP = document.createElement('p');
  headerP.textContent = 'Os cookies usam dados coletados pra personalizar e melhorar sua navegação, respeitando seus direitos. É possível bloquear alguns tipos de cookies, mas isso pode afetar sua experiência no site.';
  headerDiv.append(headerH1, headerP);

  const contentContainer = document.createElement('div');
  contentContainer.id = 'cookieModal';

  const modalContent = document.createElement('div');
  modalContent.className = 'c-modal__content';

  const listUl = document.createElement('ul');
  listUl.className = 'c-ul--none';

  // Item 1 - Cookies Necessários
  const item1 = document.createElement('li');
  const headerContent1 = document.createElement('div');
  headerContent1.className = 'header-content';
  const input1 = document.createElement('input');
  input1.type = 'checkbox';
  input1.id = 'necessary';
  input1.className = 'c-chkbox';
  input1.checked = true;
  input1.disabled = true;
  const button1 = document.createElement('button');
  button1.textContent = 'Cookies Necessários';
  button1.setAttribute('aria-expanded', 'false');
  headerContent1.append(input1, button1);
  const collapse1 = document.createElement('div');
  collapse1.id = 'collapseContent01';
  collapse1.className = 'collapse-content cookie';
  collapse1.style.display = 'none';
  const collapseP1 = document.createElement('p');
  collapseP1.textContent = 'Permitem o funcionamento correto do site e o uso dos serviços oferecidos. Se quiser, você pode bloquear esses cookies diretamente no seu navegador, mas isso pode prejudicar a sua experiência.';
  collapse1.appendChild(collapseP1);
  item1.append(headerContent1, collapse1);

  // Item 2 - Cookies de Desempenho
  const item2 = document.createElement('li');
  const headerContent2 = document.createElement('div');
  headerContent2.className = 'header-content';
  const input2 = document.createElement('input');
  input2.type = 'checkbox';
  input2.id = 'performance';
  input2.className = 'c-chkbox';
  const button2 = document.createElement('button');
  button2.textContent = 'Cookies de Desempenho';
  button2.setAttribute('aria-expanded', 'false');
  headerContent2.append(input2, button2);
  const collapse2 = document.createElement('div');
  collapse2.id = 'collapseContent02';
  collapse2.className = 'collapse-content cookie';
  collapse2.style.display = 'none';
  const collapseP2 = document.createElement('p');
  collapseP2.innerHTML = 'Usamos esses cookies para entender as interações com o site, tempo de visita e eventuais problemas na navegação. Por meio do Google Analytics, coletamos dados e analisamos o desempenho do site para melhorar sua experiência. Para mais informações, acesse: <a href="https://policies.google.com/technologies/partner-sites" target="_blank">https://policies.google.com/technologies/partner-sites</a>';
  collapse2.appendChild(collapseP2);
  item2.append(headerContent2, collapse2);

  // Item 3 - Cookies Funcionais
  const item3 = document.createElement('li');
  const headerContent3 = document.createElement('div');
  headerContent3.className = 'header-content';
  const input3 = document.createElement('input');
  input3.type = 'checkbox';
  input3.id = 'funcional';
  input3.className = 'c-chkbox';
  const button3 = document.createElement('button');
  button3.textContent = 'Cookies Funcionais';
  button3.setAttribute('aria-expanded', 'false');
  headerContent3.append(input3, button3);
  const collapse3 = document.createElement('div');
  collapse3.id = 'collapseContent03';
  collapse3.className = 'collapse-content cookie';
  collapse3.style.display = 'none';
  const collapseP3 = document.createElement('p');
  collapseP3.textContent = 'Permitem que nosso site relembre suas escolhas para oferecer uma experiência personalizada. Com esses cookies, você pode assistir vídeos, fazer comentários, usar fóruns e outras funções.';
  collapse3.appendChild(collapseP3);
  item3.append(headerContent3, collapse3);

  // Item 4 - Cookies de Marketing
  const item4 = document.createElement('li');
  const headerContent4 = document.createElement('div');
  headerContent4.className = 'header-content';
  const input4 = document.createElement('input');
  input4.type = 'checkbox';
  input4.id = 'marketing';
  input4.className = 'c-chkbox';
  const button4 = document.createElement('button');
  button4.textContent = 'Cookies de Marketing';
  button4.setAttribute('aria-expanded', 'false');
  headerContent4.append(input4, button4);
  const collapse4 = document.createElement('div');
  collapse4.id = 'collapseContent04';
  collapse4.className = 'collapse-content cookie cookie';
  collapse4.style.display = 'none';
  const collapseP4 = document.createElement('p');
  collapseP4.textContent = 'São usados para oferecer conteúdos mais relevantes, que podem apresentar uma publicidade que mais combina com você ou limitar a frequência com que alguns anúncios aparecem. Eles também ajudam a avaliar o desempenho de uma campanha publicitária.';
  collapse4.appendChild(collapseP4);
  item4.append(headerContent4, collapse4);

  listUl.append(item1, item2, item3, item4);
  modalContent.appendChild(listUl);
  contentContainer.appendChild(modalContent);

  const avisoP = document.createElement('p');
  avisoP.className = 'aviso';
  avisoP.innerHTML = 'Para mais informações sobre como configurar os cookies de seu navegador nossa <a href="/seguranca/seguranca-da-informacao/privacidade.shtm" target="_blank">Diretiva de Privacidade</a>';

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'buttons-modal';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'c-btn aceitar configuracoes';
  saveBtn.id = 'salvarCookies';
  saveBtn.textContent = 'Salvar configurações';
  const rejectBtn = document.createElement('button');
  rejectBtn.className = 'c-btn rejeitar naoncessarios';
  rejectBtn.id = 'rejeitarCookies';
  rejectBtn.textContent = 'Rejeitar não necessários';
  buttonsDiv.append(saveBtn, rejectBtn);

  contentContainer.append(avisoP, buttonsDiv);
  modalDiv.append(closeBtn, headerDiv, contentContainer);
  overlayDiv.appendChild(modalDiv);
  cookieModal.appendChild(overlayDiv);

  return cookieModal;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const [
    infosDiv, supportDiv, sitesDiv, socialMediaDiv, addressDiv, logoDiv, linksDiv,
  ] = block.children;

  block.classList.add('c-footer');
  console.log({ infosDiv, supportDiv, sitesDiv, socialMediaDiv, addressDiv, logoDiv, linksDiv })

  const cUteis = document.createElement('div');
  cUteis.classList.add('c-uteis');
  const cCtnrUteis = document.createElement('div');
  cCtnrUteis.classList.add('c-ctnr');

  const cUteisNav = document.createElement('nav');
  const cUteisNavUl = document.createElement('ul');

  const infosLi = document.createElement('li');
  const infosAnchor = document.createElement('a');
  infosAnchor.href = 'javascript:;';
  infosAnchor.textContent = 'Informações Úteis';
  infosLi.classList.add('c-uteis__lnk', 'js-content');
  infosLi.appendChild(infosAnchor);
  const infoContentLi = document.createElement('li');
  infoContentLi.classList.add('c-uteis__content', 'js-content', 'is-closed');
  const infos = chunkArray([...infosDiv.querySelectorAll('li')], 3);
  infos.forEach((info) => {
    const ul = document.createElement('ul');
    ul.classList.add('c-info');
    ul.replaceChildren(...info);
    infoContentLi.appendChild(ul);
  });

  const supportLi = document.createElement('li');
  const supportAnchor = document.createElement('a');
  supportAnchor.href = 'javascript:;';
  supportAnchor.textContent = 'Atendimento';
  supportLi.classList.add('c-uteis__lnk', 'js-content', 'is-active');
  supportLi.appendChild(supportAnchor);
  const supportContentLi = document.createElement('li');
  supportContentLi.classList.add('c-uteis__content', 'js-content', 'is-open', 'a-fadeIn');
  const support = [...supportDiv.querySelectorAll('div > ul > li')];
  support.forEach((phone) => {
    const ul = document.createElement('ul');
    ul.classList.add('c-facil');
    ul.replaceChildren(phone);
    supportContentLi.appendChild(ul);
  });

  const sitesLi = document.createElement('li');
  const sitesAnchor = document.createElement('a');
  sitesAnchor.href = 'javascript:;';
  sitesAnchor.textContent = 'Sites Bradesco';
  sitesLi.classList.add('c-uteis__lnk', 'js-content');
  sitesLi.appendChild(sitesAnchor);
  const sitesContentLi = document.createElement('li');
  sitesContentLi.classList.add('c-uteis__content', 'js-content', 'is-closed');
  const sites = sitesDiv.querySelectorAll('a');
  const sitesNav = document.createElement('nav');
  sitesNav.classList.add('c-map', 'js-acc-map');
  sitesContentLi.appendChild(sitesNav);

  groupAndSortAnchors(sites).forEach((group) => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('c-map__item');
    const letter = getBaseLetter(group[0].textContent.trim());
    const groupH3 = document.createElement('h3');
    groupH3.textContent = letter;

    const groupUl = document.createElement('ul');
    group.forEach((anchor) => {
      const li = document.createElement('li');
      li.appendChild(anchor);
      groupUl.appendChild(li);
    });

    groupDiv.replaceChildren(groupH3, groupUl);
    sitesNav.appendChild(groupDiv);
  });

  // eslint-disable-next-line max-len
  cUteisNavUl.replaceChildren(infosLi, infoContentLi, supportLi, supportContentLi, sitesLi, sitesContentLi);
  cUteisNav.appendChild(cUteisNavUl);
  cCtnrUteis.appendChild(cUteisNav);
  cUteis.appendChild(cCtnrUteis);

  const cGradiente = document.createElement('div');
  cGradiente.classList.add('c-gradiente');

  const cCtnrGradiente = document.createElement('div');
  cCtnrGradiente.classList.add('c-ctnr');

  const cSeguir = document.createElement('div');
  cSeguir.classList.add('c-seguir');
  const cSeguirNav = document.createElement('nav');
  const cSeguirUl = document.createElement('ul');
  const cSeguirLi = document.createElement('li');
  const cSeguirSpan = document.createElement('span');
  cSeguirSpan.textContent = 'Acompanhe:';
  cSeguirLi.appendChild(cSeguirSpan);
  cSeguirUl.appendChild(cSeguirLi);

  const socialMedias = [...socialMediaDiv.querySelectorAll('a')];
  socialMedias.forEach((socialMedia) => {
    const socialMediaLi = document.createElement('li');
    socialMediaLi.appendChild(socialMedia);
    const icon = getSocialMediaIcon(socialMedia.textContent.trim());

    socialMedia.target = '_blank';
    if (icon) socialMedia.replaceChildren(icon);

    cSeguirUl.appendChild(socialMediaLi);
  });

  cSeguirNav.appendChild(cSeguirUl);
  cSeguir.appendChild(cSeguirNav);

  const cEndereco = document.createElement('div');
  cEndereco.classList.add('c-endereco');
  const address = document.createElement('address');
  address.innerHTML = addressDiv.querySelector('p').innerHTML;
  cEndereco.appendChild(address);

  const cBrand = document.createElement('div');
  cBrand.classList.add('c-brand');
  const logo = logoDiv.querySelector('picture');
  cBrand.appendChild(logo);

  const cRapido = document.createElement('div');
  cRapido.classList.add('c-rapido');
  const cRapidoNav = document.createElement('nav');
  const links = linksDiv.querySelector('ul');
  const linkSpan = document.createElement('span');
  linkSpan.textContent = ' | ';
  const linksLis = links.querySelectorAll('li');
  [...linksLis].forEach((link, index) => {
    if (index === linksLis.length - 1) return;
    const linkAnchor = link.querySelector('a');
    linkAnchor.appendChild(linkSpan.cloneNode(true));
  });
  cRapidoNav.appendChild(links);
  cRapido.appendChild(cRapidoNav);

  cCtnrGradiente.replaceChildren(cSeguir, cEndereco, cBrand, cRapido);
  cGradiente.appendChild(cCtnrGradiente);

  const cookiesCta = getCookiesCTA();
  const cookieModal = getCookieModal();

  block.replaceChildren(cUteis, cGradiente, cookiesCta, cookieModal);
}
