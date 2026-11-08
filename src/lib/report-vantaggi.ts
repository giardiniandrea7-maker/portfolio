// Riepilogo PDF del calcolatore, generato nel browser con jsPDF (caricato solo al clic).
// A4 verticale, 1 pagina, firmato: filigrana diagonale + footer + metadati.

import { jsPDF, GState } from 'jspdf';

import type { Input, Risultato } from './previdenza';
import { BADGE, DISCLAIMER, eur, fraseChiusura, pct, vantaggi } from './vantaggi';
import { euro } from './formato';
import { FASCE, FONTI } from '../data/previdenza';

type RGB = [number, number, number];

export interface DatiReport {
  input: Input;
  risultato: Risultato;
  qrDataUrl: string;
  logoUrl: string;
  contatti: { telefono: string; email: string };
  qualifica: string;
}

const A4 = { w: 210, h: 297 };
const MX = 16;
const L = A4.w - MX * 2;
const C: Record<string, RGB> = {
  brand: [0, 105, 55],
  ochre: [217, 152, 79],
  ochreDark: [154, 95, 34],
  testo: [30, 36, 33],
  tenue: [91, 99, 95],
  ivory: [246, 243, 237],
  sand: [236, 227, 212],
};

function dataIso(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function urlToDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

export async function creaRiepilogo(d: DatiReport): Promise<{ blob: Blob; nomeFile: string }> {
  const { input: i, risultato: r } = d;
  const oggi = new Date();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  doc.setProperties({
    title: 'I vantaggi fiscali della previdenza complementare — giardiniconsulenza.it',
    author: 'Andrea Giardini',
    subject: 'Simulazione indicativa a scopo informativo ed educativo',
    keywords: 'previdenza complementare, deduzione, simulazione',
    creator: 'giardiniconsulenza.it',
  });
  const logo = await urlToDataUrl(d.logoUrl).catch(() => '');

  const font = (stile: 'normal' | 'bold', size: number, col: RGB = C.testo, fam: 'helvetica' | 'times' = 'helvetica') => {
    doc.setFont(fam, stile);
    doc.setFontSize(size);
    doc.setTextColor(...col);
  };
  const etichetta = (t: string, x: number, y: number, col: RGB = C.tenue) => {
    font('bold', 7.5, col);
    doc.text(t.toUpperCase(), x, y);
  };
  const paragrafo = (t: string, x: number, y: number, w: number, lh = 4.2) => {
    const righe = doc.splitTextToSize(t, w);
    doc.text(righe, x, y);
    return righe.length * lh;
  };

  // Header
  if (logo) doc.addImage(logo, 'JPEG', MX, 13, 31, 31 * (366 / 958));
  font('bold', 11, C.brand);
  doc.text('Andrea Giardini — Consulente Finanziario', A4.w - MX, 17, { align: 'right' });
  font('normal', 9, C.tenue);
  doc.text('giardiniconsulenza.it', A4.w - MX, 22, { align: 'right' });
  doc.text(`Riepilogo del ${oggi.toLocaleDateString('it-IT')}`, A4.w - MX, 26.5, { align: 'right' });
  doc.setDrawColor(...C.sand);
  doc.setLineWidth(0.4);
  doc.line(MX, 32, A4.w - MX, 32);

  let y = 43;
  font('normal', 20, C.testo, 'times');
  doc.text('I vantaggi fiscali della previdenza complementare', MX, y);
  y += 6;
  font('normal', 9, C.tenue);
  doc.text('Valori indicativi e stimati, in base alle tue risposte.', MX, y);

  // Le tue risposte
  y += 6;
  doc.setFillColor(...C.ivory);
  doc.roundedRect(MX, y, L, 16, 2, 2, 'F');
  const fascia = FASCE.find((f) => f.id === i.fascia)!;
  const risposte: Array<[string, string]> = [
    ['Età', `${i.eta} anni`],
    ['Reddito lordo annuo', fascia.breve],
    ['Metti da parte', `${euro(i.mensile)} al mese`],
  ];
  risposte.forEach(([k, v], n) => {
    const x = MX + 6 + n * ((L - 12) / 3);
    font('normal', 7.5, C.tenue);
    doc.text(k, x, y + 6.5);
    font('bold', 10);
    doc.text(v, x, y + 11.5);
  });
  y += 24;

  // Risultato principale
  etichetta(BADGE[r.profilo], MX, y, C.brand);
  y += 7;
  font('normal', 10);
  doc.text('Ogni anno lo Stato ti restituisce circa', MX, y);
  y += 12;
  font('normal', 34, C.ochreDark, 'times');
  doc.text(eur(r.rimborsoAnno), MX, y);
  y += 7;
  font('normal', 10);
  y += paragrafo(`In ${r.anni} anni fanno circa ${eur(r.rimborsoTotale)} di tasse in meno.`, MX, y, L);
  y += 3;

  const cw = (L - 6) / 2;
  const cards: Array<[string, string, string, RGB]> = [
    ['Metti da parte', euro(i.mensile), 'al mese', C.brand],
    ['Ti costa davvero', eur(r.costoReale), 'al mese, al netto del rimborso fiscale', C.ochre],
  ];
  cards.forEach(([t, v, nota, col], n) => {
    const x = MX + n * (cw + 6);
    doc.setDrawColor(...col);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cw, 24, 2, 2, 'S');
    etichetta(t, x + 5, y + 7);
    font('normal', 18, C.testo, 'times');
    doc.text(v, x + 5, y + 16);
    font('normal', 7.5, C.tenue);
    doc.text(nota, x + 5, y + 21);
  });
  y += 32;

  // I tuoi 3 vantaggi
  etichetta('I tuoi 3 vantaggi', MX, y, C.brand);
  y += 5;
  for (const v of vantaggi(r)) {
    doc.setFillColor(...C.ochre);
    doc.circle(MX + 1.6, y - 1.2, 1.2, 'F');
    font('bold', 10);
    doc.text(v.titolo, MX + 6, y);
    font('bold', 8.5, C.ochreDark);
    doc.text(v.numero, A4.w - MX, y, { align: 'right' });
    y += 4.6;
    font('normal', 8.5, C.tenue);
    y += paragrafo(v.testo, MX + 6, y, L - 6, 3.9) + 3.5;
  }
  font('normal', 10, C.testo, 'times');
  y += paragrafo(fraseChiusura(r), MX, y + 1, L, 4.6) + 4;

  // Contatti
  const boxH = 38;
  doc.setDrawColor(...C.brand);
  doc.setLineWidth(0.5);
  doc.roundedRect(MX, y, L, boxH, 2, 2, 'S');
  etichetta('Prossimo passo', MX + 6, y + 8, C.brand);
  font('normal', 16, C.testo, 'times');
  doc.text('Ne parliamo insieme', MX + 6, y + 16);
  font('normal', 9);
  doc.text(`Tel. ${d.contatti.telefono}`, MX + 6, y + 24);
  doc.text(d.contatti.email, MX + 6, y + 29);
  font('normal', 9, C.brand);
  doc.text('giardiniconsulenza.it/contatti', MX + 6, y + 34);
  const qr = 30;
  doc.addImage(d.qrDataUrl, 'PNG', A4.w - MX - qr - 4, y + (boxH - qr) / 2, qr, qr);

  // Fonti, disclaimer, footer
  const fy = A4.h - 37;
  doc.setDrawColor(...C.sand);
  doc.setLineWidth(0.3);
  doc.line(MX, fy, A4.w - MX, fy);
  font('normal', 6.8, C.tenue);
  let ty = fy + 4;
  ty += paragrafo(`Fonti: ${FONTI.dlgs252}; ${FONTI.bilancio2026}; ${FONTI.irpef2026}. Aliquota usata: ${pct(r.aliquota * 100)}.`, MX, ty, L, 3.2);
  ty += 1;
  ty += paragrafo(DISCLAIMER, MX, ty, L, 3.2);
  ty += 1.5;
  font('bold', 6.8);
  paragrafo(`Riepilogo generato su giardiniconsulenza.it · Andrea Giardini, ${d.qualifica}, iscritto all'Albo OCF n. 2965`, MX, ty, L, 3.2);

  // Filigrana diagonale leggera
  doc.setGState(new GState({ opacity: 0.06 }));
  font('bold', 54, C.brand);
  const testo = 'giardiniconsulenza.it';
  const w = doc.getTextWidth(testo);
  const rad = (35 * Math.PI) / 180;
  doc.text(testo, A4.w / 2 - (w / 2) * Math.cos(rad), A4.h / 2 + (w / 2) * Math.sin(rad), { angle: 35 });
  doc.setGState(new GState({ opacity: 1 }));

  return { blob: doc.output('blob'), nomeFile: `vantaggi-previdenza-giardiniconsulenza-${dataIso(oggi)}.pdf` };
}

/** Download compatibile con Chrome Android e Safari iOS; senza supporto al download apre il PDF in una nuova scheda. */
export function scaricaPdf(blob: Blob, nomeFile: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  if ('download' in a) {
    a.href = url;
    a.download = nomeFile;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    window.open(url, '_blank');
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
