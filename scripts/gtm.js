/* eslint-disable camelcase */
/* eslint-disable quotes */

function normalizeStr(str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replaceAll(' ', '-')
    .replaceAll('--', '-');
}

export function appendGTM() {
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-KPLBJPKG';
  iframe.height = 0;
  iframe.width = 0;
  iframe.style = 'display:none;visibility:hidden';
  noscript.appendChild(iframe);

  const body = document.querySelector('body');
  const head = document.querySelector('head');

  if (body.firstChild) body.insertBefore(noscript, body.firstChild);
  else body.appendChild(noscript);

  const script = document.createElement('script');
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-MRWK5Q98');`;

  if (head.firstChild) head.insertBefore(script, head.firstChild);
  else head.appendChild(head);
}

function trackDynamicCard(elementTitle) {
  const filterNames = {
    0: 'todos',
    1: 'bia',
    2: 'credito-financiamento',
    3: 'conta',
    4: 'cartao',
  };

  const activeFilter = document.querySelector('.lp-others').getAttribute('data-filter') || '0';
  const filterName = filterNames[activeFilter] || 'todos';
  const dataLayer = window.dataLayer || [];

  dataLayer.push({
    event: 'Event_Data',
    event_type: 'new',
    ga_event: {
      location: '/lp/bradesco-facilidades',
      action: 'clique-botao',
      element_name: elementTitle,
    },
    product: {
      product: 'institucional',
      flow: 'consulta',
    },
    cd: {
      element_title: filterName,
    },
    user: {
      logged_user: 'deslogado',
    },
    up: {},
  });
}

export function startGTM() {
  const { dataLayer } = window;
  dataLayer.push({
    event: 'page_view',
    event_type: 'new',
    page: {
      page_location: '/lp/bradesco-facilidades',
      page_title: 'bradesco-facilidades',
    },
    product: { product: 'institucional', flow: 'consulta' },
    user: { logged_user: 'deslogado' },
    debug: { url_webview: document.URL, hostname_webview: document.location.hostname },
  });

  const defaultInfo = {
    event: 'Event_Data',
    event_type: 'new',
    ga_event: {
      location: '/lp/bradesco-facilidades',
    },
    product: { product: 'institucional' },
    user: { logged_user: 'deslogado' },
    up: {},
  };

  const carouselCards = [...document.querySelectorAll('.lp-slide')];
  carouselCards.forEach((card) => {
    const button = card.querySelector('.lp-actions');
    const text = button.querySelector('p');
    const anchor = button.querySelector('a');
    const video = card.querySelector('.lp-videocard a');
    const videoTitle = video.getAttribute('aria-label');

    const normalizeText = normalizeStr(text.textContent);
    anchor.onclick = () => dataLayer.push(
      {
        ...defaultInfo,
        ga_event: {
          ...defaultInfo.ga_event,
          action: 'clique-botao',
          element_name: normalizeText,
        },
        product: {
          ...defaultInfo.product,
          flow: 'consulta',
        },
        cd: {
          element_title: videoTitle,
        },
      },
    );

    video.onclick = () => {
      dataLayer.push(
        {
          ...defaultInfo,
          ga_event: {
            ...defaultInfo.ga_event,
            action: 'clique-video',
            element_name: videoTitle,
          },
          product: {
            ...defaultInfo.product,
            flow: 'video',
          },
        },
      );
    };
  });

  const filters = [...document.querySelectorAll('.lp-filters ul li')];
  filters.forEach((filter) => {
    const name = filter.textContent.trim();
    filter.onclick = () => dataLayer.push(
      {
        ...defaultInfo,
        ga_event: {
          ...defaultInfo.ga_event,
          action: 'clique-botao',
          element_name: normalizeStr(name),
        },
        product: {
          ...defaultInfo.product,
          flow: 'consulta',
        },
      },
    );
  });

  const cards = [...document.querySelectorAll('.lp-card')];
  cards.forEach((card) => {
    const title = card.querySelector('h3').textContent.trim();
    card.onclick = () => trackDynamicCard(normalizeStr(title));
  });

  const [appStore, playStore] = document.querySelector('.app-teaser .lp-action').children;
  appStore.onclick = () => dataLayer.push(
    {
      ...defaultInfo,
      ga_event: {
        ...defaultInfo.ga_event,
        action: 'clique-botao',
        element_name: 'app-store',
      },
      product: {
        ...defaultInfo.product,
        flow: 'abra-sua-conta',
      },
    },
  );

  playStore.onclick = () => dataLayer.push(
    {
      ...defaultInfo,
      ga_event: {
        ...defaultInfo.ga_event,
        action: 'clique-botao',
        element_name: 'google-play',
      },
      product: {
        ...defaultInfo.product,
        flow: 'abra-sua-conta',
      },
    },
  );

  const bia = document.querySelector('.teaser .lp-action .lp-btn a');
  bia.onclick = () => dataLayer.push(
    {
      ...defaultInfo,
      ga_event: {
        ...defaultInfo.ga_event,
        action: 'clique-botao',
        element_name: 'autorizar-agora',
      },
      product: {
        ...defaultInfo.product,
        flow: 'consulta',
      },
    },
  );
}

export default appendGTM;
