// =============================================================================
// Calcolatore di Interesse Composto — funzione di calcolo pura
// -----------------------------------------------------------------------------
// Stima il montante con eventuali aggiunte periodiche all'inizio di ogni anno.
//
// Modello:
//   - C  = capitale iniziale (€)
//   - A  = aggiunta annuale (€/anno).
//          Se la frequenza è "Mensili", A = aggiuntaMensile * 12 (semplificazione
//          didattica: 12 versamenti mensili approssimati come un'unica aggiunta
//          a inizio anno).
//   - R  = tasso annuo in forma decimale (es. 0,07 per 7%)
//   - N  = anni di crescita
//
// Formula del montante a fine anno k (con aggiunta a inizio periodo):
//   totale[k] = C * (1+R)^k + A * [ (1+R)^(k+1) - (1+R) ] / R     (R > 0)
//   totale[k] = C + A * k                                          (R = 0)
//
// Capitale investito a fine anno k:
//   investito[k] = C + A * k     (k >= 1)
//   investito[0] = C
// =============================================================================

export type Frequenza = 'annuale' | 'mensile';

export interface InteresseCompostoInput {
  capitaleIniziale: number;
  aggiunta: number;
  frequenza: Frequenza;
  anni: number;
  tasso: number; // in percentuale, es. 7 per 7%
}

export interface PuntoAnnuo {
  anno: number;
  investito: number;
  totale: number;
  interessi: number;
}

/**
 * Dato per il grafico a barre impilate.
 * I tre segmenti sommano sempre al montante (totale[k]) di quell'anno.
 */
export interface DatoBarra {
  anno: number;
  capitaleIniziale: number;
  versamentiAggiuntivi: number;
  interessiMaturati: number;
}

export interface InteresseCompostoOutput {
  capitaleFinale: number;
  capitaleInvestito: number;
  interessiMaturati: number;
  /** Variazione % degli interessi rispetto al capitale investito (NaN se investito = 0). */
  rendimentoPercentuale: number;
  /** Serie completa { anno, investito, totale, interessi } per popolare il grafico a linee. */
  datiAnnui: PuntoAnnuo[];
  /** Serie pronta per il bar chart impilato (3 segmenti per anno). */
  datiBarre: DatoBarra[];
}

/**
 * Sanifica un input numerico: trasforma NaN, undefined o valori negativi in 0
 * (eccetto `tasso` dove 0 è valido). Lascia passare i decimali.
 */
function safeNumber(value: number, allowZero = true): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  if (!allowZero && value === 0) return 0;
  return Math.max(0, value);
}

export function calcolaInteresseComposto(
  input: InteresseCompostoInput
): InteresseCompostoOutput {
  const C = safeNumber(input.capitaleIniziale);
  const aggInput = safeNumber(input.aggiunta);
  const A = input.frequenza === 'mensile' ? aggInput * 12 : aggInput;
  const N = Math.max(0, Math.floor(input.anni || 0));
  const R = Math.max(0, (input.tasso || 0) / 100);

  const datiAnnui: PuntoAnnuo[] = [];
  const datiBarre: DatoBarra[] = [];

  for (let k = 0; k <= N; k++) {
    const investito = C + A * k;
    let totale: number;

    if (k === 0) {
      // Anno 0 = stato iniziale, nessuna capitalizzazione, nessuna aggiunta
      totale = C;
    } else if (R === 0) {
      // Caso degenerato: niente interessi, montante = capitale investito
      totale = investito;
    } else {
      const onePlusR = 1 + R;
      // C * (1+R)^k
      const baseGrowth = C * Math.pow(onePlusR, k);
      // A * [(1+R)^(k+1) - (1+R)] / R  → serie geometrica delle aggiunte
      const annuityGrowth = A === 0 ? 0 : (A * (Math.pow(onePlusR, k + 1) - onePlusR)) / R;
      totale = baseGrowth + annuityGrowth;
    }

    const interessi = Math.max(0, totale - investito);
    datiAnnui.push({ anno: k, investito, totale, interessi });
    datiBarre.push({
      anno: k,
      capitaleIniziale: C,
      versamentiAggiuntivi: A * k,
      interessiMaturati: interessi,
    });
  }

  const finale = datiAnnui[datiAnnui.length - 1];
  const capitaleFinale = finale.totale;
  const capitaleInvestito = finale.investito;
  const interessiMaturati = Math.max(0, capitaleFinale - capitaleInvestito);
  const rendimentoPercentuale =
    capitaleInvestito > 0 ? (interessiMaturati / capitaleInvestito) * 100 : NaN;

  return {
    capitaleFinale,
    capitaleInvestito,
    interessiMaturati,
    rendimentoPercentuale,
    datiAnnui,
    datiBarre,
  };
}
