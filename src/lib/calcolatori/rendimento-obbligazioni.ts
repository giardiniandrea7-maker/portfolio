// =============================================================================
// Calcolatore di Rendimento per Obbligazioni e Titoli di Stato
// -----------------------------------------------------------------------------
// Due modalità:
//   - Semplice: rendimento alla scadenza senza valore temporale (BOT, CTZ, stime)
//   - Avanzata: YTM su tutti i flussi di cassa (BTP, CCT, corporate con cedole)
//
// Fiscalità italiana:
//   - Titoli di Stato: 12,5% (su cedole e capital gain)
//   - Corporate:       26%
//   - Personalizzata:  aliquota libera
//   - Le minusvalenze in conto capitale non si compensano automaticamente
//     (zainetto fiscale fuori scope): impostaCG = 0 quando guadagno < 0
//   - Il rateo cedolare versato in acquisto, sui Titoli di Stato, genera
//     credito d'imposta del 12,5% recuperabile sulle prime cedole successive
//
// YTM: tasso annuo nominale composto alla frequenza cedolare. Trovato con
// Newton-Raphson, fallback a bisezione. Espresso come r tale che
//   sum( flusso_i / (1 + r/fpa)^t_i ) = 0
// dove t_i è il tempo in periodi cedolari dall'acquisto.
// =============================================================================

export type ModalitaCalcolo = 'semplice' | 'avanzata';
export type Tipologia = 'titolo_stato' | 'corporate' | 'personalizzata';
export type Frequenza = 'annuale' | 'semestrale' | 'trimestrale';

export interface PuntoGrafico {
  data: Date;
  valore: number;
  tipo: 'inizio' | 'cedola' | 'scadenza' | 'tick';
  descrizione?: string;
}

export interface InputObbligazione {
  modalita: ModalitaCalcolo;
  tipologia: Tipologia;
  aliquotaPersonalizzata?: number;
  dataAcquisto: Date;
  dataScadenza: Date;
  prezzoAcquisto: number;
  prezzoRimborso: number;
  capitaleNominale: number;
  cedolaLordaAnnua: number;
  // Solo Avanzata
  frequenzaCedolare?: Frequenza;
  dataProssimaCedola?: Date;
  includiRateo?: boolean;
  reinvestiCedole?: boolean;
  tassoReinvestimento?: number;
}

export interface OutputObbligazione {
  ok: boolean;
  errore?: string;
  aliquotaApplicata: number;
  anniResidui: number;
  numeroTitoli: number;
  cedoleTotaliLorde: number;
  cedoleTotaliNette: number;
  numeroCedole: number;
  guadagnoContoCapitaleLordo: number;
  guadagnoContoCapitaleNetto: number;
  rateoVersato: number;
  creditoImpostaMaturato: number;
  capitaleInvestitoTotale: number;
  capitaleFinaleNetto: number;
  rendimentoTotaleNetto: number;
  rendimentoPercMedioAnnuoNetto: number;
  ytmLordo: number | null;
  ytmNetto: number | null;
  impostePagateTotali: number;
  curvaCrescita: PuntoGrafico[];
  warning: string[];
}

const MS_PER_DAY = 86400000;
const DAYS_PER_YEAR = 365.25;

function aliquotaFromTipologia(t: Tipologia, custom = 0): number {
  if (t === 'titolo_stato') return 12.5;
  if (t === 'corporate') return 26;
  return Math.max(0, Math.min(100, custom));
}

