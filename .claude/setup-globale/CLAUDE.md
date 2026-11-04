# Istruzioni Globali - Claude Code

<!-- Il timestamp di allineamento vive in ~/.claude/manifest.json, non più in questo file.
     Lo Step 0 del workflow lo legge da lì via JSON parse. -->

## Inizializzazione Workspace

Quando l'utente chiede di **inizializzare un nuovo workspace**, creare la seguente struttura e applicare le regole descritte sotto.

### Workspace con contenuti preesistenti
Quando si inizializza una workspace che contiene gia file e cartelle:

1. **File e cartelle generici:** Claude opera **SOLO** dentro `.claude/`. **NON** deve toccare, modificare, o inizializzare come sotto-progetto nessuna directory o file preesistente. I sotto-progetti vengono creati **SOLO** su richiesta esplicita dell'utente, specificando quale directory inizializzare.

2. **Configurazione Claude preesistente:** Se la workspace ha gia un `CLAUDE.md` al root o una cartella `.claude/` parziale/non conforme alla struttura standard, Claude deve:
   - Leggere tutti i file di configurazione Claude esistenti (CLAUDE.md, file dentro `.claude/`, ecc.)
   - Classificare il contenuto trovato (regole operative, memoria, contesto, convenzioni)
   - Redistribuire ogni informazione nei file della struttura standard prevista sopra (`.claude/memories/MEMORY.md`, `.claude/rules/workspace-conventions.md`, `.claude_interactions/context.md`, ecc.)
   - Spostare/rinominare i file esistenti nelle posizioni corrette
   - **Verificare completezza:** Prima di eliminare qualsiasi vecchio file, confrontare il suo contenuto con i nuovi file e confermare che ogni informazione e stata redistribuita senza perdite
   - **Eliminare i vecchi file** solo dopo la verifica di completezza
   - Al termine, la workspace deve contenere **solo** la struttura `.claude/` prevista, senza residui della vecchia configurazione

3. **Sotto-progetti gia registrati:** Se la configurazione preesistente contiene file di memoria dedicati a sotto-progetti (es. `memory-<nome>.md` o equivalenti), quei sotto-progetti devono essere considerati **gia inizializzati dall'utente**. Per ciascuno, verificare e completare TUTTI i passi di inizializzazione previsti dalla sezione "Regole Sotto-Progetti".

### Struttura da creare

```
<root-workspace>/
├── .claude_interactions/
│   ├── context.md              # Contesto workspace (compilato dall'utente, sola lettura per Claude)
│   ├── project.md              # Descrizione concettuale del progetto (gestito da Claude)
│   ├── reports/                # Report testuali delle task
│   └── documents/              # Archivio documenti — leggere SOLO su richiesta esplicita dell'utente
└── .claude/
    ├── CLAUDE.md                # Guida per Claude Code (template specifico workspace)
    ├── agents/                  # Definizioni di agenti specializzati
    ├── skills/                  # Skill personalizzate di workspace
    ├── tasks/                   # Task attive (documenti checklist)
    ├── plans/                   # Piani temporanei (plan mode)
    ├── rules/
    │   ├── workspace-conventions.md  # Convenzioni del workspace
    │   └── rules-<nome>.md           # Regole dedicate per sotto-progetto
    └── memories/
        ├── MEMORY.md            # Memoria generale (sommario task)
        └── memory-<nome>.md     # Memorie dedicate per sotto-progetto
```

### Contenuto Standard di `.claude_interactions/`

Ogni workspace e ogni sotto-progetto inizializzato DEVE contenere la cartella `.claude_interactions/` con:
- **`.claude_interactions/context.md`** — (opzionale per sotto-progetti, obbligatorio per workspace root) Contesto breve scritto dall'utente. Claude lo legge a inizio task ma **NON lo modifica mai**. Per i sotto-progetti non viene creato automaticamente all'inizializzazione — l'utente lo crea quando lo ritiene utile.
- **`.claude_interactions/project.md`** — Descrizione concettuale del progetto, aggiornata da Claude su richiesta dell'utente (vedi sezione "File: `project.md`").
- **`.claude_interactions/reports/`** — Report testuali delle task.
- **`.claude_interactions/documents/`** — Archivio documenti dell'utente. Claude **NON deve leggere** il contenuto di questa cartella, **salvo richiesta esplicita dell'utente**. Senza richiesta esplicita, la cartella è off-limits. Eccezione aggiuntiva: la creazione di note vuote (vedi sezione "Inizializzazione Note"). L'utente ci archivia file generati o documenti che non rientrano piu nel contesto attivo.

All'inizializzazione di una workspace o di un sotto-progetto, verificare **sempre** che `.claude_interactions/`, il file `project.md` e le due sottocartelle (`reports/`, `documents/`) esistano e crearli se mancanti. Il file `context.md` viene creato automaticamente solo per la workspace root (con intestazione e commento placeholder); per i sotto-progetti NON viene creato automaticamente.

### Inizializzazione Note

