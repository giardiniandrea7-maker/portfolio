// Logica del percorso "La tua pensione": funzioni pure, nessun accesso al DOM.
// Importi in euro di oggi. Simulazione anno per anno, versamenti a fine anno.

import {
  COEFF_LORDO,
  DATORE_PCT,
  DEDUCIBILITA_MAX,
  FASCE_IRPEF,
  FATTORE_AUTONOMO,
  MENSILITA,
  ORIZZONTE,
  RENDIMENTI,
  TASSA_RENDIMENTI,
  TASSI_DIPENDENTE,
  TFR_PCT,
  USCITA,
  type FasciaId,
  type Ipotesi,
  type TipoLavoro,
} from '../data/previdenza';

export type { FasciaId, Ipotesi, TipoLavoro };

export const LIMITI = { etaMin: 20, etaMax: 64, nettoMin: 500, etaPensioneMin: 63, etaPensioneMax: 71 };

// ——— Parametri derivati

/** Tasso di sostituzione lordo (%) per anno di pensione: interpolazione lineare, limitata a 2020–2070. */
export function tassoSostituzione(anno: number, tipo: TipoLavoro): number {
  const p = TASSI_DIPENDENTE;
  const a = Math.min(p[p.length - 1][0], Math.max(p[0][0], anno));
  let t = p[p.length - 1][1];
  for (let i = 0; i < p.length - 1; i++) {
    const [a0, t0] = p[i];
    const [a1, t1] = p[i + 1];
    if (a >= a0 && a <= a1) {
      t = t0 + ((t1 - t0) * (a - a0)) / (a1 - a0);
      break;
    }
  }
  return tipo === 'autonomo' ? t * FATTORE_AUTONOMO : t;
}

/** Reddito lordo annuo stimato dal netto mensile. */
export function stimaLordoAnnuo(nettoMese: number): number {
  const c = COEFF_LORDO;
  let k = c[c.length - 1][1];
  if (nettoMese <= c[0][0]) k = c[0][1];
  else {
    for (let i = 0; i < c.length - 1; i++) {
      const [n0, k0] = c[i];
      const [n1, k1] = c[i + 1];
      if (nettoMese >= n0 && nettoMese <= n1) {
        k = k0 + ((k1 - k0) * (nettoMese - n0)) / (n1 - n0);
        break;
      }
    }
  }
  return nettoMese * MENSILITA * k;
}

export function fasciaDaLordo(lordo: number): FasciaId {
  return (FASCE_IRPEF.find((f) => lordo < f.max) ?? FASCE_IRPEF[FASCE_IRPEF.length - 1]).id;
}

/** Lordo coerente con la fascia scelta dalla persona (la stima viene riportata dentro la fascia). */
export function lordoNellaFascia(nettoMese: number, fascia: FasciaId): number {
  const f = FASCE_IRPEF.find((x) => x.id === fascia)!;
  const stima = stimaLordoAnnuo(nettoMese);
  return Math.min(Number.isFinite(f.max) ? f.max - 1 : stima, Math.max(f.min, stima));
}

export function aliquotaFascia(fascia: FasciaId): number {
  return FASCE_IRPEF.find((f) => f.id === fascia)!.aliquota;
}

/** Aliquota in uscita: 15%, -0,30 punti per anno oltre il 15°, minimo 9%. */
export function aliquotaUscita(anniPartecipazione: number): number {
  const extra = Math.max(0, Math.floor(anniPartecipazione) - USCITA.oltreAnni);
  return Math.max(USCITA.minimo, USCITA.base - extra * USCITA.riduzioneAnnua);
}

// ——— Simulazione

export interface InputPensione {
  eta: number;
  tipo: TipoLavoro;
  nettoMese: number;
  /** Fascia di reddito lordo; se assente viene stimata dal netto. */
  fascia?: FasciaId;
  tenorePct: number;
  versamentoMese: number;
  /** Il datore versa nel fondo (conta solo per i dipendenti privati). */
  datore: boolean;
  etaPensione: number;
  ipotesi: Ipotesi;
  reinvestiRimborso: boolean;
  tfr: boolean;
  annoCorrente?: number;
  orizzonte?: number;
}

export interface PuntoSerie {
  eta: number;
  tuo: number;
  rimborso: number;
  datore: number;
  tfr: number;
  crescita: number;
  totale: number;
}

