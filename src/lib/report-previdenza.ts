// Report PDF "Il tuo percorso verso la pensione", generato nel browser con jsPDF (caricato solo al clic).
// A4 verticale, 2 pagine, firmato: filigrana diagonale + footer fisso + metadati.

import { jsPDF, GState } from 'jspdf';

import type { InputPensione, RisultatoPensione } from './previdenza';
import { euro, percento } from './formato';
import { FASCE_IRPEF, FONTI, RENDIMENTI, TASSA_RENDIMENTI, DEDUCIBILITA_MAX } from '../data/previdenza';

type RGB = [number, number, number];

export interface DatiReport {
  input: InputPensione;
  risultato: RisultatoPensione;
  svgGradino: string;
  svgTorre: string;
  qrDataUrl: string;
  logoUrl: string;
  contatti: { telefono: string; email: string };
  qualifica: string;
  etichette: { tipo: string; tenore: string; ipotesi: string };
}

const A4 = { w: 210, h: 297 };
const MX = 16;
const L = A4.w - MX * 2;
const C: Record<string, RGB> = {
  brand: [0, 105, 55],
  brandDark: [0, 72, 42],
  soft: [140, 195, 164],
  fiscale: [217, 152, 79],
  datore: [79, 163, 115],
  tfr: [126, 156, 138],
  crescita: [213, 233, 220],
  testo: [30, 36, 33],
  tenue: [91, 99, 95],
  ivory: [246, 243, 237],
  sand: [236, 227, 212],
};

const eur = (v: number) => euro(v, 10);

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

