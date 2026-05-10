// =============================================================================
// Glossario finanziario — struttura dati + helpers
// -----------------------------------------------------------------------------
// Tipologia di voce, mappe label e funzioni di utilità.
// L'array `voci` è popolato in fondo: per aggiungere una nuova voce basta
// aggiungere un oggetto rispettando il tipo VoceGlossario.
//
// Il markdown supportato nei testi è quello inline:
//   **bold**, *italic*, [link](url)
// I numeri con valuta italiana ("10.000 €", "7%") vengono resi con nbsp dal
// componente di rendering (MarkdownInline.astro).
// =============================================================================

export type Categoria =
  | 'investire'
  | 'casa-mutuo'
  | 'pensione'
  | 'lavoro-pensione'
  | 'capire-economia'
  | 'fiscalita'
  | 'protezione-assicurazioni'
  | 'liquidita-conti';

export type Livello = 'base' | 'intermedio' | 'avanzato';

export interface CalcolatoreCorrelato {
  titolo: string;
  slug: string;
}

export interface VoceGlossario {
  slug: string;
  titolo: string;
  /** Forma estesa di una sigla, es. "Tasso Annuo Effettivo Globale" per TAEG. Omessa se non applicabile. */
  sigla?: string;
  categoria: Categoria;
  livello: Livello;
  /** Markdown inline. Resa come paragrafo grande in serif/Playfair nella sezione "La frase essenziale". */
  fraseEssenziale: string;
  /** Markdown inline. Sezione "Un esempio concreto". */
  esempioConcreto: string;
  /** Markdown inline. Sezione "Perché ti riguarda". */
  perchéTiRiguarda: string;
  /** Markdown inline. Sezione "La definizione tecnica". */
  definizioneTecnica: string;
  /** Lista di stringhe markdown inline. Resa come <ul> nella sezione "Errori comuni". */
  erroriComuni: string[];
  /** Slug di altre voci. Resi come card cliccabili in fondo alla pagina. */
  correlate: string[];
  /** Se presente, mostra una CTA dedicata al calcolatore correlato. */
  calcolatoreCorrelato?: CalcolatoreCorrelato;
  /** Max 160 caratteri per <meta name="description">. */
  metaDescription: string;
  /** false → la voce non viene generata staticamente né indicizzata. */
  pubblicata: boolean;
}

// -------------------- LABEL VISIBILI --------------------

export const CATEGORIE: Record<Categoria, string> = {
  'investire': 'Investire',
  'casa-mutuo': 'Casa e mutuo',
  'pensione': 'Pensione',
  'lavoro-pensione': 'Lavoro e pensione',
  'capire-economia': "Capire l'economia",
  'fiscalita': 'Fiscalità',
  'protezione-assicurazioni': 'Protezione e assicurazioni',
  'liquidita-conti': 'Liquidità e conti',
};

/**
 * Color → token Tailwind:
 *   sage  → var(--aw-color-primary) #166963
 *   ochre → var(--aw-color-accent)  #AB7F62
 *   red   → centralizzato, usato anche da rendita scenario aggressivo
 */
export const LIVELLI: Record<Livello, { label: string; emoji: string; color: 'sage' | 'ochre' | 'red' }> = {
  'base':       { label: 'Base',       emoji: '🟢', color: 'sage' },
  'intermedio': { label: 'Intermedio', emoji: '🟡', color: 'ochre' },
  'avanzato':   { label: 'Avanzato',   emoji: '🔴', color: 'red' },
};

/**
 * Identita' visiva per categoria: colore accento + key dell'icona.
 * Il colore e' espresso come stringa CSS (hex o rgba), perche' Tailwind
 * non genera classi dinamiche: l'accento viene applicato via
 * inline style (border-color, color) nei componenti che consumano
 * questa mappa.
 *
 * Tutti i colori sono varianti di sage/emerald/ochre/charcoal del brand
 * (nessun colore nuovo introdotto).
 *
 * Le icone sono Heroicons-style (line, stroke 1.5) renderizzate dal
 * componente CategoriaIcon.astro tramite `iconKey`.
 */
export type IconaCategoria =
  | 'chart-bar'
  | 'home'
  | 'clock'
  | 'briefcase'
  | 'globe-alt'
  | 'document-text'
  | 'banknotes'
  | 'shield-check';

export interface IdentitaCategoria {
  /** Colore accento espresso come CSS color string (hex o rgba). */
  accent: string;
  /** Versione "soft" del colore accento, per sfondi sottili (5-10% opacity). */
  accentSoft: string;
  /** Chiave dell'icona Heroicons-style. */
  iconKey: IconaCategoria;
}

export const CATEGORIE_VISUAL_IDENTITY: Record<Categoria, IdentitaCategoria> = {
  'investire':                { accent: '#0F4F4A',                  accentSoft: 'rgba(15, 79, 74, 0.08)',   iconKey: 'chart-bar' },
  'casa-mutuo':               { accent: '#AB7F62',                  accentSoft: 'rgba(171, 127, 98, 0.10)', iconKey: 'home' },
  'pensione':                 { accent: '#00A652',                  accentSoft: 'rgba(0, 166, 82, 0.10)',   iconKey: 'clock' },
  'lavoro-pensione':          { accent: 'rgba(55, 61, 66, 0.60)',   accentSoft: 'rgba(55, 61, 66, 0.06)',   iconKey: 'briefcase' },
  'capire-economia':          { accent: '#166963',                  accentSoft: 'rgba(22, 105, 99, 0.08)',  iconKey: 'globe-alt' },
  'fiscalita':                { accent: '#8A6449',                  accentSoft: 'rgba(138, 100, 73, 0.10)', iconKey: 'document-text' },
  'liquidita-conti':          { accent: 'rgba(0, 166, 82, 0.75)',   accentSoft: 'rgba(0, 166, 82, 0.08)',   iconKey: 'banknotes' },
  'protezione-assicurazioni': { accent: '#0F4F4A',                  accentSoft: 'rgba(15, 79, 74, 0.08)',   iconKey: 'shield-check' },
};

// -------------------- VOCI --------------------
//
// I testi sono trascrizione fedele di quanto fornito da Andrea Giardini.
// NON modificare wording, punteggiatura, ordini di parole. Per nuove voci
// vedi il tipo `VoceGlossario` sopra.

