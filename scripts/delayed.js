import { appendGTM, startGTM } from './gtm.js';

// add delayed functionality here
async function loadIcons() {
  // Vamos baixar as definições SVG.
  const response = await fetch('icons/icons.xml');
  const isXml = response.headers.get('content-type') === 'application/xml';
  if (!response.ok || !isXml) return;

  const xmlBody = await response.text();
  const parser = new DOMParser();
  const svgDom = parser.parseFromString(xmlBody, 'image/svg+xml');

  document.body.prepend(svgDom.documentElement);
}

loadIcons();
appendGTM();
startGTM();
