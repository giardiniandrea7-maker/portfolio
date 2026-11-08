// Grafici SVG del percorso "La tua pensione": stringhe autonome con colori espliciti,
// così lo stesso disegno va nella pagina e nel PDF.

import type { InputPensione, RisultatoPensione, PuntoSerie } from './previdenza';
import { euro } from './formato';

/** Colori con significato (palette del sito). Ogni grafico ha la sua legenda. */
export const COLORI = {
  reddito: '#00482A', // reddito di oggi
  pensione: '#8CC3A4', // pensione pubblica
  tuo: '#006937', // il tuo versamento
  fiscale: '#D9984F', // motore fiscale (ocra pieno)
  divario: '#D9984F', // divario (ocra tratteggiato)
  divarioTesto: '#9A5F22',
  datore: '#4FA373', // datore di lavoro
  tfr: '#7E9C8A', // TFR
  crescita: '#D5E9DC', // crescita nel tempo (con puntini)
  crescitaPunti: '#6FAE8A',
  testo: '#1E2421',
  tenue: '#5B635F',
  asse: '#D8D2C6',
};

const eur = (v: number) => euro(v, 10);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const FONT = `font-family="Manrope, 'Segoe UI', Helvetica, Arial, sans-serif"`;

const defs = (id: string) =>
  `<defs>` +
  `<pattern id="${id}-trat" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#FBF1E4"/><line x1="0" y1="0" x2="0" y2="7" stroke="${COLORI.divario}" stroke-width="2.4"/></pattern>` +
  `<pattern id="${id}-punti" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${COLORI.crescita}"/><circle cx="3" cy="3" r="1.1" fill="${COLORI.crescitaPunti}"/></pattern>` +
  `</defs>`;

// ——— Capitolo 1: gradino reddito di oggi → pensione pubblica + divario

export function gradinoSvg(
  input: Pick<InputPensione, 'eta' | 'etaPensione' | 'nettoMese'>,
  r: Pick<RisultatoPensione, 'pensione' | 'desiderato' | 'divario'>,
  o: { larghezza?: number; altezza?: number; orizzonte?: number; id?: string } = {}
): string {
  const W = o.larghezza ?? 480;
  const H = o.altezza ?? 260;
  const id = o.id ?? 'g1';
  const fine = o.orizzonte ?? 90;
  const M = { top: 34, right: 12, bottom: 30, left: 12 };
  const { eta, etaPensione, nettoMese } = input;
  const yMax = Math.max(nettoMese, r.desiderato, r.pensione) * 1.18 || 1;
  const x = (a: number) => M.left + ((a - eta) / (fine - eta)) * (W - M.left - M.right);
  const y = (v: number) => H - M.bottom - (v / yMax) * (H - M.top - M.bottom);
  const base = y(0);
  const x0 = x(eta);
  const xP = x(etaPensione);
  const x1 = x(fine);
  const g = 3;
  const yPens = y(r.pensione);
  const yDes = y(r.desiderato);

  const p: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}-t">`,
    `<title id="${id}-t">${esc(
      `Oggi ${eur(nettoMese)} al mese. In pensione, dai ${etaPensione} anni, la stima pubblica è ${eur(r.pensione)}. Tenore desiderato ${eur(r.desiderato)}: tassello da costruire ${eur(r.divario)} al mese.`
    )}</title>`,
    defs(id),
    `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`,
    `<line x1="${M.left}" y1="${base}" x2="${W - M.right}" y2="${base}" stroke="${COLORI.asse}"/>`,
    `<rect x="${x0}" y="${y(nettoMese)}" width="${Math.max(0, xP - x0 - g)}" height="${base - y(nettoMese)}" fill="${COLORI.reddito}" rx="2"/>`,
    `<rect x="${xP + g}" y="${yPens}" width="${Math.max(0, x1 - xP - g)}" height="${base - yPens}" fill="${COLORI.pensione}" rx="2"/>`,
  ];
  if (r.divario > 0.5) {
    p.push(
      `<rect x="${xP + g}" y="${yDes}" width="${Math.max(0, x1 - xP - g)}" height="${yPens - yDes}" fill="url(#${id}-trat)" stroke="${COLORI.divario}" stroke-width="1.4" stroke-dasharray="4 3"/>`
    );
  }
  p.push(
    `<line x1="${x0}" y1="${yDes}" x2="${x1}" y2="${yDes}" stroke="${COLORI.divario}" stroke-width="1.8" stroke-dasharray="6 4"/>`,
    `<text x="${x0 + 2}" y="${Math.min(y(nettoMese), yDes) - 8}" ${FONT} font-size="12" font-weight="600" fill="${COLORI.testo}">${esc(`Oggi ${eur(nettoMese)}`)}</text>`,
    `<text x="${x1 - 2}" y="${yDes - 8}" text-anchor="end" ${FONT} font-size="12" font-weight="600" fill="${COLORI.divarioTesto}">${esc(`Desiderato ${eur(r.desiderato)}`)}</text>`
  );
  if (base - yPens > 18) {
    p.push(
      `<text x="${x1 - 6}" y="${base - 8}" text-anchor="end" ${FONT} font-size="11" font-weight="600" fill="${COLORI.testo}">${esc(`Pensione ${eur(r.pensione)}`)}</text>`
    );
  }
  for (const [v, xx, a] of [
    [eta, x0, 'start'],
    [etaPensione, xP, 'middle'],
    [fine, x1, 'end'],
  ] as const) {
    p.push(`<text x="${xx}" y="${H - 10}" text-anchor="${a}" ${FONT} font-size="12" fill="${COLORI.tenue}">${v} anni</text>`);
  }
  p.push('</svg>');
  return p.join('');
}

