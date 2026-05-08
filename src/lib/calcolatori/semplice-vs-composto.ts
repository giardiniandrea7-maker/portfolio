// =============================================================================
// Calcolatore "Interesse Semplice vs. Composto" — funzione di calcolo pura
// -----------------------------------------------------------------------------
// Strumento didattico-emotivo. Confronta i due regimi di capitalizzazione su
// un capitale iniziale + versamenti periodici, e produce dati per:
//   • il grafico classico (line chart)
//   • il "race chart" (Atto 1)
//   • lo slider time-machine (Atto 2)
//   • il "costo del ritardo" (Atto 3)
//   • la storia Marco vs Luca (Atto 4)
//
// Convenzioni:
//   • Versamenti annualizzati: V = versamentoMensile * 12, versato a fine
//     anno (rendita posticipata). Scelta coerente con i test del brief.
//   • Tasso annuo R nominale, capitalizzazione annuale.
//   • Edge case R = 0: semplice e composto coincidono.
//
// FORMULE
//   Semplice[k] = C * (1 + R*k) + V * (k + R * k * (k-1) / 2)
//   Composto[k] = C * (1+R)^k + V * ((1+R)^k - 1) / R          R ≠ 0
//   Composto[k] = C + V * k                                     R = 0
//
//   Anno incrocio "magia" = primo k con (composto[k] - semplice[k]) ≥ C.
//
// Tutti gli importi sono in euro; "anni" sono interi non-negativi.
// =============================================================================

export interface InputSempliceVsComposto {
  capitaleIniziale: number;
  versamentoMensile: number;
  anni: number;
  tassoAnnuo: number; // %
}

export interface DatoAnnuale {
  anno: number;
  capitaleSemplice: number;
  capitaleComposto: number;
  differenza: number;
  versatoCumulato: number;
}

export interface CostoRitardo {
  capitaleFinaleOggi: number;
  capitaleFinaleRitardato: number;
  differenzaAssoluta: number;
  differenzaPercentuale: number;
  versamentiTotaliOggi: number;
  versamentiTotaliRitardato: number;
  anniRitardo: number;
}

export interface StoriaMarcoLucaAttore {
  versato: number;
  finale: number;
  anniVersamento: number;
  anniRiposo?: number;
}

export interface StoriaMarcoLuca {
  marco: StoriaMarcoLucaAttore;
  luca: StoriaMarcoLucaAttore;
  differenzaAssoluta: number;
  rapporto: number;          // marco.finale / luca.finale
  vincitore: 'marco' | 'luca' | 'pari';
}

export interface OutputSempliceVsComposto {
  ok: boolean;
  errore?: string;
  finaleSemplice: number;
  finaleComposto: number;
  magiaTotale: number;          // composto - semplice
  versamentoTotale: number;     // capitale iniziale + versamenti totali
  annoIncrocio: number | null;  // anno in cui magia >= capitale iniziale
  datiAnnuali: DatoAnnuale[];
  costoRitardo: CostoRitardo;
  storiaMarcoLuca: StoriaMarcoLuca;
  warning: string[];
}

// -------------------- HELPERS --------------------

/**
 * Capitale finale in regime di interesse SEMPLICE con versamenti annui.
 * Forma chiusa: C*(1+Rk) + V*(k + R*k*(k-1)/2)
 */
function semplice(C: number, V: number, R: number, k: number): number {
  if (k <= 0) return C;
  return C * (1 + R * k) + V * (k + (R * k * (k - 1)) / 2);
}

/**
 * Capitale finale in regime di interesse COMPOSTO con versamenti annui.
 * C*(1+R)^k + V*((1+R)^k - 1)/R, oppure C + V*k se R = 0.
 */
function composto(C: number, V: number, R: number, k: number): number {
  if (k <= 0) return C;
  if (Math.abs(R) < 1e-12) return C + V * k;
  const fattore = Math.pow(1 + R, k);
  return C * fattore + V * (fattore - 1) / R;
}

// -------------------- ENTRY POINT --------------------