Quando l'utente chiede di inizializzare/creare una nota:
- Creare un file `.txt` **vuoto** nella sottocartella `Note/` dentro `.claude_interactions/documents/` dell'attivita indicata.
- Se la sottocartella `Note/` non esiste, crearla.
- Per un sotto-progetto: `<sotto-progetto>/.claude_interactions/documents/Note/MM_DD.txt`
- Per il workspace generale: `.claude_interactions/documents/Note/MM_DD.txt`
- Formato nome: `MM_DD.txt` dove MM = mese (due cifre), DD = giorno (due cifre). Es. 11 marzo → `03_11.txt`.
- Un solo file per giorno — non si creano duplicati.
- Eccezione aggiuntiva alla regola documents/: Claude può **creare** file qui, ma **NON deve leggere** i file esistenti (salvo richiesta esplicita dell'utente).

### File: `context.md`

**A livello workspace** (`.claude_interactions/context.md`):
- Creato con intestazione e commento placeholder all'inizializzazione del workspace.
- Compilato e gestito **esclusivamente dall'utente**.
- Contiene informazioni brevi e sommarie sul progetto complessivo del workspace.
- Claude lo legge **SEMPRE** all'inizio di ogni task, ma **NON lo modifica mai**.

**A livello sotto-progetto** (`<directory>/.claude_interactions/context.md`):
- File **opzionale** — NON creato automaticamente all'inizializzazione.
- L'utente lo crea quando vuole dare a Claude un contesto breve e generale sull'attivita.
- Compilato e gestito **esclusivamente dall'utente**.
- Claude lo legge a inizio task (se esiste) ma **NON lo modifica mai**.

### File: `project.md`

Ogni workspace e ogni sotto-progetto ha un file `project.md` dentro `.claude_interactions/`.

**Scopo:** descrizione concettuale e discorsiva del progetto. Chiunque deve poterlo leggere e capire: cos'e il progetto, cosa fa, come si e evoluto, quali decisioni sono state prese. **NON** contiene dettagli tecnici, path di file, riferimenti al codice, o log di operazioni.

**Gestione:**
- Claude lo legge all'inizio di ogni task (insieme a context.md e MEMORY.md).
- Claude lo aggiorna **solo** quando l'utente chiede di "aggiornare le memorie" — in quel momento, aggiorna sia i file di memoria (tecnici/operativi) sia project.md (concettuale).
- **Sempre una fotografia aggiornata:** a ogni aggiornamento il file viene **riscritto interamente** (non append). Claude rielabora tutto il contenuto: aggiunge le novita, modifica le parti che non riflettono piu lo stato attuale, elimina cio che e diventato obsoleto. Il risultato deve essere sempre un documento coerente, efficace e aggiornato — mai un accumulo cronologico con parti arretrate.
- **Lunghezza target:** conciso, idealmente 30-60 righe.

**Template:**

```markdown
# <Nome Progetto>

## Cos'e
<Cosa e il progetto, il suo scopo, a chi si rivolge>

## Evoluzione
<Come si e evoluto il progetto, milestone concettuali, decisioni importanti>

## Stato Attuale
<Dove si trova ora il progetto, cosa e attivo, prossimi passi concettuali>

## Decisioni Chiave
<Decisioni non-tecniche che hanno dato forma al progetto>
```

**Differenza con i file di memoria:**
- `project.md` = visione concettuale, leggibile da chiunque, nessun dettaglio tecnico
- `memory-<nome>.md` / `MEMORY.md` = log operativo-tecnico di Claude: task svolte, file modificati, decisioni tecniche, comandi eseguiti

### File: `.claude/memories/MEMORY.md`
- Memoria generale del workspace di **alto livello**, organizzata per giornate di lavoro (vedi sezione "Struttura Memoria per Giornate").
- Contiene in cima le **sezioni fisse** (Sotto-Progetti Attivi, Note Generali), poi le **entry giornaliere** in ordine dalla più recente alla più vecchia, e infine il blocco `## Storico pre-daily` (archivio pre-migrazione, letto solo in scan mode su richiesta).
- All'inizio di ogni task viene caricata solo la **finestra recente** (sezioni fisse + ultimi 2 giorni, cap 150 righe). Il dettaglio storico si recupera via scan mode sulle keyword/riassunto delle giornate o tramite lettura della memoria-task se la task ha cartella associata.
- **Granularita**: solo header giornaliero macro + annotazioni ciclo vita task inline + lavoro ad-hoc. Nessun sub-heading `#### <slug>` con dettaglio operativo — quel dettaglio vive in `memory-<nome>.md` (medio) e nella memoria-task (completo).

### Sistema Task

La cartella `.claude/tasks/` ospita documenti di tracking per le task. Una task viene inizializzata **solo su richiesta esplicita dell'utente** (es. "inizializziamo una task").

**Organizzazione per attivita:**
- `.claude/tasks/` contiene un file per ogni attivita (sotto-progetto o workspace).
- Il file prende il nome dell'attivita: `<nome-attivita>.md` (es. `progetto_alpha.md`).
- Per task a livello workspace generale: `workspace.md`.
- Il file viene creato alla prima task inizializzata per quell'attivita.

**Piu task per file:** ogni file puo contenere piu task attive contemporaneamente.

**Contenuto di ogni task** (SOLO questo, niente altro):
- Titolo/obiettivo della task
- **Stato della task**: `[ ]` attiva, `[x]` completata
- **Slug** della task (riga `**slug**: \`<slug>\`` sotto l'header) — identificatore stabile kebab-case 2-5 parole, usato per collegare la task alle entry memoria via scan mode
- Checklist numerata dei punti necessari per completarla
- Stato di ogni punto: `[ ]` da fare, `[~]` in corso, `[x]` completato

**Slug della task:** ogni task ha uno slug in kebab-case, 2-5 parole, lowercase, senza accenti. Lo slug è stabile per tutta la vita della task e rimane nelle entry memoria passate come riferimento immutabile anche dopo la chiusura.

**Inizializzazione task:** quando l'utente chiede di inizializzare una task (fornendo titolo e attivita di riferimento), la **prima azione in assoluto** e scrivere la task nel file `.claude/tasks/<attivita>.md` con il titolo fornito, uno **slug proposto** (Claude lo propone all'utente per eventuale correzione prima di scriverlo) e la checklist vuota. Contestualmente Claude propone anche il **nome della sottocartella dedicata** in `<attivita>/.claude_interactions/reports/task/` (default = slug della task, personalizzabile dall'utente). Una volta confermati slug e nome cartella, Claude: (a) crea la sottocartella `<attivita>/.claude_interactions/reports/task/<nome>/` se non esiste (la sotto-struttura `task/` raccoglie tutte le cartelle task — vedi "Report di Task"), (b) scrive il campo `**folder**: \`<path-relativo-alla-root-attivita>\`` nell'header del file task subito sotto lo slug, (c) crea il file della **memoria-task** dentro la cartella, nominato come la cartella sostituendo `-` con `_` con un **punto iniziale** (es. cartella `improvement-workflow-x/` → file `.improvement_workflow_x.md`), con il template iniziale (vedi sezione "Memoria-Task"). Solo dopo si procede a pianificare la task, definire la checklist e svolgere il lavoro.

**Flessibilita della checklist:** la checklist puo variare durante lo svolgimento della task. Punti possono essere aggiunti, rimossi o riformulati.

**Avanzamento:** Claude aggiorna lo stato dei checkpoint man mano che vengono completati. L'utente conferma il completamento di ogni punto.

**Chiusura task:** quando tutti i punti della checklist sono completati, Claude **chiede conferma esplicita all'utente**. Passi:
1. La checklist viene eliminata dal file.
2. Resta solo una riga: `**Task: <titolo> (slug: \`<slug>\`) — Completata**`. Lo slug resta per tracciabilità storica. Il campo `**folder**:` viene rimosso dall'header.
3. **Archiviazione cartella task:** se la cartella `<attivita>/.claude_interactions/reports/task/<nome>/` esiste ed e' non-vuota, viene **spostata** in `<attivita>/.claude_interactions/documents/task/<nome>/` (stesso nome, sempre dentro la sotto-struttura `task/`). Se e' vuota, viene **eliminata** invece che spostata. Il file memoria-task dentro la cartella segue lo spostamento e nel suo header passa a `**stato**: chiusa` con `**chiusa**: YYYY-MM-DD` aggiunta.
4. Il resoconto sommario viene scritto nella memoria appropriata (vedi sezione "Struttura Memoria per Giornate").
5. **Commit automatico:** verificare se la directory dell'attivita e un repository Git (`git rev-parse --is-inside-work-tree`). Se si, eseguire automaticamente `git add -A`, commit con messaggio uguale al titolo della task, e `git push`. Non chiedere conferma. Questo vale per la task completa, **NON** per i singoli checkpoint.

**Il file dell'attivita non viene mai eliminato**: resta con lo storico delle task completate.

**Template task nel file:**

```markdown
# Task - <Nome Attivita>

**Task: <titolo task precedente> (slug: `<slug-precedente>`) — Completata**

---

## [ ] Task: <titolo task attiva>
**slug**: `<slug-task-attiva>`
**folder**: `.claude_interactions/reports/task/<nome-cartella>/`

### Obiettivo
<descrizione concisa>

### Checklist
- [ ] 1. Primo punto
- [ ] 2. Secondo punto
- [ ] 3. Terzo punto
```

### Task Iterative

Una **task iterativa** e una task ciclica associata a un'attivita (workspace o sotto-progetto). A differenza delle task normali, non si "completa" — viene eseguita ripetutamente secondo una cadenza definita nelle rules.

**Struttura su 3 file:**

1. **File task** (`.claude/tasks/<attivita>.md`) — La task e registrata come le altre, ma con marker `[iterativa]` invece di `[ ]`. Non ha checklist fissa — la checklist viene popolata ad ogni esecuzione e poi ripulita. Storico delle esecuzioni annotato brevemente.

2. **File rules** (`.claude/rules/rules-<attivita>.md` o `workspace-conventions.md` per task a livello workspace) — Contiene le specifiche operative della task iterativa: cadenza, file di riferimento, trigger, condizioni particolari.

3. **File skill** (`.claude/skills/<nome-skill>.md` o `.claude/skills/<nome-skill>/SKILL.md`) — Contiene il **workflow completo** della task: tutti i passi da eseguire, in che ordine, quali file leggere, cosa produrre.

**Workflow di esecuzione:**
1. L'utente invoca la task (o Claude la propone se scaduta, in base alle rules).
2. Claude legge la skill per il workflow.
3. Claude legge le rules per le specifiche operative.
4. Esegue il workflow.
5. Aggiorna il file task con breve annotazione dell'esecuzione nello storico.
6. Aggiorna memoria se necessario.

**Inizializzazione task iterativa (su richiesta utente):**
1. Scrivere la task nel file `.claude/tasks/<attivita>.md` con marker `[iterativa]` e slug proposto.
2. Aggiungere le specifiche operative nel file rules appropriato.
3. Creare il file skill in `.claude/skills/`.

**Template task iterativa nel file task:**

```markdown
## [iterativa] Task: <titolo>
**slug**: `<slug-task-iterativa>`

### Obiettivo
<descrizione concisa>

### Skill di riferimento
`.claude/skills/<nome-skill>.md`

### Storico esecuzioni
- **YYYY-MM-DD** — Breve annotazione risultato
- **YYYY-MM-DD** — Breve annotazione risultato
```

La sezione `### Storico esecuzioni` resta per comodità cronologica, ma il **vero detail** di ciascun round vive in memoria tramite lo slug.

**Chiusura:** una task iterativa non si chiude come le task normali. Viene **archiviata** solo su richiesta esplicita dell'utente. In quel caso, il marker diventa `[iterativa-archiviata]` e resta nel file come storico.

### Gestione Piani (Plan Mode)

La cartella `.claude/plans/` ospita temporaneamente i file dei piani generati durante la plan mode.

**Salvataggio automatico nel progetto:** Un hook su `PreToolUse (ExitPlanMode)` esegue lo script `~/.claude/scripts/copy-plan.ps1` (o `.sh` su macOS) che copia automaticamente i piani da `~/.claude/plans/` alla `.claude/plans/` del progetto corrente prima che l'utente debba revisionarli, e poi suona la notifica. Non serve alcuna azione da parte di Claude — la copia e gestita dall'hook.

- Il file locale del piano resta disponibile finche il piano non viene **approvato ed eseguito**, oppure **cancellato** dall'utente.
- Al termine (piano eseguito o cancellato), il file locale viene **eliminato** da `.claude/plans/` del progetto.
- La cartella deve restare vuota tra una sessione di plan mode e l'altra.

### Regole Sotto-Progetti
- Un sotto-progetto viene creato **solo su richiesta esplicita dell'utente**.
- I nomi delle directory usano **sempre snake_case**.
- **Sotto-progetti annidati**: un sotto-progetto puo contenere altri sotto-progetti al suo interno, sempre su richiesta esplicita dell'utente. La struttura di inizializzazione e identica a qualsiasi livello di annidamento.
- Passi di inizializzazione sotto-progetto:
  1. Creare la directory se non esiste.
  2. Creare `<directory>/.claude_interactions/project.md` con template vuoto.
  3. Creare `<directory>/.claude_interactions/reports/` per i report testuali delle task.
  4. Creare `<directory>/.claude_interactions/documents/` per l'archivio documenti.
  5. Creare `.claude/memories/memory-<nome>.md` per la memoria dedicata.
  6. Creare `.claude/rules/rules-<nome>.md` per le regole dedicate del sotto-progetto.
  7. Registrarlo in `.claude/memories/MEMORY.md` nella sezione "Sotto-Progetti Attivi".
- I sotto-progetti **non sono isolati**: possono avere correlazioni e dipendenze reciproche.
- **Ereditarietà rules per sotto-progetti annidati**: quando una task riguarda un sotto-progetto annidato, Claude deve leggere **tutta la catena di rules** dal workspace fino al sotto-progetto target. Esempio: per una task su `<sotto-progetto>/<sub-modulo>/`, leggere in ordine: `workspace-conventions.md` → `rules-<sotto-progetto>.md` → `rules-<sub-modulo>.md`. Questo garantisce che le convenzioni del parent non vengano ignorate.

### Livelli di Contesto e Memoria
1. **Contesto Workspace** (`.claude_interactions/context.md`): compilato dall'utente, sola lettura. Identita del workspace.
2. **Contesto Sotto-Progetto** (`<dir>/.claude_interactions/context.md`): opzionale, compilato dall'utente, sola lettura. Contesto breve dell'attivita.
3. **Descrizione Progetto** (`.claude_interactions/project.md`): gestito da Claude, concettuale/discorsivo. Aggiornato su richiesta insieme alle memorie.
4. **Memoria Workspace — alto livello** (`.claude/memories/MEMORY.md`): mappa di navigazione, header giornaliero macro + annotazioni ciclo vita task + lavoro ad-hoc. Niente dettaglio operativo per task.
5. **Memoria Sotto-Progetto — dettaglio medio** (`.claude/memories/memory-<nome>.md`): sub-heading `#### <slug>` per task del sotto-progetto, dettaglio medio (decisioni, aree, output). Aggiornata SOLO se la task riguarda quel sotto-progetto.
6. **Memoria-Task — dettaglio completo** (`<task-folder>/.<nome-cartella-con-underscore>.md`): file dedicato dentro la cartella della task (con **punto iniziale** nel nome per apparire in cima nel file viewer), dettaglio operativo granulare (file con path, comandi, decisioni, output, problemi). Una task = un file. Vedi sezione "Memoria-Task".

### Struttura Memoria per Giornate

I file di memoria — `MEMORY.md` (workspace), `memory-<nome>.md` (sotto-progetto), e la **memoria-task** per-cartella (vedi sezione "Memoria-Task") — **non hanno limite di righe** e **non vengono compattati**. Sono organizzati per **giornate di lavoro**: ogni giornata ha un header con riassunto e keyword, seguito dal dettaglio. Questo permette un recall selettivo del contesto senza perdere informazione storica.

**Cascata di granularita su 3 livelli** — per ogni task toccata in una sessione, il lavoro fatto viene distribuito a cascata sui tre file di memoria con livelli di dettaglio diversi:

| Livello | File | Granularita |
|---|---|---|
| **Workspace (alto livello)** | `MEMORY.md` | Header giornaliero (`Tasks`/`Keywords`/`Riassunto` macro) + annotazioni ciclo vita task + lavoro ad-hoc. **Nessun sub-heading `#### <slug>` con dettaglio operativo** — il workspace traccia "cosa e stato toccato" non "come". Funziona da mappa di navigazione verso le memorie piu specifiche. |
| **Sotto-progetto (dettaglio medio)** | `memory-<nome>.md` | Header giornaliero standard + `### Dettaglio` con sub-heading `#### <slug>` per ogni task del sotto-progetto toccata in giornata. Dentro `#### <slug>`: livello "ristrutturato il modulo X per supportare Y", "decisione presa su Z", "output prodotto W" — senza scendere a singoli file/comandi/path. Annotazioni ciclo vita restano qui. |
| **Task (dettaglio completo)** | `<task-folder>/.<nome>.md` (memoria-task, **punto iniziale**) | Header giornaliero focalizzato sulla task + `### Dettaglio` con il dettaglio operativo **completo**: file con path, comandi eseguiti, decisioni con motivazioni, problemi/risoluzioni, dipendenze tra cambiamenti. Niente sub-heading `#### <slug>` perche il file e gia scoped a una sola task. |

I trigger checkpoint ("aggiorna le memorie", saluti chiusura sessione) orchestrano automaticamente la scrittura su tutti e 3 i livelli con la granularita appropriata.

**Struttura di `MEMORY.md` (workspace, alto livello):**

```markdown
# Memoria — <Nome workspace>

## Sezioni fisse
<!-- Sotto-Progetti Attivi, Note Generali. -->

---

## YYYY-MM-DD
**Tasks**: <slug-task-1>, <slug-task-2>
**Keywords**: parola-chiave-1, parola-chiave-2, parola-chiave-3
**Riassunto**: 1-2 frasi macro che dicono cosa e stato toccato a livello di task/sotto-progetto.

### Dettaglio
- [task aperta] cartella dedicata: `<path>` (annotazioni ciclo vita, una riga per evento)
- [task chiusa] cartella archiviata in: `<path>`
- [cartella associata] `<path>`

#### (senza task)
- Lavoro ad-hoc non legato a task formali (se presente).

---

## Storico pre-daily
...
```

**Struttura di `memory-<nome>.md` (sotto-progetto, dettaglio medio):**

```markdown
# Memoria — <Nome sotto-progetto>

## Sezioni fisse
<!-- Descrizione breve, sotto-progetti annidati, ecc. -->

---

## YYYY-MM-DD
**Tasks**: <slug-task-1>, <slug-task-2>
**Keywords**: ...
**Riassunto**: 1-2 frasi sulla giornata in questo sotto-progetto.

### Dettaglio

#### <slug-task-1>
- Decisioni prese, aree/moduli toccati, output prodotti — livello medio, niente file singoli/comandi.

#### <slug-task-2>
- ...

#### (senza task)
- Lavoro ad-hoc nel sotto-progetto, se presente.

---

## Storico pre-daily
...
```

**Aggiornamento entry della giornata corrente:**
- Per ogni file di memoria interessato, prima di scrivere Claude **controlla se esiste già una entry `## YYYY-MM-DD`** per la data odierna.
- **Se esiste**: rielabora l'header (`**Tasks**`, `**Keywords**` e `**Riassunto**`) integrando anche il nuovo lavoro — l'header deve sempre riflettere *tutto* il lavoro della giornata — ed **estende** la sezione `### Dettaglio` con le nuove informazioni.
- **Se non esiste**: crea una nuova entry in cima, subito sopra l'entry del giorno precedente e sotto le sezioni fisse.

**Annotazioni ciclo di vita task:**

Le annotazioni `[task aperta]` / `[task chiusa]` / `[cartella associata]` vivono in `MEMORY.md` (sempre) e in `memory-<nome>.md` (se task di sotto-progetto). **NON** vivono nella memoria-task: il file memoria-task riflette intrinsecamente il ciclo vita tramite il proprio header.

**Caricamento selettivo del contesto (modalità di lettura):**

All'inizio di ogni task Claude carica **solo la finestra recente** della memoria:
1. Legge le sezioni fisse in cima al file.
2. Legge le entry degli **ultimi 2 giorni di lavoro** presenti nel file (gli ultimi 2 giorni in cui è stata scritta memoria, non le ultime 2 date calendario).
3. **Cap hard 150 righe per file**: se il totale supera 150 righe, Claude carica solo gli header (`## YYYY-MM-DD` + `**Keywords**` + `**Riassunto**`) senza `### Dettaglio`.
4. Le giornate più vecchie **non vengono mai lette in automatico**.

**Scan mode (per recupero contesto storico):**

**A) Scan mode semantica (per keyword/argomento)**
1. Estrae da ogni file memoria rilevante **solo gli header delle giornate** (`## YYYY-MM-DD`, `**Tasks**`, `**Keywords**`, `**Riassunto**`), senza i dettagli.
2. Confronta keyword e riassunti con l'intento della task.
3. Per ogni giornata con match, fa un secondo `Read` mirato al blocco `### Dettaglio` di quella giornata.

**B) Recupero contesto by task — primaria via memoria-task, secondaria via scan mode**

