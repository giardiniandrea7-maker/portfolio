// Testi dei 3 vantaggi per profilo, condivisi tra pagina e PDF. Nessun rendimento, nessuna promessa.

import type { Risultato } from './previdenza';
import { euro } from './formato';
import {
  ANTICIPAZIONE_CASA,
  CAPITALE_MAX_USCITA,
  DEDUCIBILITA_MAX,
  EXTRA_DEDUZIONE_GIOVANI,
  TASSAZIONE_USCITA,
} from '../data/previdenza';

export const eur = (v: number) => euro(v, 10);
export const pct = (v: number) => `${String(Math.round(v * 10) / 10).replace('.', ',')}%`;

export interface Vantaggio {
  titolo: string;
  numero: string;
  testo: string;
}

export function vantaggi(r: Risultato): Vantaggio[] {
  const aliq = pct(r.aliquota * 100);
  if (r.profilo === 'tempo') {
    return [
      {
        titolo: 'Il tempo è dalla tua parte',
        numero: `circa ${eur(r.valoreCinqueAnni)}`,
        testo: `Iniziare oggi invece che tra 5 anni vale circa ${eur(r.valoreCinqueAnni)} di rimborsi in più. Prima inizi, più è leggero ogni passo.`,
      },
      {
        titolo: 'Un aiuto anche per la casa',
        numero: `fino al ${ANTICIPAZIONE_CASA.percentualeMax}%`,
        testo: `Dopo ${ANTICIPAZIONE_CASA.dopoAnni} anni di partecipazione puoi chiedere fino al ${ANTICIPAZIONE_CASA.percentualeMax}% di quanto hai messo da parte per comprare o ristrutturare la prima casa.`,
      },
      {
        titolo: 'Un vantaggio in più per chi inizia ora',
        numero: `fino a circa ${eur(r.extraGiovani)} in più l’anno`,
        testo: `Se hai iniziato a lavorare dal ${EXTRA_DEDUZIONE_GIOVANI.primaOccupazioneDal}, dal ${EXTRA_DEDUZIONE_GIOVANI.dalAnno}° anno puoi dedurre anche la quota non usata nei primi 5. E se il tuo contratto lo prevede, anche il datore di lavoro contribuisce.`,
      },
    ];
  }
  const uscita =
    r.aliquotaUscita >= TASSAZIONE_USCITA.base
      ? `in uscita il ${pct(TASSAZIONE_USCITA.base)}`
      : `in uscita dal ${pct(TASSAZIONE_USCITA.base)} fino al ${pct(r.aliquotaUscita)}`;
  return [
    {
      titolo: 'Meno tasse, ogni anno',
      numero: `fino a circa ${eur(r.rimborsoMax)} l’anno`,
      testo: `Versando fino al limite deducibile di ${eur(DEDUCIBILITA_MAX)} l’anno, il rimborso arriva con la dichiarazione dei redditi.`,
    },
    {
      titolo: 'Alla fine paghi meno',
      numero: `oggi il ${aliq}, ${uscita}`,
      testo: 'La tassazione finale si riduce con gli anni di partecipazione.',
    },
    {
      titolo: 'Protetto e flessibile',
      numero: `fino al ${CAPITALE_MAX_USCITA}% in capitale`,
      // TODO compliance: verificare formulazione
      testo: `Durante l’accumulo non è pignorabile, va ai beneficiari che scegli tu e alla pensione puoi ritirare fino al ${CAPITALE_MAX_USCITA}% in capitale.`,
    },
  ];
}

export function fraseChiusura(r: Risultato): string {
  return r.profilo === 'tempo'
    ? 'Mettere da parte poco, ma presto, è la scelta che pesa di più sul tuo domani.'
    : `Hai ${r.anni} anni per trasformare una parte delle tue tasse in pensione.`;
}

export const BADGE = { tempo: 'Hai il tempo dalla tua parte', fisco: 'Hai il fisco dalla tua parte' };

export const DISCLAIMER =
  'Simulazione semplificata a scopo informativo ed educativo. Non costituisce consulenza né raccomandazione personalizzata. Il rimborso effettivo dipende dalla tua situazione fiscale (capienza d’imposta, addizionali, detrazioni). Prima di aderire a una forma pensionistica complementare leggi la Nota informativa e la documentazione d’offerta.';
