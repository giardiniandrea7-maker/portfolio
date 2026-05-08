// =============================================================================
// Calcolatore ISEE 2026 — funzione di calcolo pura
// -----------------------------------------------------------------------------
// Riferimenti normativi:
//   • DPCM 5 dicembre 2013 n. 159 (testo base ISEE)
//   • Legge di Bilancio 2026, commi 32-34 (cripto, conti esteri, asset digitali)
//   • Decreto Ministeriale 2 marzo 2026 n. 3 (nuovo modello DSU)
//
// Aggiornamenti 2026 rilevanti:
//   • Franchigia prima casa elevata da 52.500€ → 91.500€
//     (200.000€ per ISEE Inclusione in città metropolitane)
//   • Inclusione obbligatoria di criptovalute, conti correnti esteri e asset
//     digitali nel patrimonio mobiliare
//   • Nuova scala di equivalenza con maggiorazioni potenziate (+0,05 punti
//     rispetto al 2025) per nuclei con più figli minori
//   • ISEE Inclusione riservato alle prestazioni di inclusione sociale, con
//     franchigie ad hoc
//
// Nota: questo è uno strumento di STIMA. Il valore ufficiale è determinato
// dall'INPS sulla base della DSU. Per piccole discrepanze considera spese e
// patrimoni esatti, e situazioni particolari (separazioni, eredità in corso).
// =============================================================================

// -------------------- COSTANTI NORMATIVE 2026 --------------------
// Posizionate in cima per agevolare aggiornamenti futuri quando la normativa
// cambierà. Ogni costante riporta il riferimento legislativo specifico.

/** Franchigia prima casa standard (Ordinario, Universitario).
 *  Rif: Legge di Bilancio 2026, art. 1 c. 32 — incremento da 52.500€. */
export const FRANCHIGIA_PRIMA_CASA_2026 = 91_500;

/** Franchigia prima casa per ISEE Inclusione in città metropolitane.
 *  Rif: Legge di Bilancio 2026, art. 1 c. 33. */
export const FRANCHIGIA_PRIMA_CASA_INCLUSIONE_METROPOLITANA = 200_000;

/** Maggiorazione franchigia prima casa per ogni figlio convivente oltre il primo.
 *  Rif: DPCM 159/2013 art. 5 c. 2 (modificato dalla LB 2026). */
export const MAGGIORAZIONE_FRANCHIGIA_PER_FIGLIO = 2_500;

/** Franchigia base patrimonio mobiliare.
 *  Rif: DPCM 159/2013 art. 5 c. 4. */
export const FRANCHIGIA_MOBILIARE_BASE = 6_000;

/** Incremento franchigia mobiliare per ogni componente oltre il primo. */
export const FRANCHIGIA_MOBILIARE_PER_COMPONENTE = 2_000;

/** Tetto massimo franchigia mobiliare. */
export const FRANCHIGIA_MOBILIARE_MAX = 10_000;

/** Tasso di rendimento figurativo applicato al patrimonio mobiliare oltre franchigia.
 *  Rif: DPCM 159/2013 art. 5 c. 4. */
export const ALIQUOTA_REDDITO_FIGURATIVO = 0.035;

/** Coefficiente di abbattimento (2/3) sull'eccedenza prima casa oltre franchigia.
 *  Rif: DPCM 159/2013 art. 5 c. 2. */
export const COEFF_ABBATTIMENTO_PRIMA_CASA = 2 / 3;

/** Aliquota di abbattimento sui redditi da lavoro dipendente e pensioni. */
export const ABBATTIMENTO_REDDITO_LAVORO = 0.20;

/** Tetto massimo abbattimento redditi da lavoro/pensioni. */
export const ABBATTIMENTO_REDDITO_LAVORO_MAX = 3_000;

/** Tetto massimo deduzione affitto effettivamente pagato. */
export const DEDUZIONE_AFFITTO_MAX = 7_000;

