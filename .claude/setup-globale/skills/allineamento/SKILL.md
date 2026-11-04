---
name: allineamento
description: Allinea una workspace alle regole globali di Claude. Gestisce migrazione da struttura vecchia (SETUP-GLOBALE.md file singolo) a struttura nuova (cartella setup-globale/), allineamento diretto master→workspace, sync inversa workspace→master (per propagazione tra PC via git), e audit di conformità strutturale. Invocata automaticamente dallo Step 0 del workflow globale quando i timestamp divergono o la struttura è obsoleta, oppure manualmente con frasi tipo "allinea la workspace alle regole globali", "fai sync inversa", "allinea le regole globali".
---

# Skill: allineamento

Motore di allineamento bidirezionale tra le regole globali di Claude (`~/.claude/`) e i workspace dell'utente. Contiene istruzioni esplicite di copia file per ognuno dei 4 casi possibili, più un audit di conformità strutturale eseguito alla fine.

## Quando viene invocata

- **Automaticamente**: dallo Step 0 del workflow di `~/.claude/CLAUDE.md` all'inizio di ogni task, se rileva disallineamento (timestamps differenti, struttura vecchia, sezione duplicata in workspace-conventions.md).
- **Manualmente**: quando l'utente chiede "allinea la workspace alle regole globali", "fai sync inversa", "applica allineamento", o frasi equivalenti.

## Detection (eseguita all'ingresso)

1. Leggi `~/.claude/manifest.json::alignment-rules-updated` → `T_master`. Se il file non esiste, considera `T_master = "0"` (PC vergine).
2. Leggi `<workspace>/.claude/setup-globale/manifest.json::alignment-rules-updated` → `T_mirror`. Se la cartella o il file non esiste, considera `T_mirror = null`.
3. Verifica esistenza di `<workspace>/.claude/SETUP-GLOBALE.md` (file vecchio formato).
4. Verifica esistenza di `<workspace>/.claude/setup-globale/` (cartella nuovo formato).
5. Rileva OS corrente (Windows / macOS).
6. Verifica se `<workspace>/.claude/rules/workspace-conventions.md` contiene la sezione `## Regole Globali (auto-allineate)`.

## Routing — 4 casi mutuamente esclusivi

### Caso A — Migrazione struttura vecchia

**Trigger**: `<workspace>/.claude/SETUP-GLOBALE.md` (file) esiste E `<workspace>/.claude/setup-globale/` (cartella) non esiste.

**Azioni esplicite**:

1. Eliminare il file vecchio `SETUP-GLOBALE.md`.
2. Creare la struttura cartella:
   ```
   <workspace>/.claude/setup-globale/
   ├── settings/
   ├── scripts/windows/
   ├── scripts/macos/
   └── skills/
       ├── allineamento/
       ├── pptx-validation/
       ├── frontend-design/
       ├── llm-wiki-setup/
       └── sync/
   ```
3. Copiare il manifest: `cp ~/.claude/manifest.json <workspace>/.claude/setup-globale/manifest.json`.
4. Copiare il CLAUDE.md globale.
5. Split di `~/.claude/settings.json` in 3 file:
   - `settings/permissions.shared.json` (permissions.allow).
   - `settings/settings.<OS-corrente>.json` (hooks + autoUpdatesChannel + effortLevel).
   - Per l'altro OS: applicare il mapping PS↔bash (vedi sotto).
6. Copiare gli script `copy-plan.ps1` → `setup-globale/scripts/windows/` e `copy-plan.sh` → `setup-globale/scripts/macos/`.
7. Copiare le skill custom in `setup-globale/skills/`.
8. Creare `skills-external.md` con i comandi `git clone` per le skill esterne.
9. Aggiornare `last-aligned` in `workspace-conventions.md`.
10. Eseguire Fase Audit Conformità.

### Caso B — Allineamento diretto (master più recente)

**Trigger**: `setup-globale/` esiste E `T_master > T_mirror` (o `T_mirror == null`).

**Azioni esplicite**:

1. Copiare `~/.claude/manifest.json` → mirror.
2. Copiare `~/.claude/CLAUDE.md` → mirror.
3. Ri-split di `~/.claude/settings.json` in mirror.
4. Copiare gli script in `setup-globale/scripts/<OS>/`.
5. Sovrascrivere le skill in `setup-globale/skills/`.
6. Rigenerare `skills-external.md` se differente.
7. Aggiornare `last-aligned`.
8. Eseguire Fase Audit Conformità.

### Caso C — Sync inversa (mirror più recente)

**Trigger**: `setup-globale/` esiste E `T_mirror > T_master`.

**Azioni esplicite**:

1. Copiare `setup-globale/CLAUDE.md` → `~/.claude/CLAUDE.md` (sovrascrivere).
2. Ricomporre `~/.claude/settings.json` merge JSON tra `permissions.shared.json` e `settings.<OS-corrente>.json` del mirror.
3. Copiare script `setup-globale/scripts/<OS-corrente>/copy-plan.<ext>` → `~/.claude/scripts/`.
4. Copiare le skill custom dal mirror → `~/.claude/skills/`.
5. Skill esterne: stampare i comandi `git clone` e attendere l'utente.
6. Copiare `setup-globale/manifest.json` → `~/.claude/manifest.json`.
7. Aggiornare `last-aligned` workspace.
8. Eseguire Fase Audit Conformità.

### Caso D — Skip sync, solo audit

**Trigger**: `setup-globale/` esiste E `SETUP-GLOBALE.md` non esiste E `T_master == T_mirror`.