function fpaFromFrequenza(f: Frequenza): number {
  if (f === 'annuale') return 1;
  if (f === 'semestrale') return 2;
  return 4;
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

function diffYears(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (DAYS_PER_YEAR * MS_PER_DAY);
}

function diffDays(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_DAY;
}

// Tempo in periodi cedolari fra due date. Un periodo = mesiPerPeriodo mesi.
// Per date allineate sul giorno-del-mese il risultato è un intero esatto;
// altrimenti la frazione è proporzionata sui giorni (30,4375 giorni/mese).
function diffPeriodi(from: Date, to: Date, mesiPerPeriodo: number): number {
  const yearsDiff = to.getFullYear() - from.getFullYear();
  const monthsDiff = to.getMonth() - from.getMonth();
  const daysDiff = to.getDate() - from.getDate();
  const totalMonths = yearsDiff * 12 + monthsDiff + daysDiff / 30.4375;
  return totalMonths / mesiPerPeriodo;
}

// Risolve sum(importo / (1 + r/fpa)^tPeriodi) = 0 in r (tasso annuo).
// Newton-Raphson con fallback a bisezione su [-0.49; +2.0].
function calcolaYTM(
  flussi: Array<{ tPeriodi: number; importo: number }>,
  fpa: number,
  guess = 0.05
): number | null {
  const evalF = (r: number): { f: number; df: number } => {
    const rp = r / fpa;
    if (1 + rp <= 0) return { f: NaN, df: NaN };
    let f = 0;
    let df = 0;
    for (const fl of flussi) {
      const denom = Math.pow(1 + rp, fl.tPeriodi);
      f += fl.importo / denom;
      df += (-fl.importo * fl.tPeriodi) / (fpa * (1 + rp) * denom);
    }
    return { f, df };
  };

  let r = guess;
  for (let iter = 0; iter < 100; iter++) {
    const { f, df } = evalF(r);
    if (!Number.isFinite(f) || !Number.isFinite(df)) break;
    if (Math.abs(df) < 1e-14) break;
    const r1 = r - f / df;
    if (!Number.isFinite(r1)) break;
    if (Math.abs(r1 - r) < 1e-10) return r1;
    r = Math.max(-0.99 * fpa, r1);
  }

  let lo = -0.49;
  let hi = 2.0;
  let flo = evalF(lo).f;
  let fhi = evalF(hi).f;
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    const fmid = evalF(mid).f;
    if (Math.abs(fmid) < 1e-9 || hi - lo < 1e-12) return mid;
    if (flo * fmid < 0) {
      hi = mid;
      fhi = fmid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return null;
}

function emptyOutput(errore: string): OutputObbligazione {
  return {
    ok: false,
    errore,
    aliquotaApplicata: 0,
    anniResidui: 0,
    numeroTitoli: 0,
    cedoleTotaliLorde: 0,
    cedoleTotaliNette: 0,
    numeroCedole: 0,
    guadagnoContoCapitaleLordo: 0,
    guadagnoContoCapitaleNetto: 0,
    rateoVersato: 0,
    creditoImpostaMaturato: 0,
    capitaleInvestitoTotale: 0,
    capitaleFinaleNetto: 0,
    rendimentoTotaleNetto: 0,
    rendimentoPercMedioAnnuoNetto: 0,
    ytmLordo: null,
    ytmNetto: null,
    impostePagateTotali: 0,
    curvaCrescita: [],
    warning: [errore],
  };
}

// Genera la serie di punti per il grafico "crescita del montante netto".
// In Avanzata: scalini ai cashing date di ogni cedola netta + step finale a scadenza.
// In Semplice con cedole: crescita lineare a tick annuali + step finale.
// In Semplice senza cedole (BOT/CTZ): linea piatta, unico step a scadenza.
function generaCurvaCrescita(args: {
  modalita: ModalitaCalcolo;
  dataA: Date;
  dataS: Date;
  capitaleInvestitoTotale: number;
  capitaleFinaleNetto: number;
  cedoleTotaliNette: number;
  cedole: Array<{ data: Date; netta: number }>;
}): PuntoGrafico[] {
  const { modalita, dataA, dataS, capitaleInvestitoTotale, capitaleFinaleNetto, cedoleTotaliNette, cedole } = args;
  const punti: PuntoGrafico[] = [];

  punti.push({
    data: dataA,
    valore: capitaleInvestitoTotale,
    tipo: 'inizio',
    descrizione: 'Acquisto',
  });

  if (modalita === 'avanzata' && cedole.length > 0) {
    let cumulato = capitaleInvestitoTotale;
    cedole.forEach((c, i) => {
      // Tick "appena prima" della cedola → crea visivamente lo scalino
      punti.push({
        data: new Date(c.data.getTime() - 1),
        valore: cumulato,
        tipo: 'tick',
      });
      cumulato += c.netta;
      punti.push({
        data: c.data,
        valore: cumulato,
        tipo: 'cedola',
        descrizione: `Cedola ${i + 1}: +${c.netta.toFixed(2).replace('.', ',')} €`,
      });
    });
    const lastCedolaTime = cedole[cedole.length - 1].data.getTime();
    if (lastCedolaTime < dataS.getTime() - 1) {
      punti.push({
        data: new Date(dataS.getTime() - 1),
        valore: cumulato,
        tipo: 'tick',
      });
    }
  } else if (cedoleTotaliNette > 0) {
    const anni = (dataS.getTime() - dataA.getTime()) / (365.25 * MS_PER_DAY);
    const steps = Math.max(2, Math.min(10, Math.ceil(anni)));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const data = new Date(dataA.getTime() + t * (dataS.getTime() - dataA.getTime()));
      const valore = capitaleInvestitoTotale + t * cedoleTotaliNette;
      punti.push({ data, valore, tipo: 'tick' });
    }
    punti.push({
      data: new Date(dataS.getTime() - 1),
      valore: capitaleInvestitoTotale + cedoleTotaliNette,
      tipo: 'tick',
    });
  } else {
    punti.push({
      data: new Date(dataS.getTime() - 1),
      valore: capitaleInvestitoTotale,
      tipo: 'tick',
    });
  }

  punti.push({
    data: dataS,
    valore: capitaleFinaleNetto,
    tipo: 'scadenza',
    descrizione: 'Rimborso a scadenza',
  });

  return punti;
}

export function calcolaRendimentoObbligazione(
  input: InputObbligazione
): OutputObbligazione {
  const warnings: string[] = [];
  const aliquota = aliquotaFromTipologia(input.tipologia, input.aliquotaPersonalizzata);
  const aliquotaDec = aliquota / 100;
  const dataA = input.dataAcquisto;
  const dataS = input.dataScadenza;
  const prezzoAcq = Math.max(0, input.prezzoAcquisto);
  const prezzoRimb = Math.max(0, input.prezzoRimborso);
  const nominale = Math.max(0, input.capitaleNominale);
  const cedolaPctAnnua = Math.max(0, input.cedolaLordaAnnua);

  const anniResidui = diffYears(dataA, dataS);
  if (anniResidui <= 0) {
    return emptyOutput('La data di scadenza deve essere successiva alla data di acquisto.');
  }
  if (nominale <= 0) {
    return emptyOutput('Inserisci un capitale nominale maggiore di zero.');
  }
  if (anniResidui > 50) {
    warnings.push('Durata superiore a 50 anni: verifica le date inserite.');
  }
  if (prezzoAcq > 110 || prezzoAcq < 80) {
    warnings.push('Prezzo di acquisto insolito (fuori dalla forchetta 80–110): verifica il dato.');
  }
  if (prezzoRimb > 110 || prezzoRimb < 80) {
    warnings.push('Prezzo di rimborso insolito (fuori dalla forchetta 80–110): verifica il dato.');
  }

  const numeroTitoli = nominale / 1000;
  const esborsoCorsoSecco = (nominale * prezzoAcq) / 100;
  const rimborsoLordo = (nominale * prezzoRimb) / 100;

  // ============ MODALITÀ SEMPLICE ============
  if (input.modalita === 'semplice') {
    if (cedolaPctAnnua > 0) {
      warnings.push(
        'In modalità Semplice le cedole sono trattate senza valore temporale. ' +
          'Per BTP usa la Modalità Avanzata per calcolare lo YTM corretto.'
      );
    }
    const cedoleLorde = (cedolaPctAnnua / 100) * nominale * anniResidui;
    const impostaCedole = cedoleLorde * aliquotaDec;
    const cedoleNette = cedoleLorde - impostaCedole;

    const cgLordo = rimborsoLordo - esborsoCorsoSecco;
    const impostaCG = cgLordo > 0 ? cgLordo * aliquotaDec : 0;
    const cgNetto = cgLordo - impostaCG;

    const capitaleInvestitoTotale = esborsoCorsoSecco;
    const capitaleFinaleNetto = esborsoCorsoSecco + cedoleNette + cgNetto;
    const rendimentoTotaleNetto = capitaleFinaleNetto - capitaleInvestitoTotale;
    const rendimentoPercMedioAnnuoNetto =
      capitaleInvestitoTotale > 0
        ? ((rendimentoTotaleNetto / capitaleInvestitoTotale) * 100) / anniResidui
        : 0;

    const curvaCrescita = generaCurvaCrescita({
      modalita: 'semplice',
      dataA,
      dataS,
      capitaleInvestitoTotale,
      capitaleFinaleNetto,
      cedoleTotaliNette: cedoleNette,
      cedole: [],
    });

    return {
      ok: true,
      aliquotaApplicata: aliquota,
      anniResidui,
      numeroTitoli,
      cedoleTotaliLorde: cedoleLorde,
      cedoleTotaliNette: cedoleNette,
      numeroCedole: 0,
      guadagnoContoCapitaleLordo: cgLordo,
      guadagnoContoCapitaleNetto: cgNetto,
      rateoVersato: 0,
      creditoImpostaMaturato: 0,
      capitaleInvestitoTotale,
      capitaleFinaleNetto,
      rendimentoTotaleNetto,
      rendimentoPercMedioAnnuoNetto,
      ytmLordo: null,
      ytmNetto: null,
      impostePagateTotali: impostaCedole + impostaCG,
      curvaCrescita,
      warning: warnings,
    };
  }

  // ============ MODALITÀ AVANZATA ============
  const freq = input.frequenzaCedolare ?? 'semestrale';
  const fpa = fpaFromFrequenza(freq);
  const mesiPerPeriodo = 12 / fpa;
  const dataProssima = input.dataProssimaCedola ?? addMonths(dataA, mesiPerPeriodo);
  const cedolaPeriodaleLorda = ((cedolaPctAnnua / fpa) * nominale) / 100;

  if (input.dataProssimaCedola && input.dataProssimaCedola.getTime() <= dataA.getTime()) {
    warnings.push('La data della prossima cedola dovrebbe essere successiva alla data di acquisto.');
  }

  // ----- Rateo cedolare -----
  let rateoVersato = 0;
  let creditoImpostaIniziale = 0;
  if (input.includiRateo && cedolaPctAnnua > 0) {
    const dataUltimaCedola = addMonths(dataProssima, -mesiPerPeriodo);
    const giorniRateo = diffDays(dataUltimaCedola, dataA);
    const giorniPeriodo = diffDays(dataUltimaCedola, dataProssima);
    if (giorniPeriodo > 0 && giorniRateo > 0 && giorniRateo < giorniPeriodo) {
      rateoVersato = cedolaPeriodaleLorda * (giorniRateo / giorniPeriodo);
      if (input.tipologia === 'titolo_stato') {
        creditoImpostaIniziale = rateoVersato * 0.125;
      }
    }
  }

  const capitaleInvestitoTotale = esborsoCorsoSecco + rateoVersato;

  // ----- Cedole intermedie -----
  type Cedola = { data: Date; lorda: number; imposta: number; netta: number };
  const cedole: Cedola[] = [];
  if (cedolaPctAnnua > 0) {
    let creditoResiduo = creditoImpostaIniziale;
    for (let i = 0; i < 1000; i++) {
      const dataC = addMonths(dataProssima, mesiPerPeriodo * i);
      if (dataC.getTime() <= dataA.getTime()) continue;
      if (dataC.getTime() > dataS.getTime() + MS_PER_DAY) break;
      const lorda = cedolaPeriodaleLorda;
      const impostaTeorica = lorda * aliquotaDec;
      const impostaEffettiva = Math.max(0, impostaTeorica - creditoResiduo);
      creditoResiduo = Math.max(0, creditoResiduo - impostaTeorica);
      cedole.push({ data: dataC, lorda, imposta: impostaEffettiva, netta: lorda - impostaEffettiva });
    }
  }

  const cedoleTotaliLorde = cedole.reduce((s, c) => s + c.lorda, 0);
  const cedoleTotaliNette = cedole.reduce((s, c) => s + c.netta, 0);
  const impostaCedoleTotale = cedole.reduce((s, c) => s + c.imposta, 0);

  // ----- Guadagno in conto capitale -----
  const cgLordo = rimborsoLordo - esborsoCorsoSecco;
  const impostaCG = cgLordo > 0 ? cgLordo * aliquotaDec : 0;
  const cgNetto = cgLordo - impostaCG;

  // ----- Capitale finale netto -----
  let capitaleFinaleNetto: number;
  if (input.reinvestiCedole && (input.tassoReinvestimento ?? 0) > 0) {
    const tassoR = (input.tassoReinvestimento ?? 0) / 100;
    let cedoleReinvestite = 0;
    for (const c of cedole) {
      const t = Math.max(0, diffYears(c.data, dataS));
      cedoleReinvestite += c.netta * Math.pow(1 + tassoR, t);
    }
    capitaleFinaleNetto = rimborsoLordo - impostaCG + cedoleReinvestite;
  } else {
    capitaleFinaleNetto = esborsoCorsoSecco + cedoleTotaliNette + cgNetto;
  }
  const rendimentoTotaleNetto = capitaleFinaleNetto - capitaleInvestitoTotale;
  const rendimentoPercMedioAnnuoNetto =
    capitaleInvestitoTotale > 0
      ? ((rendimentoTotaleNetto / capitaleInvestitoTotale) * 100) / anniResidui
      : 0;

  // ----- YTM -----
  type FlussoYTM = { tPeriodi: number; importo: number; importoNetto: number };
  const flussiYTM: FlussoYTM[] = [
    { tPeriodi: 0, importo: -capitaleInvestitoTotale, importoNetto: -capitaleInvestitoTotale },
  ];
  for (const c of cedole) {
    flussiYTM.push({
      tPeriodi: diffPeriodi(dataA, c.data, mesiPerPeriodo),
      importo: c.lorda,
      importoNetto: c.netta,
    });
  }
  flussiYTM.push({
    tPeriodi: diffPeriodi(dataA, dataS, mesiPerPeriodo),
    importo: rimborsoLordo,
    importoNetto: rimborsoLordo - impostaCG,
  });

  const guess = Math.max(
    0.005,
    (cedolaPctAnnua / 100 +
      (prezzoRimb - prezzoAcq) / (Math.max(0.01, prezzoAcq) * Math.max(0.5, anniResidui))) /
      (prezzoAcq / 100)
  );
  const ytmLordo = calcolaYTM(
    flussiYTM.map((f) => ({ tPeriodi: f.tPeriodi, importo: f.importo })),
    fpa,
    guess
  );
  const ytmNetto = calcolaYTM(
    flussiYTM.map((f) => ({ tPeriodi: f.tPeriodi, importo: f.importoNetto })),
    fpa,
    Math.max(0.001, guess * (1 - aliquotaDec))
  );
  if (ytmLordo === null) warnings.push('YTM lordo non calcolabile con questi parametri.');
  if (ytmNetto === null) warnings.push('YTM netto non calcolabile con questi parametri.');

  const curvaCrescita = generaCurvaCrescita({
    modalita: 'avanzata',
    dataA,
    dataS,
    capitaleInvestitoTotale,
    capitaleFinaleNetto,
    cedoleTotaliNette,
    cedole: cedole.map((c) => ({ data: c.data, netta: c.netta })),
  });

  return {
    ok: true,
    aliquotaApplicata: aliquota,
    anniResidui,
    numeroTitoli,
    cedoleTotaliLorde,
    cedoleTotaliNette,
    numeroCedole: cedole.length,
    guadagnoContoCapitaleLordo: cgLordo,
    guadagnoContoCapitaleNetto: cgNetto,
    rateoVersato,
    creditoImpostaMaturato: creditoImpostaIniziale,
    capitaleInvestitoTotale,
    capitaleFinaleNetto,
    rendimentoTotaleNetto,
    rendimentoPercMedioAnnuoNetto,
    ytmLordo: ytmLordo !== null ? ytmLordo * 100 : null,
    ytmNetto: ytmNetto !== null ? ytmNetto * 100 : null,
    impostePagateTotali: impostaCedoleTotale + impostaCG,
    curvaCrescita,
    warning: warnings,
  };
}
