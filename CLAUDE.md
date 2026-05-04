# Briefing operativo — giardiniconsulenza.it

> **Per chi legge:** sei un assistente AI che opera dentro VS Code (Claude Code, Cursor o simile) sulla cartella locale del repository. Questo documento ti dà tutto il contesto + le istruzioni operative per portare avanti il sito **giardiniconsulenza.it** in autonomia. Leggi tutto prima di agire. Quando agisci, fallo in modo incrementale e conservativo.

---

## 1 · Identità del progetto

**Cliente:** Andrea Giardini — Consulente Finanziario indipendente in Italia, in fase di formalizzazione partita IVA. Iscritto OCF n. 2965, delibera del 23/04/2026.

**Sito:** `giardiniconsulenza.it` (già online), redirect attivo da `giardiniconsulenza.com`.

**Posizionamento del brand:** consulenza finanziaria moderna, accessibile, empatica e trasparente. Tono professionale ma umano. Il sito si rivolge a persone e famiglie italiane che vogliono ridurre costi nascosti, pianificare obiettivi (casa, figli, pensione), costruire una strategia che « regge nel tempo ».

**Identità visiva (da rispettare ovunque):**
- **Palette:** sage `#4A5D4F` · ocra `#D4A574` · avorio `#F5F1E8` · antracite `#2C2C2A` · smeraldo accento `#00A652`
- **Tipografia:** Playfair Display o Fraunces per titoli (serif elegante) · Manrope o Inter per body (sans moderno)
- **Logo:** α calligrafica minuscola fusa con G corsiva maiuscola, freccia a zig-zag ascendente che termina in smeraldo `#00A652`. Il tratto della α è più spesso del tratto della G.

---

## 2 · Stack tecnico

| Componente | Cosa fa | Dove |
|---|---|---|
| **Astro 5.12.x** | Framework statico (52 pagine generate) | `package.json` |
| **Tailwind CSS 3.4** | Styling utility-first | `tailwind.config.js` |
| **AstroWind template** | Base di partenza (da personalizzare) | tutto il progetto |
| **GitHub** | Repo `giardiniandrea7-maker/portfolio` (branch `main`) | cloud |
| **Cloudflare Pages** | Build & deploy automatici sul push | progetto `andrea-giardini` |
| **Node** | Versione richiesta: `>= 18.17.1` (Cloudflare usa `NODE_VERSION=20`) | locale + Cloudflare |

**Build pipeline:**
1. Push su `main` di GitHub
2. Cloudflare rileva, esegue `npm install` poi `npm run build`
3. Pubblica `dist/` sulla CDN globale
4. Tempo totale: ~2-4 minuti dal commit al sito online aggiornato

**Comandi locali essenziali:**
```bash
npm install        # solo al primo setup o dopo aver cancellato node_modules
npm run dev        # anteprima su http://localhost:4321 con hot reload
npm run build      # compila in dist/ (per testare la build esattamente come fa Cloudflare)
npm run preview    # serve dist/ in locale come fosse production
```

---

## 3 · Struttura del repository

```
portfolio/
├── .astro/             # cache Astro - IGNORATA da git
├── .github/            # workflow GitHub (lasciare stare)
├── .vscode/            # settings editor (lasciare stare)
├── dist/               # build output - IGNORATA da git
├── nginx/              # config Docker (non usata in produzione)
├── node_modules/       # dipendenze - IGNORATE da git
├── public/             # ⭐ asset statici: favicon, logo, immagini, robots.txt
├── src/
│   ├── assets/         # immagini importate via Astro (ottimizzate)
│   ├── components/     # ⭐ componenti riutilizzabili (Header, Footer, Hero, ecc.)
│   ├── content/        # articoli markdown del blog
│   ├── data/           # dati strutturati (autori, post)
│   ├── layouts/        # layout base delle pagine
│   ├── pages/          # ⭐ una pagina = un file (index.astro è la home)
│   ├── styles/         # CSS globale e custom
│   ├── utils/          # utility TypeScript
│   ├── config.yaml     # ⭐⭐ CONFIGURAZIONE GLOBALE: nome sito, SEO, social
│   └── navigation.ts   # menu header e footer
├── vendor/             # tema base AstroWind (NON modificare direttamente)
├── astro.config.ts     # config Astro
├── tailwind.config.js  # config Tailwind (palette estesa qui)
├── package.json
└── .gitignore          # esclude node_modules, dist, .astro, .env
```

