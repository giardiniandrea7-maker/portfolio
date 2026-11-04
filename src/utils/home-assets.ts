import fs from 'node:fs';
import path from 'node:path';

import type { ImageMetadata } from 'astro';

// Immagini opzionali della home: se il file esiste in src/assets/images/
// viene usato, altrimenti il componente mostra un segnaposto [TODO].
const assetImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
});

export const findAssetImage = (filename: string): ImageMetadata | undefined =>
  assetImages[`/src/assets/images/${filename}`]?.default;

// File in public/: restituisce l'URL pubblico solo se il file esiste.
export const findPublicFile = (publicPath: string): string | undefined =>
  fs.existsSync(path.join(process.cwd(), 'public', publicPath)) ? `/${publicPath}` : undefined;

// Come findPublicFile, ma accetta il primo formato disponibile (es. 'images/certificazioni/ocf').
export const findPublicImage = (basePath: string, exts = ['svg', 'png', 'webp', 'jpg', 'jpeg']): string | undefined =>
  exts.map((ext) => findPublicFile(`${basePath}.${ext}`)).find(Boolean);
