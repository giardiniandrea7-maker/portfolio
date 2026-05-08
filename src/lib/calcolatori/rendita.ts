// =============================================================================
// Calcolatore di Rendita — funzione di calcolo pura
// -----------------------------------------------------------------------------
// Decumulazione patrimoniale con inflazione: stima il capitale necessario per
// vivere di rendita o la rendita sostenibile dato un capitale.
//
// Convenzioni (allineate al brief):
//   • S = spese annue desiderate, espresse in valore "anno 1" (= valore oggi:
//     il prelievo dell'anno 1 è esattamente S, gli anni successivi crescono
//     con l'inflazione).
//   • prelievoNominale[k] = S × (1+inf)^(k-1)
//   • Tutti i flussi sono di fine anno: il capitale matura il rendimento r
//     poi si preleva.
//
// Rendita posticipata crescente (PV):
//   PV = S × [1 − ((1+inf)/(1+r))^N] / (r − inf)            r ≠ inf
//   PV = S × N / (1+r)                                       r = inf
//
// Capitale necessario con eredità (E in valore reale a fine periodo):
//   C = S × pvFactor + E × (1+inf)^N / (1+r)^N
//
// Rendita sostenibile (modalità B, con eredità):
//   rendita = (C − E × (1+inf)^N / (1+r)^N) / pvFactor
//
// Simulazione anno per anno: iterativa, robusta sull'edge case di esaurimento
// del capitale (clamp a 0 e segnalazione anno).
// =============================================================================

export type ModalitaRendita = 'capitale-necessario' | 'rendita-sostenibile';

export interface InputRendita {
  modalita: ModalitaRendita;
  // Modalità A
  speseAnnueDesiderate?: number;
  // Modalità B
  capitaleDisponibile?: number;
  // Comuni
  anni: number;
  rendimentoNettoPerc: number;
  inflazionePerc: number;
  lasciareEredita: boolean;
  ereditaTarget?: number;
}

export interface AndamentoAnnuo {
  anno: number;
  capitaleNominale: number;
  capitaleReale: number;
  prelievoNominale: number;
  prelievoReale: number;
  inflazioneCumulata: number;
}

export interface ConfrontoRegola4 {
  capitaleSecondoRegola: number;
  renditaSecondoRegola: number;
  differenzaPerc: number;
}

export interface OutputRendita {
  ok: boolean;
  errore?: string;
  modalita: ModalitaRendita;
  capitaleNecessario?: number;
  renditaSostenibileAnnua?: number;
  renditaSostenibileMensile?: number;
  rendimentoRealePerc: number;
  tassoPrelevamentoIniziale: number;
  totalePrelevato: number;
  inflazioneCumulataFinale: number;
  capitaleResiduoNominale: number;
  capitaleResiduoReale: number;
  capitaleEsauritoAnno: number | null;
  confrontoRegola4Percento: ConfrontoRegola4;
  andamento: AndamentoAnnuo[];
  warning: string[];
}

function emptyOutput(errore: string, modalita: ModalitaRendita): OutputRendita {
  return {
    ok: false,
    errore,
    modalita,
    rendimentoRealePerc: 0,
    tassoPrelevamentoIniziale: 0,
    totalePrelevato: 0,
    inflazioneCumulataFinale: 0,
    capitaleResiduoNominale: 0,
    capitaleResiduoReale: 0,
    capitaleEsauritoAnno: null,
    confrontoRegola4Percento: {
      capitaleSecondoRegola: 0,
      renditaSecondoRegola: 0,
      differenzaPerc: 0,
    },
    andamento: [],
    warning: [errore],
  };
}

