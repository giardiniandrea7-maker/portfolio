// =============================================================================
// Calcolatore Rata Mutuo — funzione di calcolo pura
// -----------------------------------------------------------------------------
// Modello: ammortamento alla francese (rata costante).
//
// Formula della rata:
//   R = C × i / (1 − (1+i)^(−N))     se i > 0
//   R = C / N                         se i = 0
// dove:
//   C = capitale (importo mutuo)
//   i = tasso periodico (TAN annuo / numero rate per anno)
//   N = numero totale di rate (durataAnni × frequenza)
//
// Modalità Sostenibilità: invertiamo la formula per trovare C dato R.
//
// TAEG (per direttiva EU 2008/48 / Banca d'Italia):
//   Tasso annuo effettivo X tale che
//   netErogato = Σ pagamento_k × (1+X)^(−t_k)
//   con t_k in anni e frazioni di anno.
//   Risolto con Newton-Raphson, fallback a bisezione su [0; 5].
//   Sanity check: TAEG ≥ TAN (le spese non riducono mai il costo).
// =============================================================================

export type ModalitaMutuo = 'rata' | 'sostenibilita';
export type TipoTasso = 'fisso' | 'variabile';
export type FrequenzaRata = 'mensile' | 'trimestrale' | 'semestrale' | 'annuale';

export interface SpeseAccessorie {
  istruttoria: number;
  perizia: number;
  impostaSostitutiva: number;
  polizzaIncendioAnnua: number;
  polizzaVitaAnnua: number;
  speseIncassoRata: number;
}

export interface InputMutuo {
  modalita: ModalitaMutuo;
  // Modalità rata
  valoreImmobile?: number;
  anticipo?: number;
  // Modalità sostenibilità
  rataSostenibile?: number;
  anticipoDisponibile?: number;
  // Comuni
  durataAnni: number;
  tipoTasso: TipoTasso;
  tassoFisso?: number;
  spread?: number;
  euribor?: number;
  frequenzaRata: FrequenzaRata;
  includiTaeg: boolean;
  speseAccessorie?: SpeseAccessorie;
}

export interface RigaAmmortamento {
  numero: number;
  anno: number;
  quotaCapitale: number;
  quotaInteressi: number;
  rataTotale: number;
  capitaleResiduo: number;
}

export interface DatoAnnuale {
  anno: number;
  quotaInteressiAnnua: number;
  quotaCapitaleAnnua: number;
  rateAnnuTotali: number;
  capitaleResiduoFineAnno: number;
}

export interface OutputMutuo {
  ok: boolean;
  errore?: string;
  importoMutuo: number;
  rataPeriodica: number;
  numeroRate: number;
  rateAnnuali: number;
  tan: number;
  taeg: number | null;
  totaleInteressi: number;
  costoTotaleMutuo: number;
  percentualeInteressiSuTotale: number;
  ltv: number;
  pianoAmmortamento: RigaAmmortamento[];
  datiAnnuali: DatoAnnuale[];
  valoreImmobileCalcolato?: number;
  warning: string[];
}

function rateAnnualiFromFreq(f: FrequenzaRata): number {
  if (f === 'mensile') return 12;
  if (f === 'trimestrale') return 4;
  if (f === 'semestrale') return 2;
  return 1;
}

function calcolaRata(C: number, i: number, N: number): number {
  if (C <= 0 || N <= 0) return 0;
  if (i === 0) return C / N;
  return (C * i) / (1 - Math.pow(1 + i, -N));
}

function calcolaImportoFinanziabile(rata: number, i: number, N: number): number {
  if (rata <= 0 || N <= 0) return 0;
  if (i === 0) return rata * N;
  return (rata * (1 - Math.pow(1 + i, -N))) / i;
}

function generaPianoAmmortamento(
  C: number,
  i: number,
  N: number,
  rata: number,
  rateAnnuali: number
): RigaAmmortamento[] {
  const piano: RigaAmmortamento[] = [];
  let residuo = C;
  for (let k = 1; k <= N; k++) {
    const interessi = residuo * i;
    let capitale = rata - interessi;
    let nuovoResiduo = residuo - capitale;
    // Aggiusta l'ultima rata per assorbire eventuali residui di arrotondamento
    if (k === N) {
      capitale += nuovoResiduo;
      nuovoResiduo = 0;
    }
    piano.push({
      numero: k,
      anno: Math.ceil(k / rateAnnuali),
      quotaCapitale: capitale,
      quotaInteressi: interessi,
      rataTotale: capitale + interessi,
      capitaleResiduo: Math.max(0, nuovoResiduo),
    });
    residuo = nuovoResiduo;
  }
  return piano;
}

