// Genera logo e icone del sito dal monogramma AG (src/assets/images/logo.png).
// Uso: npm run brand
//
// - src/assets/images/logo-ag.png       monogramma ritagliato su fondo trasparente (header, footer, anteprima social)
// - public/favicon.ico                  16/32/48 px (scheda del browser)
// - public/favicon.png                  64 px
// - public/apple-touch-icon.png         180 px (icona su iPhone/iPad)
// - public/icon-192.png, icon-512.png   icone del manifest
//
// Il fondo crema del file sorgente diventa trasparente: l'opacità di ogni pixel è calcolata
// dalla distanza di luminosità tra fondo e inchiostro, così i bordi restano morbidi.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const src = path.join(root, 'src/assets/images/logo.png');
const pub = (f) => path.join(root, 'public', f);

// Fondo delle icone quadrate: avorio del sito
const IVORY = { r: 246, g: 243, b: 237 };

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

// Fondo = luminosità tipica dell'angolo, inchiostro = pixel più scuro
const bgLum = lum(0);
let inkLum = 255;
let ink = [0, 0, 0];
for (let i = 0; i < data.length; i += 3) {
  const l = lum(i);
  if (l < inkLum) {
    inkLum = l;
    ink = [data[i], data[i + 1], data[i + 2]];
  }
}

const rgba = Buffer.alloc(info.width * info.height * 4);
for (let p = 0, i = 0; i < data.length; i += 3, p += 4) {
  const a = Math.max(0, Math.min(1, (bgLum - lum(i)) / (bgLum - inkLum - 10)));
  rgba[p] = ink[0];
  rgba[p + 1] = ink[1];
  rgba[p + 2] = ink[2];
  rgba[p + 3] = Math.round(a * 255);
}

const mark = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer({ resolveWithObject: true });

await sharp(mark.data).resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(path.join(root, 'src/assets/images/logo-ag.png'));

// Icona quadrata: monogramma centrato su avorio, con margine
const square = async (size, padding = 0.14) => {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(mark.data).resize({ width: inner, height: inner, fit: 'inside' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { ...IVORY, alpha: 1 } } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
};

fs.writeFileSync(pub('favicon.png'), await square(64, 0.08));
fs.writeFileSync(pub('apple-touch-icon.png'), await square(180));
fs.writeFileSync(pub('icon-192.png'), await square(192));
fs.writeFileSync(pub('icon-512.png'), await square(512));

// favicon.ico con immagini PNG incorporate (formato supportato da tutti i browser moderni)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => square(s, 0.04)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s, o);
  header.writeUInt8(s, o + 1);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(pngs[i].length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += pngs[i].length;
});
fs.writeFileSync(pub('favicon.ico'), Buffer.concat([header, ...pngs]));

for (const f of ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  console.log(`OK public/${f} — ${(fs.statSync(pub(f)).size / 1024).toFixed(1)} KB`);
}
console.log(`OK src/assets/images/logo-ag.png — colore ${ink.map((c) => c.toString(16).padStart(2, '0')).join('')}`);
