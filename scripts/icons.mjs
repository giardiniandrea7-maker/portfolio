// Genera favicon e icone del sito.
// Uso: npm run icons
//
// PROVVISORIO: un cerchio pieno verde, senza lettere né segni grafici personali (Vademecum Fideuram, pag. 11 e 22).
// Quando arriverà il logo firma ufficiale si sostituirà il disegno qui sotto e si alzerà la versione.
//
// I nomi contengono la versione (-v3): cambiarla obbliga browser, iPhone e Google a riscaricare le icone.
// /favicon.ico resta anche alla radice, perché molti servizi lo cercano lì.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const pub = (f) => path.join(root, 'public', f);
const V = 'v3';

const GREEN = '#006837';
const IVORY = '#F5F1E8';

// Cerchio verde su fondo trasparente (favicon) o avorio (icone che devono essere piene)
const circleSvg = (size, { padding, background }) => {
  const r = (size / 2) * (1 - padding * 2);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      (background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '') +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${GREEN}"/></svg>`
  );
};
const png = (size, opts) => sharp(circleSvg(size, opts)).png({ compressionLevel: 9 }).toBuffer();

const files = {};

files[`favicon-32-${V}.png`] = await png(32, { padding: 0.04 });
files[`apple-touch-icon-${V}.png`] = await png(180, { padding: 0.16, background: IVORY });
files[`icon-192-${V}.png`] = await png(192, { padding: 0.12, background: IVORY });
files[`icon-512-${V}.png`] = await png(512, { padding: 0.12, background: IVORY });
// Maskable: Android ritaglia fino al cerchio dell'area sicura (80%), quindi margine più ampio
files[`icon-maskable-512-${V}.png`] = await png(512, { padding: 0.24, background: IVORY });

// favicon.ico con PNG incorporati 16/32/48
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(icoSizes.map((s) => png(s, { padding: 0.03 })));
const header = Buffer.alloc(6 + 16 * icoSizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);
let offset = header.length;
icoSizes.forEach((s, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s, o);
  header.writeUInt8(s, o + 1);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(icoPngs[i].length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += icoPngs[i].length;
});
const ico = Buffer.concat([header, ...icoPngs]);
files[`favicon-${V}.ico`] = ico;
files['favicon.ico'] = ico;

files[`favicon-${V}.svg`] = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${GREEN}"/></svg>`
);
// mask-icon (Safari, schede fissate): forma monocromatica
files[`mask-icon-${V}.svg`] = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#000"/></svg>`
);

// Manifest
files[`site-${V}.webmanifest`] = Buffer.from(
  JSON.stringify(
    {
      name: 'Andrea Giardini',
      short_name: 'A. Giardini',
      icons: [
        { src: `/icon-192-${V}.png`, sizes: '192x192', type: 'image/png' },
        { src: `/icon-512-${V}.png`, sizes: '512x512', type: 'image/png' },
        { src: `/icon-maskable-512-${V}.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      background_color: IVORY,
      theme_color: IVORY,
      display: 'standalone',
      start_url: '/',
    },
    null,
    2
  ) + '\n'
);

for (const [name, buf] of Object.entries(files)) {
  fs.writeFileSync(pub(name), buf);
  console.log(`OK public/${name} — ${(buf.length / 1024).toFixed(1)} KB`);
}