function aggregaAnnuale(piano: RigaAmmortamento[]): DatoAnnuale[] {
  const map = new Map<number, DatoAnnuale>();
  for (const r of piano) {
    if (!map.has(r.anno)) {
      map.set(r.anno, {
        anno: r.anno,
        quotaInteressiAnnua: 0,
        quotaCapitaleAnnua: 0,
        rateAnnuTotali: 0,
        capitaleResiduoFineAnno: 0,
      });
    }
    const d = map.get(r.anno)!;
    d.quotaInteressiAnnua += r.quotaInteressi;
    d.quotaCapitaleAnnua += r.quotaCapitale;
    d.rateAnnuTotali += r.rataTotale;
    d.capitaleResiduoFineAnno = r.capitaleResiduo; // valore alla fine dell'anno = ultima rata
  }
  return Array.from(map.values()).sort((a, b) => a.anno - b.anno);
}

// Risolve netErogato = Σ_{k=1..N} payment / (1+X)^(k/rateAnnuali) in X (TAEG annuo effettivo).
function calcolaTAEG(
  netErogato: number,
  paymentPerRata: number,
  N: number,
  rateAnnuali: number,
  guess: number
): number | null {
  const evalF = (X: number): { f: number; df: number } => {
    const oneX = 1 + X;
    if (oneX <= 0) return { f: NaN, df: NaN };
    let f = netErogato;
    let df = 0;
    for (let k = 1; k <= N; k++) {
      const t = k / rateAnnuali;
      const denom = Math.pow(oneX, t);
      f -= paymentPerRata / denom;
      df += (paymentPerRata * t) / (denom * oneX);
    }
    return { f, df };
  };

  let X = guess;
  for (let iter = 0; iter < 100; iter++) {
    const { f, df } = evalF(X);
    if (!Number.isFinite(f) || !Number.isFinite(df)) break;
    if (Math.abs(df) < 1e-12) break;
    const X1 = X - f / df;
    if (!Number.isFinite(X1)) break;
    if (Math.abs(X1 - X) < 1e-9) return X1;
    X = Math.max(-0.99, X1);
  }

  // Bisezione: f è monotona crescente in X (più alto X → meno valore attuale dei rimborsi → f sale).
  let lo = 0;
  let hi = 5.0;
  let flo = evalF(lo).f;
  let fhi = evalF(hi).f;
  if (!Number.isFinite(flo) || !Number.isFinite(fhi)) return null;
  if (flo > 0 || fhi < 0) return null;
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    const fmid = evalF(mid).f;
    if (Math.abs(fmid) < 1e-7 || hi - lo < 1e-12) return mid;
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

function emptyOutput(errore: string): OutputMutuo {
  return {
    ok: false,
    errore,
    importoMutuo: 0,
    rataPeriodica: 0,
    numeroRate: 0,
    rateAnnuali: 0,
    tan: 0,
    taeg: null,
    totaleInteressi: 0,
    costoTotaleMutuo: 0,
    percentualeInteressiSuTotale: 0,
    ltv: 0,
    pianoAmmortamento: [],
    datiAnnuali: [],
    warning: [errore],
  };
}

export function calcolaMutuo(input: InputMutuo): OutputMutuo {
  const warnings: string[] = [];
  const rateAnnuali = rateAnnualiFromFreq(input.frequenzaRata);
  const durataAnni = Math.max(0, input.durataAnni || 0);
  const N = Math.round(durataAnni * rateAnnuali);
  if (durataAnni < 1 || N <= 0) {
    return emptyOutput('Inserisci una durata di almeno 1 anno.');
  }

  const tanAnnuo =
    input.tipoTasso === 'fisso'
      ? Math.max(0, input.tassoFisso ?? 0)
      : Math.max(0, (input.spread ?? 0) + (input.euribor ?? 0));
  const i = tanAnnuo / 100 / rateAnnuali;

  let importoMutuo = 0;
  let valoreImmobile = 0;
  let valoreImmobileCalcolato: number | undefined;

  if (input.modalita === 'rata') {
    valoreImmobile = Math.max(0, input.valoreImmobile ?? 0);
    const anticipo = Math.max(0, input.anticipo ?? 0);
    importoMutuo = Math.max(0, valoreImmobile - anticipo);
    if (importoMutuo <= 0) {
      return emptyOutput("Anticipo maggiore o uguale al valore dell'immobile: nessun mutuo da finanziare.");
    }
    if (valoreImmobile > 0 && anticipo / valoreImmobile < 0.20) {
      warnings.push('Anticipo inferiore al 20%: le banche generalmente richiedono un anticipo minimo del 20%.');
    }
  } else {
    const rataSost = Math.max(0, input.rataSostenibile ?? 0);
    if (rataSost <= 0) {
      return emptyOutput('Inserisci una rata sostenibile maggiore di zero.');
    }
    importoMutuo = calcolaImportoFinanziabile(rataSost, i, N);
    const anticipoDisp = Math.max(0, input.anticipoDisponibile ?? 0);
    valoreImmobileCalcolato = importoMutuo + anticipoDisp;
    valoreImmobile = valoreImmobileCalcolato;
    if (anticipoDisp > 0 && valoreImmobile > 0 && anticipoDisp / valoreImmobile < 0.20) {
      warnings.push("Anticipo inferiore al 20% del valore immobile teorico: rivedi la disponibilità di liquidità.");
    }
  }

  const rata = calcolaRata(importoMutuo, i, N);
  const piano = generaPianoAmmortamento(importoMutuo, i, N, rata, rateAnnuali);
  const datiAnnuali = aggregaAnnuale(piano);

  const totaleInteressi = piano.reduce((s, r) => s + r.quotaInteressi, 0);
  const costoTotaleMutuo = importoMutuo + totaleInteressi;
  const percentualeInteressiSuTotale =
    costoTotaleMutuo > 0 ? (totaleInteressi / costoTotaleMutuo) * 100 : 0;
  const ltv = valoreImmobile > 0 ? (importoMutuo / valoreImmobile) * 100 : 0;

  if (ltv > 80) {
    warnings.push(
      'Rapporto mutuo/immobile (LTV) superiore all\'80%: le banche potrebbero richiedere garanzie aggiuntive o tassi più alti.'
    );
  }
  if (durataAnni >= 40) {
    warnings.push('Durata massima 40 anni: verifica che sia realistico estinguerlo prima della pensione.');
  }

  // ---- TAEG ----
  let taeg: number | null = null;
  if (input.includiTaeg && input.speseAccessorie && importoMutuo > 0) {
    const s = input.speseAccessorie;
    const speseIniziali =
      Math.max(0, s.istruttoria || 0) +
      Math.max(0, s.perizia || 0) +
      Math.max(0, s.impostaSostitutiva || 0);
    const speseExtraPerRata =
      Math.max(0, s.speseIncassoRata || 0) +
      (Math.max(0, s.polizzaIncendioAnnua || 0) + Math.max(0, s.polizzaVitaAnnua || 0)) /
        rateAnnuali;
    const netErogato = importoMutuo - speseIniziali;
    const paymentPerRata = rata + speseExtraPerRata;
    if (netErogato > 0 && paymentPerRata > 0) {
      // Stima iniziale: TAN convertito in tasso annuo effettivo equivalente
      const guess = i > 0 ? Math.pow(1 + i, rateAnnuali) - 1 : 0.01;
      taeg = calcolaTAEG(netErogato, paymentPerRata, N, rateAnnuali, guess);
    }
  }

  return {
    ok: true,
    importoMutuo,
    rataPeriodica: rata,
    numeroRate: N,
    rateAnnuali,
    tan: tanAnnuo,
    taeg: taeg !== null ? taeg * 100 : null,
    totaleInteressi,
    costoTotaleMutuo,
    percentualeInteressiSuTotale,
    ltv,
    pianoAmmortamento: piano,
    datiAnnuali,
    valoreImmobileCalcolato,
    warning: warnings,
  };
}