export function calcolaRendita(input: InputRendita): OutputRendita {
  const warnings: string[] = [];
  const N = Math.max(0, Math.floor(input.anni || 0));
  const r = (Number.isFinite(input.rendimentoNettoPerc) ? input.rendimentoNettoPerc : 0) / 100;
  const inf = (Number.isFinite(input.inflazionePerc) ? input.inflazionePerc : 0) / 100;
  const E = input.lasciareEredita ? Math.max(0, input.ereditaTarget ?? 0) : 0;

  if (N < 1) return emptyOutput('Inserisci almeno 1 anno di rendita.', input.modalita);
  if (N > 60) return emptyOutput('La durata massima è 60 anni.', input.modalita);

  // Rendimento reale (Fisher esatta)
  const rendimentoReale = (1 + r) / (1 + inf) - 1;
  const rendimentoRealePerc = rendimentoReale * 100;

  if (rendimentoReale < 0) {
    warnings.push("Rendimento reale negativo: il patrimonio si erode più velocemente di quanto cresce.");
  }
  if (N > 40) {
    warnings.push('Orizzonte oltre 40 anni: le proiezioni diventano poco affidabili.');
  }

  // Fattore di valore attuale della rendita posticipata crescente (S=1)
  const isDegenerate = Math.abs(r - inf) < 1e-9;
  const ratio = (1 + inf) / (1 + r);
  const ratioN = Math.pow(ratio, N);
  const pvFactor = isDegenerate ? N / (1 + r) : (1 - ratioN) / (r - inf);

  // Valore attuale dell'eredità target (espresso in valore reale di oggi)
  const eNominalAtN = E * Math.pow(1 + inf, N);
  const ePresentValue = eNominalAtN / Math.pow(1 + r, N);

  let capitaleIniziale: number;
  let prelievoBase: number;
  let capitaleNecessario: number | undefined;
  let renditaSostenibileAnnua: number | undefined;
  let renditaSostenibileMensile: number | undefined;

  if (input.modalita === 'capitale-necessario') {
    const S = Math.max(0, input.speseAnnueDesiderate ?? 0);
    if (S <= 0) {
      return emptyOutput('Inserisci spese annue maggiori di zero.', input.modalita);
    }
    capitaleNecessario = S * pvFactor + ePresentValue;
    capitaleIniziale = capitaleNecessario;
    prelievoBase = S;
  } else {
    const C = Math.max(0, input.capitaleDisponibile ?? 0);
    if (C <= 0) {
      return emptyOutput('Inserisci un capitale disponibile maggiore di zero.', input.modalita);
    }
    if (pvFactor <= 0) {
      return emptyOutput('Parametri non validi (rendimento/inflazione fuori range).', input.modalita);
    }
    let r_annua = (C - ePresentValue) / pvFactor;
    if (r_annua < 0) {
      warnings.push("Capitale insufficiente per garantire l'eredità target: la rendita risultante è zero.");
      r_annua = 0;
    }
    renditaSostenibileAnnua = r_annua;
    renditaSostenibileMensile = r_annua / 12;
    capitaleIniziale = C;
    prelievoBase = r_annua;
  }

  // -------- Simulazione iterativa --------
  const andamento: AndamentoAnnuo[] = [];
  andamento.push({
    anno: 0,
    capitaleNominale: capitaleIniziale,
    capitaleReale: capitaleIniziale,
    prelievoNominale: 0,
    prelievoReale: 0,
    inflazioneCumulata: 0,
  });

  let capitale = capitaleIniziale;
  let totalePrelevato = 0;
  let capitaleEsauritoAnno: number | null = null;

  for (let k = 1; k <= N; k++) {
    let prelievoNom = prelievoBase * Math.pow(1 + inf, k - 1);
    const capDopoRendimento = capitale * (1 + r);
    let nuovoCap = capDopoRendimento - prelievoNom;
    if (nuovoCap < 0) {
      if (capitaleEsauritoAnno === null) capitaleEsauritoAnno = k;
      // Ultimo prelievo "parziale" pari al capitale residuo dopo la crescita
      prelievoNom = Math.max(0, capDopoRendimento);
      nuovoCap = 0;
    }
    capitale = nuovoCap;
    totalePrelevato += prelievoNom;
    const inflFactor = Math.pow(1 + inf, k);
    andamento.push({
      anno: k,
      capitaleNominale: capitale,
      capitaleReale: capitale / inflFactor,
      prelievoNominale: prelievoNom,
      // Prelievo reale: per convenzione = base (è "S in valore di anno 1")
      prelievoReale: capitaleEsauritoAnno !== null && k > capitaleEsauritoAnno ? 0 : prelievoBase,
      inflazioneCumulata: (inflFactor - 1) * 100,
    });
  }

  const tassoPrelevamentoIniziale =
    capitaleIniziale > 0 ? (prelievoBase / capitaleIniziale) * 100 : 0;

  if (tassoPrelevamentoIniziale > 6 && capitaleEsauritoAnno === null) {
    warnings.push(
      'Tasso di prelievo aggressivo (> 6% del capitale iniziale): alto rischio di esaurire il capitale prima del previsto.'
    );
  }
  if (capitaleEsauritoAnno !== null) {
    warnings.push(
      `ATTENZIONE: con questi parametri il capitale si esaurisce all'anno ${capitaleEsauritoAnno} (su ${N} richiesti).`
    );
  }

  // -------- Regola del 4% (Trinity Study) --------
  let speseRiferimento = 0;
  let capitaleRiferimento = 0;
  if (input.modalita === 'capitale-necessario') {
    speseRiferimento = prelievoBase; // = S
    capitaleRiferimento = capitaleNecessario ?? 0;
  } else {
    speseRiferimento = renditaSostenibileAnnua ?? 0;
    capitaleRiferimento = capitaleIniziale;
  }
  const capitaleSecondoRegola = speseRiferimento * 25;
  const renditaSecondoRegola = capitaleRiferimento * 0.04;

  let differenzaPerc = 0;
  if (input.modalita === 'capitale-necessario') {
    differenzaPerc =
      capitaleSecondoRegola > 0
        ? (((capitaleNecessario ?? 0) - capitaleSecondoRegola) / capitaleSecondoRegola) * 100
        : 0;
  } else {
    differenzaPerc =
      renditaSecondoRegola > 0
        ? (((renditaSostenibileAnnua ?? 0) - renditaSecondoRegola) / renditaSecondoRegola) * 100
        : 0;
  }

  const ultimo = andamento[andamento.length - 1];

  return {
    ok: true,
    modalita: input.modalita,
    capitaleNecessario,
    renditaSostenibileAnnua,
    renditaSostenibileMensile,
    rendimentoRealePerc,
    tassoPrelevamentoIniziale,
    totalePrelevato,
    inflazioneCumulataFinale: (Math.pow(1 + inf, N) - 1) * 100,
    capitaleResiduoNominale: ultimo.capitaleNominale,
    capitaleResiduoReale: ultimo.capitaleReale,
    capitaleEsauritoAnno,
    confrontoRegola4Percento: {
      capitaleSecondoRegola,
      renditaSecondoRegola,
      differenzaPerc,
    },
    andamento,
    warning: warnings,
  };
}
