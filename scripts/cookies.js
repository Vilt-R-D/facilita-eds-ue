function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function fecharModal() {
  const modal = document.querySelector('.cookies.js-cookie.is-hidden');
  const modalActive = document.querySelector('.c-overlay.active');
  if (modal) {
    modal.style.display = 'none';
  }
  if (modalActive) {
    modalActive.classList.remove('active');
  }
}

function fecharCookies() {
  const cookiesDivs = document.getElementsByClassName('cookies');
  const jsCookies = document.querySelector('.cookies.js-cookie');
  jsCookies.classList.add('is-hidden');

  [...cookiesDivs].forEach((cookiesDiv) => {
    cookiesDiv.style.display = 'none';
  });
}

function salvarConfiguracoesCookies() {
  const performance = document.querySelector('#performance').checked;
  const funcional = document.querySelector('#funcional').checked;
  const marketing = document.querySelector('#marketing').checked;

  setCookie('cookiePerformance', performance, 365);
  setCookie('cookieFunction', funcional, 365);
  setCookie('cookieMarketing', marketing, 365);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cookieContent',
    cookieNecessario: true,
    cookiePerformance: performance,
    cookieFunction: funcional,
    cookieMarketing: marketing,
  });

  fecharModal();
  fecharCookies();
}

function aceitarCookies() {
  const inputs = document.querySelectorAll('input[type="checkbox"].c-chkbox');
  inputs.forEach((input) => {
    input.checked = true;
  });

  setCookie('cookieNecessario', true, 365);
  setCookie('cookiePerformance', true, 365);
  setCookie('cookieFunction', true, 365);
  setCookie('cookieMarketing', true, 365);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cookieContent',
    cookieNecessario: true,
    cookiePerformance: true,
    cookieFunction: true,
    cookieMarketing: true,
  });

  fecharModal();
  fecharCookies();
}

function rejeitarCookiesNaoNecessarios() {
  const performance = document.querySelector('#performance');
  const funcional = document.querySelector('#funcional');
  const marketing = document.querySelector('#marketing');

  if (performance) performance.checked = false;
  if (funcional) funcional.checked = false;
  if (marketing) marketing.checked = false;

  setCookie('cookiePerformance', false, 365);
  setCookie('cookieFunction', false, 365);
  setCookie('cookieMarketing', false, 365);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cookieContent',
    cookieNecessario: true,
    cookiePerformance: false,
    cookieFunction: false,
    cookieMarketing: false,
  });

  fecharModal();
  fecharCookies();
}

// Cria modal
function abreModal(modalID) {
  if (localStorage.lgpd_bradesco !== modalID) {
    const modal = document.getElementById(modalID);

    if (modal) {
      modal.classList.add('active');

      modal.addEventListener('click', (e) => {
        if (e.target.id === modalID || e.target.className === 'c-closed') {
          modal.classList.remove('active');
        } else if (e.target.className === 'js-salvar') {
          localStorage.lgpd_bradesco = modalID;
        }
      });
    }
  }
}

// Inicia modal de configuração dos cookies
function configurarCookie() {
  const btnConfigurar = document.querySelector('.js-configurar');

  btnConfigurar.addEventListener('click', (e) => {
    abreModal('js-modal');
  });
}

// Variaveis globais
const ctaCookie = document.querySelector('.js-cookie');
let nomeClasse; let
  arr;
//  Variavel criada para evitar conflito com outras bibliotecas
const CookiesSemConflito = Cookies.noConflict();

// Função para gravar cookie
function aceitarCookie() {
  const btnAceitar = document.getElementById('aceitarCookies');
  const btnSalvar = document.getElementById('salvarCookies');
  const btnRejeitar = document.getElementById('rejeitarCookiesNaoNecessarios');
  const btnRejeitarCookies = document.getElementById('rejeitarCookies');

  nomeClasse = 'is-hidden';
  arr = ctaCookie.className.split(' ');

  // Verifica se há o nome do cookie se, existir ele não será exibido no proximo acesso no periodo de 12 meses
  if (CookiesSemConflito.get('lgpd')) {
    // adiciona classe is-hidden (compativel com todos navegadores)
    ctaCookie.className += ` ${nomeClasse}`;
  }

  btnAceitar.addEventListener('click', () => {
    // Definição do Cookie - chave , valor e expires (data de expiração)
    CookiesSemConflito.set('lgpd', true, {
      expires: 365,
    });

    if (arr.indexOf(nomeClasse) === -1) {
      ctaCookie.className += ` ${nomeClasse}`;
    }
  });

  btnSalvar.addEventListener('click', () => {
    // Definição do Cookie - chave , valor e expires (data de expiração)
    CookiesSemConflito.set('lgpd', true, {
      expires: 365,
    });

    if (arr.indexOf(nomeClasse) === -1) {
      ctaCookie.className += ` ${nomeClasse}`;
    }
  });

  btnRejeitar.addEventListener('click', () => {
    // Definição do Cookie - chave , valor e expires (data de expiração)
    CookiesSemConflito.set('lgpd', true, {
      expires: 365,
    });

    if (arr.indexOf(nomeClasse) === -1) {
      ctaCookie.className += ` ${nomeClasse}`;
    }
  });

  btnRejeitarCookies.addEventListener('click', () => {
    // Definição do Cookie - chave , valor e expires (data de expiração)
    CookiesSemConflito.set('lgpd', true, {
      expires: 365,
    });

    if (arr.indexOf(nomeClasse) === -1) {
      ctaCookie.className += ` ${nomeClasse}`;
    }
  });
}