Skip sync file (timestamp coincidono), eseguire solo l'Audit Conformità (per pulizia sezione duplicata residua o check semantico Regole Workspace).

---

## Fase Audit Conformità (eseguita come ultimo step in Casi A, B, C)

23 voci di check. Per ogni voce: ✅ conforme / 🔧 auto-fix applicato / ⚠️ richiede attenzione umana.

### A. Struttura workspace root
1. `.claude_interactions/context.md` esiste? Se no → creare con header placeholder.
2. `.claude_interactions/project.md` esiste? Se no → creare con template vuoto.
3. `.claude_interactions/reports/` esiste? Se no → creare.
4. `.claude_interactions/documents/` esiste? Se no → creare.
5. `.claude_interactions/` contiene solo elementi standard? Anomalie → segnalare/spostare.
6. `.claude/memories/MEMORY.md` esiste? Se no → segnalare anomalia.
7. `.claude/rules/workspace-conventions.md` esiste? Se no → creare template minimo.

### B. Sotto-progetti registrati in MEMORY.md
8-13. Per ogni sotto-progetto: verificare `project.md`, `reports/`, `documents/`, `rules-<nome>.md`, e che `.claude_interactions/` non abbia residui.

### C. File `.gitignore` workspace
14. Rimuovere riga `.claude/.sync-check-last` se presente (residuo pre-refactor lazy). Eliminare anche il marker file se esiste sul filesystem.

### D. Memoria-task per-cartella (punto iniziale + esistenza)
15. **Rename retroattivo**: file memoria-task senza punto iniziale → rinominare con `git mv` (preserva history).
16. **Memoria-task mancanti**: per ogni cartella task in `reports/task/`, creare il file se manca.

### E. File task minimali e coerenza folder
17-18. Verificare coerenza `**folder**:` ↔ posizione cartella per task attive e chiuse.

### F. Struttura memoria per giornate
19-20. Verificare entry `## YYYY-MM-DD` ben formate, no entry duplicate per stesso giorno.

### G. Workspace-conventions.md pulito
21. Rimuovere sezione `## Regole Globali (auto-allineate)` se residua (auto-fix se contiene solo regole standard, chiedere conferma altrimenti).
22. Verificare presenza riga `**last-aligned: ...**`.
23. **Audit semantico**: scansione "Regole Workspace" alla ricerca di duplicati delle regole globali. Pattern noti da segnalare (vedi lista). **Non auto-rimuovere** — chiedere conferma all'utente per ogni match.

### Summary finale
```
[AUDIT] Workspace: <nome>
  ✅ Conformi: N/M voci
  🔧 Auto-fixati: K voci
  ⚠️ Anomalie da rivedere: J voci
```

---

## Mapping PS↔bash

Tabella di equivalenze usata per tradurre comandi hook e script tra Windows (PowerShell) e macOS (bash).

| Scopo | PowerShell (Windows) | Bash (macOS) |
|---|---|---|
| Suono notifica | `(New-Object Media.SoundPlayer 'C:\Windows\Media\Windows Ding.wav').PlaySync()` | `afplay /System/Library/Sounds/Glass.aiff` |
| Path home utente | `$env:USERPROFILE` | `$HOME` |
| Path plans globale | `Join-Path $env:USERPROFILE '.claude\plans'` | `$HOME/.claude/plans` |
| Separatore path | `\` | `/` |
| Read stdin hook | `$data = [Console]::In.ReadToEnd() \| ConvertFrom-Json` | `data=$(cat); cwd=$(echo "$data" \| python3 -c "import sys,json; print(json.load(sys.stdin)['cwd'])")` |
| Copia file | `Copy-Item $src $dest -Force` | `cp "$src" "$dest"` |
| Crea dir se manca | `if (-not (Test-Path $dest)) { New-Item -ItemType Directory $dest -Force \| Out-Null }` | `mkdir -p "$dest"` |
| Trova file ricorsivo | `Get-ChildItem -Recurse -Filter '*.md'` | `find . -name '*.md'` |
| Esecuzione hook command | `powershell -ExecutionPolicy Bypass -File "..."` | `bash "..."` |

## Anti-ricorsione

- La skill non re-invoca lo Step 0 del workflow dopo la propria esecuzione.
- Flag interno: appena entrata, considerarsi "in esecuzione" — se per qualche motivo Claude la richiama subito dopo, riconoscere il caso e skippare.
- L'Audit Conformità non auto-richiama la skill.

## Comportamenti su edge case

- **PC vergine (no `~/.claude/manifest.json`)**: `T_master = "0"`. Se la workspace ha un mirror con `T_mirror` valido → Caso C automatico, ricostruisce tutto il globale.
- **Workspace vergine (no `setup-globale/` né `SETUP-GLOBALE.md`)**: `T_mirror = null` → Caso B (genera mirror da zero).
- **Sezione "Regole Globali" con contenuto custom**: prima di rimuoverla, chiedere conferma all'utente.
- **Settings.json corrotto**: segnalare e fermarsi, non sovrascrivere.

## Note di installazione (profilo locale)

Questa installazione ha `os-profiles: ["windows"]` e skill custom `allineamento`, `pptx-validation`, `llm-wiki-setup`, `sync`. La skill `frontend-design` è gestita via plugin marketplace, non come file locale: non includerla nelle copie mirror. Non esistono skill esterne clonate. Nei Casi A e B, copiare solo le skill effettivamente presenti in `~/.claude/skills/`.

## Note finali

Questa skill è il **cuore del sistema di allineamento**. La chiarezza determina la qualità del flusso multi-PC. Aggiornare in lockstep con il `~/.claude/CLAUDE.md` quando cambiano le regole strutturali.
