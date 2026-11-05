// Genera favicon e icone del sito dal monogramma AG dell'header (src/assets/images/logo-ag.png).
// Uso: npm run icons   (prima, se cambia logo.png: npm run brand)
//
// I nomi contengono la versione (-v2): cambiarla obbliga browser, iPhone e Google a riscaricare le icone.
// /favicon.ico resta anche alla radice, perché molti servizi lo cercano lì.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const pub = (f) => path.join(root, 'public', f);
const V = 'v2';

const IVORY = '#F5F1E8';
const ivory = { r: 0xf5, g: 0xf1, b: 0xe8, alpha: 1 };

// Monogramma su fondo trasparente, già nel colore del logo dell'header
const mark = await sharp(path.join(root, 'src/assets/images/logo-ag.png')).trim({ threshold: 1 }).png().toBuffer();

// Icona quadrata: monogramma centrato su avorio con margine interno (padding = frazione per lato)
const square = async (size, padding) => {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(mark).resize({ width: inner, height: inner, fit: 'inside' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: ivory } })
    .composite([{ input: logo, gravity: 'center' }])
    .flatten({ background: ivory })
    .png({ compressionLevel: 9 })
    .toBuffer();
};

const files = {};

files[`favicon-32-${V}.png`] = await square(32, 0.06);
files[`apple-touch-icon-${V}.png`] = await square(180, 0.12);
files[`icon-192-${V}.png`] = await square(192, 0.12);
files[`icon-512-${V}.png`] = await square(512, 0.12);
// Maskable: Android ritaglia fino al cerchio dell'area sicura (80%), quindi margine più ampio
files[`icon-maskable-512-${V}.png`] = await square(512, 0.22);

// favicon.ico con PNG incorporati 16/32/48
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(icoSizes.map((s) => square(s, 0.04)));
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

// favicon.svg: fondo avorio arrotondato + monogramma (PNG incorporato, bordi morbidi a ogni scala)
const svgMark = (await sharp(mark).resize({ width: 224, height: 224, fit: 'inside' }).png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true }));
const mw = svgMark.info.width;
const mh = svgMark.info.height;
files[`favicon-${V}.svg`] = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 256">` +
    `<rect width="256" height="256" rx="40" fill="${IVORY}"/>` +
    `<image x="${(256 - mw) / 2}" y="${(256 - mh) / 2}" width="${mw}" height="${mh}" xlink:href="data:image/png;base64,${svgMark.data.toString('base64')}"/>` +
    `</svg>`
);

// mask-icon (Safari, schede fissate): forma vettoriale monocromatica ricavata dal monogramma
const G = 160;
const { data: alpha, info } = await sharp(mark)
  .resize({ width: G, height: G, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extractChannel('alpha')
  .raw()
  .toBuffer({ resolveWithObject: true });
let d = '';
for (let y = 0; y < info.height; y++) {
  let x = 0;
  while (x < info.width) {
    if (alpha[y * info.width + x] > 110) {
      const start = x;
      while (x < info.width && alpha[y * info.width + x] > 110) x++;
      d += `M${start} ${y}h${x - start}v1h-${x - start}z`;
    } else x++;
  }
}
files[`mask-icon-${V}.svg`] = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}"><path fill="#000" d="${d}"/></svg>`
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