// ——— Capitolo 2: torre a strati che cresce anno per anno

export const STRATI: Array<{ k: keyof Omit<PuntoSerie, 'eta' | 'totale'>; etichetta: string }> = [
  { k: 'tuo', etichetta: 'Il tuo versamento' },
  { k: 'rimborso', etichetta: 'Motore fiscale' },
  { k: 'datore', etichetta: 'Datore di lavoro' },
  { k: 'tfr', etichetta: 'TFR' },
  { k: 'crescita', etichetta: 'Crescita nel tempo' },
];

export function torreSvg(
  serie: PuntoSerie[],
  indice: number,
  obiettivo: number,
  o: { larghezza?: number; altezza?: number; id?: string } = {}
): string {
  const W = o.larghezza ?? 300;
  const H = o.altezza ?? 340;
  const id = o.id ?? 'tr';
  const punto = serie[Math.max(0, Math.min(serie.length - 1, indice))];
  const finale = serie[serie.length - 1];
  const scala = Math.max(finale.totale, obiettivo) * 1.1 || 1;
  const M = { top: 40, bottom: 30 };
  const hUtile = H - M.top - M.bottom;
  const base = H - M.bottom;
  const tw = Math.min(130, W * 0.44);
  const tx = (W - tw) / 2;
  const y = (v: number) => base - (v / scala) * hUtile;

  const colore: Record<string, string> = {
    tuo: COLORI.tuo,
    rimborso: COLORI.fiscale,
    datore: COLORI.datore,
    tfr: COLORI.tfr,
    crescita: `url(#${id}-punti)`,
  };

  const p: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}-t">`,
    `<title id="${id}-t">${esc(
      `A ${punto.eta} anni il capitale accumulato è di circa ${eur(punto.totale)}: ` +
        STRATI.filter((s) => punto[s.k] > 0)
          .map((s) => `${s.etichetta.toLowerCase()} ${eur(punto[s.k])}`)
          .join(', ') +
        '.'
    )}</title>`,
    defs(id),
    `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`,
    // sagoma della torre finale, leggera
    `<rect x="${tx}" y="${y(finale.totale)}" width="${tw}" height="${base - y(finale.totale)}" fill="none" stroke="${COLORI.asse}" stroke-dasharray="3 3" rx="3"/>`,
    `<line x1="${tx - 24}" y1="${base}" x2="${tx + tw + 24}" y2="${base}" stroke="${COLORI.asse}"/>`,
  ];
  let acc = 0;
  for (const s of STRATI) {
    const v = punto[s.k];
    if (v <= 0) continue;
    const y0 = y(acc);
    const y1 = y(acc + v);
    p.push(`<rect x="${tx}" y="${y1}" width="${tw}" height="${Math.max(0, y0 - y1)}" fill="${colore[s.k]}"/>`);
    acc += v;
  }
  if (punto.totale > 0) {
    p.push(
      `<text x="${tx + tw + 6}" y="${Math.max(14, y(punto.totale) + 5)}" ${FONT} font-size="14" font-weight="700" fill="${COLORI.testo}">${esc(eur(punto.totale))}</text>`
    );
  }
  if (obiettivo > 0) {
    const yo = y(obiettivo);
    p.push(
      `<line x1="4" y1="${yo}" x2="${tx + tw}" y2="${yo}" stroke="${COLORI.divario}" stroke-width="1.8" stroke-dasharray="6 4"/>`,
      `<text x="4" y="${yo - 19}" ${FONT} font-size="10.5" font-weight="600" fill="${COLORI.divarioTesto}">Il tuo obiettivo</text>`,
      `<text x="4" y="${yo - 6}" ${FONT} font-size="10.5" font-weight="600" fill="${COLORI.divarioTesto}">${esc(eur(obiettivo))}</text>`
    );
  }
  p.push(
    `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" ${FONT} font-size="12" fill="${COLORI.tenue}">A ${punto.eta} anni</text>`,
    '</svg>'
  );
  return p.join('');
}