/** Tetto deduzione spese sanitarie disabile medio. */
export const DEDUZIONE_SPESE_SANITARIE_MEDIA_MAX = 5_000;

/** Coefficiente di calcolo ISE: ISE = ISR + (questo) × ISP.
 *  Rif: DPCM 159/2013 art. 2 c. 1. */
export const PESO_PATRIMONIO_SU_ISE = 0.20;

/** Scala di equivalenza base: indice → valore (componenti 1..5).
 *  Rif: DPCM 159/2013 art. 2 c. 4 (Allegato 1). */
export const SCALA_EQUIVALENZA_BASE: Record<number, number> = {
  1: 1.0,
  2: 1.57,
  3: 2.04,
  4: 2.46,
  5: 2.85,
};

/** Incremento scala equivalenza per ogni componente oltre il quinto. */
export const SCALA_EQUIVALENZA_INCREMENTO_OLTRE_5 = 0.35;

// Maggiorazioni scala equivalenza 2026 (+0,05 vs 2025 per nuclei con più figli minori)
export const MAGG_DISABILITA_GRAVE = 0.50;
export const MAGG_DISABILITA_MEDIA_O_NON_AUTOSUFF = 0.30;
export const MAGG_TRE_FIGLI_MINORI = 0.25;        // era 0,20 nel 2025
export const MAGG_QUATTRO_FIGLI_MINORI = 0.40;    // era 0,35 nel 2025
export const MAGG_CINQUE_PIU_FIGLI_MINORI = 0.55; // era 0,50 nel 2025
export const MAGG_FIGLIO_SOTTO_TRE_ANNI = 0.20;
export const MAGG_ENTRAMBI_GENITORI_LAVORANO = 0.10;
/** Maggiorazione aggiuntiva ISEE Inclusione per nuclei con almeno un componente non autosufficiente. */
export const MAGG_INCLUSIONE_NON_AUTOSUFFICIENTE = 0.15;

// Soglie ISEE 2026 per le principali agevolazioni (riferimento orientativo)
const SOGLIA_BONUS_BOLLETTE = 9_530;
const SOGLIA_REDDITO_INCLUSIONE = 9_360;
const SOGLIA_BONUS_NIDO_FASCIA_ALTA = 25_000;
const SOGLIA_BONUS_NIDO_FASCIA_MEDIA = 40_000;
const SOGLIA_TASSE_UNI_NO_TASSE = 22_000;
const SOGLIA_TASSE_UNI_RIDOTTE = 30_000;
const SOGLIA_AUU_FASCIA_BASSA = 17_227.33;
const SOGLIA_AUU_FASCIA_ALTA = 45_939.56;

// -------------------- TIPI --------------------

export type TipologiaIsee = 'ordinario' | 'universitario' | 'inclusione';
export type ModalitaIsee = 'semplice' | 'avanzata';
export type TipoCasa = 'proprieta' | 'affitto' | 'comodato' | 'altro';
export type TipoComune = 'metropolitano' | 'altro';
export type TipoDisabilita = 'media' | 'grave' | 'non_autosufficiente';

export interface InputIsee {
  tipologia: TipologiaIsee;
  modalita: ModalitaIsee;

  // Nucleo
  numeroComponenti: number;
  numeroFigliMinorenni: number;
  numeroFigliSottoTreAnni: number;
  numeroFigliACarico: number;
  numeroDisabili: number;
  tipoDisabilita?: TipoDisabilita;

  // Casa
  tipoCasa: TipoCasa;
  valoreCatastalePrimaCasa: number;
  mutuoResiduoPrimaCasa: number;
  tipoComune: TipoComune;
  canoneAffitto: number;

  // Patrimonio mobiliare
  contiCorrentiDepositi: number;
  investimentiFinanziari: number;
  criptovalute: number;
  contiEsteri: number;
  moneyTransferEstero: number;

  // Redditi
  redditoLavoroDipendente: number;
  redditoLavoroAutonomo: number;
  pensioni: number;
  altriRedditi: number;

