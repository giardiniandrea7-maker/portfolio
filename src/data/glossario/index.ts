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
  | 'capire-economia';

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
