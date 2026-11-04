---
name: llm-wiki-setup
description: Setup di un'enciclopedia LLM Wiki (protocollo Karpathy adattato) nella workspace corrente, usando Obsidian come vault. Crea la struttura wiki/ senza spostare i file sorgente, fa baseline ingestion, popola iterativamente. Invocare quando l'utente chiede di "creare un wiki", "applicare LLM Wiki", "fare ingestion della workspace" o simili.
---

# LLM Wiki Setup — Skill

Protocollo per costruire un'enciclopedia navigabile su una workspace contenente molti documenti sparsi. Adattamento del protocollo LLM Wiki di Karpathy: **zero spostamento fisico dei sorgenti** — le pagine wiki vivono in `wiki/` alla root workspace e citano i file originali con link markdown relativi.

## Quando invocare

- L'utente chiede: "crea un wiki", "applichiamo LLM Wiki", "voglio usare Obsidian sulla workspace".
- Dopo una cleanup documentale in una workspace grossa: molti `.md` sparsi, utile consolidare la conoscenza navigabile.

## Principio architetturale chiave

Obsidian **non indicizza cartelle che iniziano con `.`**. Le sorgenti in `.claude_interactions/` quindi non saranno visibili nel vault Obsidian. Questo è **intenzionale**:
- **Obsidian** = wiki workspace (search, graph, backlinks, editor pagine).
- **Claude** = ingestion engine (legge sorgenti via Read tool).
- **VS Code** = navigazione sorgenti.

## Workflow

### Step 1 — Struttura wiki/

```
wiki/
├── PROTOCOL.md
├── index.md
├── log.md
├── entities/    # Pagine per entità concrete
├── concepts/    # Pagine per concetti trasversali
└── syntheses/   # Overview, confronti, analisi
```

### Step 2 — Guida Obsidian all'utente

1. Aprire Obsidian → "Open folder as vault" → root workspace.
2. Settings → Files and links → Excluded files: aggiungere `codebase/`, `node_modules/`, `dist/`, `build/`, `.venv/`.
3. Core plugins: Graph view, Backlinks, Outgoing links, Tags, Search.

### Step 3 — Baseline ingestion

**3a. Identificare source roots**: Glob sui pattern `*/.claude_interactions/reports/**/*.md`, `*/.claude_interactions/project.md`, ecc.

**3b. Estrarre entità chiave**: per ogni sorgente principale, creare una pagina `entities/<nome>.md` con: titolo, tipo, ultima fonte, riassunto 3-5 righe, link alle fonti.

**3c. Estrarre concetti trasversali**: pagine `concepts/<nome>.md` per idee ricorrenti.

**3d. Sintesi iniziale**: una pagina `syntheses/overview.md` come punto d'ingresso del wiki.

### Step 4 — Popolamento iterativo

Quando l'utente chiede "espandi il wiki" o "documenta X":
- Leggere le sorgenti pertinenti.
- Creare/aggiornare pagine.
- **Densità > esaustività**: 40 righe dense > 200 diluite.
- Wikilink `[[...]]` per navigazione interna; link markdown per sorgenti.
- Aggiornare `log.md` con la data e le pagine toccate.

### Step 5 — Lint operation (su richiesta)

Quando l'utente chiede "fai una lint del wiki":
- Pagine orfane (zero backlink).
- Claim superati (date pagine vs date sorgenti).
- Fonti broken (file linkati che non esistono più).
- Stub non popolati.

Output → `wiki/syntheses/lint-YYYY-MM-DD.md`.

## Anti-pattern da evitare

- Creare `raw/` e spostarci i file: rompe il principio.
- Pagine wiki che duplicano sorgenti: il wiki sintetizza, non ri-narra.
- Changelog nelle pagine wiki: usare `log.md`.
- Wikilink troppo granulari (`[[parametro-x]]`): il wiki è navigazione, non doc API.