export const voci: VoceGlossario[] = [
  // -------------------------------------------------------------------------
  // 1. INTERESSE COMPOSTO
  // -------------------------------------------------------------------------
  {
    slug: 'interesse-composto',
    titolo: 'Interesse composto',
    categoria: 'investire',
    livello: 'base',
    fraseEssenziale:
      `L'interesse composto è il meccanismo per cui gli interessi che maturi nel tempo iniziano a generare a loro volta nuovi interessi. È la differenza tra una crescita lineare e una crescita esponenziale, ed è la forza più sottovalutata della finanza personale.`,
    esempioConcreto:
      `Investi 10.000 € a un rendimento del 7% annuo, senza aggiungere nient'altro. Dopo 10 anni non hai 17.000 € — quanto otterresti se gli interessi fossero "semplici" — ma 19.672 €. Dopo 30 anni hai 76.123 €. Dopo 40 anni hai 149.745 €. La curva accelera nel tempo, non rallenta.`,
    perchéTiRiguarda:
      `Il vero protagonista dell'interesse composto è il tempo, non il capitale. Chi inizia a 25 anni versando 200 € al mese per soli 10 anni accumula a 65 anni più capitale di chi inizia a 35 e versa per 30 anni di seguito. Il primo ha investito 24.000 €, il secondo 72.000 €. Eppure il primo arriva con un patrimonio finale superiore, perché ha permesso ai suoi soldi di comporsi per un decennio in più. Questa è la ragione per cui rinviare di un anno una decisione di investimento ha un costo molto più alto di quanto la maggior parte delle persone immagini.`,
    definizioneTecnica:
      `L'interesse composto è il meccanismo per cui gli interessi maturati in ciascun periodo si capitalizzano sul montante, diventando essi stessi base di calcolo per gli interessi successivi. La formula di base del montante è F = C × (1 + R)^N, dove C è il capitale iniziale, R il tasso periodale e N il numero di periodi. In presenza di versamenti periodici costanti, la formula diventa F = C × (1 + R)^N + V × [(1 + R)^N − 1] / R, dove V è il versamento periodico.`,
    erroriComuni: [
      `**Aspettare di avere "abbastanza"** prima di iniziare a investire: ogni anno perso è tempo che non si recupera.`,
      `**Sottovalutare i costi**: una commissione annua dell'1% può erodere oltre un quarto del capitale finale su orizzonti trentennali, perché anche i costi si compongono.`,
      `**Confondere rendimento medio aritmetico e rendimento composto**: un anno +50% seguito da un anno −50% produce un rendimento medio del 0% ma un rendimento composto del −25%.`,
      `**Pensare al composto solo come fenomeno finanziario**: vale per il debito (a tuo sfavore), per la formazione professionale, per le abitudini di risparmio. È una legge generale della crescita.`,
    ],
    correlate: ['volatilita', 'diversificazione', 'inflazione'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Interesse Semplice vs. Composto',
      slug: '/calcolatori/semplice-vs-composto',
    },
    metaDescription:
      `L'interesse composto spiegato con chiarezza: cos'è, come funziona, esempi numerici e gli errori più comuni da evitare. Con calcolatore.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 2. TAEG
  // -------------------------------------------------------------------------
  {
    slug: 'taeg',
    titolo: 'TAEG',
    sigla: 'Tasso Annuo Effettivo Globale',
    categoria: 'casa-mutuo',
    livello: 'base',
    fraseEssenziale:
      `Il TAEG (Tasso Annuo Effettivo Globale) è il costo reale di un finanziamento, espresso in percentuale annua. A differenza del TAN, include tutte le spese accessorie obbligatorie: istruttoria, perizia, polizze, commissioni di incasso. È il numero che devi guardare per confrontare due offerte di mutuo o prestito.`,
    esempioConcreto:
      `Una banca ti propone un mutuo di 200.000 € in 25 anni con TAN al 3,50%. La rata mensile è 1.001 € e il totale interessi è 100.000 €. Ma se aggiungi 500 € di istruttoria, 300 € di perizia, una polizza incendio obbligatoria da 200 € l'anno e 2 € di commissione su ogni rata, il TAEG sale al 3,82%. Su 25 anni quei 32 punti base rappresentano circa 9.000 € di costi aggiuntivi che il TAN da solo non rivelava.`,
    perchéTiRiguarda:
      `Le banche pubblicizzano il TAN perché è il numero più basso. Ma confrontare due mutui guardando solo il TAN equivale a confrontare due automobili guardando solo il prezzo di listino, ignorando bollo, assicurazione e manutenzione. Per legge italiana ed europea, ogni offerta di finanziamento deve riportare il TAEG: è l'unico parametro che permette un confronto onesto. Una banca con TAN più basso ma TAEG più alto sta semplicemente spostando il costo dalle voci visibili a quelle accessorie.`,
    definizioneTecnica:
      `Il TAEG è l'indicatore sintetico di costo di un finanziamento previsto dalla normativa di trasparenza bancaria (art. 121 TUB e Direttiva 2008/48/CE). Si calcola come il tasso annuo che rende equivalente, in termini di valore attuale, la somma erogata e la sommatoria di tutti i pagamenti dovuti dal cliente, comprensivi delle spese accessorie obbligatorie. Si determina risolvendo numericamente l'equazione di equivalenza finanziaria con metodi iterativi (es. Newton-Raphson).`,
    erroriComuni: [
      `**Confrontare TAEG di mutui con durate diverse**: lo stesso TAEG su 20 anni o 30 anni produce costi assoluti molto diversi.`,
      `**Ignorare le spese non incluse nel TAEG**: tasse, imposta sostitutiva e alcune polizze accessorie facoltative non rientrano nel calcolo.`,
      `**Pensare che TAEG basso significhi sempre offerta migliore**: vanno valutati anche flessibilità, possibilità di surroga, presenza di tetto massimo nei tassi variabili.`,
    ],
    correlate: ['inflazione'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Rata Mutuo',
      slug: '/calcolatori/mutuo',
    },
    metaDescription:
      `TAEG: cos'è, come si calcola, differenza con il TAN. Esempi pratici per confrontare correttamente offerte di mutuo e prestito.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 3. ETF
  // -------------------------------------------------------------------------
  {
    slug: 'etf',
    titolo: 'ETF',
    sigla: 'Exchange Traded Fund',
    categoria: 'investire',
    livello: 'intermedio',
    fraseEssenziale:
      `Un ETF (Exchange Traded Fund) è un fondo di investimento che si compra e si vende in borsa come un'azione. Replica passivamente l'andamento di un indice di mercato (azionario, obbligazionario, settoriale) e tipicamente costa molto meno di un fondo a gestione attiva.`,
    esempioConcreto:
      `Acquisti un ETF che replica l'indice MSCI World, che contiene circa 1.500 azioni di aziende di paesi sviluppati in tutto il mondo. Con un'unica operazione di acquisto, ti ritrovi esposto al rendimento medio dell'economia globale. Se l'indice sale del 7%, il tuo ETF (al netto di una commissione tipica dello 0,15-0,30% annuo) sale di circa il 6,7%. Se l'indice scende, scendi anche tu nella stessa proporzione. Non c'è un gestore che cerca di "battere il mercato": c'è un algoritmo che lo replica.`,
    perchéTiRiguarda:
      `Per la maggior parte degli investitori privati, gli ETF rappresentano oggi lo strumento più efficiente in termini di rapporto costo/rendimento. La ricerca finanziaria mostra che oltre l'80% dei fondi a gestione attiva non riesce a battere il proprio indice di riferimento sul lungo periodo, soprattutto al netto dei costi. Costruire un portafoglio diversificato con tre o quattro ETF ben scelti può essere oggi più efficiente, e meno costoso, di prodotti finanziari più sofisticati. Detto questo, scegliere quali ETF inserire, in che proporzione, e quando ribilanciare richiede una pianificazione che tenga conto del tuo orizzonte temporale, della tua tolleranza al rischio e della tua situazione fiscale: lo strumento è semplice, la strategia molto meno.`,
    definizioneTecnica:
      `Un ETF è un OICR (Organismo di Investimento Collettivo del Risparmio) di tipo aperto, quotato su un mercato regolamentato, che mira a replicare l'andamento di un indice di riferimento (benchmark) attraverso replica fisica (acquisto diretto dei titoli sottostanti) o sintetica (uso di derivati come swap). Gli ETF sono soggetti alla normativa UCITS in Europa e offrono trasparenza giornaliera della composizione del portafoglio, liquidità intraday e meccanismi di creazione/redemption che mantengono il prezzo di mercato allineato al NAV (Net Asset Value).`,
    erroriComuni: [
      `**Confondere ETF e azione**: un ETF è un paniere di titoli, non un titolo singolo. La sua volatilità è quasi sempre inferiore.`,
      `**Concentrarsi sull'ETF più popolare anziché su quello più adatto**: un ETF S&P 500 è eccellente per esposizione USA, ma da solo non è un portafoglio diversificato.`,
      `**Trascurare la fiscalità**: gli ETF UCITS armonizzati hanno trattamento fiscale più favorevole rispetto a ETF non armonizzati (USA), che richiedono dichiarazioni complesse.`,
      `**Fare market timing**: la tentazione di entrare e uscire in base alle notizie distrugge il vantaggio dell'investimento passivo.`,
    ],
    correlate: ['diversificazione', 'volatilita', 'btp'],
    metaDescription:
      `ETF spiegati con esempi concreti: cosa sono, come funzionano, vantaggi rispetto ai fondi attivi e errori comuni da evitare.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 4. INFLAZIONE
  // -------------------------------------------------------------------------
  {
    slug: 'inflazione',
    titolo: 'Inflazione',
    categoria: 'capire-economia',
    livello: 'base',
    fraseEssenziale:
      `L'inflazione è la perdita di potere d'acquisto del denaro nel tempo. In altre parole: gli stessi soldi, anno dopo anno, comprano sempre meno cose. È il motivo per cui 100 € di vent'anni fa valgono molto di più di 100 € di oggi.`,
    esempioConcreto:
      `Nel 2004 una pizza margherita in pizzeria costava in media 5 €. Nel 2024 la stessa pizza costa circa 8 €. Non è la pizza a essere diventata "più cara" in termini reali: è il valore dell'euro ad essere diminuito. Un pensionato che vent'anni fa percepiva 1.500 € al mese, se la sua pensione non si è adeguata all'inflazione, oggi con quei 1.500 € può comprare ciò che vent'anni fa avrebbe comprato con circa 950 €.`,
    perchéTiRiguarda:
      `L'inflazione è il principale nemico silenzioso della pianificazione finanziaria di lungo periodo. Tenere 100.000 € fermi in conto corrente, in un periodo di inflazione media al 3%, significa perdere circa 26.000 € di potere d'acquisto in dieci anni. Questa è anche la ragione per cui investire non è una scelta opzionale ma una necessità: chi non investe sta scegliendo, di fatto, di perdere denaro lentamente. Il rendimento reale di un investimento — quello che conta davvero — è il rendimento nominale meno l'inflazione. Un BTP che rende il 3% lordo, se l'inflazione è al 3%, ti sta dando un rendimento reale dello 0% al lordo della tassazione.`,
    definizioneTecnica:
      `L'inflazione è la variazione percentuale generalizzata del livello dei prezzi di beni e servizi in un'economia, misurata attraverso indici dei prezzi al consumo (in Italia: IPC, indice nazionale dei prezzi al consumo per l'intera collettività; armonizzato europeo: IPCA). La BCE persegue un obiettivo di inflazione del 2% nel medio periodo. Si distingue tra inflazione "headline" (totale) e "core" (al netto di componenti volatili come energia e alimentari freschi). La relazione di Fisher esprime il legame tra tassi nominali, reali e inflazione: (1 + nominale) = (1 + reale) × (1 + inflazione).`,
    erroriComuni: [
      `**Confondere prezzo e valore**: il prezzo nominale di un bene può salire mentre il suo valore reale resta costante.`,
      `**Sottovalutare l'effetto cumulato**: un'inflazione media del 2% per trent'anni erode quasi metà del potere d'acquisto.`,
      `**Pensare che l'inflazione colpisca tutti allo stesso modo**: persone con redditi indicizzati e investimenti reali (immobili, azioni) si difendono meglio di chi vive di reddito fisso e liquidità.`,
      `**Ignorare la fiscalità sui rendimenti**: per battere davvero l'inflazione, il rendimento dei tuoi investimenti deve coprire sia l'inflazione sia le tasse sui guadagni.`,
    ],
    correlate: ['spread', 'btp', 'interesse-composto'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore di Rendita',
      slug: '/calcolatori/rendita',
    },
    metaDescription:
      `Inflazione: cos'è, come si misura, come erode il potere d'acquisto. Esempi reali e strategie per proteggere i tuoi risparmi.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 5. SPREAD
  // -------------------------------------------------------------------------
  {
    slug: 'spread',
    titolo: 'Spread',
    categoria: 'capire-economia',
    livello: 'base',
    fraseEssenziale:
      `Lo spread è la differenza di rendimento tra due titoli, tipicamente tra il BTP italiano a 10 anni e il Bund tedesco di pari durata. È espresso in punti base (un punto base = 0,01%) ed è il termometro con cui i mercati misurano la fiducia verso i conti pubblici di un Paese.`,
    esempioConcreto:
      `Se il BTP decennale rende il 4,2% e il Bund tedesco decennale rende il 2,4%, lo spread è di 180 punti base, ovvero 1,8%. Significa che gli investitori chiedono al governo italiano un rendimento aggiuntivo di 1,8 punti percentuali rispetto a quello tedesco, per compensare il maggiore rischio percepito di prestare soldi all'Italia rispetto alla Germania.`,
    perchéTiRiguarda:
      `Lo spread non è un dato astratto da telegiornale: ha effetti concreti sulla vita quotidiana. Quando lo spread sale, lo Stato italiano paga di più per finanziare il proprio debito, e questo si traduce in pressione su tasse e spesa pubblica. Le banche italiane, che detengono molti BTP, vedono ridursi il valore dei loro attivi e tendono a stringere le condizioni di credito: i mutui a tasso variabile per nuovi finanziamenti tendono a salire, e diventa più difficile ottenere prestiti per le piccole imprese. Per chi possiede BTP, una salita dello spread significa un calo del prezzo dei titoli in portafoglio (se decidi di venderli prima della scadenza), ma anche rendimenti più alti sui nuovi acquisti.`,
    definizioneTecnica:
      `Lo spread è il differenziale di rendimento tra due strumenti finanziari, tipicamente titoli di Stato di pari scadenza emessi da emittenti diversi. Riflette il premio per il rischio (credit spread) richiesto dagli investitori per detenere il titolo più rischioso. Si calcola come differenza dei rendimenti a scadenza (Yield To Maturity) ed è influenzato da fattori macroeconomici (rating sovrano, dinamiche fiscali, stabilità politica), monetari (politiche delle banche centrali, aspettative di inflazione) e tecnici (offerta di nuove emissioni, flussi di capitale internazionali).`,
    erroriComuni: [
      `**Confondere spread e rendimento assoluto**: lo spread può salire perché il BTP rende di più o perché il Bund rende di meno. Le due situazioni hanno significati molto diversi.`,
      `**Reagire emotivamente alle oscillazioni quotidiane**: lo spread è volatile e una variazione di 20-30 punti base in pochi giorni è normale.`,
      `**Ignorare il contesto**: uno spread di 200 punti base in un periodo di inflazione bassa è molto diverso dallo stesso spread in un periodo di alta inflazione.`,
    ],
    correlate: ['btp', 'inflazione'],
    metaDescription:
      `Spread BTP-Bund spiegato: cos'è, perché è importante, quali effetti ha sui mutui, sui titoli di Stato e sull'economia italiana.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 6. DIVERSIFICAZIONE
  // -------------------------------------------------------------------------
  {
    slug: 'diversificazione',
    titolo: 'Diversificazione',
    categoria: 'investire',
    livello: 'base',
    fraseEssenziale:
      `La diversificazione è la pratica di distribuire i propri investimenti su più strumenti, settori, aree geografiche e classi di asset, in modo che il cattivo andamento di alcuni venga compensato dal buon andamento di altri. È l'unica forma di "pasto gratis" riconosciuta dalla finanza moderna.`,
    esempioConcreto:
      `Immagina due investitori. Il primo ha tutti i suoi risparmi in un'unica azione, anche se è una grande azienda nota e solida. Il secondo distribuisce gli stessi soldi su 500 aziende diverse, di settori diversi, in dieci paesi. Se la prima azienda subisce un evento negativo specifico — un richiamo di prodotti, uno scandalo, un cambio di management mal riuscito — il primo investitore può perdere il 30% in pochi giorni. Il secondo investitore subisce, per lo stesso evento, un impatto trascurabile, perché quell'azienda rappresenta una piccolissima parte del suo portafoglio. Hanno entrambi assunto un rischio di mercato, ma solo il primo si è esposto al rischio specifico di un singolo titolo.`,
    perchéTiRiguarda:
      `La diversificazione non è una strategia di "prudenza": è una strategia di efficienza. Riduce il rischio del portafoglio senza dover rinunciare al rendimento atteso, perché elimina quei rischi (detti idiosincratici) che non vengono remunerati dal mercato. È il principio cardine della Modern Portfolio Theory di Markowitz, premio Nobel 1990. Detto questo, esistono livelli di diversificazione: avere dieci azioni dello stesso settore non è veramente diversificare, così come avere ETF diversi tutti su mercati sviluppati. Una diversificazione efficace richiede di mescolare classi di asset che si comportano diversamente nelle stesse condizioni di mercato (azioni, obbligazioni, eventualmente immobiliare e materie prime), aree geografiche diverse e fattori di rischio diversi.`,
    definizioneTecnica:
      `La diversificazione di portafoglio è il principio per cui combinare attività finanziarie con correlazioni inferiori a 1 riduce la varianza complessiva del portafoglio senza ridurre proporzionalmente il rendimento atteso. Matematicamente, dato un portafoglio di N titoli con pesi w_i, varianze σ_i² e covarianze σ_ij, la varianza del portafoglio è la sommatoria dei termini w_i × w_j × σ_ij; quando le covarianze sono inferiori alle varianze, la diversificazione produce un beneficio quantificabile. La frontiera efficiente di Markowitz identifica, per ogni livello di rendimento atteso, il portafoglio con varianza minima.`,
    erroriComuni: [
      `**Confondere quantità e qualità**: avere 50 titoli azionari italiani non diversifica davvero, perché tutti reagiscono in modo simile agli stessi eventi.`,
      `**Sovra-diversificare**: oltre un certo punto, aggiungere strumenti aumenta i costi senza ridurre ulteriormente il rischio.`,
      `**Diversificare solo all'interno di una classe di asset**: avere venti ETF azionari diversi è diverso dall'avere un mix di azioni, obbligazioni e altri strumenti.`,
      `**Trascurare la diversificazione temporale**: investire tutto in un unico momento è diverso dall'investire gradualmente nel tempo (Piano di Accumulo del Capitale, PAC).`,
    ],
    correlate: ['etf', 'volatilita', 'btp'],
    metaDescription:
      `Diversificazione di portafoglio: il principio cardine degli investimenti efficienti, con esempi pratici e errori comuni.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 7. PREVIDENZA COMPLEMENTARE
  // -------------------------------------------------------------------------
  {
    slug: 'previdenza-complementare',
    titolo: 'Previdenza complementare',
    categoria: 'pensione',
    livello: 'intermedio',
    fraseEssenziale:
      `La previdenza complementare è il "secondo pilastro" del sistema pensionistico italiano. È un investimento di lungo periodo, fiscalmente agevolato, che si affianca alla pensione pubblica per integrare il reddito al momento del pensionamento. Le forme principali sono il fondo pensione negoziale, il fondo pensione aperto e il PIP (Piano Individuale Pensionistico).`,
    esempioConcreto:
      `Un dipendente con uno stipendio lordo di 35.000 € l'anno, che decide di destinare il TFR al fondo pensione negoziale del proprio settore e di aggiungere un contributo volontario di 100 € al mese, può beneficiare di tre vantaggi fiscali immediati. Primo: i suoi 1.200 € di contributi annui sono interamente deducibili dal reddito imponibile, generando un risparmio fiscale di circa 480 € (con aliquota marginale del 38%). Secondo: i rendimenti del fondo sono tassati al 20%, anziché al 26% degli investimenti finanziari ordinari. Terzo: alla pensione, la prestazione finale è soggetta a una tassazione agevolata che parte dal 15% e può scendere fino al 9%, con una riduzione dello 0,3% per ogni anno di partecipazione oltre il quindicesimo.`,
    perchéTiRiguarda:
      `Il sistema pensionistico pubblico italiano garantirà a chi va in pensione nei prossimi venti o trenta anni un tasso di sostituzione (il rapporto tra prima pensione e ultimo stipendio) significativamente più basso di quello attuale: per molti lavoratori dipendenti privati si parla di percentuali tra il 50% e il 65% dell'ultima retribuzione. Questo significa che, senza un'integrazione, lo stile di vita post-pensionamento sarà sensibilmente inferiore a quello in attività. La previdenza complementare non è quindi un'opzione "extra" per chi può permetterselo: per le generazioni nate dagli anni '80 in poi è una componente strutturale necessaria della pianificazione finanziaria. Iniziare presto è cruciale, perché qui l'interesse composto e le agevolazioni fiscali si sommano amplificandosi reciprocamente.`,
    definizioneTecnica:
      `La previdenza complementare è disciplinata dal D.Lgs. 252/2005 e si articola in forme pensionistiche complementari (FPC) collettive (fondi negoziali e preesistenti) e individuali (fondi aperti e PIP). I contributi sono deducibili fino a 5.164,57 € annui ai sensi dell'art. 10 c.1 lett. e-bis TUIR. I rendimenti sono tassati al 20% (al 12,5% per la quota investita in titoli di Stato). Le prestazioni sono erogate sotto forma di rendita vitalizia, capitale (fino al 50% del montante) o anticipazioni per casi specifici (acquisto prima casa, spese sanitarie). La gestione finanziaria è regolata e vigilata dalla COVIP.`,
    erroriComuni: [
      `**Aderire senza valutare quale linea di investimento scegliere**: un fondo "garantito" per un trentenne è quasi sempre subottimale, mentre per un sessantenne può essere appropriato.`,
      `**Sottovalutare i costi**: differenze nell'ISC (Indicatore Sintetico di Costo) anche di pochi decimi di punto, su 30 anni, hanno impatti enormi.`,
      `**Non sfruttare il contributo del datore di lavoro**: nei fondi negoziali è spesso previsto un contributo aziendale che si attiva solo se il lavoratore versa il proprio. Non aderire significa rinunciare a una parte di retribuzione.`,
      `**Confondere previdenza complementare e polizza vita**: sono prodotti molto diversi per finalità, fiscalità e flessibilità.`,
    ],
    correlate: ['tfr', 'interesse-composto'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Pensione Integrativa',
      slug: '/calcolatori/pensione-integrativa',
    },
    metaDescription:
      `Previdenza complementare: come funziona, vantaggi fiscali, fondo pensione vs PIP. Guida pratica per scegliere consapevolmente.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 8. TFR
  // -------------------------------------------------------------------------
  {
    slug: 'tfr',
    titolo: 'TFR',
    sigla: 'Trattamento di Fine Rapporto',
    categoria: 'lavoro-pensione',
    livello: 'base',
    fraseEssenziale:
      `Il TFR (Trattamento di Fine Rapporto), comunemente chiamato "liquidazione", è una somma che il datore di lavoro accantona ogni anno per ogni dipendente, e che gli verrà corrisposta al termine del rapporto di lavoro. Equivale, per ciascun anno lavorato, a circa una mensilità della retribuzione lorda annua.`,
    esempioConcreto:
      `Un dipendente con una retribuzione lorda annua di 30.000 € matura ogni anno un TFR pari a circa 30.000 / 13,5, ovvero 2.222 €, che viene rivalutato anno per anno con un coefficiente legato all'inflazione (1,5% fisso più il 75% dell'inflazione registrata). Dopo 30 anni di servizio, il montante TFR può ammontare a circa 80.000-100.000 €, in funzione delle rivalutazioni e degli aumenti di stipendio nel corso della carriera.`,
    perchéTiRiguarda:
      `Il TFR è una decisione finanziaria che ogni lavoratore italiano deve prendere, anche se molti non se ne rendono conto. Hai due opzioni: lasciarlo in azienda, dove viene rivalutato a un tasso modesto e tassato in modo separato al momento del pagamento; oppure conferirlo al fondo pensione, dove diventa parte di un investimento di lungo periodo con rendimenti potenzialmente più alti e una fiscalità più favorevole sulla prestazione finale. La scelta è irreversibile e ha conseguenze sostanziali sul tuo capitale futuro. Non esiste una risposta universale: dipende dall'orizzonte temporale, dalla solidità del datore di lavoro (in caso di fallimento, il TFR in azienda è tutelato dal Fondo di Garanzia INPS, ma con tempi e procedure complessi), dalle linee di investimento del fondo pensione disponibile e dalla tua tolleranza al rischio.`,
    definizioneTecnica:
      `Il TFR è disciplinato dall'art. 2120 del Codice Civile. La quota annua accantonata è pari alla retribuzione utile divisa per 13,5, al netto del contributo per il finanziamento del Fondo di Garanzia INPS (0,5% sulla retribuzione utile). La rivalutazione annua è pari al 1,5% fisso più il 75% dell'incremento dell'indice ISTAT dei prezzi al consumo per le famiglie di operai e impiegati. Sulla rivalutazione si applica un'imposta sostitutiva del 17%. Al momento dell'erogazione, il TFR è soggetto a tassazione separata con aliquota basata sulla media dei redditi degli ultimi cinque anni.`,
    erroriComuni: [
      `**Pensare che il TFR sia un "extra"**: è retribuzione differita, già di tua proprietà economica.`,
      `**Conferire al fondo pensione senza valutare la linea di investimento**: la scelta della linea (garantita, obbligazionaria, bilanciata, azionaria) è spesso più importante della scelta tra TFR in azienda o nel fondo.`,
      `**Trascurare il contributo del datore di lavoro**: alcuni contratti prevedono un contributo aggiuntivo se il TFR viene conferito al fondo negoziale.`,
      `**Aspettare troppo per decidere**: ogni anno di TFR lasciato in azienda è un anno di rendimento composto perso se l'alternativa sarebbe stata più redditizia.`,
    ],
    correlate: ['previdenza-complementare', 'interesse-composto'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Pensione Integrativa',
      slug: '/calcolatori/pensione-integrativa',
    },
    metaDescription:
      `TFR: cos'è, come si calcola, conviene lasciarlo in azienda o conferirlo al fondo pensione? Guida con esempi numerici.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 9. VOLATILITÀ
  // -------------------------------------------------------------------------
  {
    slug: 'volatilita',
    titolo: 'Volatilità',
    categoria: 'investire',
    livello: 'intermedio',
    fraseEssenziale:
      `La volatilità misura quanto il prezzo di uno strumento finanziario oscilla nel tempo. Un investimento molto volatile può salire e scendere ampiamente in periodi brevi; uno poco volatile si muove con variazioni più contenute. La volatilità non è il rischio in sé, ma è la sua manifestazione più visibile e psicologicamente impattante.`,
    esempioConcreto:
      `Considera due fondi azionari in un periodo di un anno. Il primo chiude l'anno con un rendimento del +10%, ma durante i dodici mesi è arrivato a guadagnare il 25% per poi scendere al 5%, oscillando continuamente. Il secondo chiude lo stesso anno con un rendimento del +9%, ma con un percorso quasi lineare: piccole oscillazioni quotidiane e nessuna grande discesa. Il rendimento finale è simile, ma l'esperienza dell'investitore è radicalmente diversa. Il primo richiede una tolleranza emotiva molto alta; il secondo è gestibile anche da chi è alle prime armi.`,
    perchéTiRiguarda:
      `La volatilità è il principale nemico psicologico dell'investitore di lungo periodo. La ricerca comportamentale mostra che il dolore di una perdita è circa il doppio del piacere di un guadagno equivalente: questo significa che vedere il proprio capitale scendere del 20% può portare a vendere proprio nel momento peggiore, cristallizzando la perdita. Capire che la volatilità è una caratteristica intrinseca dei mercati azionari, non un'anomalia, e prepararsi mentalmente prima di investire, è uno dei fattori di successo più sottovalutati. La volatilità inoltre è simmetrica: chi sopporta le discese viene premiato dalle salite. Storicamente, l'indice azionario globale ha registrato discese intorno al -30% in media una volta ogni dieci anni, e tutte queste discese sono state seguite da nuovi massimi.`,
    definizioneTecnica:
      `La volatilità è la deviazione standard dei rendimenti di uno strumento finanziario, tipicamente annualizzata. Se i rendimenti giornalieri hanno deviazione standard σ_d, la volatilità annua è approssimativamente σ_d × √252 (252 giorni di trading per anno). Si distingue tra volatilità storica (calcolata su rendimenti passati) e volatilità implicita (estratta dai prezzi delle opzioni, indica le aspettative di mercato sulla volatilità futura). L'indice VIX, calcolato sulle opzioni dell'S&P 500, è il più noto indicatore di volatilità implicita di mercato.`,
    erroriComuni: [
      `**Confondere volatilità e rischio di perdita permanente**: un'azione volatile può oscillare molto ma recuperare; un'azione di un'azienda in crisi può perdere tutto senza riprendersi.`,
      `**Reagire alla volatilità di breve periodo**: le decisioni di investimento basate su movimenti settimanali sono quasi sempre subottimali.`,
      `**Sottovalutare il proprio profilo di rischio reale**: molte persone si dichiarano "tolleranti al rischio" quando i mercati salgono, e scoprono di non esserlo quando scendono.`,
      `**Pensare che bassa volatilità significhi sicurezza assoluta**: anche strumenti percepiti come stabili possono subire perdite, soprattutto se inflazione o tassi cambiano significativamente.`,
    ],
    correlate: ['etf', 'diversificazione', 'interesse-composto'],
    metaDescription:
      `Volatilità degli investimenti: cos'è, come si misura, perché non coincide con il rischio e come gestirla psicologicamente.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 10. BTP
  // -------------------------------------------------------------------------
  {
    slug: 'btp',
    titolo: 'BTP',
    sigla: 'Buono del Tesoro Poliennale',
    categoria: 'investire',
    livello: 'base',
    fraseEssenziale:
      `Il BTP (Buono del Tesoro Poliennale) è un titolo di Stato italiano a medio-lungo termine, emesso dal Ministero dell'Economia per finanziare il debito pubblico. Acquistandolo, presti denaro allo Stato italiano in cambio di cedole semestrali e della restituzione del capitale alla scadenza.`,
    esempioConcreto:
      `Acquisti 10.000 € di BTP a 10 anni con cedola del 4% annuo, frazionata in due pagamenti semestrali. Ogni sei mesi riceverai 200 € lordi (170 € netti dopo la tassazione agevolata del 12,5% riservata ai titoli di Stato). Alla scadenza, dopo dieci anni, lo Stato ti restituirà i 10.000 € di capitale. Il rendimento totale lordo del periodo, se hai acquistato a 100 (cioè alla pari), è del 40% sul capitale investito, distribuito in cedole.`,
    perchéTiRiguarda:
      `I BTP sono uno degli strumenti più comuni nei portafogli italiani, sia per ragioni storiche sia per il vantaggio fiscale (12,5% sui rendimenti contro il 26% di azioni e obbligazioni corporate). Hanno tre caratteristiche che è importante comprendere prima di acquistarli. Primo: il prezzo di mercato del BTP varia nel tempo in funzione dei tassi di interesse e dello spread; se vendi prima della scadenza puoi guadagnare o perdere capitale. Secondo: tenuto fino a scadenza, il BTP restituisce il valore nominale, quindi il rendimento effettivo è quello calcolato all'acquisto (Yield To Maturity). Terzo: il rischio di credito di un BTP coincide con il rischio sovrano italiano, percepito come moderato all'interno dell'Eurozona ma non nullo. Per molti investitori, una piccola allocazione in BTP all'interno di un portafoglio diversificato ha senso; concentrare gran parte del proprio patrimonio in BTP, come fanno tradizionalmente molte famiglie italiane, è invece una scelta di concentrazione del rischio raramente ottimale.`,
    definizioneTecnica:
      `I BTP sono titoli di Stato italiani a tasso fisso e cedola semestrale, con scadenze tipiche di 3, 5, 7, 10, 15, 20, 30 e 50 anni. Sono emessi tramite asta marginale gestita dal Tesoro e successivamente quotati sui mercati MOT (per il retail) e MTS (per gli operatori istituzionali). La tassazione delle cedole e delle plusvalenze è agevolata al 12,5% (art. 26 DPR 600/73). I BTP rientrano nelle categorie ammissibili come collaterale presso la BCE per le operazioni di rifinanziamento. Esistono varianti specifiche: BTP€i (indicizzati all'inflazione europea), BTP Italia (indicizzati all'inflazione italiana, riservati al retail), BTP Futura, BTP Valore.`,
    erroriComuni: [
      `**Confondere rendimento cedolare e rendimento a scadenza**: una cedola del 4% non significa un rendimento del 4% se hai pagato il titolo sopra o sotto la pari.`,
      `**Non considerare il rischio di prezzo**: un BTP a 30 anni può perdere il 20-30% del valore di mercato se i tassi salgono significativamente, anche se l'emittente è solvibile.`,
      `**Considerare i BTP come "privi di rischio"**: hanno rischio sovrano, rischio tasso, rischio inflazione e (se venduti prima) rischio di liquidità.`,
      `**Concentrare il portafoglio in BTP per "patriottismo"**: la decisione di allocare risparmi deve basarsi su rendimento, rischio e diversificazione, non su appartenenza nazionale.`,
    ],
    correlate: ['spread', 'inflazione', 'diversificazione'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Rendimento Obbligazioni e BTP',
      slug: '/calcolatori/rendimento-obbligazioni',
    },
    metaDescription:
      `BTP: cosa sono, come funzionano, vantaggi fiscali, rischi e ruolo nel portafoglio. Con calcolatore di rendimento.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 11. AFFITTO VS ACQUISTO
  // -------------------------------------------------------------------------
  {
    slug: 'affitto-vs-acquisto',
    titolo: 'Affitto vs acquisto',
    categoria: 'casa-mutuo',
    livello: 'base',
    fraseEssenziale:
      `La scelta tra affittare e comprare casa non ha una risposta universale: dipende dai tuoi anni di permanenza prevista nella casa, dal mercato immobiliare locale e dal costo opportunità del capitale che useresti per la caparra.`,
    esempioConcreto:
      `Marco sta valutando se comprare un appartamento da 250.000 euro a Milano o continuare ad affittarne uno equivalente a 1.200 euro al mese. Comprando dovrebbe versare 50.000 euro di caparra, 15.000 euro di costi di acquisto (notaio, imposte, agenzia) e pagare circa 1.100 euro al mese di mutuo per 25 anni. Affittando, mantiene i 50.000 euro investiti in un portafoglio diversificato. Dopo 7 anni le due strade si equivalgono economicamente: prima di quel periodo l'affitto è più conveniente, dopo lo è l'acquisto. Se Marco non è sicuro di restare a Milano per più di 7 anni, l'affitto è la scelta razionale.`,
    perchéTiRiguarda:
      `La cultura italiana spinge verso l'acquisto come scelta 'saggia per definizione', ma matematicamente non è quasi mai così automatico. Comprare casa è una decisione finanziaria irreversibile che blocca il tuo capitale per decenni, riduce la tua mobilità lavorativa e ti espone al rischio del mercato immobiliare locale. Affittare non è 'buttare soldi': è pagare per la flessibilità e per un servizio (l'abitazione) senza assumere rischi. La scelta giusta dipende da chi sei, dove sei nella vita e cosa vuoi fare nei prossimi 10-15 anni, non da quello che hanno fatto i tuoi genitori.`,
    definizioneTecnica:
      `Il calcolo del break-even (punto di pareggio) tra affitto e acquisto considera: costo totale dell'acquisto (mutuo + interessi + manutenzione + IMU + assicurazione + costi di transazione), costo opportunità del capitale immobilizzato (rendimento atteso del portafoglio alternativo, tipicamente 4-6% annuo netto), apprezzamento o deprezzamento atteso dell'immobile, costo dell'affitto comparabile e sua inflazione attesa. Il calcolatore 'Affitto vs Acquisto' del New York Times è il più rigoroso disponibile pubblicamente.`,
    erroriComuni: [
      `Considerare l'affitto come 'soldi buttati' senza calcolare il costo opportunità della caparra`,
      `Ignorare i costi di acquisto (notaio, imposte, agenzia: circa 8-10% del valore)`,
      `Sottovalutare le manutenzioni straordinarie (mediamente 1% del valore immobile l'anno)`,
      `Considerare l'apprezzamento immobiliare degli ultimi 20 anni come garantito anche per i prossimi 20`,
      `Non considerare la perdita di mobilità lavorativa come un costo reale`,
    ],
    correlate: ['estinzione-anticipata-mutuo', 'taeg', 'inflazione', 'fondo-emergenza'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Rata Mutuo',
      slug: '/calcolatori/mutuo',
    },
    metaDescription:
      `Affitto o acquisto? Il calcolo onesto: anni di permanenza, costo opportunità della caparra, costi nascosti. Senza luoghi comuni.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 12. ASSET ALLOCATION
  // -------------------------------------------------------------------------
  {
    slug: 'asset-allocation',
    titolo: 'Asset allocation',
    categoria: 'investire',
    livello: 'intermedio',
    fraseEssenziale:
      `L'asset allocation è la decisione su come dividere il tuo patrimonio tra le grandi categorie di investimento (azioni, obbligazioni, liquidità, immobili). È la scelta più importante che fai come investitore, più importante di quale specifico fondo o azione comprare.`,
    esempioConcreto:
      `Laura ha 100.000 euro da investire e ha 35 anni. Una asset allocation possibile per lei è: 70% in azioni globali (70.000 euro), 20% in obbligazioni governative (20.000 euro), 10% in liquidità per imprevisti (10.000 euro). La stessa Laura a 60 anni, con 5 anni alla pensione, avrà probabilmente un'allocazione molto diversa: 40% azioni, 50% obbligazioni, 10% liquidità. Stessa persona, stessa cifra: ma asset allocation diverse perché l'orizzonte temporale e la tolleranza al rischio sono cambiati.`,
    perchéTiRiguarda:
      `Studi accademici dimostrano che l'asset allocation determina circa il 90% della variabilità dei rendimenti di un portafoglio di lungo periodo. Tradotto: cambia molto di più scegliere '70% azioni, 30% obbligazioni' rispetto a '60% azioni, 40% obbligazioni' che non cambiare l'ETF specifico al suo interno. Eppure la maggior parte degli investitori italiani spende ore a scegliere il singolo fondo e zero minuti a decidere coscientemente la propria asset allocation. Se non hai mai pensato esplicitamente a 'quanto del mio denaro è in azioni e quanto in obbligazioni', probabilmente l'allocazione che hai oggi è figlia del caso, non di una decisione strategica.`,
    definizioneTecnica:
      `L'asset allocation strategica definisce le percentuali di lungo periodo tra le classi di asset principali (equity, fixed income, real estate, cash, alternativi) basandosi su tre fattori: orizzonte temporale dell'investitore, capacità oggettiva di sopportare perdite (riserve liquide, reddito stabile), tolleranza emotiva alla volatilità. L'asset allocation tattica, opzionale, è l'introduzione di deviazioni temporanee dalla strategica per cogliere opportunità di mercato. La modello classica di allocazione decrescente delle azioni con l'età ('100 meno la tua età = % azioni') è semplificata e sostituita oggi da approcci più sofisticati basati sul ciclo di vita.`,
    erroriComuni: [
      `Non avere mai deciso esplicitamente la propria asset allocation`,
      `Cambiare allocazione frequentemente in base alle notizie di mercato`,
      `Confondere diversificazione tra strumenti (10 ETF azionari diversi) con vera asset allocation (azioni vs obbligazioni vs liquidità)`,
      `Tenere troppa liquidità sul conto 'per sicurezza' senza considerare l'erosione dell'inflazione`,
      `Mantenere la stessa allocazione per 20 anni senza adeguarla all'invecchiamento e ai cambiamenti di vita`,
    ],
    correlate: ['diversificazione', 'etf', 'volatilita', 'gestione-attiva-vs-passiva'],
    metaDescription:
      `Asset allocation: la decisione più importante che fai come investitore. Cos'è, perché conta più della scelta del singolo fondo.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 13. CAPITAL GAIN
  // -------------------------------------------------------------------------
  {
    slug: 'capital-gain',
    titolo: 'Capital gain',
    categoria: 'investire',
    livello: 'intermedio',
    fraseEssenziale:
      `Il capital gain è il guadagno realizzato quando vendi uno strumento finanziario a un prezzo superiore a quello di acquisto. In Italia è tassato al 26% per la maggior parte degli strumenti, al 12,5% per titoli di Stato italiani e di paesi white list.`,
    esempioConcreto:
      `Marco ha comprato 100 azioni di una società a 50 euro l'una (5.000 euro totali). Dopo due anni le vende a 70 euro l'una (7.000 euro totali). Il suo capital gain è 2.000 euro. Su questi 2.000 euro paga il 26% di imposta sostitutiva, ovvero 520 euro. Il suo guadagno netto è quindi 1.480 euro. Se invece avesse comprato BTP italiani con lo stesso schema, sui 2.000 euro di guadagno avrebbe pagato il 12,5%, cioè 250 euro, con un guadagno netto di 1.750 euro. La fiscalità non è un dettaglio: in 30 anni di investimento può cambiare il risultato finale di decine di migliaia di euro.`,
    perchéTiRiguarda:
      `La fiscalità è la 'tassa nascosta' più sottovalutata negli investimenti. Molti investitori italiani guardano solo al rendimento lordo dichiarato dai prodotti finanziari, dimenticando che il rendimento netto può essere significativamente inferiore. Capire le differenze tra le aliquote fiscali (26% standard, 12,5% titoli di Stato, 26% sui dividendi) ti permette di costruire un portafoglio fiscalmente efficiente, dove la stessa esposizione al mercato genera più rendimento netto a parità di rischio. È uno degli ambiti dove la consulenza professionale ripaga il proprio costo decine di volte nel tempo.`,
    definizioneTecnica:
      `Il capital gain (plusvalenza) si calcola come differenza tra prezzo di vendita e prezzo medio ponderato di acquisto, al netto delle commissioni. In Italia rientra nella categoria dei 'redditi diversi' ed è soggetto a imposta sostitutiva. Le aliquote sono: 26% sulla maggior parte degli strumenti finanziari (azioni, ETF azionari, obbligazioni corporate, dividendi), 12,5% sui titoli di Stato italiani, sovranazionali (BEI, BIRS) e di paesi white list, 26% sui guadagni cripto. Le minusvalenze (perdite realizzate) possono essere compensate con plusvalenze entro 4 anni successivi. I regimi possibili sono: amministrato (la banca trattiene), gestito (il gestore trattiene), dichiarativo (te ne occupi tu in dichiarazione).`,
    erroriComuni: [
      `Vendere e ricomprare lo stesso strumento per 'monetizzare' un guadagno, pagando inutilmente le tasse`,
      `Non usare le minusvalenze pregresse prima della loro scadenza quadriennale`,
      `Confondere il rendimento lordo con quello netto quando si confrontano strumenti`,
      `Ignorare l'esistenza del 12,5% su titoli di Stato, che li rende più convenienti di quanto sembri`,
      `Tenere ETF a distribuzione dei dividendi quando uno ad accumulazione sarebbe fiscalmente più efficiente`,
    ],
    correlate: ['btp', 'etf', 'fondo-comune-investimento'],
    metaDescription:
      `Capital gain: cos'è, le aliquote italiane (26% e 12,5%), come compensare le minusvalenze e ottimizzare la fiscalità degli investimenti.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 14. CONTO DEPOSITO
  // -------------------------------------------------------------------------
  {
    slug: 'conto-deposito',
    titolo: 'Conto deposito',
    categoria: 'liquidita-conti',
    livello: 'base',
    fraseEssenziale:
      `Il conto deposito è uno strumento di risparmio che offre un tasso di interesse garantito, in cambio del vincolo di lasciare il denaro per un periodo definito (tipicamente 6, 12, 24 o 36 mesi). È protetto dal Fondo Interbancario di Tutela dei Depositi fino a 100.000 euro per intestatario.`,
    esempioConcreto:
      `Anna ha 30.000 euro che le serviranno tra esattamente 24 mesi per la caparra di una casa. Lasciarli sul conto corrente significa erosione certa per inflazione. Investirli in azioni ha rendimento atteso superiore ma con rischio di perdita nel breve periodo. Un conto deposito vincolato a 24 mesi al 3% annuo lordo le garantisce alla scadenza esattamente 31.346 euro lordi, 31.000 euro netti. È rendimento certo, importo certo, scadenza certa. Per un obiettivo a tempo definito e somma definita, è lo strumento giusto.`,
    perchéTiRiguarda:
      `Negli ultimi 15 anni il conto deposito è stato spesso ignorato perché i tassi erano vicini allo zero. Oggi (2026) molte banche offrono 2,5-4% annuo lordo su vincoli di 12-24 mesi, una situazione che non si vedeva dal 2008. Per somme che ti serviranno con certezza in un orizzonte definito (caparra casa, spese mediche programmate, regalo importante), il conto deposito è probabilmente lo strumento più adatto. Non sostituisce gli investimenti di lungo periodo, ma è uno strumento complementare che molti italiani trascurano per disinformazione o pigrizia.`,
    definizioneTecnica:
      `Il conto deposito è un contratto bancario regolato dall'art. 1834 del Codice Civile. Le caratteristiche principali sono: tasso di interesse fisso garantito per la durata del vincolo, garanzia FITD fino a 100.000 euro per depositante per banca (in caso di fallimento dell'istituto), imposta di bollo dello 0,2% annuo sulla giacenza media, ritenuta del 26% sugli interessi maturati. I conti deposito si distinguono in svincolabili (puoi ritirare prima ma perdi gli interessi maturati) e non svincolabili (denaro bloccato fino a scadenza). Il tasso offerto è generalmente più alto sui non svincolabili e su durate più lunghe.`,
    erroriComuni: [
      `Mettere sul conto deposito somme che potrebbero servire per emergenze (devono restare liquide)`,
      `Vincolare denaro che servirà prima della scadenza (perdita degli interessi)`,
      `Confrontare solo i tassi lordi senza calcolare il netto dopo bollo e ritenuta`,
      `Aprire conti deposito presso banche con rating creditizio basso senza considerare il rischio (la garanzia FITD è solida ma ha tempi di rimborso non immediati)`,
      `Ignorare il conto deposito per principio 'le banche italiane non rendono nulla' senza verificare le offerte attuali`,
    ],
    correlate: ['fondo-emergenza', 'inflazione', 'btp'],
    metaDescription:
      `Conto deposito: come funziona, garanzia FITD, calcolo del netto, quando ha senso e quando no. Esempi pratici aggiornati al 2026.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 15. DEDUZIONE FISCALE
  // -------------------------------------------------------------------------
  {
    slug: 'deduzione-fiscale',
    titolo: 'Deduzione fiscale',
    categoria: 'fiscalita',
    livello: 'base',
    fraseEssenziale:
      `La deduzione fiscale riduce il tuo reddito imponibile, cioè la base su cui si calcolano le tasse. Diversa dalla detrazione, che invece riduce direttamente l'imposta da pagare. La deduzione vale di più per chi ha un reddito alto, perché si applica all'aliquota marginale.`,
    esempioConcreto:
      `Roberto ha un reddito di 50.000 euro e versa 4.000 euro all'anno in un fondo pensione, somma deducibile. Il suo reddito imponibile diventa 46.000 euro. Trovandosi nello scaglione del 38% (aliquota marginale tra 28.000 e 50.000 euro), risparmia 4.000 × 38% = 1.520 euro di IRPEF. In pratica, il suo versamento netto al fondo pensione è 4.000 - 1.520 = 2.480 euro. La stessa deduzione, fatta da una persona con reddito di 20.000 euro (aliquota 23%), gli farebbe risparmiare solo 4.000 × 23% = 920 euro: la deduzione vale di più chi ha un reddito alto.`,
    perchéTiRiguarda:
      `Le deduzioni fiscali sono uno degli strumenti più potenti per ottimizzare la propria posizione fiscale, ma molti italiani non le sfruttano per disinformazione. Le principali deduzioni includono: contributi alla previdenza complementare (fino a 5.300 euro annui dal 2026), contributi previdenziali e assistenziali obbligatori, assegni periodici al coniuge separato, donazioni a ONG e ONLUS riconosciute. Capire la differenza tra deduzioni e detrazioni e sfruttarle correttamente può ridurre la tua imposta annuale di centinaia o migliaia di euro, soldi che restano nel tuo patrimonio.`,
    definizioneTecnica:
      `Le deduzioni fiscali (art. 10 del TUIR) sono importi sottratti dal reddito complessivo prima del calcolo dell'imposta lorda. Riducono quindi la base imponibile su cui si applicano le aliquote IRPEF (23%, 35%, 43% nel 2026). Il vantaggio fiscale reale di una deduzione è quindi pari all'importo dedotto moltiplicato per l'aliquota marginale del contribuente. Le detrazioni invece sono importi sottratti dall'imposta lorda dopo il calcolo, e hanno un valore fiscale pari al 19% (la maggior parte) o al 50%/65%/110% (interventi edilizi specifici) dell'importo speso. La distinzione è fondamentale perché con lo stesso importo speso, una deduzione vale più di una detrazione per redditi medio-alti, viceversa per redditi bassi.`,
    erroriComuni: [
      `Confondere deduzione e detrazione, sottostimando il vantaggio della prima per redditi alti`,
      `Non versare alla previdenza complementare per 'non avere tempo di pensarci', perdendo migliaia di euro all'anno`,
      `Non conservare i giustificativi delle spese deducibili (rischio in caso di accertamento)`,
      `Versare al fondo pensione importi superiori al tetto di deducibilità annua (5.300 euro nel 2026): l'eccedenza non gode del beneficio fiscale`,
      `Aspettare il commercialista invece di pianificare le deduzioni nell'anno fiscale (a dicembre è troppo tardi)`,
    ],
    correlate: ['detrazione-fiscale', 'previdenza-complementare', 'tfr'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Pensione Integrativa',
      slug: '/calcolatori/pensione-integrativa',
    },
    metaDescription:
      `Deduzione fiscale: come riduce il reddito imponibile e perché vale di più per i redditi alti. Esempi numerici concreti.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 16. DETRAZIONE FISCALE
  // -------------------------------------------------------------------------
  {
    slug: 'detrazione-fiscale',
    titolo: 'Detrazione fiscale',
    categoria: 'fiscalita',
    livello: 'base',
    fraseEssenziale:
      `La detrazione fiscale riduce direttamente l'imposta da pagare, dopo che è stata calcolata sul reddito. Diversamente dalla deduzione, ha lo stesso valore per tutti (tipicamente 19% della spesa sostenuta), indipendentemente dall'aliquota marginale.`,
    esempioConcreto:
      `Sara ha sostenuto 1.000 euro di spese mediche detraibili al 19%. La sua imposta lorda IRPEF, calcolata sul suo reddito, era 8.500 euro. Grazie alla detrazione, l'imposta effettiva da pagare diventa 8.500 - (1.000 × 19%) = 8.500 - 190 = 8.310 euro. Sara ha quindi recuperato 190 euro grazie alla detrazione. La stessa detrazione vale 190 euro sia per Sara (reddito 30.000 euro) sia per Marco (reddito 80.000 euro): a differenza della deduzione, la detrazione ha lo stesso impatto economico per tutti.`,
    perchéTiRiguarda:
      `Le detrazioni fiscali sono il meccanismo più diffuso di agevolazione per i redditi italiani: spese mediche, mutuo prima casa, ristrutturazioni edilizie, scuola dei figli, attività sportive dei minori, spese funebri, assicurazione vita. Molti italiani perdono migliaia di euro l'anno semplicemente perché non conservano gli scontrini medici, non chiedono al proprio gestore di mutuo l'attestazione degli interessi pagati, o non sanno che certe spese sono detraibili. Una buona pianificazione fiscale annuale include la mappatura sistematica di tutte le detrazioni a cui hai diritto.`,
    definizioneTecnica:
      `Le detrazioni fiscali (artt. 13-16 del TUIR) sono importi che riducono l'imposta lorda calcolata sul reddito imponibile. Le principali categorie sono: detrazioni per familiari a carico, detrazioni per tipologia di reddito (lavoro dipendente, pensione, autonomo), detrazioni del 19% per oneri detraibili (spese mediche, interessi mutuo prima casa, assicurazione vita, scuola, attività sportive minori), detrazioni del 19-90% per interventi edilizi (ecobonus, sismabonus, ristrutturazione). Le detrazioni sono soggette a tracciabilità del pagamento dal 2020: pagamenti in contanti per importi non strettamente di prima necessità non sono detraibili. L'eccedenza di detrazioni rispetto all'imposta lorda non è rimborsabile per la maggior parte delle categorie (incapienza fiscale).`,
    erroriComuni: [
      `Non conservare gli scontrini medici e farmaceutici durante l'anno`,
      `Non chiedere alla banca l'attestazione degli interessi mutuo entro la dichiarazione dei redditi`,
      `Pagare in contanti spese che richiederebbero tracciabilità per essere detraibili`,
      `Confondere le detrazioni con le deduzioni e sottostimare l'impatto delle scelte fiscali`,
      `Non sfruttare le detrazioni edilizie quando si fanno comunque dei lavori (cessione del credito, sconto in fattura)`,
    ],
    correlate: ['deduzione-fiscale', 'estinzione-anticipata-mutuo'],
    metaDescription:
      `Detrazione fiscale: come riduce direttamente l'imposta, le detrazioni più diffuse e gli errori comuni da evitare ogni anno.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 17. ESTINZIONE ANTICIPATA MUTUO
  // -------------------------------------------------------------------------
  {
    slug: 'estinzione-anticipata-mutuo',
    titolo: 'Estinzione anticipata mutuo',
    categoria: 'casa-mutuo',
    livello: 'intermedio',
    fraseEssenziale:
      `L'estinzione anticipata del mutuo è la facoltà del mutuatario di restituire alla banca, in tutto o in parte, il debito residuo prima della scadenza naturale del piano di ammortamento. Per i mutui prima casa stipulati dopo il 2007, l'estinzione totale o parziale è gratuita per legge.`,
    esempioConcreto:
      `Giovanni ha un mutuo da 200.000 euro a 25 anni, di cui ha pagato 8 anni. Il suo debito residuo è di circa 145.000 euro. Riceve un'eredità di 80.000 euro e si chiede: estinguere parzialmente il mutuo o investire? Se il tasso del mutuo è 2,5% fisso e il rendimento atteso del portafoglio è 4-5%, matematicamente conviene investire. Se il tasso del mutuo è 5% variabile e il rendimento atteso è 4%, conviene quasi certamente estinguere. La risposta non è universale: dipende dal tasso del mutuo, dall'orizzonte temporale residuo, dalla tua tolleranza al rischio e dal valore psicologico che dai al 'non avere debiti'.`,
    perchéTiRiguarda:
      `L'estinzione anticipata è una delle decisioni finanziarie più importanti che molte famiglie italiane affrontano nella vita, eppure viene quasi sempre presa 'di pancia' anziché con un calcolo razionale. La risposta giusta dipende da una combinazione di matematica (confronto tra tasso del mutuo e rendimento atteso degli investimenti alternativi), psicologia (quanto pesa per te il debito residuo) e situazione personale (hai un fondo emergenza? Hai liquidità per imprevisti?). Una consulenza professionale ti aiuta a fare il calcolo onesto e a decidere con tutti gli elementi sul tavolo.`,
    definizioneTecnica:
      `L'estinzione anticipata è disciplinata dal D.L. 7/2007 (decreto Bersani) per i mutui prima casa contratti da persone fisiche, che ne stabilisce la gratuità totale (nessuna penale ammessa). Per altre tipologie di mutuo (seconda casa, mutui aziendali) la penale può variare ma è soggetta a tetti normativi. L'estinzione può essere totale (chiusura completa del debito residuo) o parziale (riduzione di una porzione del debito, con possibilità di scegliere se ridurre la rata o accorciare la durata). Per richiedere l'estinzione serve presentare richiesta scritta alla banca, che ha 30 giorni per fornire il conteggio esatto. Il pagamento avviene tramite bonifico bancario tracciato.`,
    erroriComuni: [
      `Estinguere il mutuo senza prima costituire un fondo emergenza adeguato`,
      `Estinguere mutui a tasso molto basso (sotto il 2%) quando si potrebbe ottenere di più investendo`,
      `Non valutare l'opzione 'estinzione parziale con riduzione durata' che ha effetti molto diversi da 'riduzione rata'`,
      `Considerare l'estinzione solo come scelta finanziaria, ignorando l'impatto psicologico positivo del 'non avere debiti'`,
      `Non sfruttare la surroga (cambio banca a costo zero) come alternativa all'estinzione quando il problema vero è il tasso troppo alto`,
    ],
    correlate: ['affitto-vs-acquisto', 'taeg', 'asset-allocation', 'fondo-emergenza'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Rata Mutuo',
      slug: '/calcolatori/mutuo',
    },
    metaDescription:
      `Estinzione anticipata mutuo: conviene? Quando, come, gratuita per legge. Confronto matematico tra estinzione e investimento alternativo.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 18. FONDO COMUNE DI INVESTIMENTO
  // -------------------------------------------------------------------------
  {
    slug: 'fondo-comune-investimento',
    titolo: 'Fondo comune di investimento',
    categoria: 'investire',
    livello: 'base',
    fraseEssenziale:
      `Il fondo comune di investimento è uno strumento finanziario che raccoglie il denaro di molti risparmiatori per investirlo collettivamente in un portafoglio di azioni, obbligazioni o altri strumenti, gestito da una società di gestione professionale. Permette anche con piccole somme di accedere a una diversificazione che da soli sarebbe impossibile.`,
    esempioConcreto:
      `Laura vuole investire 5.000 euro in azioni globali ma non sa quali società comprare. Acquista quote di un fondo comune azionario globale che investe in 1.500 società diverse in tutto il mondo. Con i suoi 5.000 euro Laura partecipa proporzionalmente al patrimonio del fondo, beneficia della diversificazione massima e dell'esperienza dei gestori. In cambio paga una commissione annua (TER) che varia tipicamente dall'1,5% al 2,5% per i fondi attivi italiani. Su 5.000 euro investiti, una commissione del 2% significa 100 euro all'anno sottratti al rendimento.`,
    perchéTiRiguarda:
      `I fondi comuni sono lo strumento di investimento più diffuso in Italia: oltre 1.500 miliardi di euro sono investiti nei fondi italiani e oltre 600 miliardi in fondi esteri commercializzati nel paese. Ma sono anche uno degli strumenti più costosi sul mercato, e spesso sotto-performano rispetto a strumenti più semplici come gli ETF a parità di esposizione. Capire come funziona un fondo, quali sono i suoi costi reali e quando ha davvero senso preferirlo a un ETF è fondamentale per non finire intrappolati in prodotti che erodono silenziosamente il rendimento per decenni. Molti portafogli italiani contengono fondi attivi costosi quando ETF passivi equivalenti farebbero il lavoro a un quinto del costo.`,
    definizioneTecnica:
      `Un fondo comune di investimento è regolato in Italia dal Testo Unico della Finanza (TUF). È costituito da una società di gestione del risparmio (SGR) che raccoglie il patrimonio dei sottoscrittori e lo investe secondo le politiche dichiarate nel prospetto informativo. Si distinguono in: fondi aperti (sottoscrizione e rimborso possibili in qualsiasi momento, valutazione giornaliera del NAV), fondi chiusi (sottoscrizione solo all'inizio, rimborso solo a scadenza), fondi armonizzati UCITS (rispettano normativa europea, commercializzabili in tutta Europa). Per categoria di investimento si distinguono in azionari, obbligazionari, bilanciati, monetari, flessibili. La commissione totale annua è espressa nel TER (Total Expense Ratio).`,
    erroriComuni: [
      `Non leggere il TER prima di sottoscrivere e scoprire dopo anni di pagare commissioni elevate`,
      `Confondere il rendimento dichiarato (lordo, di periodi favorevoli) con il rendimento netto effettivo`,
      `Sottoscrivere fondi proposti dalla banca senza confrontarli con alternative ETF`,
      `Spostare denaro da un fondo all'altro frequentemente, generando costi di entrata/uscita inutili`,
      `Non controllare periodicamente la performance del fondo rispetto al benchmark di riferimento`,
    ],
    correlate: ['etf', 'gestione-attiva-vs-passiva', 'diversificazione', 'capital-gain'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Interesse Composto',
      slug: '/calcolatori/interesse-composto',
    },
    metaDescription:
      `Fondi comuni di investimento: cosa sono, come funzionano, costi nascosti (TER) e perché sono spesso meno efficienti degli ETF.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 19. FONDO EMERGENZA
  // -------------------------------------------------------------------------
  {
    slug: 'fondo-emergenza',
    titolo: 'Fondo emergenza',
    categoria: 'liquidita-conti',
    livello: 'base',
    fraseEssenziale:
      `Il fondo emergenza è una somma di denaro liquida e immediatamente disponibile, da usare solo per imprevisti significativi: perdita del lavoro, spese mediche urgenti, riparazioni domestiche o automobilistiche non rinviabili. La regola più diffusa è coprire 3-6 mesi di spese essenziali.`,
    esempioConcreto:
      `Marco e Giulia spendono mediamente 3.000 euro al mese per le spese essenziali (mutuo, bollette, spesa, scuola dei figli). Il loro fondo emergenza ideale è quindi tra 9.000 e 18.000 euro. Lo tengono su un conto deposito svincolabile, separato dal conto corrente quotidiano per non spenderlo per impulsi. Quando l'azienda di Marco annuncia una ristrutturazione, sanno di avere 6 mesi di tranquillità per cercare un nuovo lavoro senza dover svendere investimenti o accendere prestiti. Quel fondo non rende molto (forse 2-3% all'anno), ma è la base che permette al resto del patrimonio di poter rimanere investito anche in momenti difficili.`,
    perchéTiRiguarda:
      `Senza fondo emergenza, ogni imprevisto si trasforma in una piccola crisi finanziaria che ti costringe a prendere decisioni sub-ottimali: vendere investimenti nel momento sbagliato (quando i mercati sono in ribasso), accendere un prestito personale a tasso elevato (8-12%), chiedere aiuto a familiari, andare in scoperto sul conto corrente. Il fondo emergenza non è un investimento: è la fondazione che permette tutto il resto. Costruirlo è il primo passo concreto di qualsiasi pianificazione finanziaria seria, prima ancora di parlare di investimenti, fondi pensione o altri strumenti.`,
    definizioneTecnica:
      `Il fondo emergenza è una riserva di liquidità accessibile, dimensionata in base alle spese essenziali mensili dell'individuo o della famiglia. La dimensione raccomandata varia in funzione di stabilità del reddito (lavoratore dipendente vs autonomo), composizione del nucleo familiare (single vs famiglia con figli), patrimonio già costituito, presenza di altre forme di copertura (TFR maturato disponibile, copertura disoccupazione). Le forme tecniche tipiche sono: conto corrente (massima liquidità, rendimento nullo), conto deposito svincolabile (rendimento moderato, liquidità in 24-48 ore), fondi monetari (rendimento simile al conto deposito, liquidità immediata). Va tenuto rigorosamente separato dai capitali destinati agli investimenti di lungo periodo.`,
    erroriComuni: [
      `Iniziare a investire senza prima costituire un fondo emergenza adeguato`,
      `Tenere il fondo emergenza sul conto corrente quotidiano dove rischi di spenderlo per spese non emergenziali`,
      `Sovradimensionare il fondo (12+ mesi di spese) rinunciando a rendimenti significativi nel lungo periodo`,
      `Considerare la carta di credito come alternativa al fondo emergenza (i tassi sono proibitivi)`,
      `Non rifornire il fondo dopo averlo utilizzato, lasciandolo inadeguato per la prossima emergenza`,
    ],
    correlate: ['conto-deposito', 'inflazione', 'asset-allocation'],
    metaDescription:
      `Fondo emergenza: quanto serve, dove tenerlo, perché è la fondazione di ogni piano finanziario. Esempi pratici e formule semplici.`,
    pubblicata: true,
  },

  // -------------------------------------------------------------------------
  // 20. GESTIONE ATTIVA VS PASSIVA
  // -------------------------------------------------------------------------
  {
    slug: 'gestione-attiva-vs-passiva',
    titolo: 'Gestione attiva vs passiva',
    categoria: 'investire',
    livello: 'intermedio',
    fraseEssenziale:
      `La gestione attiva cerca di battere il mercato attraverso la selezione di singoli titoli o tempistiche di acquisto e vendita, applicando commissioni più alte. La gestione passiva si limita a replicare un indice di mercato (es. S&P 500), accettando il rendimento medio in cambio di costi minimi. Empiricamente, nel lungo periodo la gestione passiva batte quella attiva nella maggioranza dei casi.`,
    esempioConcreto:
      `Marco investe 10.000 euro in un fondo azionario attivo italiano con TER del 2,2% annuo. Luca investe gli stessi 10.000 euro in un ETF passivo che replica lo stesso mercato con TER dello 0,15% annuo. Dopo 30 anni, ipotizzando lo stesso rendimento lordo del 7% annuo, Marco si ritrova con circa 41.000 euro, Luca con circa 73.000 euro. La differenza di 32.000 euro non deriva da scelte di investimento migliori, ma esclusivamente dal divario di costi che si accumula attraverso l'interesse composto. E questo nell'ipotesi che il fondo attivo replichi il mercato: dati storici mostrano che la maggior parte dei fondi attivi sotto-performa il proprio benchmark al netto dei costi.`,
    perchéTiRiguarda:
      `La distinzione tra gestione attiva e passiva è una delle più importanti del mondo degli investimenti, ma in Italia è ancora poco compresa. Lo studio annuale SPIVA (S&P Indices Versus Active) dimostra che a 10 anni il 90% dei fondi azionari attivi italiani sotto-performa il proprio benchmark di riferimento. Questo non significa che la gestione attiva sia sempre sbagliata, ma significa che nella maggior parte dei casi un investitore italiano paga commissioni alte per un risultato peggiore del semplice ETF passivo. Capire questa dinamica è essenziale per costruire un portafoglio fiscalmente ed economicamente efficiente.`,
    definizioneTecnica:
      `La gestione attiva si basa sul tentativo di generare alpha (rendimento aggiuntivo rispetto al benchmark) tramite security selection (scelta dei titoli), market timing (tempistica di acquisto/vendita), asset allocation tattica. Comporta costi più alti (TER tipico 1,5-2,5%) per remunerare il team di analisti e gestori. La gestione passiva o indicizzata replica meccanicamente la composizione di un indice di riferimento (S&P 500, MSCI World, FTSE MIB), accettando per definizione il rendimento medio del mercato e azzerando i costi di gestione attiva. Il TER tipico di un ETF passivo è 0,05-0,30%. Esistono forme intermedie: smart beta (regole sistematiche non discrezionali), gestione fattoriale (esposizione a fattori di rischio specifici come value, momentum, quality).`,
    erroriComuni: [
      `Scegliere il fondo attivo guardando solo le performance passate (che non si ripeteranno con la stessa probabilità)`,
      `Sottostimare l'impatto di commissioni dell'1-2% all'anno nel lungo periodo`,
      `Pensare che 'il mio gestore' sia diverso e batterà il mercato (statisticamente, non lo farà)`,
      `Confondere la gestione attiva di alta qualità (rara, costosa, accessibile a pochi) con la gestione attiva mainstream venduta dalle banche`,
      `Mescolare in portafoglio molti fondi attivi diversi pensando di 'diversificare', quando in realtà si moltiplicano solo i costi`,
    ],
    correlate: ['etf', 'fondo-comune-investimento', 'diversificazione', 'asset-allocation'],
    calcolatoreCorrelato: {
      titolo: 'Calcolatore Interesse Composto',
      slug: '/calcolatori/interesse-composto',
    },
    metaDescription:
      `Gestione attiva vs passiva degli investimenti: cosa cambia in 30 anni, dati SPIVA, perché conviene quasi sempre la passiva.`,
    pubblicata: true,
  },
];

