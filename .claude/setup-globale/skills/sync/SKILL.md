---
name: sync
description: Sincronizza tutti i repo Git della workspace corrente con i loro upstream. Esegue git fetch in parallelo via Bash tool, segnala repo behind/dirty/diverged, esegue pull --ff-only sui repo eligibili. Usare quando l'utente lavora da piu PC e vuole pullare modifiche pushate da un altro PC. Trigger naturali: "sincronizza", "fai sync", "controlla origin", "pull repo", "/sync", saluto apertura sessione.
---

# Skill: sync

Sincronizza tutti i repo Git della workspace corrente con i loro upstream. **Niente script esterni** (sync-check.ps1/.sh sono stati rimossi nel refactor lazy): Claude esegue comandi `git` diretti via Bash tool, con parallelizzazione `& ; wait`.

## Workflow

1. **Determinare la root della workspace** dal `cwd` del system prompt.

2. **Eseguire il comando di sync** via Bash tool (Git Bash su Windows, bash su macOS):

```bash
cd "<workspace_root>"
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
        :
      elif [ "$ahead" = "0" ] && [ "$behind" -gt 0 ] && [ -z "$dirty" ]; then
        echo "[PULL_FF] $repo ($branch) behind=$behind"
      elif [ -n "$dirty" ]; then
        echo "[WARN_DIRTY] $repo ($branch) ahead=$ahead behind=$behind"
      elif [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
        echo "[WARN_DIVERGED] $repo ($branch) ahead=$ahead behind=$behind"
      elif [ "$ahead" -gt 0 ]; then
        echo "[AHEAD] $repo ($branch) ahead=$ahead"
      fi
    fi
  ) &
done
wait
```

3. **Per ogni `[PULL_FF]` nell'output**: eseguire `cd <repo> && git pull --ff-only`.

4. **Per ogni altro marker (`WARN_*`, `FETCH_FAIL`, `NO_UPSTREAM`, `AHEAD`)**: segnalare all'utente, **non agire**.

5. **Output finale**: riepilogo conciso. Se nessuna riga, dire "Tutti i repo già allineati".

## Cosa NON fa la skill

- Non committa modifiche locali (per quello esiste "aggiorna le memorie").
- Non risolve conflitti o divergenze: segnala e attende istruzioni.
- Non tocca repo fuori dalla workspace corrente.
- Non pusha. Per push usare commit/push espliciti o il checkpoint "aggiorna le memorie".

## Trigger

- Slash command esplicito: `/sync`.
- Trigger naturali: "sincronizza", "fai sync", "controlla origin", "pull repo", "aggiorna i repo".
- **Saluto di apertura sessione**: "buongiorno", "buonasera", "ciao", "hello".