// Função apenas para fechar o elemnto cookies completo
function fecharCookie() {
  const btnFechar = document.querySelector('.js-fechar');

  nomeClasse = 'is-hidden';
  arr = ctaCookie.className.split(' ');

  btnFechar.addEventListener('click', () => {
    if (arr.indexOf(nomeClasse) === -1) {
      ctaCookie.className += ` ${nomeClasse}`;
    }
  });
}

// troca o tagueamento no botao aceitar e fechar das diretivas de privacidade

let urlPrivacidade = window.location.href;
urlPrivacidade = urlPrivacidade.split('/');
const lnk = document.querySelector('.js-href');
const aceitar = document.querySelector('.js-aceitar');
const fechar = document.querySelector('.js-fechar');
const urlPF = 'https://www.bradescoseguranca.com.br/html/seguranca_corporativa/pf/seguranca-informacao/privacidade.shtm';
const urlPJ = 'https://www.bradescoseguranca.com.br/html/seguranca_corporativa/pj/seguranca-informacao/privacidade.shtm';

function trocarTagueamento(url) {
  if (!url) {
    if (urlPrivacidade[4] === 'classic') {
      lnk.setAttribute('href', urlPF);
      lnk.setAttribute('onclick', "trackBradesco('Portal Classic - Home','Menu Inferior - Informações Uteis','Botão - Diretiva de privacidade');");
      aceitar.setAttribute('onclick', "trackBradesco('Portal Classic - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
      fechar.setAttribute('onclick', "trackBradesco('Portal Classic - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
    }

    if (urlPrivacidade[4] === 'exclusive') {
      lnk.setAttribute('href', urlPF);
      lnk.setAttribute('onclick', "trackBradesco('Portal Exclusive - Home','Menu Inferior - Informações Uteis','Botão - Diretiva de privacidade');");
      aceitar.setAttribute('onclick', "trackBradesco('Portal Exclusive - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
      fechar.setAttribute('onclick', "trackBradesco('Portal Exclusive - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
    }

    if (urlPrivacidade[4] === 'prime') {
      lnk.setAttribute('href', urlPF);
      lnk.setAttribute('onclick', "trackBradesco('Portal Prime - Home','Menu Inferior - Informações Uteis','Botão - Diretiva de privacidade');");
      aceitar.setAttribute('onclick', "trackBradesco('Portal Prime - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
      fechar.setAttribute('onclick', "trackBradesco('Portal Prime - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
    }

    if (urlPrivacidade[3] === 'semanadobrasil') {
      lnk.setAttribute('href', urlPF);
      lnk.setAttribute('onclick', "trackBradesco('LP Semana do Brasil','Aviso de Cookies','Diretiva de Privacidade');");
      aceitar.setAttribute('onclick', "trackBradesco('LP Semana do Brasil','Aviso de Cookies','Fechar');");
      fechar.setAttribute('onclick', "trackBradesco('LP Semana do Brasil','Aviso de Cookies','Fechar');");
    }

    if (urlPrivacidade[3] === 'aguentefirme') {
      lnk.setAttribute('href', urlPF);
      lnk.setAttribute('onclick', "trackBradesco('LP Aguente Firme','Aviso de Cookies','Diretiva de Privacidade');");
      aceitar.setAttribute('onclick', "trackBradesco('LP Aguente Firme','Aviso de Cookies','Fechar');");
      fechar.setAttribute('onclick', "trackBradesco('LP Aguente Firme','Aviso de Cookies','Fechar');");
    }

    if (urlPrivacidade[4] === 'private') {
      lnk.setAttribute('href', urlPF);
    }

    if (urlPrivacidade[4] === 'corporate') {
      lnk.setAttribute('href', urlPJ);
    }

    if (urlPrivacidade[4] === 'pessoajuridica') {
      lnk.setAttribute('href', urlPJ);
    }

    if (urlPrivacidade[3] === 'semanadobrasil') {
      lnk.setAttribute('href', urlPF);
    }
  } else {
    lnk.setAttribute('onclick', "trackBradesco('Portal - Home','Menu Inferior - Informações Uteis','Botão - Diretiva de privacidade');");
    aceitar.setAttribute('onclick', "trackBradesco('Portal - Home','Menu Inferior - Informações Uteis','Botão - Aceitar');");
    fechar.setAttribute('onclick', "trackBradesco('Portal - Home','Menu Inferior - Informações Uteis','Botão - Fechar');");
  }
}

function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const cookieCta = document.querySelector('.cookies__cta');

  if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    cookieCta.style.marginBottom = '2.5rem';

    return 'iOS';
  }
  return 'unknown';
}

// Iniciliza todas as funções
function init() {
  fecharCookie();
  aceitarCookie();
  configurarCookie();
  trocarTagueamento();
  getMobileOperatingSystem();
}

init();

function getCookie(name) {
  const cookieArr = document.cookie.split(';');
  for (const cookie of cookieArr) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
}

function toggleCollapse(contentId, button) {
  const content = document.getElementById(contentId);
  if (content) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
    button.setAttribute('aria-expanded', !isExpanded);
  }
}

const performance = getCookie('cookiePerformance') === 'true';
const funcional = getCookie('cookieFunction') === 'true';
const marketing = getCookie('cookieMarketing') === 'true';

document.querySelector('#performance').checked = performance;
document.querySelector('#funcional').checked = funcional;
document.querySelector('#marketing').checked = marketing;

if (!document.cookie.includes('cookiePerformance')) {
  document.querySelector('#cookieModal').style.display = 'block';
}

document.querySelector('#salvarCookies').addEventListener('click', salvarConfiguracoesCookies);
document.querySelector('#rejeitarCookies').addEventListener('click', rejeitarCookiesNaoNecessarios);

document.querySelector('#aceitarCookies').addEventListener('click', aceitarCookies);
document.querySelector('#rejeitarCookiesNaoNecessarios').addEventListener('click', rejeitarCookiesNaoNecessarios);

function showCookie() {
  const preferencia = document.querySelector('.cookies.js-cookie.is-hidden');
  if (preferencia) {
    preferencia.style.display = 'block';

    const salvarButton = document.querySelector('#salvarCookies');
    if (salvarButton) {
      salvarButton.removeEventListener('click', salvarConfiguracoesCookies);
      salvarButton.addEventListener('click', salvarConfiguracoesCookies);
    }

    const rejeitarButton = document.querySelector('#rejeitarCookies');
    if (rejeitarButton) {
      rejeitarButton.removeEventListener('click', rejeitarCookiesNaoNecessarios);
      rejeitarButton.addEventListener('click', rejeitarCookiesNaoNecessarios);
    }

    const fechar = document.querySelector('.cookies.js-cookie.is-hidden.is-hidden.is-hidden');
    if (fechar) {
      fechar.removeEventListener('click', () => {
        preferencia.style.display = 'none';
      });
      fechar.addEventListener('click', () => {
        preferencia.style.display = 'none';
      });
    }
  }
}

function enviarDadosCookies() {
  const performance = document.querySelector('#performance').checked;
  const funcional = document.querySelector('#funcional').checked;
  const marketing = document.querySelector('#marketing').checked;

  setCookie('cookiePerformance', performance, 365);
  setCookie('cookieFunction', funcional, 365);
  setCookie('cookieMarketing', marketing, 365);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cookieContent',
    cookieNecessario: true,
    cookiePerformance: performance,
    cookieFunction: funcional,
    cookieMarketing: marketing,
  });
}

const cookieFechado = document.getElementById('cookies');

if (cookieFechado) {
  const cookieNecessario = getCookie('cookieNecessario');
  const cookiePerformance = getCookie('cookiePerformance');
  const cookieFuncional = getCookie('cookieFunction');
  const cookieMarketing = getCookie('cookieMarketing');

  if (!cookieNecessario
        && !cookiePerformance
        && !cookieFuncional
        && !cookieMarketing
  ) {
    cookieFechado.style.display = 'block';
  }
}
