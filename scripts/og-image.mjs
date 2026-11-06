// Genera l'immagine di anteprima per i social (WhatsApp, Facebook, LinkedIn, Google).
// Uso: npm run og  →  public/og/og-home-v5.jpg (1200x630, JPEG q85, max 300 KB)
//
// Solo testo, nessun logo (Vademecum Fideuram, pag. 11 e 22): nome, qualifica breve e indirizzo del sito.
// Tutto il contenuto resta nell'area centrale 1000x500: WhatsApp e LinkedIn tagliano i bordi.
// Il nome file contiene la versione (v5): cambiarla forza i social a riscaricare l'anteprima.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const out = path.join(root, 'public/og/og-home-v5.jpg');

// Palette del sito (tailwind.config.js)
const C = { ivory: '#F6F3ED', brand: '#006937', charcoal: '#1E2421', ember: '#E04403', muted: '#5C635F' };

const W = 1200;
const H = 630;
// Area sicura 1000x500 centrata
const SAFE = { x: 100, y: 65, w: 1000, h: 500 };

// Pango legge solo TTF/OTF: converto i WOFF di @fontsource (sfnt + tabelle zlib) in TTF temporanei
function woffToTtf(buf) {
  const numTables = buf.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20;
    tables.push({
      tag: buf.readUInt32BE(o),
      offset: buf.readUInt32BE(o + 4),
      compLength: buf.readUInt32BE(o + 8),
      origLength: buf.readUInt32BE(o + 12),
      checksum: buf.readUInt32BE(o + 16),
    });
  }
  let searchRange = 1;
  let entrySelector = 0;
  while (searchRange * 2 <= numTables) {
    searchRange *= 2;
    entrySelector++;
  }
  const header = Buffer.alloc(12 + 16 * numTables);
  header.writeUInt32BE(buf.readUInt32BE(4), 0);
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(searchRange * 16, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(numTables * 16 - searchRange * 16, 10);
  let offset = header.length;
  const chunks = [];
  tables.forEach((t, i) => {
    let data = buf.subarray(t.offset, t.offset + t.compLength);
    if (t.compLength < t.origLength) data = zlib.inflateSync(data);
    const pad = (4 - (data.length % 4)) % 4;
    const o = 12 + i * 16;
    header.writeUInt32BE(t.tag, o);
    header.writeUInt32BE(t.checksum, o + 4);
    header.writeUInt32BE(offset, o + 8);
    header.writeUInt32BE(t.origLength, o + 12);
    chunks.push(data, Buffer.alloc(pad));
    offset += data.length + pad;
  });
  return Buffer.concat([header, ...chunks]);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-fonts-'));
const toTtf = (rel, name) => {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, woffToTtf(fs.readFileSync(path.join(root, rel))));
  return file;
};
const fonts = {
  playfair: toTtf('node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff', 'playfair.ttf'),
  manrope: toTtf('node_modules/@fontsource/manrope/files/manrope-latin-500-normal.woff', 'manrope-500.ttf'),
  manropeRegular: toTtf('node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff', 'manrope-400.ttf'),
};

// Testo renderizzato da Pango con il file di font del sito
const text = (value, { font, family, size, color, weight = '' }) =>
  sharp({
    text: {
      text: `<span foreground="${color}" letter_spacing="${Math.round(size * 0.02 * 1024)}">${value}</span>`,
      font: `${family} ${weight} ${size}`.replace(/\s+/g, ' '),
      fontfile: font,
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });

const centerX = SAFE.x + SAFE.w / 2; // 600
const midY = SAFE.y + SAFE.h / 2; // 315

// Blocco centrato: nome, qualifica breve, indirizzo del sito
const name = await text('Andrea Giardini', { font: fonts.playfair, family: 'Playfair Display', size: 76, color: C.charcoal });
const role = await text('Consulente Finanziario', { font: fonts.manrope, family: 'Manrope', size: 34, color: C.brand, weight: 'Medium' });
const site = await text('giardiniconsulenza.it', { font: fonts.manropeRegular, family: 'Manrope', size: 24, color: C.muted });

for (const [label, t] of [['nome', name], ['qualifica', role], ['dominio', site]]) {
  if (t.info.width > SAFE.w) throw new Error(`Il testo "${label}" esce dall'area sicura`);
}

const accentH = 4;
const gap0 = 34; // accento → nome
const gap1 = 22; // nome → qualifica
const gap2 = 48; // qualifica → dominio
const blockH = accentH + gap0 + name.info.height + gap1 + role.info.height + gap2 + site.info.height;
let y = Math.round(midY - blockH / 2);
const accentTop = y;
y += accentH + gap0;
const nameTop = y;
y += name.info.height + gap1;
const roleTop = y;
y += role.info.height + gap2;
const siteTop = y;
const cx = (t) => Math.round(centerX - t.info.width / 2);

// Fondo avorio, alone morbido e accento arancio sopra il nome
const base = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="${C.ivory}"/>
  <circle cx="${W + 40}" cy="${H + 40}" r="250" fill="${C.ember}" fill-opacity="0.07"/>
  <circle cx="-60" cy="-60" r="220" fill="${C.brand}" fill-opacity="0.05"/>
  <rect x="${centerX - 28}" y="${accentTop}" width="56" height="${accentH}" fill="${C.ember}"/>
  <rect x="${centerX - 160}" y="${siteTop - gap2 / 2}" width="320" height="1" fill="${C.brand}" fill-opacity="0.35"/>
</svg>`);

const img = sharp(base).composite([
  { input: name.data, left: cx(name), top: nameTop },
  { input: role.data, left: cx(role), top: roleTop },
  { input: site.data, left: cx(site), top: siteTop },
]);

fs.mkdirSync(path.dirname(out), { recursive: true });
await img.jpeg({ quality: 85, mozjpeg: true }).toFile(out);

fs.rmSync(tmp, { recursive: true, force: true });

const kb = fs.statSync(out).size / 1024;
if (kb > 300) throw new Error(`Immagine troppo pesante: ${kb.toFixed(0)} KB`);
console.log(`OK ${path.relative(root, out)} — ${W}x${H}, ${kb.toFixed(0)} KB, solo testo`);