Quando serve ricostruire **tutto il lavoro svolto su una specifica task** (attiva o chiusa):

1. **Lettura diretta della memoria-task** (primaria): leggere il file task per recuperare lo slug e il campo `**folder**:`. Aprire il file memoria-task `<task-folder>/.<nome-cartella-con-underscore>.md`. Per task aperte vive in `reports/task/<nome>/`; per task chiuse vive in `documents/task/<nome>/`. Il file contiene **tutto** il dettaglio operativo cronologico della task.
2. **Scan mode by task — fallback**: quando la task non ha cartella associata, o per analisi cross-task: `Grep` dello slug sulla riga `**Tasks**:` di `MEMORY.md`/`memory-<nome>.md` → lista date → lettura mirata. Nelle memorie principali troverai pero solo dettaglio medio (sotto-progetto) o annotazioni ciclo vita (workspace) — non il dettaglio completo.

**Storico pre-daily:**
- Il blocco `## Storico pre-daily` (contenuto pre-migrazione alla struttura per giornate) **non viene mai caricato in automatico** né incluso nella scan mode standard.
- È consultabile solo su richiesta esplicita dell'utente.

**Niente compattamento:**
- Non esiste più soglia di righe. I file possono crescere indefinitamente.

**project.md:** non soggetto a questa struttura. A ogni aggiornamento viene riscritto per intero. Lunghezza target: 30-60 righe.

