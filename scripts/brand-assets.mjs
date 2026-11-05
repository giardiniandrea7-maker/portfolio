// Ricava il monogramma AG su fondo trasparente da src/assets/images/logo.png.
// Uso: npm run brand   →   src/assets/images/logo-ag.png (header, footer, anteprima social, icone)
// Le icone del sito si generano poi con: npm run icons
//
// Il fondo crema del file sorgente diventa trasparente: l'opacità di ogni pixel è calcolata
// dalla distanza di luminosità tra fondo e inchiostro, così i bordi restano morbidi.

import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const src = path.join(root, 'src/assets/images/logo.png');

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

console.log(`OK src/assets/images/logo-ag.png — colore ${ink.map((c) => c.toString(16).padStart(2, '0')).join('')}`);
