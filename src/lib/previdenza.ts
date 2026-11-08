// Calcolo dei vantaggi fiscali della previdenza complementare: funzioni pure, nessun rendimento.

import {
  DEDUCIBILITA_MAX,
  ETA_PENSIONE,
  EXTRA_DEDUZIONE_GIOVANI,
  FASCE,
  SOGLIA_PROFILO,
  TASSAZIONE_USCITA,
  type FasciaId,
} from '../data/previdenza';

export type { FasciaId };
export type Profilo = 'tempo' | 'fisco';

/** Versamento mensile che porta esattamente al limite deducibile (arrotondato all'euro). */
export const MENSILE_MASSIMO = Math.round(DEDUCIBILITA_MAX / 12);

export function aliquotaFascia(fascia: FasciaId): number {
  return FASCE.find((f) => f.id === fascia)!.aliquota;
}

/** Aliquota in uscita (%) dopo `anni` di partecipazione: 15%, -0,30 per anno oltre il 15°, minimo 9%. */
export function aliquotaUscita(anni: number): number {
  const t = TASSAZIONE_USCITA;
  const v = t.base - t.riduzioneAnnua * Math.max(0, Math.floor(anni) - t.oltreAnni);
  return Math.max(t.minimo, Math.round(v * 10) / 10);
}

export function profilo(eta: number): Profilo {
  return eta < SOGLIA_PROFILO ? 'tempo' : 'fisco';
}

export interface Input {
  eta: number;
  fascia: FasciaId;
  mensile: number;
}

export interface Risultato {
  profilo: Profilo;
  aliquota: number;
  anni: number;
  versatoAnno: number;
  rimborsoAnno: number;
  rimborsoTotale: number;
  costoReale: number;
  aliquotaUscita: number;
  /** Rimborsi di 5 anni: quanto vale iniziare oggi invece che tra 5 anni. */
  valoreCinqueAnni: number;
  /** Rimborso aggiuntivo annuo possibile con la deduzione extra per chi ha iniziato a lavorare dal 2007. */
  extraGiovani: number;
  /** Rimborso annuo massimo, versando fino al limite deducibile. */
  rimborsoMax: number;
}

export function calcola({ eta, fascia, mensile }: Input): Risultato {
  const aliquota = aliquotaFascia(fascia);
  const m = Math.max(0, mensile);
  const versatoAnno = Math.min(m * 12, DEDUCIBILITA_MAX);
  const rimborsoAnno = versatoAnno * aliquota;
  const anni = Math.max(0, ETA_PENSIONE - eta);
  return {
    profilo: profilo(eta),
    aliquota,
    anni,
    versatoAnno,
    rimborsoAnno,
    rimborsoTotale: rimborsoAnno * anni,
    costoReale: Math.max(0, m - rimborsoAnno / 12),
    aliquotaUscita: aliquotaUscita(anni),
    valoreCinqueAnni: rimborsoAnno * Math.min(5, anni),
    extraGiovani: EXTRA_DEDUZIONE_GIOVANI.importo * aliquota,
    rimborsoMax: DEDUCIBILITA_MAX * aliquota,
  };
}