### Bootstrap Sessione (prima di tutto, al primo messaggio della sessione)

**Questi due check girano sempre, indipendentemente dal tipo di primo messaggio** (task, saluto, domanda, comando, sync esplicito, qualsiasi cosa). Eseguirli **prima** di rispondere al contenuto del messaggio. Sono operazioni veloci: leggere 2 JSON e confrontare timestamp è quasi gratuito.

**B0. Check allineamento workspace ↔ regole globali**: leggere `~/.claude/manifest.json::alignment-rules-updated` (= `T_master`) e `<workspace>/.claude/setup-globale/manifest.json::alignment-rules-updated` (= `T_mirror`, se la cartella esiste). Se `T_master != T_mirror`, **oppure** la workspace ha ancora la struttura vecchia (`.claude/SETUP-GLOBALE.md` file invece della cartella `setup-globale/`), **oppure** `workspace-conventions.md` contiene ancora la sezione "Regole Globali (auto-allineate)", invocare la **skill `allineamento`** (`~/.claude/skills/allineamento/SKILL.md`). La skill gestisce automaticamente il routing nei 4 casi: A) migrazione struttura vecchia, B) allineamento diretto master→mirror, C) sync inversa mirror→master, D) skip. Se i timestamp coincidono e la struttura è nuova, skip silenzioso. L'utente può anche triggerare manualmente la skill con frasi tipo "allinea la workspace alle regole globali" / "fai sync inversa".