  // Avanzate (opzionali)
  valoreAltriImmobili?: number;
  mutuoAltriImmobili?: number;
  affittoPagato?: number;
  speseSanitarieDisabili?: number;
  assegniMantenimento?: number;
  speseAssistenzaDisabili?: number;
  entrambiGenitoriLavorano?: boolean;

  // Universitario specifico
  studenteFuoriSede?: boolean;
  distanzaUniversitaKm?: number;
  redditoPersonaleStudente?: number;
  patrimonioPersonaleStudente?: number;
}

export interface AgevolazioneAccessibile {
  nome: string;
  accessibile: boolean;
  sogliaIsee: number;
  importoStimato?: number;
  note?: string;
}

export interface DettaglioComponenti {
  redditiTotali: number;
  abbattimento20Percento: number;
  deduzioniTotali: number;
  redditoNetto: number;
  patrimonioImmobiliareLordo: number;
  franchigiaApplicata: number;
  patrimonioImmobiliareNetto: number;
  patrimonioMobiliareLordo: number;
  franchigiaMobiliare: number;
  patrimonioMobiliareNetto: number;
  redditoFigurativo: number;
  componente20PatrimonioImmobiliare: number;
  componente20PatrimonioMobiliare: number;
}

export interface OutputIsee {
  ok: boolean;
  errore?: string;
  isr: number;
  isp: number;
  ise: number;
  scalaEquivalenza: number;
  componentiEquivalenti: number;
  iseeStimato: number;
  iseeOrdinario: number;
  iseeUniversitario: number;
  iseeInclusione: number;
  dettaglioComponenti: DettaglioComponenti;
  agevolazioniAccessibili: AgevolazioneAccessibile[];
  warning: string[];
}

// -------------------- HELPERS --------------------