**File con asterisco** = quelli che modificherai più spesso. **Mai toccare** `vendor/` direttamente: contiene il template base; per personalizzare, sovrascrivi i suoi componenti creando file omonimi in `src/components/`.

---

## 4 · Stato attuale del sito (4 maggio 2026)

✅ **Funzionante online** su `giardiniconsulenza.it` con la migrazione da HTML statico a Astro completata oggi.

✅ **Contenuti ben impostati:**
- Hero con headline orientata al cliente
- Sezione « Il progetto » con 4 card (Articoli / Calcolatori / Diagnosi / News)
- Presentazione « Andrea Giardini » con doppia CTA
- 3 servizi (Diagnosi / Pianificazione / Previdenza)
- Banner CTA verde « Richiedi diagnosi gratuita »
- Footer completo con dati OCF e disclaimer

⚠️ **Da sistemare (priorità decrescente):**

| # | Item | Dove | Priorità |
|---|---|---|---|
| 1 | Favicon ancora AstroWind (A rosa) | `public/favicon.svg`, `public/favicon.ico` | ALTA |
| 2 | Logo header AstroWind | `src/components/widgets/Header.astro` o `src/navigation.ts` | ALTA |
| 3 | Logo footer | `src/components/widgets/Footer.astro` | ALTA |
| 4 | OG Image (anteprima social) | `src/assets/images/default.png` + `src/config.yaml` | MEDIA |
| 5 | Foto profilo Andrea (placeholder « FOTO IN ARRIVO ») | `src/pages/index.astro` o `src/components/...` | MEDIA |
| 6 | Video « Benvenuto » placeholder YouTube | home page | MEDIA |
| 7 | Footer: completare campo `[Nome Banca] S.p.A.` | footer component | MEDIA |
| 8 | Articoli del blog | `src/content/post/` | BASSA |

---

## 5 · Brand assets attesi (chiedere all'utente prima di procedere)

L'utente ha questi file (verificare con lui dove sono caricati):
- **Logo SVG** versione standard (sfondo chiaro)
- **Logo SVG** versione inverse (sfondo scuro) — opzionale
- **Favicon** o sorgente quadrato per generarlo
- **Foto profilo** (in arrivo)

Quando ti vengono caricati i file, posizionali in `public/` con nomi semantici: `logo.svg`, `logo-inverse.svg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.jpg`.

---

## 6 · Workflow operativo (cosa fai ad ogni richiesta)

### Regola d'oro
**Ogni modifica passa per: edit → test locale → commit → push.** Mai pushare senza prima verificare in `npm run dev` che il sito non sia rotto.

### Sequenza standard

1. **Capisci la richiesta** dell'utente. Se è ambigua, chiedi chiarimenti prima di toccare file.

2. **Localizza i file da modificare.** Usa la mappa al §3 e la grep semantica. Non modificare mai a tappeto.

3. **Mostra all'utente il piano** prima di scrivere codice (specie per modifiche cross-file). Esempio: « Per cambiare la headline modifico `src/pages/index.astro` riga ~20. Procedo? »

4. **Esegui le modifiche.** Sii conservativo: cambia il minimo necessario, mantieni lo stile esistente, rispetta la palette e i componenti già usati.

5. **Verifica in locale.** Se `npm run dev` è già attivo, l'utente vedrà il cambio in tempo reale. Altrimenti suggerisci `npm run build` per il check finale.

6. **Quando tutto è ok, committa e pusha:**
   ```bash
   git add .
   git status        # mostra all'utente cosa stai per committare
   git commit -m "Messaggio descrittivo in italiano"
   git push
   ```
   Il commit message deve essere: imperativo, breve, chiaro. Esempi: `Sostituito favicon con logo brand`, `Aggiornata headline home`, `Corretti link footer`.

7. **Avvisa l'utente che il deploy è partito** e che in 2-4 minuti sarà online. Suggerisci `Ctrl+F5` su `giardiniconsulenza.it` per forzare il refresh cache.

### Cosa NON fare