**B1. Check sincronizzazione repo (lazy, on-demand)**: nessun hook automatico, nessuno script esterno. Claude esegue il sync **solo** quando esiste un trigger esplicito (vedi sezione "Sincronizzazione repo — trigger e comandi"): saluto di apertura sessione, skill `/sync`, trigger naturali, oppure fetch mirato prima di un commit/push/pull su un repo specifico. Skip silenzioso in tutti gli altri casi.

**Ordine di esecuzione al primo messaggio**:
1. Esegui B0 (sempre, anche se costa zero quando già allineato).
2. Esegui B1 se il messaggio contiene un trigger di sync (saluto, "/sync", frase naturale).
3. Procedi con la gestione del contenuto del messaggio (task, risposta, ecc.).

Nei messaggi successivi della stessa sessione, B0 può essere skippato (l'allineamento è già stato verificato e applicato). Lo si ri-esegue solo se l'utente lo chiede esplicitamente o se sospetti che il manifest sia cambiato (es. dopo un `git pull` esplicito che potrebbe aver toccato `setup-globale/manifest.json`).

### Workflow per Ogni Task
1. Leggere `.claude_interactions/context.md` e `.claude_interactions/project.md` (workspace root). Il context.md e sola lettura — NON modificare.
2. Leggere `.claude/memories/MEMORY.md` applicando la **finestra recente** (sezioni fisse + ultimi 2 giorni di lavoro, cap 150 righe). Per contesto più vecchio usare **scan mode**.
3. Se la task riguarda un sotto-progetto, leggere anche `.claude/memories/memory-<nome>.md` con la stessa strategia.
4. Se la task riguarda un sotto-progetto, leggere `<directory>/.claude_interactions/context.md` (se esiste) e `<directory>/.claude_interactions/project.md`. **NON leggere `<directory>/.claude_interactions/documents/`** salvo richiesta esplicita.
4b. Se la task riguarda un sotto-progetto, leggere `.claude/rules/rules-<nome>.md`. Per sotto-progetti **annidati**, leggere tutta la catena di rules dal parent fino al target.
4c. Se la task corrente ha gia una cartella associata (campo `**folder**:` valorizzato nel file task) e la memoria-task esiste, **leggere la finestra recente della memoria-task** (`<task-folder>/.<nome-cartella-con-underscore>.md`, con **punto iniziale** nel nome): header + ultimi 2 giorni di entry, cap 150 righe. La memoria-task e la fonte primaria del contesto storico della task — non serve scan mode by task se il file esiste.
5. Eseguire la task.
6. Aggiornare `.claude/memories/MEMORY.md` con il **dettaglio di alto livello**: se esiste già una entry `## YYYY-MM-DD` per la data odierna, rielaborarne l'header (`**Tasks**` + `**Keywords**` + `**Riassunto**` macro integrando il nuovo lavoro) ed estendere il `### Dettaglio` con eventuali annotazioni ciclo vita inline (`[task aperta]`/`[task chiusa]`/`[cartella associata]`) e con il sub-heading `#### (senza task)` per lavoro ad-hoc. **Niente sub-heading `#### <slug>` con dettaglio operativo** — quel dettaglio vive nella memoria-task. Se la entry non esiste, crearne una nuova in cima sotto le sezioni fisse.
7. Se la task riguarda un sotto-progetto, aggiornare `.claude/memories/memory-<nome>.md` con il **dettaglio medio**: stessa logica giornaliera (`**Tasks**:` + sub-heading `#### <slug>` per ogni task del sotto-progetto toccata in giornata). Dentro `#### <slug>`: decisioni prese, aree/moduli toccati, output prodotti — niente file singoli/comandi/path.
7b. Se applicabile, aggiornare `<directory>/.claude_interactions/project.md` (concettuale — solo su richiesta dell'utente di aggiornare le memorie).
7c. **Aggiornare la memoria-task** (`<task-folder>/.<nome-cartella-con-underscore>.md`, con **punto iniziale** nel nome) con il **dettaglio operativo completo** della sessione: file con path, comandi eseguiti, decisioni con motivazioni, output, problemi/risoluzioni, dipendenze tra cambiamenti. Stessa logica giornaliera delle altre memorie, ma senza sub-heading `#### <slug>` perche il file e gia scoped.

### Comando "Aggiorna le Memorie" — Checkpoint workspace

Quando l'utente chiede di aggiornare le memorie (frasi tipo "aggiorna le memorie", "aggiorniamo le memorie", "salva il lavoro"), oppure invia un **saluto di chiusura sessione** ("buonanotte", "buona notte", "arrivederci", "a domani", "ci vediamo", "good night", "bye" o equivalenti), Claude NON si limita ad aggiornare i file di memoria ma esegue un **checkpoint completo della workspace**:

1. **Distribuzione a cascata su 3 livelli** — per ogni task toccata nella sessione, Claude orchestra l'aggiornamento di **tutti e tre** i file di memoria con la granularita appropriata:
   - **Memoria-task** (`<task-folder>/.<nome>.md`): dettaglio operativo completo della sessione (file, comandi, decisioni, output, problemi).
   - **`memory-<nome>.md`** (se task di sotto-progetto): dettaglio medio sotto `#### <slug>` (decisioni, aree toccate, output) + annotazioni ciclo vita.
   - **`MEMORY.md`** (workspace): annotazione di alto livello — slug nella riga `**Tasks**:`, riassunto macro, annotazioni ciclo vita inline per task workspace-level, eventuale `#### (senza task)` per lavoro ad-hoc.
   Inoltre aggiorna `project.md` (concettuale, riscritto interamente) se richiesto.
2. Scansiona tutti i repo Git della workspace (root + sotto-repo). Usa `find . -maxdepth 4 -name .git -type d` (bash) o equivalente.
3. Per ogni repo con modifiche (tracked o untracked):
   a. Legge il diff (`git status` + `git diff`).
   b. Genera un messaggio di commit descrittivo specifico per quel repo (non generico, basato sul diff).
   c. Esegue `git add -A` + `git commit` + `git push`.
   d. Se il push richiede force, non forza — avvisa l'utente.
4. Riporta elenco finale dei commit creati (repo + hash breve + titolo).

Questo comportamento vale per workspace multi-repo. Per workspace mono-repo il comando semplicemente committa e pusha il repo unico.

**Casi di esclusione** (repo da saltare automaticamente):
- Repo con solo file gitignored (es. solo `__pycache__/`): skip silenzioso.
- Repo senza upstream configurato: commit locale, no push, avviso all'utente.

Il comando resta esplicito — Claude NON esegue questo checkpoint automaticamente dopo ogni task. Le uniche eccezioni sono: (a) la richiesta esplicita "aggiorna le memorie" o equivalenti, (b) un **saluto di chiusura sessione** che Claude interpreta come segnale di fine giornata.

### Report di Task

Ogni task ha una **cartella dedicata** dentro `<attivita>/.claude_interactions/reports/task/` dove vengono salvati tutti i documenti che la task produce. La sotto-struttura `task/` raccoglie esclusivamente le cartelle associate a task formali (campo `**folder**:` valorizzato), separandole dai documenti singoli sparsi e dalle eventuali cartelle tematiche non-task. La cartella vive per tutta la durata della task e viene archiviata in `documents/task/<nome>/` alla chiusura.

#### Creazione della cartella (all'inizializzazione task)
- **Path di default**: `<attivita>/.claude_interactions/reports/task/<slug-task>/`. Il segmento `task/` e sempre presente.
- **Nome di default**: slug della task (kebab-case).
- **Personalizzabile**: l'utente puo' sovrascrivere il nome proposto al momento dell'inizializzazione.
- **Path scritto nel file task**: campo `**folder**: \`<path-relativo-alla-root-attivita>\`` nell'header. Questa e' la **source of truth** dell'associazione task ↔ cartella.
- **Memoria-task**: contestualmente alla creazione della cartella, Claude crea il file della memoria-task dentro la cartella stessa.
- **Subfolder `task/` on-demand**: se la sotto-struttura `task/` non esiste ancora in `reports/` o `documents/` per quel sotto-progetto, viene creata alla prima task.

#### Cosa va nella cartella (documenti coperti)
Tutti i **DOCUMENTI** prodotti dalla task, finali e intermedi (salvo richiesta contraria dell'utente). Estensioni coperte:
- `.md` (report, analisi, documentazione prodotta)
- `.xlsx`, `.xls` (fogli di calcolo)
- `.pptx`, `.ppt` (presentazioni)
- `.pdf` (documenti finali)
- `.docx`, `.doc` (documenti Word)
- `.txt`, `.csv` (dati testuali, tabelle)
- `.yaml`, `.yml` (solo se sono report o output, NON se sono configurazioni di codice)
- `.png`, `.jpg`, `.svg` (solo se sono grafici/immagini prodotti come parte di un report)

**Regola sui report degli agenti**: salvare SOLO i report finali degli agenti, NON i report intermedi.

#### Cosa NON va nella cartella (file esclusi)
La convenzione **non si applica** ai file di codice e di lavoro tecnico:
- File di codice sorgente: `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.c`, `.cpp`, `.h`, `.java`, `.rs`, `.go`, `.rb`, `.php`, `.sh`, `.ps1`, `.bat`, ecc.
- File di configurazione del codice (anche se in formato `.yaml`/`.json`).
- File di dati grezzi in input a script o pipeline.
- Notebook Jupyter (`.ipynb`) — sono codice.

Per questi file Claude chiede sempre esplicitamente all'utente dove salvarli.

#### Gestione dell'ambiguita'
Se Claude sta per salvare un documento e **non e' certo a quale task appartiene** — o se potrebbe non appartenere a nessuna task — **DEVE chiedere esplicitamente all'utente** in quale cartella salvarlo.

#### Chiusura della task
- Se la cartella `<attivita>/.claude_interactions/reports/task/<nome>/` esiste ed e' **non-vuota**: viene **spostata** in `<attivita>/.claude_interactions/documents/task/<nome>/`. Il file memoria-task dentro la cartella segue lo spostamento e nel suo header passa a `**stato**: chiusa` con `**chiusa**: YYYY-MM-DD` aggiunta.
- Se la cartella e' **vuota** (o non esiste): viene **eliminata**.
- Lo spostamento avviene PRIMA del commit automatico Git.
- L'annotazione di chiusura va in `MEMORY.md` (inline) e in `memory-<nome>.md` (nel `#### <slug>`).

#### Retrocompatibilita': associare cartelle/file esistenti
Comandi supportati:

1. **"Crea una task X e associala alla cartella `reports/<path>/` esistente"** → Claude crea la task con `**folder**` che punta alla cartella gia' esistente, senza spostare nulla.
2. **"Crea una task X e raggruppa questi file in una sottocartella dedicata"** → Claude crea `reports/task/<slug-o-nome>/`, sposta i file indicati, e apre la task con `**folder**` valorizzato.
3. **"Associa la cartella `reports/<path>/` alla task Y (gia' esistente)"** → Claude aggiorna il campo `**folder**:` della task Y, senza muovere nulla.

In tutti e tre i casi, Claude annota in memoria con la riga `- [cartella associata] \`<path>\``.

#### Cartelle "tematiche" non legate a task
La convenzione task ↔ cartella non esclude la presenza di altre sottocartelle in `reports/` o `documents/` non associate a nessuna task. Queste cartelle vivono **fuori dalla sotto-struttura `task/`** — `reports/task/` e `documents/task/` sono riservate esclusivamente alle cartelle associate a task formali.

### Memoria-Task

Ogni task con cartella dedicata ha un **file di memoria-task** dentro la propria cartella. Contiene il **dettaglio operativo completo** del lavoro fatto sulla task, organizzato per giornate. E la fonte primaria del contesto storico della task.

#### Posizione e nome del file
- **Path**: `<task-folder>/.<nome-cartella-con-underscore>.md`
- **Naming**: il nome del file deriva meccanicamente dal nome della cartella sostituendo `-` con `_`, con un **punto iniziale** che lo fa apparire in cima alla cartella nel file viewer. Esempi: cartella `improvement-workflow-x/` → file `.improvement_workflow_x.md`. Cartella `validazione_letteratura/` (gia in snake_case) → file `.validazione_letteratura.md`.

#### Quando viene creato
- **All'inizializzazione della task**: subito dopo la creazione della cartella, prima di pianificare la checklist. Il file viene creato con il template iniziale, senza entry giornaliere.
- **Backfill retroattivo**: per task gia attive prima dell'introduzione della regola, Claude crea il file vuoto al primo aggiornamento di memoria su quella task, oppure su richiesta esplicita dell'utente.

#### Template iniziale

```markdown
# Memoria Task — <titolo task>

**slug**: `<slug>`
**folder**: `<path-relativo-alla-root-attivita>`
**stato**: aperta
**aperta**: YYYY-MM-DD

---
```

#### Struttura giornaliera
Identica a `MEMORY.md` / `memory-<nome>.md`, **senza** sub-heading `#### <slug>` (il file e gia scoped a una sola task):

```markdown
## YYYY-MM-DD
**Keywords**: parola-1, parola-2, parola-3
**Riassunto**: 1-2 frasi su cosa e stato fatto sulla task in questa sessione.

### Dettaglio
- File modificati: `<path:line>` — motivo della modifica.
- Comando eseguito: `<comando>` — output sintetico, problemi.
- Decisione: `<scelta>` — alternative considerate, motivazione.
- Problema/risoluzione: `<problema>` — `<come e stato risolto>`.

---

## YYYY-MM-DD (giorno precedente)
...
```

#### Aggiornamento e caricamento
- **Aggiornamento**: stessa logica delle memorie principali — se la entry `## YYYY-MM-DD` esiste gia, rielaborare l'header e estendere `### Dettaglio`. Altrimenti creare una nuova entry in cima.
- **Caricamento**: header del file (slug/folder/stato/date) + ultimi 2 giorni di entry, cap 150 righe. Per task piccole il file e spesso leggibile per intero.
- **Nessun limite di righe, niente compattamento**.

#### Chiusura della task
Alla chiusura: il blocco frontmatter diventa `**stato**: chiusa` con `**chiusa**: YYYY-MM-DD` aggiunta. Il file segue la cartella in `documents/task/<nome>/`. Resta consultabile via scan mode come archivio storico.

#### Differenza rispetto alle memorie principali
- **Memoria-task**: dettaglio operativo completo. Granularita massima. Una task = un file.
- **`memory-<nome>.md`**: dettaglio medio (decisioni, aree, output) — multi-task organizzato per giornate.
- **`MEMORY.md`**: alto livello (eventi macro, annotazioni ciclo vita, navigazione) — workspace intera.

I tre livelli si completano: la memoria-task e il "come", `memory-<nome>.md` e il "cosa", `MEMORY.md` e il "quando/dove".

### Template CLAUDE.md di Progetto
Quando si inizializza il workspace, il file `.claude/CLAUDE.md` deve contenere solo informazioni specifiche del workspace (nome, descrizione, contesto). Usare un workspace di riferimento esistente per stile e struttura.

### Separazione Regole Globali e Locali

**Regola fondamentale**: le regole definite in questo file globale (`~/.claude/CLAUDE.md`) **NON devono MAI essere duplicate** nei file locali del progetto (`.claude/CLAUDE.md`, `.claude/rules/*.md`).

I file locali devono contenere **esclusivamente**:
- Informazioni specifiche del workspace (nome, descrizione, tech stack)
- Convenzioni particolari del progetto non coperte dalle regole globali
- Regole specifiche dei sotto-progetti

Le regole globali (workflow, memoria giornaliera, inizializzazione, struttura cartelle, report, sistema task) sono la **unica fonte di verita** e vengono ereditate automaticamente da ogni workspace. Non riscriverle, non riassumerle, non riferirle nei file locali.

### Sincronizzazione repo — trigger e comandi

Il sync repo non è automatico. **Nessun hook**, **nessuno script esterno** (era `sync-check.ps1`/`.sh`, rimossi). Claude esegue il sync solo su trigger esplicito, usando comandi `git` diretti via Bash tool.

**Trigger (in ordine di frequenza)**:

1. **Saluto di apertura sessione** — quando il **primo messaggio della sessione** (o il primo dopo un'inattività prolungata) è un saluto come "buongiorno", "buonasera", "buon pomeriggio", "ciao", "ehi", "salve", "hello", "hi" o equivalenti, Claude esegue il sync completo della workspace. Si applica solo ai saluti di apertura — non ai saluti intermedi.

2. **Skill `/sync`** — slash command esplicito (`~/.claude/skills/sync/SKILL.md`). L'utente digita `/sync` e Claude esegue il sync completo.

3. **Trigger naturale** — quando l'utente dice "sincronizza", "fai sync", "fai un sync", "controlla origin", "pull repo", "aggiorna i repo", "controlla se ci sono modifiche pushate" o frasi equivalenti, Claude esegue il sync completo.

4. **Fetch mirato pre-operazione** — prima di fare `git pull`, `git push` o `git commit` su un repo specifico, Claude fa **solo** su quel repo: `git fetch --quiet && git status --porcelain --branch`. Pochi token, zero overhead sugli altri repo.

**Comando canonico per sync completo workspace** (eseguito via Bash tool, in Git Bash su Windows o bash su macOS — non PowerShell):

```bash
find . -maxdepth 4 -name .git -type d 2>/dev/null | while read d; do
  repo=$(dirname "$d")
  (
    cd "$repo" || exit
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    upstream=$(git rev-parse --abbrev-ref "@{u}" 2>/dev/null)
    git fetch --quiet 2>/dev/null
    fetch_rc=$?
    dirty=$(git status --porcelain 2>/dev/null | head -1)
    if [ -z "$upstream" ]; then
      echo "[NO_UPSTREAM] $repo ($branch)"
    elif [ "$fetch_rc" -ne 0 ]; then
      echo "[FETCH_FAIL] $repo ($branch)"
    else
      ahead=$(git rev-list --count "$upstream..HEAD" 2>/dev/null)
      behind=$(git rev-list --count "HEAD..$upstream" 2>/dev/null)
      if [ "$ahead" = "0" ] && [ "$behind" = "0" ]; then
        : # silent — already in sync
      elif [ "$ahead" = "0" ] && [ "$behind" -gt 0 ] && [ -z "$dirty" ]; then
        echo "[PULL_FF] $repo ($branch) behind=$behind — fast-forward eligible"
      elif [ -n "$dirty" ]; then
        echo "[WARN_DIRTY] $repo ($branch) ahead=$ahead behind=$behind — tree sporco"
      elif [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
        echo "[WARN_DIVERGED] $repo ($branch) ahead=$ahead behind=$behind"
      elif [ "$ahead" -gt 0 ]; then
        echo "[AHEAD] $repo ($branch) ahead=$ahead — push pendente"
      fi
    fi
  ) &
done
wait
```

Il `& ... wait` lancia i `git fetch` in parallelo: tempo totale ≈ repo più lento, non somma.

**Dopo l'output**, Claude:
- Per ogni `[PULL_FF]`: esegue `cd <repo> && git pull --ff-only` automaticamente.
- Per ogni `[WARN_DIRTY]` / `[WARN_DIVERGED]` / `[FETCH_FAIL]` / `[NO_UPSTREAM]` / `[AHEAD]`: segnala all'utente, non agisce in autonomia.

**Su Windows**: il comando va eseguito in **Git Bash** (default del Bash tool su Claude Code), non PowerShell. Il pattern `& ; wait` funziona perfettamente.

### Inizializzazione Git/GitHub

Claude inizializza una directory come repository Git **solo su richiesta esplicita dell'utente**. La directory puo essere la root workspace, un sotto-progetto, o una sotto-directory a qualsiasi livello di annidamento.

**Passi di inizializzazione:**
1. `git init` nella directory indicata.
2. Creare `.gitignore` con template minimo generico:
   ```
   # OS files
   .DS_Store
   Thumbs.db
   desktop.ini
   *.tmp
   *~
   ```
   **IMPORTANTE:** il `.gitignore` **NON deve MAI escludere** `.claude/`, `CLAUDE.md`, o `.claude_interactions/`. Tutta l'infrastruttura Claude deve essere versionata e pushata.
3. Primo commit iniziale (es. "Initial commit").
4. Creare il repository remoto **privato** su GitHub via `gh repo create --private --source=. --push`. Creare come pubblico **solo** su richiesta esplicita dell'utente.

**Account GitHub:** rilevare automaticamente l'account attivo con `gh auth status`. Non usare credenziali hardcoded.

### Generazione PPTX (python-pptx)

Quando si genera o modifica un file PowerPoint con python-pptx, rispettare **SEMPRE** queste regole:

1. **Nessuna sovrapposizione:** Gli elementi (shape, textbox, immagini, diagrammi) non devono MAI sovrapporsi tra loro. Prima di posizionare un nuovo elemento, leggere le posizioni (`top`, `left`, `width`, `height`) di tutti gli shape esistenti sulla slide e calcolare la posizione del nuovo elemento in modo che non si sovrapponga.

2. **Tutto dentro i bordi della slide:** Ogni elemento deve rientrare completamente nei confini della diapositiva. Verificare che:
   - `left >= 0` e `left + width <= slide_width`
   - `top >= 0` e `top + height <= slide_height`
   Leggere `prs.slide_width` e `prs.slide_height` per conoscere le dimensioni della slide.

3. **Verifica pre-salvataggio:** Prima di salvare il PPTX, eseguire un controllo programmatico su ogni slide modificata: iterare tutti gli shape e verificare che nessuna coppia si sovrapponga (bounding box intersection) e che tutti siano entro i bordi. Se la verifica fallisce, correggere le posizioni prima di salvare.

### Pulizia Codice dopo Refactoring

Ogni volta che un modulo, funzione, endpoint o file viene sostituito o reso obsoleto da un refactoring, Claude **deve** eseguire la pulizia del codice vecchio nella stessa operazione:

1. **Verificare referenze**: cercare con Grep tutti gli import e le chiamate al codice vecchio nella codebase.
2. **Eliminare file/funzioni non referenziati**: se nessun altro file importa o chiama il codice vecchio, eliminarlo completamente.
3. **Rimuovere import orfani**: eliminare import che puntano a moduli/funzioni rimossi.
4. **Nessun residuo**: non lasciare mai codice dead/ridondante nella codebase. Il codice nuovo + il codice preesistente modificato devono formare una codebase pulita.
5. **Endpoint/API**: se un endpoint viene sostituito da uno nuovo, verificare che il vecchio non sia ancora chiamato da frontend, Layer B, o altri servizi prima di rimuoverlo. Se e ancora usato come fallback, tenerlo ma documentare il motivo.

### Notifica Acustica

Configurata via hook in `~/.claude/settings.json`. Il suono viene riprodotto automaticamente nei seguenti casi:
- **Notification / Stop**: quando Claude Code richiede l'intervento dell'utente (permission prompt, idle, fine elaborazione).
- **PreToolUse (ExitPlanMode)**: esegue lo script `copy-plan` che copia i piani nella cartella locale del progetto e suona la notifica.

**Varianti per OS:**
- **Windows**: `C:\Windows\Media\Windows Ding.wav` via `Media.SoundPlayer`, script `copy-plan.ps1`.
- **macOS**: `/System/Library/Sounds/Glass.aiff` (o `Tink.aiff`) via `afplay`, script `copy-plan.sh`.

Non serve alcuna azione da parte di Claude — i hook sono gestiti dal sistema.