export interface Scenario {
  capitaleLordo: number;
  tasseUscita: number;
  /** Capitale disponibile alla pensione, dopo la tassazione in uscita. */
  capitale: number;
  integrazione: number;
  copertura: number;
  motori: { tuo: number; rimborso: number; datore: number; tfr: number; crescita: number };
  datoreAnnuo: number;
  tfrAnnuo: number;
  /** Rimborso fiscale del primo anno (senza reinvestimenti). */
  rimborsoAnnuo: number;
  /** Rimborsi che restano a te (non reinvestiti). */
  rimborsoInTasca: number;
  aliquotaUscita: number;
  serie: PuntoSerie[];
}

export interface RisultatoPensione {
  anni: number;
  annoPensione: number;
  anniInPensione: number;
  lordoAnnuo: number;
  fascia: FasciaId;
  aliquota: number;
  tasso: number;
  pensione: number;
  desiderato: number;
  divario: number;
  /** Capitale che servirebbe per coprire tutto il divario fino all'orizzonte. */
  obiettivo: number;
  solo: Scenario;
  complementare: Scenario;
  /** Stesso scenario senza TFR: serve per confrontare a parità di impegno. */
  complementareSenzaTfr: Scenario;
}

export type CampoInput = 'eta' | 'nettoMese' | 'versamentoMese' | 'etaPensione';
export type EsitoPensione =
  | { ok: true; risultato: RisultatoPensione }
  | { ok: false; errori: Partial<Record<CampoInput, string>> };

export function valida(i: InputPensione): Partial<Record<CampoInput, string>> {
  const e: Partial<Record<CampoInput, string>> = {};
  if (!Number.isFinite(i.eta) || i.eta < LIMITI.etaMin || i.eta > LIMITI.etaMax) {
    e.eta = `Scegli un’età tra ${LIMITI.etaMin} e ${LIMITI.etaMax} anni.`;
  }
  if (!Number.isFinite(i.nettoMese) || i.nettoMese < LIMITI.nettoMin) {
    e.nettoMese = `Inserisci almeno ${LIMITI.nettoMin} € al mese.`;
  }
  if (!Number.isFinite(i.versamentoMese) || i.versamentoMese < 0) {
    e.versamentoMese = 'Inserisci una cifra mensile, anche piccola.';
  }
  if (
    !Number.isFinite(i.etaPensione) ||
    i.etaPensione < LIMITI.etaPensioneMin ||
    i.etaPensione > LIMITI.etaPensioneMax ||
    (Number.isFinite(i.eta) && i.etaPensione <= i.eta)
  ) {
    e.etaPensione = `Scegli un’età di pensione tra ${LIMITI.etaPensioneMin} e ${LIMITI.etaPensioneMax} anni, più avanti di oggi.`;
  }
  return e;
}

interface ParametriScenario {
  anni: number;
  eta: number;
  versamentoAnnuo: number;
  rendimentoNetto: number;
  datoreAnnuo: number;
  tfrAnnuo: number;
  aliquota: number;
  fiscale: boolean;
  reinvesti: boolean;
  mesiInPensione: number;
  pensione: number;
  desiderato: number;
}

function simula(p: ParametriScenario): Scenario {
  let capitale = 0;
  const cum = { tuo: 0, rimborso: 0, datore: 0, tfr: 0 };
  let baseUscita = 0;
  let rimborsoPrecedente = 0;
  let rimborsoInTasca = 0;
  let rimborsoAnnuo = 0;
  const serie: PuntoSerie[] = [{ eta: p.eta, tuo: 0, rimborso: 0, datore: 0, tfr: 0, crescita: 0, totale: 0 }];

  for (let t = 1; t <= p.anni; t++) {
    const reinvestito = p.fiscale && p.reinvesti ? rimborsoPrecedente : 0;
    const contributi = p.versamentoAnnuo + reinvestito + p.datoreAnnuo + p.tfrAnnuo;
    capitale = capitale * (1 + p.rendimentoNetto) + contributi;

    cum.tuo += p.versamentoAnnuo;
    cum.rimborso += reinvestito;
    cum.datore += p.datoreAnnuo;
    cum.tfr += p.tfrAnnuo;

    if (p.fiscale) {
      const dedotti = Math.min(p.versamentoAnnuo + reinvestito + p.datoreAnnuo, DEDUCIBILITA_MAX);
      baseUscita += dedotti + p.tfrAnnuo;
      const rimborso = dedotti * p.aliquota;
      if (t === 1) rimborsoAnnuo = rimborso;
      if (p.reinvesti && t < p.anni) rimborsoPrecedente = rimborso;
      else rimborsoInTasca += rimborso; // l'ultimo rimborso arriva dopo la pensione
    }

    const versati = cum.tuo + cum.rimborso + cum.datore + cum.tfr;
    serie.push({ eta: p.eta + t, ...cum, crescita: Math.max(0, capitale - versati), totale: capitale });
  }

  const aliqUscita = p.fiscale ? aliquotaUscita(p.anni) : 0;
  const tasseUscita = p.fiscale ? baseUscita * aliqUscita : 0;
  const netto = capitale - tasseUscita;
  const integrazione = netto / p.mesiInPensione;
  const versati = cum.tuo + cum.rimborso + cum.datore + cum.tfr;
  const copertura = p.desiderato > 0 ? Math.min(100, ((p.pensione + integrazione) / p.desiderato) * 100) : 100;

  return {
    capitaleLordo: capitale,
    tasseUscita,
    capitale: netto,
    integrazione,
    copertura,
    motori: { ...cum, crescita: Math.max(0, capitale - versati) },
    datoreAnnuo: p.datoreAnnuo,
    tfrAnnuo: p.tfrAnnuo,
    rimborsoAnnuo,
    rimborsoInTasca,
    aliquotaUscita: aliqUscita,
    serie,
  };
}