// -------------------- HELPERS --------------------

/** Tutte le voci con `pubblicata: true`. */
export function getVociPubblicate(): VoceGlossario[] {
  return voci.filter((v) => v.pubblicata);
}

/** Voce singola per slug (solo se pubblicata). */
export function getVoceBySlug(slug: string): VoceGlossario | undefined {
  return voci.find((v) => v.slug === slug && v.pubblicata);
}

/** Ordinamento alfabetico per titolo (Intl, locale italiano). */
const collator = new Intl.Collator('it', { sensitivity: 'base' });
export function getVociAlfabetiche(): VoceGlossario[] {
  return getVociPubblicate().slice().sort((a, b) => collator.compare(a.titolo, b.titolo));
}

/** Voci raggruppate per categoria, mantenendo l'ordine di CATEGORIE. */
export function getVociByCategoria(): Array<{ categoria: Categoria; voci: VoceGlossario[] }> {
  const pub = getVociPubblicate();
  const result: Array<{ categoria: Categoria; voci: VoceGlossario[] }> = [];
  for (const cat of Object.keys(CATEGORIE) as Categoria[]) {
    const list = pub
      .filter((v) => v.categoria === cat)
      .sort((a, b) => collator.compare(a.titolo, b.titolo));
    if (list.length > 0) result.push({ categoria: cat, voci: list });
  }
  return result;
}

