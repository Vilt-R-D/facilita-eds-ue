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
  const icon = createOptimizedPicture(`icons/${socialMedia}.${extension}`);

  return icon;
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

  const cUteis = document.createElement('div');
  cUteis.classList.add('c-uteis');
  const cCtnrUteis = document.createElement('div');
  cCtnrUteis.classList.add('c-ctnr');

  const cUteisNav = document.createElement('nav');
  const cUteisNavUl = document.createElement('ul');

  const infosLi = document.createElement('li');
  const infosAnchor = document.createElement('a');
  infosAnchor.href = '#';
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
  supportAnchor.href = '#';
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
  sitesAnchor.href = '#';
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

  block.replaceChildren(cUteis, cGradiente);
}
