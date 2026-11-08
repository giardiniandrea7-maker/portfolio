// Valori normativi del calcolatore "Vantaggi fiscali della previdenza complementare".
// Un solo file da aggiornare: ogni valore riporta fonte e data di riferimento.
// Nessun rendimento: solo grandezze stabilite dalla norma.

export const FONTI = {
  dlgs252: 'D.Lgs. 252/2005 (disciplina delle forme pensionistiche complementari)',
  bilancio2026: 'L. 199/2025 (Legge di Bilancio 2026)',
  irpef2026: 'Aliquote IRPEF 2026 (art. 11 TUIR)',
};

/** Limite annuo dei contributi deducibili. Fonte: L. 199/2025, dal periodo d'imposta 2026. Aggiornato: 2026. */
export const DEDUCIBILITA_MAX = 5300;

/** Aliquota marginale per fascia di reddito lordo annuo. Fonte: aliquote IRPEF 2026. Aggiornato: 2026.
 *  TODO: verifica finale. */
export const FASCE = [
  { id: 'fino28', etichetta: 'Fino a 28.000 €', breve: 'fino a 28.000 €', aliquota: 0.23 },
  { id: 'da28a50', etichetta: '28–50.000 €', breve: '28.000–50.000 €', aliquota: 0.33 },
  { id: 'oltre50', etichetta: 'Oltre 50.000 €', breve: 'oltre 50.000 €', aliquota: 0.43 },
] as const;
export type FasciaId = (typeof FASCE)[number]['id'];

/** Deduzione aggiuntiva per i lavoratori di prima occupazione dal 2007, dal 6° al 25° anno di partecipazione.
 *  Fonte: D.Lgs. 252/2005, art. 8 c. 6, come modificato. Aggiornato: 2026. */
export const EXTRA_DEDUZIONE_GIOVANI = { importo: 2650, dalAnno: 6, alAnno: 25, primaOccupazioneDal: 2007 };

/** Tassazione in uscita: 15%, -0,30 punti per ogni anno oltre il 15°, minimo 9%. Fonte: D.Lgs. 252/2005, art. 11. Aggiornato: 2026. */
export const TASSAZIONE_USCITA = { base: 15, riduzioneAnnua: 0.3, oltreAnni: 15, minimo: 9 };

/** Anticipazione per l'acquisto o la ristrutturazione della prima casa. Fonte: D.Lgs. 252/2005, art. 11 c. 7. Aggiornato: 2026. */
export const ANTICIPAZIONE_CASA = { dopoAnni: 8, percentualeMax: 75 };

/** Quota massima ritirabile in capitale alla pensione. Fonte: L. 199/2025. Aggiornato: 2026. */
export const CAPITALE_MAX_USCITA = 60;

/** Età di pensione usata nella simulazione. */
export const ETA_PENSIONE = 67;

/** Sotto questa età il profilo è "tempo", da questa età in su "fisco". */
export const SOGLIA_PROFILO = 40;

/** Limiti degli input. */
export const ETA_MIN = 20;
export const ETA_MAX = 62;