/** Voci raggruppate per livello, ordine: base → intermedio → avanzato. */
export function getVociByLivello(): Array<{ livello: Livello; voci: VoceGlossario[] }> {
  const pub = getVociPubblicate();
  const result: Array<{ livello: Livello; voci: VoceGlossario[] }> = [];
  for (const liv of ['base', 'intermedio', 'avanzato'] as Livello[]) {
    const list = pub
      .filter((v) => v.livello === liv)
      .sort((a, b) => collator.compare(a.titolo, b.titolo));
    if (list.length > 0) result.push({ livello: liv, voci: list });
  }
  return result;
}

/** Voci raggruppate per lettera iniziale (vista alfabetica con ancore). */
export function getVociPerLettera(): Array<{ lettera: string; voci: VoceGlossario[] }> {
  const ordinate = getVociAlfabetiche();
  const map = new Map<string, VoceGlossario[]>();
  for (const v of ordinate) {
    const lettera = v.titolo.charAt(0).toUpperCase();
    const arr = map.get(lettera) ?? [];
    arr.push(v);
    map.set(lettera, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([lettera, voci]) => ({ lettera, voci }));
}

/** Voce precedente / successiva in ordine alfabetico. */
export function getNeighbors(slug: string): { prev?: VoceGlossario; next?: VoceGlossario } {
  const ordinate = getVociAlfabetiche();
  const idx = ordinate.findIndex((v) => v.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ordinate[idx - 1] : undefined,
    next: idx < ordinate.length - 1 ? ordinate[idx + 1] : undefined,
  };
}

/** Le voci correlate effettivamente esistenti e pubblicate. */
export function getCorrelate(slug: string): VoceGlossario[] {
  const voce = getVoceBySlug(slug);
  if (!voce) return [];
  return voce.correlate
    .map((s) => getVoceBySlug(s))
    .filter((v): v is VoceGlossario => v !== undefined);
}