export function calcola(input: InputPensione): EsitoPensione {
  const errori = valida(input);
  if (Object.keys(errori).length > 0) return { ok: false, errori };

  const annoCorrente = input.annoCorrente ?? new Date().getFullYear();
  const orizzonte = input.orizzonte ?? ORIZZONTE;
  const anni = input.etaPensione - input.eta;
  const annoPensione = annoCorrente + anni;
  const anniInPensione = Math.max(1, orizzonte - input.etaPensione);
  const mesiInPensione = anniInPensione * 12;

  const fascia = input.fascia ?? fasciaDaLordo(stimaLordoAnnuo(input.nettoMese));
  const lordoAnnuo = lordoNellaFascia(input.nettoMese, fascia);
  const aliquota = aliquotaFascia(fascia);

  const tasso = tassoSostituzione(annoPensione, input.tipo);
  const pensione = (input.nettoMese * tasso) / 100;
  const desiderato = (input.nettoMese * input.tenorePct) / 100;
  const divario = Math.max(0, desiderato - pensione);

  const rendimento = RENDIMENTI[input.ipotesi];
  const privato = input.tipo === 'privato';
  const datoreAnnuo = privato && input.datore ? lordoAnnuo * DATORE_PCT : 0;
  const tfrAnnuo = privato && input.tfr ? lordoAnnuo * TFR_PCT : 0;

  const comune = {
    anni,
    eta: input.eta,
    versamentoAnnuo: input.versamentoMese * 12,
    aliquota,
    mesiInPensione,
    pensione,
    desiderato,
  };

  const solo = simula({
    ...comune,
    rendimentoNetto: rendimento * (1 - TASSA_RENDIMENTI.ordinario),
    datoreAnnuo: 0,
    tfrAnnuo: 0,
    fiscale: false,
    reinvesti: false,
  });
  const base = {
    ...comune,
    rendimentoNetto: rendimento * (1 - TASSA_RENDIMENTI.complementare),
    datoreAnnuo,
    fiscale: true,
    reinvesti: input.reinvestiRimborso,
  };
  const complementare = simula({ ...base, tfrAnnuo });
  const complementareSenzaTfr = tfrAnnuo > 0 ? simula({ ...base, tfrAnnuo: 0 }) : complementare;

  return {
    ok: true,
    risultato: {
      anni,
      annoPensione,
      anniInPensione,
      lordoAnnuo,
      fascia,
      aliquota,
      tasso,
      pensione,
      desiderato,
      divario,
      obiettivo: divario * mesiInPensione,
      solo,
      complementare,
      complementareSenzaTfr,
    },
  };
}

/** Quanto vale iniziare oggi invece che tra `ritardo` anni (stessa età di pensione). Null se non applicabile. */
export function valoreDiIniziareOggi(input: InputPensione, ritardo = 5): number | null {
  const oggi = calcola(input);
  if (!oggi.ok || input.eta + ritardo >= input.etaPensione) return null;
  const dopo = calcola({ ...input, eta: input.eta + ritardo, annoCorrente: (input.annoCorrente ?? new Date().getFullYear()) + ritardo });
  if (!dopo.ok) return null;
  return Math.max(0, oggi.risultato.complementare.capitale - dopo.risultato.complementare.capitale);
}