/** SVG → PNG ad alta risoluzione (2x). */
async function svgToPng(svg: string, larghezzaPx: number): Promise<{ data: string; ratio: number }> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Grafico non convertibile'));
      img.src = url;
    });
    const ratio = img.naturalHeight / img.naturalWidth || 0.5;
    const canvas = document.createElement('canvas');
    canvas.width = larghezzaPx * 2;
    canvas.height = Math.round(larghezzaPx * 2 * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas non disponibile');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/png'), ratio };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function creaReport(d: DatiReport): Promise<{ blob: Blob; nomeFile: string }> {
  const { input: i, risultato: r } = d;
  const comp = r.complementare;
  const oggi = new Date();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  doc.setProperties({
    title: 'Il tuo percorso verso la pensione — giardiniconsulenza.it',
    author: 'Andrea Giardini',
    subject: 'Simulazione previdenziale a scopo educativo',
    keywords: 'pensione, previdenza complementare, simulazione',
    creator: 'giardiniconsulenza.it',
  });

  const [logo, gradino, torre] = await Promise.all([
    urlToDataUrl(d.logoUrl).catch(() => ''),
    svgToPng(d.svgGradino, 960),
    svgToPng(d.svgTorre, 600),
  ]);

  const font = (stile: 'normal' | 'bold', size: number, col: RGB = C.testo, fam: 'helvetica' | 'times' = 'helvetica') => {
    doc.setFont(fam, stile);
    doc.setFontSize(size);
    doc.setTextColor(...col);
  };
  const etichetta = (t: string, x: number, y: number, col: RGB = C.tenue) => {
    font('bold', 7.5, col);
    doc.text(t.toUpperCase(), x, y);
  };

  const header = () => {
    if (logo) doc.addImage(logo, 'JPEG', MX, 13, 31, 31 * (366 / 958));
    font('bold', 11, C.brand);
    doc.text('Andrea Giardini — Consulente Finanziario', A4.w - MX, 17, { align: 'right' });
    font('normal', 9, C.tenue);
    doc.text('giardiniconsulenza.it', A4.w - MX, 22, { align: 'right' });
    doc.text(`Report generato il ${oggi.toLocaleDateString('it-IT')}`, A4.w - MX, 26.5, { align: 'right' });
    doc.setDrawColor(...C.sand);
    doc.setLineWidth(0.4);
    doc.line(MX, 32, A4.w - MX, 32);
  };

  // ———————————————— PAGINA 1
  header();
  let y = 43;
  font('normal', 22, C.testo, 'times');
  doc.text('Il tuo percorso verso la pensione', MX, y);

  // Le tue risposte
  y += 8;
  doc.setFillColor(...C.ivory);
  doc.roundedRect(MX, y, L, 24, 2, 2, 'F');
  etichetta('Le tue risposte', MX + 5, y + 6);
  const fascia = FASCE_IRPEF.find((f) => f.id === r.fascia)!;
  const risposte: Array<[string, string]> = [
    ['Età', `${i.eta} anni`],
    ['Lavoro', d.etichette.tipo],
    ['Entrate', `${eur(i.nettoMese)} netti al mese`],
    ['Reddito lordo', fascia.etichetta],
    ['In pensione', `${d.etichette.tenore} (${i.tenorePct}%)`],
    ['Ogni mese metti', eur(i.versamentoMese)],
    ['Pensione a', `${i.etaPensione} anni`],
    ['Ipotesi di crescita', d.etichette.ipotesi],
  ];
  risposte.forEach(([k, v], n) => {
    const col = n % 4;
    const riga = Math.floor(n / 4);
    const x = MX + 5 + col * ((L - 10) / 4);
    font('normal', 7, C.tenue);
    doc.text(k, x, y + 11 + riga * 7.5);
    font('bold', 8.5);
    doc.text(v, x, y + 14.5 + riga * 7.5);
  });
  y += 32;

  // Capitolo 1
  etichetta('Capitolo 1 · Il tuo punto di partenza', MX, y, C.brand);
  y += 5;
  font('normal', 9.5);
  const frase1 =
    r.divario > 5
      ? `Oggi vivi con circa ${eur(i.nettoMese)} al mese. In pensione la stima pubblica è di circa ${eur(r.pensione)}. Per vivere come desideri, il tassello da costruire è di circa ${eur(r.divario)} al mese.`
      : `Oggi vivi con circa ${eur(i.nettoMese)} al mese. In pensione la stima pubblica è di circa ${eur(r.pensione)}: copre già lo stile di vita che desideri.`;
  const righe1 = doc.splitTextToSize(frase1, L);
  doc.text(righe1, MX, y);
  y += righe1.length * 4.2 + 1;
  const gh = 62;
  doc.addImage(gradino.data, 'PNG', MX, y, gh / gradino.ratio, gh, undefined, 'FAST');
  // legenda gradino a destra
  const lx = MX + gh / gradino.ratio + 6;
  const legenda1: Array<[RGB, string]> = [
    [C.brandDark, 'Reddito di oggi'],
    [C.soft, 'Pensione pubblica'],
    [C.fiscale, 'Da costruire (tratteggio) e tenore desiderato'],
  ];
  legenda1.forEach(([col, t], n) => {
    doc.setFillColor(...col);
    doc.rect(lx, y + 8 + n * 7 - 2.6, 3, 3, 'F');
    font('normal', 7.5);
    doc.text(doc.splitTextToSize(t, A4.w - MX - lx - 5), lx + 5, y + 8 + n * 7);
  });
  y += gh + 7;

  // Capitolo 2
  etichetta('Capitolo 2 · I motori che lavorano per te', MX, y, C.brand);
  y += 3;
  const th = 82;
  const tw = th / torre.ratio;
  doc.addImage(torre.data, 'PNG', MX, y, tw, th, undefined, 'FAST');
  const mx = MX + tw + 8;
  const motori: Array<[RGB, string, number, string]> = [
    [C.brand, 'Il tuo impegno', comp.motori.tuo, `${eur(i.versamentoMese)} al mese`],
    [
      C.fiscale,
      'Il motore fiscale',
      comp.motori.rimborso + comp.rimborsoInTasca,
      i.reinvestiRimborso ? `circa ${eur(comp.rimborsoAnnuo)} l'anno, reinvestiti` : `circa ${eur(comp.rimborsoAnnuo)} l'anno, a te`,
    ],
    [C.datore, 'Il tuo datore', comp.motori.datore, comp.datoreAnnuo > 0 ? `circa ${eur(comp.datoreAnnuo)} l'anno` : 'non incluso'],
    [C.tfr, 'Il TFR', comp.motori.tfr, comp.tfrAnnuo > 0 ? `circa ${eur(comp.tfrAnnuo)} l'anno` : 'non incluso'],
    [C.crescita, 'Il tempo', comp.motori.crescita, `ipotesi ${d.etichette.ipotesi.toLowerCase()}`],
  ];
  let my = y + 8;
  for (const [col, t, v, nota] of motori) {
    doc.setFillColor(...col);
    doc.rect(mx, my - 3, 3.5, 3.5, 'F');
    font('bold', 9);
    doc.text(t, mx + 6, my);
    font('normal', 7.5, C.tenue);
    doc.text(nota, mx + 6, my + 4);
    font('normal', 12, C.testo, 'times');
    doc.text(eur(v), A4.w - MX, my + 1, { align: 'right' });
    my += 12;
  }
  font('normal', 8, C.tenue);
  doc.text(
    doc.splitTextToSize(
      `All'uscita, dopo ${r.anni} anni di partecipazione, paghi il ${String(Math.round(comp.aliquotaUscita * 1000) / 10).replace('.', ',')}% di tasse (circa ${eur(comp.tasseUscita)}). Capitale disponibile alla pensione: circa ${eur(comp.capitale)}.`,
      A4.w - MX - mx
    ),
    mx,
    my + 1
  );
  y += th + 6;

  // Capitolo 3 (sintesi)
  etichetta('Capitolo 3 · Lo stesso impegno, due risultati', MX, y, C.brand);
  y += 5;
  font('normal', 9.5);
  const inPiu = r.complementareSenzaTfr.capitale - r.solo.capitale;
  doc.text(
    doc.splitTextToSize(
      `Con lo stesso sforzo mensile, i motori in più ti portano circa ${eur(inPiu)} in più. Il dettaglio è nella pagina seguente.`,
      L
    ),
    MX,
    y
  );

  // ———————————————— PAGINA 2
  doc.addPage();
  header();
  y = 43;
  font('normal', 20, C.testo, 'times');
  doc.text('Lo stesso impegno, due risultati', MX, y);
  y += 8;
  const colW = (L - 6) / 2;
  const scenari: Array<[string, typeof comp, RGB]> = [
    ['Da solo', r.solo, C.soft],
    ['Con la previdenza complementare', comp, C.brand],
  ];
  const maxCap = Math.max(r.solo.capitale, comp.capitale) || 1;
  scenari.forEach(([titolo, s, col], n) => {
    const x = MX + n * (colW + 6);
    doc.setDrawColor(...(n === 1 ? C.brand : C.sand));
    doc.setLineWidth(n === 1 ? 0.5 : 0.3);
    doc.roundedRect(x, y, colW, 50, 2, 2, 'S');
    etichetta(titolo, x + 5, y + 7, n === 1 ? C.brand : C.tenue);
    font('normal', 22, C.testo, 'times');
    doc.text(eur(s.capitale), x + 5, y + 18);
    font('normal', 7.5, C.tenue);
    doc.text('capitale alla pensione', x + 5, y + 22.5);
    doc.setFillColor(...C.sand);
    doc.rect(x + 5, y + 26, colW - 10, 3.5, 'F');
    doc.setFillColor(...col);
    doc.rect(x + 5, y + 26, ((colW - 10) * s.capitale) / maxCap, 3.5, 'F');
    font('bold', 9);
    doc.text(`${eur(s.integrazione)} al mese`, x + 5, y + 37);
    font('normal', 7.5, C.tenue);
    doc.text('integrazione indicativa fino a 90 anni', x + 5, y + 41);
    font('bold', 9);
    doc.text(`${percento(s.copertura)} del tuo obiettivo`, x + 5, y + 46.5);
  });
  y += 57;
  font('normal', 10);
  const extra =
    comp.rimborsoInTasca > 5 ? ` E ti tornano in tasca circa ${eur(comp.rimborsoInTasca)} di rimborsi.` : '';
  const tfrNota = comp.tfrAnnuo > 0 ? ` Il TFR aggiunge altri ${eur(comp.capitale - r.complementareSenzaTfr.capitale)}.` : '';
  const righe3 = doc.splitTextToSize(
    `Con lo stesso sforzo mensile, i motori in più ti portano circa ${eur(inPiu)} in più.${extra}${tfrNota}`,
    L
  );
  doc.text(righe3, MX, y);
  y += righe3.length * 4.6 + 4;

  // Meter copertura
  etichetta('Copertura del tuo obiettivo, con la previdenza complementare', MX, y);
  y += 4;
  const qP = Math.min(100, (r.pensione / (r.desiderato || 1)) * 100);
  const qI = Math.min(100 - qP, (comp.integrazione / (r.desiderato || 1)) * 100);
  doc.setFillColor(...C.sand);
  doc.rect(MX, y, L, 5, 'F');
  doc.setFillColor(...C.soft);
  doc.rect(MX, y, (L * qP) / 100, 5, 'F');
  doc.setFillColor(...C.brand);
  doc.rect(MX + (L * qP) / 100, y, (L * qI) / 100, 5, 'F');
  y += 9;
  font('normal', 8);
  doc.text(
    `Pensione pubblica ${percento(qP)} · Integrazione ${percento(qI)} · Da costruire ${percento(Math.max(0, 100 - qP - qI))}`,
    MX,
    y
  );
  y += 10;

  // Le ipotesi usate
  etichetta('Le ipotesi usate', MX, y);
  y += 5;
  font('normal', 8, C.testo);
  const ipotesi = [
    `Pensione pubblica: la Ragioneria Generale dello Stato stima che la prima pensione valga circa il ${Math.round(r.tasso)}% dell'ultimo stipendio per chi va in pensione nel ${r.annoPensione}; lo applichiamo al tuo netto di oggi.`,
    `Motore fiscale: quello che versi si toglie dal reddito su cui paghi le tasse, fino a ${eur(DEDUCIBILITA_MAX)} l'anno. Ti torna il ${Math.round(r.aliquota * 100)}% di quanto versi, cioè le tasse della tua fascia di reddito (${fascia.etichetta} lordi l'anno).`,
    `Crescita: ipotesi ${d.etichette.ipotesi.toLowerCase()} del ${Math.round(RENDIMENTI[i.ipotesi] * 100)}% l'anno oltre l'inflazione, prima delle tasse sui rendimenti (${Math.round(TASSA_RENDIMENTI.complementare * 100)}% nella previdenza complementare, ${Math.round(TASSA_RENDIMENTI.ordinario * 100)}% da solo). Ipotesi, non garanzia.`,
    `Tutti gli importi sono in euro di oggi, arrotondati alle decine. Il capitale è distribuito dagli ${i.etaPensione} ai 90 anni.`,
  ];
  for (const t of ipotesi) {
    const rr = doc.splitTextToSize(`•  ${t}`, L);
    doc.text(rr, MX, y);
    y += rr.length * 3.8 + 1.2;
  }
  y += 5;

  // Prossimo passo
  const boxH = 42;
  doc.setDrawColor(...C.brand);
  doc.setLineWidth(0.5);
  doc.roundedRect(MX, y, L, boxH, 2, 2, 'S');
  etichetta('Prossimo passo', MX + 6, y + 8, C.brand);
  font('normal', 17, C.testo, 'times');
  doc.text('Ne parliamo insieme', MX + 6, y + 16);
  font('normal', 9);
  doc.text(
    doc.splitTextToSize('Trasformiamo questi numeri in un percorso su misura per te e per chi ami.', L - 60),
    MX + 6,
    y + 22
  );
  doc.text(`Tel. ${d.contatti.telefono}`, MX + 6, y + 31);
  doc.text(d.contatti.email, MX + 6, y + 35.5);
  font('normal', 9, C.brand);
  doc.text('giardiniconsulenza.it/contatti', MX + 70, y + 35.5);
  const qr = 32;
  doc.addImage(d.qrDataUrl, 'PNG', A4.w - MX - qr - 5, y + (boxH - qr) / 2, qr, qr);

  // ———————————————— Footer, fonti e filigrana su ogni pagina
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p);
    const fy = A4.h - 25;
    doc.setDrawColor(...C.sand);
    doc.setLineWidth(0.3);
    doc.line(MX, fy, A4.w - MX, fy);
    font('bold', 7);
    doc.text(
      doc.splitTextToSize(`Report generato su giardiniconsulenza.it · Andrea Giardini, ${d.qualifica}, iscritto all'Albo OCF n. 2965`, L),
      MX,
      fy + 4
    );
    font('normal', 6.3, C.tenue);
    doc.text(
      doc.splitTextToSize(
        'Simulazione a scopo informativo ed educativo, basata su dati pubblici e ipotesi semplificate. Le ipotesi di crescita sono illustrative e non garantite. Non costituisce consulenza né raccomandazione personalizzata. ' +
          `Fonti: ${FONTI.rgs}; ${FONTI.bilancio}; ${FONTI.dlgs252}; ${FONTI.tuir}.`,
        L
      ),
      MX,
      fy + 11
    );
    font('normal', 7, C.tenue);
    doc.text(`${p} / ${n}`, A4.w - MX, A4.h - 6, { align: 'right' });

    doc.setGState(new GState({ opacity: 0.06 }));
    font('bold', 54, C.brand);
    const testo = 'giardiniconsulenza.it';
    const w = doc.getTextWidth(testo);
    const rad = (35 * Math.PI) / 180;
    doc.text(testo, A4.w / 2 - (w / 2) * Math.cos(rad), A4.h / 2 + (w / 2) * Math.sin(rad), { angle: 35 });
    doc.setGState(new GState({ opacity: 1 }));
  }

  return { blob: doc.output('blob'), nomeFile: `il-tuo-percorso-pensione-giardiniconsulenza-${dataIso(oggi)}.pdf` };
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
