// Parametri del percorso "La tua pensione". Ogni valore riporta fonte e data.
// Tutti gli importi sono in euro di oggi (al netto dell'inflazione).

export type TipoLavoro = 'privato' | 'pubblico' | 'autonomo';
export type Ipotesi = 'prudente' | 'equilibrato' | 'dinamico';

export const FONTI = {
  rgs: 'Ragioneria Generale dello Stato, Le tendenze di medio-lungo periodo del sistema pensionistico, Rapporto n. 26 (2025)',
  bilancio: 'Legge di Bilancio 2026 (L. 199/2025)',
  tuir: 'TUIR, aliquote IRPEF 2026',
  dlgs252: 'D.Lgs. 252/2005 (previdenza complementare)',
  covip: 'Ipotesi illustrative, da allineare al Progetto esemplificativo COVIP',
};

/** Tassi di sostituzione lordi (%) per anno di pensionamento. Dipendente con 38 anni di contributi.
 *  Fonte: FONTI.rgs — dati 2025. */
export const TASSI_DIPENDENTE: ReadonlyArray<readonly [anno: number, tasso: number]> = [
  [2020, 71.7],
  [2030, 71.9],
  [2040, 61.9],
  [2050, 60.5],
  [2060, 59.0],
  [2070, 58.5],
];

/** Autonomi: curva dei dipendenti riproporzionata sul valore 2070 (47,2 contro 58,5).
 *  TODO: verificare sulla tavola RGS completa. */
export const FATTORE_AUTONOMO = 47.2 / 58.5;

/** Limite annuo dei contributi deducibili. Fonte: FONTI.bilancio — 2026. */
export const DEDUCIBILITA_MAX = 5300;

/** Aliquote IRPEF marginali 2026 per fascia di reddito lordo annuo. Fonte: FONTI.tuir — 2026.
 *  TODO: verificare. */
export const FASCE_IRPEF = [
  { id: 'fino28', etichetta: 'fino a 28.000 €', min: 0, max: 28000, aliquota: 0.23 },
  { id: 'da28a50', etichetta: '28.000–50.000 €', min: 28000, max: 50000, aliquota: 0.33 },
  { id: 'oltre50', etichetta: 'oltre 50.000 €', min: 50000, max: Infinity, aliquota: 0.43 },
] as const;
export type FasciaId = (typeof FASCE_IRPEF)[number]['id'];

/** Tassazione annua dei rendimenti. Fonte: FONTI.dlgs252 (20%) e regime ordinario delle rendite finanziarie (26%) — 2026. */
export const TASSA_RENDIMENTI = { complementare: 0.2, ordinario: 0.26 };

/** Tassazione in uscita: 15%, -0,30 punti per ogni anno oltre il 15°, minimo 9%. Fonte: FONTI.dlgs252 — 2026. */
export const USCITA = { base: 0.15, riduzioneAnnua: 0.003, oltreAnni: 15, minimo: 0.09 };

/** Contributo indicativo del datore di lavoro (dipendente con fondo di categoria), % del lordo annuo.
 *  Fonte: media indicativa dei contratti collettivi — 2026. TODO: verificare per contratto. */
export const DATORE_PCT = 0.015;

/** TFR annuo: 6,91% della retribuzione lorda annua. Fonte: art. 2120 c.c. — 2026. */
export const TFR_PCT = 0.0691;

/** Ipotesi di rendimento annuo reale (già al netto dell'inflazione), prima delle tasse. Fonte: FONTI.covip — 2026.
 *  TODO: allineare alle ipotesi del Progetto esemplificativo COVIP. */
export const RENDIMENTI: Record<Ipotesi, number> = { prudente: 0.01, equilibrato: 0.02, dinamico: 0.03 };

/** Tenore di vita in pensione (% del reddito netto di oggi). */
export const TENORI = { essenziale: 70, comeOggi: 85, senzaRinunce: 100 } as const;

/** Orizzonte di pianificazione (età fino a cui si distribuisce il capitale). */
export const ORIZZONTE = 90;

/** Stima del reddito lordo annuo a partire dal netto mensile (13 mensilità, carico fiscale e contributivo medio).
 *  Serve solo a proporre la fascia IRPEF e a stimare datore e TFR. TODO: verificare i coefficienti. */
export const COEFF_LORDO: ReadonlyArray<readonly [netto: number, coefficiente: number]> = [
  [1000, 1.22],
  [1600, 1.32],
  [2200, 1.4],
  [3000, 1.5],
  [4000, 1.62],
  [6000, 1.75],
];
export const MENSILITA = 13;