- ❌ Non modificare file in `vendor/` (è il template base, va sovrascritto in `src/`).
- ❌ Non toccare `.gitignore` senza un motivo esplicito.
- ❌ Non installare nuove dipendenze npm senza confermare con l'utente: ogni dipendenza in più è peso e rischio.
- ❌ Non committare `.env`, password, chiavi API, dati clienti.
- ❌ Non fare commit-bomb (un commit con 30 file modificati per ragioni diverse). Un commit = un'idea coerente.
- ❌ Non pushare se `npm run build` fallisce. Se fallisce in locale, fallirà anche su Cloudflare.

### Quando hai dubbi

Chiedi all'utente prima di:
- Cancellare file
- Cambiare palette o tipografia
- Modificare la struttura della home
- Aggiungere dipendenze npm
- Toccare `astro.config.ts`, `tailwind.config.js`, `package.json`

Procedi senza chiedere per:
- Modifiche di testo/copy puntuali
- Sostituzione di immagini in posti già esistenti
- Fix di typo
- Aggiunta di nuovi articoli in `src/content/post/`

---

## 7 · Best practice tecniche

### Componenti Astro
- File `.astro` hanno frontmatter `---` (TypeScript) e template HTML.
- Importa componenti dal vendor con: `import Header from '~/components/widgets/Header.astro';` (l'alias `~` punta a `src/`).
- Per personalizzare un componente del template, copia il file da `vendor/` a `src/components/widgets/` con lo stesso nome — Astro userà la versione in `src/`.

### Tailwind
- La palette brand è (o va) estesa in `tailwind.config.js` sotto `theme.extend.colors`. Usa nomi semantici: `sage`, `ochre`, `ivory`, `charcoal`, `emerald-brand`.
- Mai colori hard-coded in classi tipo `bg-[#4A5D4F]`. Usa `bg-sage`.

### SEO
- Ogni pagina ha tag `<meta>` configurati via `Layout.astro`. Per modificarli globalmente: `src/config.yaml` chiave `metadata`.
- Per pagina specifica: passa `metadata={...}` al `<Layout>`.

### Performance
- Tutte le immagini in `src/assets/` vengono ottimizzate automaticamente (WebP, lazy-loading, responsive).
- File in `public/` vengono serviti as-is: usa solo per favicon, robots.txt, file che richiedono URL fisso.
- Non importare librerie pesanti (es. lodash intero): AstroWind ha già `astro-icon`, `unpic`, `lodash.merge`. Riusale.

---

## 8 · Glossario rapido per Andrea (l'utente)

| Termine | Significato |
|---|---|
| **Repo** | La cartella del progetto su GitHub |
| **Commit** | Una « foto » dello stato attuale del progetto, con un messaggio descrittivo |
| **Push** | Caricare i commit locali su GitHub |
| **Pull** | Scaricare aggiornamenti dal repo (utile se modifichi da più PC) |
| **Branch** | Una linea di sviluppo. Noi usiamo solo `main` |
| **Deploy** | Pubblicazione online del sito (gestita automaticamente da Cloudflare) |
| **Build** | La compilazione di Astro che genera la cartella `dist/` |
| **Hot reload** | Il browser si aggiorna da solo quando salvi un file in dev |

L'utente non è uno sviluppatore: spiega gli errori in italiano semplice, evita gergo tecnico inutile, suggerisci sempre il prossimo step concreto.

---

## 9 · Storia recente (contesto per continuità)

**4 maggio 2026 — giornata di migrazione** (questa è la giornata in cui è stato consegnato questo briefing):

1. Sito vecchio: singolo `index.html` su Cloudflare Pages, branch `main` del repo `portfolio`.
2. Progetto Astro pronto in `C:\Progetti\andrea-giardini` (mai sincronizzato con git).
3. Clone del repo in `Documents/GitHub/portfolio`, copia del progetto Astro nel repo, primo push via GitHub Desktop.
4. **Primo deploy fallito**: Cloudflare aveva deployato i sorgenti senza eseguire la build (log: `No build command specified. Skipping build step`). Risultato: 404.
5. **Fix**: nelle Settings di Cloudflare Pages → environment Production → Build command = `npm run build`, Build output = `dist`, variabile `NODE_VERSION = 20`.
6. **Retry deployment** → ✓ Build complete, sito online.
7. L'utente ha deciso di abbandonare GitHub Desktop e lavorare interamente da VS Code.

**Cartella legacy da NON toccare:** `C:\Progetti\andrea-giardini` esiste come backup ma è scollegata da git. Da oggi la cartella di lavoro è solo `Documents/GitHub/portfolio`.

---

## 10 · Roadmap operativa (ordine di priorità suggerito)

Esegui queste task quando l'utente te le chiede o conferma. Non agire spontaneamente sulla roadmap.

### Sprint 1 — Branding (priorità immediata)
- [ ] Sostituire favicon (favicon.ico, favicon.svg, apple-touch-icon.png) con logo α+G brand
- [ ] Sostituire logo header con SVG brand (gestire light/dark se necessario)
- [ ] Sostituire logo footer
- [ ] Generare e impostare OG image 1200×630 px con logo + headline brand
- [ ] Aggiornare `src/config.yaml` con nome, descrizione, social URL corretti

### Sprint 2 — Contenuti
- [ ] Caricare foto profilo Andrea Giardini (sostituire placeholder « FOTO IN ARRIVO »)
- [ ] Decidere video benvenuto: caricare su YouTube unlisted ed embeddare, oppure rimuovere il blocco
- [ ] Completare nome agente collegato nel footer
- [ ] Verificare e correggere tutti i link interni del menu

### Sprint 3 — SEO & misurazione
- [ ] Compilare meta description per ogni pagina principale
- [ ] Aggiungere Plausible Analytics (più privacy-friendly di GA4, allineato al posizionamento)
- [ ] Creare e pubblicare `robots.txt` e verificare sitemap

### Sprint 4 — Funzionalità avanzate (futuro)
- [ ] Form di prenotazione « diagnosi gratuita » integrato con Cal.com
- [ ] Primi 2-3 articoli educativi in `src/content/post/`
- [ ] Calcolatore interesse composto interattivo (componente client-side React/Svelte)
- [ ] Calcolatore mutuo
- [ ] Newsletter signup (ConvertKit o simile)

---

## 11 · Comandi di emergenza

Quando qualcosa va storto, in ordine di intervento:

```bash
# 1. Vedi cosa è cambiato dall'ultimo commit
git status
git diff

# 2. Annulla tutte le modifiche locali non committate (ATTENZIONE: irreversibile)
git checkout .

# 3. Annulla l'ultimo commit ma mantieni le modifiche
git reset --soft HEAD~1

# 4. Annulla l'ultimo commit E le sue modifiche (ATTENZIONE)
git reset --hard HEAD~1

# 5. Vedi cosa è successo nelle ultime ore
git log --oneline -20

# 6. Reinstalla dipendenze da zero (se npm fa cose strane)
rm -rf node_modules package-lock.json
npm install

# 7. Pulizia completa di build artifacts
rm -rf dist .astro
npm run build

# 8. Forza il push (SOLO se sai cosa stai facendo)
git push --force-with-lease
```

**Se Cloudflare deploy fallisce:**
1. Vai su `dash.cloudflare.com` → Workers & Pages → andrea-giardini → Deployments → View details
2. Leggi gli ultimi 30 righe del log
3. Cerca le parole `Error`, `Failed`, `npm ERR!`
4. Se l'errore è in `npm run build`, riproducilo in locale per capire

---

## 12 · Reference rapida — file più toccati

| Cosa modificare | File da aprire |
|---|---|
| Headline home | `src/pages/index.astro` |
| Sezione « Chi sono » | `src/pages/index.astro` o componente dedicato |
| Servizi | `src/pages/index.astro` (sezione Services) |
| Logo header | `src/components/widgets/Header.astro` |
| Logo footer | `src/components/widgets/Footer.astro` |
| Voci menu | `src/navigation.ts` |
| Nome sito, SEO globale, social | `src/config.yaml` |
| Palette colori | `tailwind.config.js` (sezione `theme.extend.colors`) |
| Favicon | `public/favicon.svg`, `public/favicon.ico` |
| OG image | `src/assets/images/default.png` |
| Robots.txt | `public/robots.txt` (auto-generato da `astrowind.config.yaml`) |

---

**Fine del briefing.** Quando l'utente ti dà la prima istruzione, parti dal §6 « Workflow operativo » e applica la sequenza standard. Buon lavoro.
