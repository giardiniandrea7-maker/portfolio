// Genera favicon e icone del sito dal simbolo quadrato del logo firma ufficiale (public/logo-firma.*).
// Uso: npm run icons
//
// I nomi contengono la versione (-v4): cambiarla obbliga browser, iPhone e Google a riscaricare le icone.
// /favicon.ico resta anche alla radice, perché molti servizi lo cercano lì.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const pub = (f) => path.join(root, 'public', f);
const V = 'v4';

const IVORY = '#F5F1E8';
const white = { r: 255, g: 255, b: 255, alpha: 1 };

// Simbolo: il quadrato a sinistra del logo firma, ritagliato dal bianco intorno
const source = ['svg', 'png', 'webp', 'jpg', 'jpeg'].map((e) => pub(`logo-firma.${e}`)).find((f) => fs.existsSync(f));
if (!source) throw new Error('Manca public/logo-firma.* (svg, png, webp, jpg o jpeg)');
const meta = await sharp(source).metadata();
const leftPart = await sharp(source)
  .extract({ left: 0, top: 0, width: Math.round(meta.height * 0.55), height: meta.height })
  .png()
  .toBuffer();
const mark = await sharp(leftPart).trim({ threshold: 40 }).png().toBuffer();

// Icona quadrata: simbolo centrato su bianco con margine interno (padding = frazione per lato)
const square = async (size, padding) => {
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)));
  const logo = await sharp(mark).resize({ width: inner, height: inner, fit: 'fill', kernel: 'lanczos3' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: white } })
    .composite([{ input: logo, gravity: 'center' }])
    .flatten({ background: white })
    .png({ compressionLevel: 9 })
    .toBuffer();
};

const files = {};

files[`favicon-32-${V}.png`] = await square(32, 0);
files[`apple-touch-icon-${V}.png`] = await square(180, 0.12);
files[`icon-192-${V}.png`] = await square(192, 0.12);
files[`icon-512-${V}.png`] = await square(512, 0.12);
// Maskable: Android ritaglia fino al cerchio dell'area sicura (80%), quindi margine più ampio
files[`icon-maskable-512-${V}.png`] = await square(512, 0.22);

// favicon.ico con PNG incorporati 16/32/48
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(icoSizes.map((s) => square(s, 0)));
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

// favicon.svg: simbolo come PNG incorporato
const svgPng = await sharp(mark).resize(128, 128, { fit: 'fill' }).png({ compressionLevel: 9 }).toBuffer();
files[`favicon-${V}.svg`] = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128">` +
    `<image width="128" height="128" xlink:href="data:image/png;base64,${svgPng.toString('base64')}"/></svg>`
);
// mask-icon (Safari, schede fissate): forma monocromatica quadrata
files[`mask-icon-${V}.svg`] = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#000"/></svg>`
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
