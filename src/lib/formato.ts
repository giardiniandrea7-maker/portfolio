// Formati numerici per il calcolatore (it-IT). Gli importi sono arrotondati: sono stime.

// Separatore delle migliaia sempre presente ("1.300"): Intl in italiano lo omette sotto 10.000
const nf = { format: (n: number) => migliaia(n) };

export function migliaia(n: number): string {
  const segno = n < 0 ? '-' : '';
  return segno + String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Arrotonda a `passo` euro e formatta "1.234 €". */
export function euro(valore: number, passo = 1): string {
  const v = Math.round(valore / passo) * passo;
  return `${nf.format(Math.max(0, v))} €`;
}

/** Arrotondamenti standard: importi mensili a 10 €, capitali a 100 €. */
export const euroMese = (v: number) => euro(v, 10);
export const euroCapitale = (v: number) => euro(v, 100);

export function percento(valore: number): string {
  return `${Math.round(valore)}%`;
}

/** Numero intero con separatore delle migliaia, senza simbolo (per i campi del form). */
export function intero(valore: number): string {
  return nf.format(Math.round(valore));
}

/** Legge un numero scritto all'italiana ("2.200", "15 000", "1.500,50"): tiene solo la parte intera. */
export function leggiNumero(testo: string): number {
  const pulito = testo.replace(/\s|\./g, '').replace(/,.*$/, '').replace(/[^\d-]/g, '');
  return pulito === '' || pulito === '-' ? Number.NaN : Number(pulito);
}