const num = (v: unknown, def = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Calcola la scala di equivalenza secondo DPCM 159/2013 art. 2 c. 4 (Allegato 1).
 * Per nuclei oltre 5 componenti: 2,85 + 0,35 × (componenti − 5).
 */
function scalaBase(componenti: number): number {
  const c = Math.max(1, Math.floor(componenti));
  if (c <= 5) return SCALA_EQUIVALENZA_BASE[c] ?? 1.0;
  return SCALA_EQUIVALENZA_BASE[5] + SCALA_EQUIVALENZA_INCREMENTO_OLTRE_5 * (c - 5);
}

/**
 * Maggiorazioni cumulabili alla scala di equivalenza.
 * Rif: DPCM 159/2013 art. 2 c. 4 + Legge di Bilancio 2026 (+0,05 per scaglioni 3/4/5+ figli).
 */
function maggiorazioniScala(input: InputIsee): number {
  let m = 0;

  // Disabilità (per ogni componente disabile)
  if (input.numeroDisabili > 0 && input.tipoDisabilita) {
    if (input.tipoDisabilita === 'grave') {
      m += MAGG_DISABILITA_GRAVE * input.numeroDisabili;
    } else {
      // media o non_autosufficiente
      m += MAGG_DISABILITA_MEDIA_O_NON_AUTOSUFF * input.numeroDisabili;
    }
  }

  // Famiglie numerose (figli minori) — scaglioni cumulativi non sommati,
  // si applica SOLO la maggiorazione corrispondente al numero di figli minori
  const fm = input.numeroFigliMinorenni;
  if (fm >= 5) m += MAGG_CINQUE_PIU_FIGLI_MINORI;
  else if (fm === 4) m += MAGG_QUATTRO_FIGLI_MINORI;
  else if (fm === 3) m += MAGG_TRE_FIGLI_MINORI;

  // Figli sotto 3 anni (per ogni figlio)
  m += MAGG_FIGLIO_SOTTO_TRE_ANNI * Math.max(0, input.numeroFigliSottoTreAnni);

  // Entrambi i genitori che lavorano (solo se ci sono figli minori)
  if (input.entrambiGenitoriLavorano && fm > 0) {
    m += MAGG_ENTRAMBI_GENITORI_LAVORANO;
  }

  // ISEE Inclusione: maggiorazione per non autosufficiente
  if (input.tipologia === 'inclusione' && input.tipoDisabilita === 'non_autosufficiente'
      && input.numeroDisabili > 0) {
    m += MAGG_INCLUSIONE_NON_AUTOSUFFICIENTE;
  }

  return m;
}

/**
 * Determina la franchigia prima casa applicabile in base a tipologia ISEE,
 * tipo comune e numero di figli a carico.
 * Rif: DPCM 159/2013 art. 5 c. 2 + Legge di Bilancio 2026 commi 32-33.
 */
function calcolaFranchigiaPrimaCasa(
  tipologia: TipologiaIsee,
  tipoComune: TipoComune,
  figliACarico: number
): number {
  let base = FRANCHIGIA_PRIMA_CASA_2026;
  // Solo l'ISEE Inclusione gode della franchigia 200K nelle metropoli
  if (tipologia === 'inclusione' && tipoComune === 'metropolitano') {
    base = FRANCHIGIA_PRIMA_CASA_INCLUSIONE_METROPOLITANA;
  }
  // Maggiorazione: dal secondo figlio in poi (= max(0, figli - 1))
  const maggiorazione = Math.max(0, figliACarico - 1) * MAGGIORAZIONE_FRANCHIGIA_PER_FIGLIO;
  return base + maggiorazione;
}

/**
 * Componenti equivalenti completi (base + maggiorazioni).
 */
function calcolaScalaEquivalenza(input: InputIsee): number {
  return scalaBase(input.numeroComponenti) + maggiorazioniScala(input);
}

// -------------------- CALCOLO PATRIMONIALE --------------------

/**
 * Calcola la componente patrimonio immobiliare ai fini ISEE.
 * Rif: DPCM 159/2013 art. 5 c. 2.
 *   • Prima casa: si sottrae il mutuo residuo, poi si applica la franchigia
 *     e l'eccedenza viene abbattuta al 2/3.
 *   • Altri immobili: valore al netto del mutuo, senza franchigia né abbattimento.
 */
function calcolaPatrimonioImmobiliare(
  input: InputIsee,
  tipologia: TipologiaIsee
): { lordo: number; franchigia: number; netto: number } {
  // Prima casa rilevante solo se il nucleo è proprietario
  const isProprietario = input.tipoCasa === 'proprieta';

  const valorePrimaCasa = isProprietario ? Math.max(0, input.valoreCatastalePrimaCasa) : 0;
  const mutuoPrimaCasa = isProprietario ? Math.max(0, input.mutuoResiduoPrimaCasa) : 0;
  const valoreNettoPrimaCasa = Math.max(0, valorePrimaCasa - mutuoPrimaCasa);

  const franchigiaPrimaCasa = isProprietario
    ? calcolaFranchigiaPrimaCasa(tipologia, input.tipoComune, input.numeroFigliACarico)
    : 0;

  let primaCasaCostituente = 0;
  if (valoreNettoPrimaCasa > franchigiaPrimaCasa) {
    const eccedenza = valoreNettoPrimaCasa - franchigiaPrimaCasa;
    primaCasaCostituente = eccedenza * COEFF_ABBATTIMENTO_PRIMA_CASA;
  }

  // Altri immobili (modalità avanzata, opzionali)
  const valoreAltri = Math.max(0, num(input.valoreAltriImmobili, 0));
  const mutuoAltri = Math.max(0, num(input.mutuoAltriImmobili, 0));
  const altriCostituente = Math.max(0, valoreAltri - mutuoAltri);

  const lordo = valorePrimaCasa + valoreAltri;
  const netto = primaCasaCostituente + altriCostituente;
  return { lordo, franchigia: franchigiaPrimaCasa, netto };
}

/**
 * Calcola la componente patrimonio mobiliare e il reddito figurativo.
 * Rif: DPCM 159/2013 art. 5 c. 4 + LB 2026 c. 34 (cripto, conti esteri).
 */
function calcolaPatrimonioMobiliare(input: InputIsee): {
  lordo: number;
  franchigia: number;
  netto: number;
  redditoFigurativo: number;
} {
  // LB 2026 c. 34 — inclusione obbligatoria di criptovalute, conti esteri,
  // money transfer e altri asset digitali nel patrimonio mobiliare
  const lordo =
    Math.max(0, input.contiCorrentiDepositi) +
    Math.max(0, input.investimentiFinanziari) +
    Math.max(0, input.criptovalute) +
    Math.max(0, input.contiEsteri) +
    Math.max(0, input.moneyTransferEstero);

  // Franchigia base + 2.000€ per componente oltre il primo (max 10.000€)
  const franchigiaCalcolata =
    FRANCHIGIA_MOBILIARE_BASE +
    FRANCHIGIA_MOBILIARE_PER_COMPONENTE * Math.max(0, input.numeroComponenti - 1);
  const franchigia = Math.min(FRANCHIGIA_MOBILIARE_MAX, franchigiaCalcolata);

  const netto = Math.max(0, lordo - franchigia);
  const redditoFigurativo = netto * ALIQUOTA_REDDITO_FIGURATIVO;

  return { lordo, franchigia, netto, redditoFigurativo };
}

// -------------------- CALCOLO REDDITI --------------------

/**
 * Calcola la componente reddito ai fini ISEE (ISR).
 * Rif: DPCM 159/2013 art. 4.
 */
function calcolaRedditi(input: InputIsee, redditoFigurativo: number): {
  totaliLordi: number;
  abbattimento20: number;
  deduzioni: number;
  netto: number;
} {
  const totaliLordi =
    Math.max(0, input.redditoLavoroDipendente) +
    Math.max(0, input.redditoLavoroAutonomo) +
    Math.max(0, input.pensioni) +
    Math.max(0, input.altriRedditi);

  // Abbattimento 20% su lavoro dipendente + pensioni, max 3.000€
  // Rif: DPCM 159/2013 art. 4 c. 2 lett. a)
  const baseAbbattimento = Math.max(0, input.redditoLavoroDipendente) + Math.max(0, input.pensioni);
  const abbattimento20 = Math.min(
    ABBATTIMENTO_REDDITO_LAVORO_MAX,
    baseAbbattimento * ABBATTIMENTO_REDDITO_LAVORO
  );

  // Deduzioni avanzate (modalità avanzata)
  // Rif: DPCM 159/2013 art. 4 c. 4
  const deduzioneAffitto = Math.min(DEDUZIONE_AFFITTO_MAX, Math.max(0, num(input.affittoPagato, 0)));

  let deduzioneSpeseSanitarie = 0;
  if (input.tipoDisabilita === 'media') {
    deduzioneSpeseSanitarie = Math.min(
      DEDUZIONE_SPESE_SANITARIE_MEDIA_MAX,
      Math.max(0, num(input.speseSanitarieDisabili, 0))
    );
  } else if (input.tipoDisabilita === 'non_autosufficiente') {
    // Per i non autosufficienti la deduzione è illimitata
    deduzioneSpeseSanitarie = Math.max(0, num(input.speseSanitarieDisabili, 0));
  }

  const deduzioneAssegni = Math.max(0, num(input.assegniMantenimento, 0));
  const deduzioneAssistenza = Math.max(0, num(input.speseAssistenzaDisabili, 0));

  const deduzioni = deduzioneAffitto + deduzioneSpeseSanitarie + deduzioneAssegni + deduzioneAssistenza;

  // Reddito netto = (lordi − abbattimento − deduzioni), non negativo, + reddito figurativo
  const netto = Math.max(0, totaliLordi - abbattimento20 - deduzioni) + redditoFigurativo;

  return { totaliLordi, abbattimento20, deduzioni, netto };
}

// -------------------- CALCOLO ISEE PER UNA TIPOLOGIA --------------------

interface RisultatoIsee {
  isr: number;
  isp: number;
  ise: number;
  scala: number;
  isee: number;
  dettaglio: DettaglioComponenti;
}

function calcolaIseePerTipologia(
  input: InputIsee,
  tipologia: TipologiaIsee
): RisultatoIsee {
  // Per il calcolo della tipologia "X" usiamo l'input ma con tipologia=X
  const inp: InputIsee = { ...input, tipologia };

  // ISEE Universitario: aggiungi reddito/patrimonio personale dello studente
  // (semplificazione del DPCM 159/2013 art. 8 — sezione studente fuori sede)
  let extraReddito = 0;
  let extraPatrimonio = 0;
  if (tipologia === 'universitario') {
    extraReddito = Math.max(0, num(input.redditoPersonaleStudente, 0));
    extraPatrimonio = Math.max(0, num(input.patrimonioPersonaleStudente, 0));
  }

  const immobiliare = calcolaPatrimonioImmobiliare(inp, tipologia);
  const mobiliareBase = calcolaPatrimonioMobiliare(inp);
  // Aggiungi extra patrimonio personale studente al mobiliare (semplificazione)
  const mobiliareLordoConExtra = mobiliareBase.lordo + extraPatrimonio;
  const mobiliareNettoConExtra = Math.max(0, mobiliareLordoConExtra - mobiliareBase.franchigia);
  const redditoFigurativo = mobiliareNettoConExtra * ALIQUOTA_REDDITO_FIGURATIVO;

  const inputConRedditoExtra: InputIsee = {
    ...inp,
    altriRedditi: inp.altriRedditi + extraReddito,
  };

  const redditi = calcolaRedditi(inputConRedditoExtra, redditoFigurativo);

  const isr = redditi.netto;
  const isp = immobiliare.netto + mobiliareNettoConExtra;
  const ise = isr + PESO_PATRIMONIO_SU_ISE * isp;

  const scala = calcolaScalaEquivalenza(inp);
  const isee = scala > 0 ? ise / scala : 0;

  const dettaglio: DettaglioComponenti = {
    redditiTotali: redditi.totaliLordi,
    abbattimento20Percento: redditi.abbattimento20,
    deduzioniTotali: redditi.deduzioni,
    redditoNetto: redditi.netto,
    patrimonioImmobiliareLordo: immobiliare.lordo,
    franchigiaApplicata: immobiliare.franchigia,
    patrimonioImmobiliareNetto: immobiliare.netto,
    patrimonioMobiliareLordo: mobiliareLordoConExtra,
    franchigiaMobiliare: mobiliareBase.franchigia,
    patrimonioMobiliareNetto: mobiliareNettoConExtra,
    redditoFigurativo,
    componente20PatrimonioImmobiliare: immobiliare.netto * PESO_PATRIMONIO_SU_ISE,
    componente20PatrimonioMobiliare: mobiliareNettoConExtra * PESO_PATRIMONIO_SU_ISE,
  };

  return { isr, isp, ise, scala, isee, dettaglio };
}

// -------------------- AGEVOLAZIONI --------------------

/**
 * Stima le agevolazioni potenzialmente accessibili in base all'ISEE calcolato.
 * Importi e soglie 2026 puramente indicativi.
 */
function calcolaAgevolazioni(
  iseeStimato: number,
  input: InputIsee
): AgevolazioneAccessibile[] {
  const lista: AgevolazioneAccessibile[] = [];

  // Assegno Unico Universale (sempre erogato, importo varia con ISEE)
  // Importi 2026: ~199,40€/mese figlio se ISEE ≤ 17.227€; ~57,50€ se ISEE ≥ 45.940€
  const figli = input.numeroFigliACarico;
  let importoAuuMensile = 57.50;
  if (iseeStimato <= SOGLIA_AUU_FASCIA_BASSA) {
    importoAuuMensile = 199.40;
  } else if (iseeStimato < SOGLIA_AUU_FASCIA_ALTA) {
    // Decremento lineare tra le due soglie
    const t = (iseeStimato - SOGLIA_AUU_FASCIA_BASSA) /
              (SOGLIA_AUU_FASCIA_ALTA - SOGLIA_AUU_FASCIA_BASSA);
    importoAuuMensile = 199.40 - t * (199.40 - 57.50);
  }
  lista.push({
    nome: 'Assegno Unico Universale',
    accessibile: figli > 0,
    sogliaIsee: SOGLIA_AUU_FASCIA_ALTA,
    importoStimato: figli > 0 ? Math.round(importoAuuMensile * figli * 12) : 0,
    note: figli > 0
      ? `Stima annua per ${figli} figl${figli === 1 ? 'io' : 'i'} (importi possono variare per età, disabilità, famiglie numerose).`
      : 'Richiede figli a carico.',
  });

  // Bonus bollette / sociale
  lista.push({
    nome: 'Bonus sociale bollette (luce, gas, idrico)',
    accessibile: iseeStimato <= SOGLIA_BONUS_BOLLETTE,
    sogliaIsee: SOGLIA_BONUS_BOLLETTE,
    note: 'Soglia elevata a 20.000€ per nuclei con almeno 4 figli a carico.',
  });

  // Bonus asilo nido (solo figli sotto 3 anni)
  if (input.numeroFigliSottoTreAnni > 0) {
    let importoNido = 1500;
    if (iseeStimato <= SOGLIA_BONUS_NIDO_FASCIA_ALTA) importoNido = 3000;
    else if (iseeStimato <= SOGLIA_BONUS_NIDO_FASCIA_MEDIA) importoNido = 2500;
    lista.push({
      nome: 'Bonus asilo nido',
      accessibile: true,
      sogliaIsee: 999_999,
      importoStimato: importoNido * input.numeroFigliSottoTreAnni,
      note: `Stima annua massima per ${input.numeroFigliSottoTreAnni} figli sotto i 3 anni.`,
    });
  }

  // Tasse universitarie (rilevante se tipologia universitaria o se figli > 18 a carico)
  if (input.tipologia === 'universitario' || input.numeroFigliACarico > 0) {
    let noteUni = '';
    let accessibile = false;
    if (iseeStimato <= SOGLIA_TASSE_UNI_NO_TASSE) {
      noteUni = 'Esonero totale dalle tasse universitarie (No-Tax Area).';
      accessibile = true;
    } else if (iseeStimato <= SOGLIA_TASSE_UNI_RIDOTTE) {
      noteUni = 'Tasse universitarie progressivamente ridotte.';
      accessibile = true;
    } else {
      noteUni = 'ISEE oltre la soglia per le riduzioni universitarie.';
    }
    lista.push({
      nome: 'Riduzione tasse universitarie',
      accessibile,
      sogliaIsee: SOGLIA_TASSE_UNI_RIDOTTE,
      note: noteUni,
    });
  }

  // Reddito di Inclusione / supporto economico
  lista.push({
    nome: 'Assegno di Inclusione (ADI) / Supporto formazione e lavoro',
    accessibile: iseeStimato <= SOGLIA_REDDITO_INCLUSIONE,
    sogliaIsee: SOGLIA_REDDITO_INCLUSIONE,
    note: 'Richiede anche requisiti reddituali, patrimoniali e di residenza specifici.',
  });

  // Mensa scolastica e servizi comunali
  lista.push({
    nome: 'Mensa scolastica e servizi comunali agevolati',
    accessibile: iseeStimato <= 25_000,
    sogliaIsee: 25_000,
    note: 'Le soglie effettive variano per ogni Comune.',
  });

  return lista;
}

// -------------------- VALIDATION --------------------

function validate(input: InputIsee): string | null {
  if (!Number.isFinite(input.numeroComponenti) || input.numeroComponenti < 1) {
    return 'Il nucleo familiare deve avere almeno un componente.';
  }
  if (input.numeroComponenti > 15) {
    return 'Il numero di componenti supera il massimo gestito (15).';
  }
  if (input.numeroFigliMinorenni > input.numeroFigliACarico
      && input.numeroFigliACarico >= 0
      && input.numeroFigliMinorenni > 0) {
    // soft check: i figli minorenni dovrebbero essere ≤ figli a carico, ma non blocca
  }
  if (input.numeroFigliSottoTreAnni > input.numeroFigliMinorenni) {
    return 'I figli sotto i 3 anni non possono essere più dei figli minorenni.';
  }
  if (input.numeroDisabili > 0 && !input.tipoDisabilita) {
    return 'Specifica la tipologia di disabilità.';
  }
  return null;
}

// -------------------- ENTRY POINT --------------------

export function calcolaIsee(input: InputIsee): OutputIsee {
  const warnings: string[] = [];

  const errore = validate(input);
  if (errore) {
    return {
      ok: false,
      errore,
      isr: 0,
      isp: 0,
      ise: 0,
      scalaEquivalenza: 0,
      componentiEquivalenti: 0,
      iseeStimato: 0,
      iseeOrdinario: 0,
      iseeUniversitario: 0,
      iseeInclusione: 0,
      dettaglioComponenti: {
        redditiTotali: 0,
        abbattimento20Percento: 0,
        deduzioniTotali: 0,
        redditoNetto: 0,
        patrimonioImmobiliareLordo: 0,
        franchigiaApplicata: 0,
        patrimonioImmobiliareNetto: 0,
        patrimonioMobiliareLordo: 0,
        franchigiaMobiliare: 0,
        patrimonioMobiliareNetto: 0,
        redditoFigurativo: 0,
        componente20PatrimonioImmobiliare: 0,
        componente20PatrimonioMobiliare: 0,
      },
      agevolazioniAccessibili: [],
      warning: [errore],
    };
  }

  // Calcoli per le tre tipologie (per il confronto)
  const ord = calcolaIseePerTipologia(input, 'ordinario');
  const uni = calcolaIseePerTipologia(input, 'universitario');
  const inc = calcolaIseePerTipologia(input, 'inclusione');

  // Tipologia selezionata = quella effettiva
  const selezionata =
    input.tipologia === 'universitario' ? uni
    : input.tipologia === 'inclusione' ? inc
    : ord;

  // Warnings informativi
  if (input.criptovalute > 0) {
    warnings.push(
      "Hai dichiarato criptovalute: dal 2026 sono OBBLIGATORIE nel patrimonio mobiliare ISEE."
    );
  }
  if (input.contiEsteri > 0 || input.moneyTransferEstero > 0) {
    warnings.push(
      "Conti esteri e money transfer: dal 2026 vanno dichiarati nel patrimonio mobiliare."
    );
  }
  if (input.tipologia === 'inclusione' && input.tipoComune === 'altro') {
    warnings.push(
      "ISEE Inclusione fuori dalle città metropolitane: si applica la franchigia ordinaria di 91.500€."
    );
  }
  if (selezionata.isee === 0 && input.numeroComponenti > 0) {
    warnings.push("ISEE pari a zero: verifica che redditi e patrimoni siano stati inseriti correttamente.");
  }
  if (input.numeroComponenti === 1 && input.numeroFigliACarico > 0) {
    warnings.push("Nucleo di 1 persona ma figli a carico dichiarati: verifica i dati.");
  }

  const agevolazioni = calcolaAgevolazioni(selezionata.isee, input);

  return {
    ok: true,
    isr: selezionata.isr,
    isp: selezionata.isp,
    ise: selezionata.ise,
    scalaEquivalenza: selezionata.scala,
    componentiEquivalenti: selezionata.scala,
    iseeStimato: selezionata.isee,
    iseeOrdinario: ord.isee,
    iseeUniversitario: uni.isee,
    iseeInclusione: inc.isee,
    dettaglioComponenti: selezionata.dettaglio,
    agevolazioniAccessibili: agevolazioni,
    warning: warnings,
  };
}