export function calcolaSempliceVsComposto(
  input: InputSempliceVsComposto
): OutputSempliceVsComposto {
  const warnings: string[] = [];
  const C = Math.max(0, Number.isFinite(input.capitaleIniziale) ? input.capitaleIniziale : 0);
  const versMensile = Math.max(0, Number.isFinite(input.versamentoMensile) ? input.versamentoMensile : 0);
  const V = versMensile * 12;
  const N = Math.max(1, Math.floor(Number.isFinite(input.anni) ? input.anni : 1));
  const R = (Number.isFinite(input.tassoAnnuo) ? input.tassoAnnuo : 0) / 100;

  if (N > 60) {
    return errorOutput('Orizzonte massimo: 60 anni.', N);
  }
  if (R < 0) {
    return errorOutput('Il tasso non può essere negativo.', N);
  }
  if (C === 0 && versMensile === 0) {
    return errorOutput('Inserisci almeno un capitale iniziale o un versamento mensile.', N);
  }
  if (R > 0.20) {
    warnings.push('Tasso oltre il 20% annuo: scenario altamente irrealistico per investimenti diversificati di lungo periodo.');
  }

  // Costruzione serie annuale (k = 0..N)
  const datiAnnuali: DatoAnnuale[] = [];
  for (let k = 0; k <= N; k++) {
    const s = semplice(C, V, R, k);
    const c = composto(C, V, R, k);
    datiAnnuali.push({
      anno: k,
      capitaleSemplice: s,
      capitaleComposto: c,
      differenza: c - s,
      versatoCumulato: C + V * k,
    });
  }

  const finaleSemplice = datiAnnuali[N].capitaleSemplice;
  const finaleComposto = datiAnnuali[N].capitaleComposto;
  const magiaTotale = finaleComposto - finaleSemplice;
  const versamentoTotale = C + V * N;

  // Anno incrocio: primo k in cui (composto - semplice) >= capitale iniziale
  // (cioè la "magia" da sola vale almeno quanto il capitale di partenza)
  let annoIncrocio: number | null = null;
  if (C > 0) {
    for (const d of datiAnnuali) {
      if (d.differenza >= C) {
        annoIncrocio = d.anno;
        break;
      }
    }
  }

  // Costo del ritardo: stessa configurazione ma inizio differito
  // (anni - 10 o anni/2 se anni < 10)
  const anniRitardo = N >= 10 ? 10 : Math.floor(N / 2);
  const annimDiInvestimento = N - anniRitardo;
  const finaleRitardato = composto(C, V, R, annimDiInvestimento);
  const versamentiTotaliRitardato = C + V * annimDiInvestimento;

  const costoRitardo: CostoRitardo = {
    capitaleFinaleOggi: finaleComposto,
    capitaleFinaleRitardato: finaleRitardato,
    differenzaAssoluta: finaleComposto - finaleRitardato,
    differenzaPercentuale: finaleComposto > 0
      ? ((finaleComposto - finaleRitardato) / finaleComposto) * 100
      : 0,
    versamentiTotaliOggi: versamentoTotale,
    versamentiTotaliRitardato,
    anniRitardo,
  };

  // Storia Marco e Luca (versamento mensile e tasso dell'utente)
  // Marco: versa per 10 anni dai 25 ai 35, poi lascia crescere altri 30 anni.
  // Luca: aspetta 10 anni, poi versa dai 35 ai 65 (30 anni).
  // Totale 40 anni in entrambi i casi.
  const marcoCapitaleA35 = composto(0, V, R, 10);
  const marcoFinale = R === 0 ? marcoCapitaleA35 : marcoCapitaleA35 * Math.pow(1 + R, 30);
  const marcoVersato = V * 10;

  const lucaFinale = composto(0, V, R, 30);
  const lucaVersato = V * 30;

  const differenzaMarcoLuca = marcoFinale - lucaFinale;
  const rapporto = lucaFinale > 0 ? marcoFinale / lucaFinale : 0;

  const storiaMarcoLuca: StoriaMarcoLuca = {
    marco: {
      versato: marcoVersato,
      finale: marcoFinale,
      anniVersamento: 10,
      anniRiposo: 30,
    },
    luca: {
      versato: lucaVersato,
      finale: lucaFinale,
      anniVersamento: 30,
    },
    differenzaAssoluta: differenzaMarcoLuca,
    rapporto,
    vincitore:
      Math.abs(differenzaMarcoLuca) < 1
        ? 'pari'
        : differenzaMarcoLuca > 0
        ? 'marco'
        : 'luca',
  };

  return {
    ok: true,
    finaleSemplice,
    finaleComposto,
    magiaTotale,
    versamentoTotale,
    annoIncrocio,
    datiAnnuali,
    costoRitardo,
    storiaMarcoLuca,
    warning: warnings,
  };
}

function errorOutput(msg: string, N: number): OutputSempliceVsComposto {
  return {
    ok: false,
    errore: msg,
    finaleSemplice: 0,
    finaleComposto: 0,
    magiaTotale: 0,
    versamentoTotale: 0,
    annoIncrocio: null,
    datiAnnuali: [],
    costoRitardo: {
      capitaleFinaleOggi: 0,
      capitaleFinaleRitardato: 0,
      differenzaAssoluta: 0,
      differenzaPercentuale: 0,
      versamentiTotaliOggi: 0,
      versamentiTotaliRitardato: 0,
      anniRitardo: N >= 10 ? 10 : Math.floor(N / 2),
    },
    storiaMarcoLuca: {
      marco: { versato: 0, finale: 0, anniVersamento: 10, anniRiposo: 30 },
      luca: { versato: 0, finale: 0, anniVersamento: 30 },
      differenzaAssoluta: 0,
      rapporto: 0,
      vincitore: 'pari',
    },
    warning: [msg],
  };
}
