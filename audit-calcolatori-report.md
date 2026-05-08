# Audit visivo dei calcolatori — report

**Data:** 2026-05-08
**Branch:** main
**File analizzati:**
- `src/pages/calcolatori/index.astro` (hub)
- `src/pages/calcolatori/pensione-integrativa.astro`
- `src/pages/calcolatori/interesse-composto.astro`
- `src/pages/calcolatori/rendimento-obbligazioni.astro`
- `src/pages/calcolatori/mutuo.astro`
- `src/pages/calcolatori/rendita.astro`
- `src/pages/calcolatori/isee.astro`
- `src/pages/calcolatori/semplice-vs-composto.astro`
- `src/components/widgets/PlaceholderCalcolatore.astro`
- `src/components/CustomStyles.astro` (token globali)
- `tailwind.config.js`

---

## 0. SEGNALAZIONE PRELIMINARE: il problema NON è solo nei calcolatori

Il brief ipotizzava che i calcolatori potessero essere "un'isola stilistica" rispetto al resto del sito. **Confermato, e in modo doppio:**

### 0.1 — Discrepanza CLAUDE.md vs design system reale del sito

`CLAUDE.md` (briefing del progetto) dichiara la palette brand:
| Token | CLAUDE.md | Sito reale (`CustomStyles.astro`) | Stato |
|---|---|---|---|
| Sage primario | `#4A5D4F` | `#166963` (`--aw-color-primary`) | ❌ Discrepanza |
| Ocra | `#D4A574` | `#AB7F62` (`--aw-color-accent`) | ❌ Discrepanza |
| Avorio | `#F5F1E8` | `#EEF7F6` (`bg-cream`, `rgb(238 247 246)`) | ❌ Discrepanza |
| Antracite | `#2C2C2A` | `#373D42` (`--aw-color-text-heading`) | ❌ Discrepanza |
| Smeraldo | `#00A652` | non definito globalmente | ⚠️ Solo nei calcolatori |

**Conclusione:** il `CLAUDE.md` è un briefing aspirazionale obsoleto. La palette effettiva del sito è quella di `CustomStyles.astro`. I calcolatori usano la palette del sito (corretto), NON quella del CLAUDE.md.

### 0.2 — Discrepanza tipografica brand

`CLAUDE.md` dichiara: *"Playfair Display o Fraunces per titoli (serif elegante) · Manrope o Inter per body"*.

Realtà:
- `package.json` ha installato `@fontsource-variable/fraunces` e `@fontsource-variable/manrope`
- `CustomStyles.astro` però imposta TUTTI i font a Manrope:
  ```css
  --aw-font-serif: 'Manrope Variable', …;
  --aw-font-heading: 'Manrope Variable', …;
  ```
- Solo `manrope` è importato come `@fontsource-variable/manrope` in `CustomStyles.astro`. **Fraunces è installato ma non importato e mai caricato.**
- I calcolatori (mutuo, ic, ob, rd, isee, svc) usano `var(--aw-font-serif, 'Playfair Display', Georgia, serif)` per i titoli dei chart-card e dei numeri grandi. Poiché `--aw-font-serif` è Manrope, il fallback Playfair non si attiva. **Niente serif appare effettivamente sul sito**, anche dove il codice lo richiede.

**Decisione richiesta dall'utente:** prima di procedere al refactor è necessario stabilire se:
- (A) il sito resta tutto-Manrope → rimuovere ogni invocazione di Playfair/serif dai calcolatori (è puro debito tecnico)
- (B) si introduce Fraunces come font heading reale → carico Fraunces in `CustomStyles.astro` e lo uso ovunque ci sia ora un fallback a Playfair

### 0.3 — Discrepanza pattern stilistico hub vs calcolatori

| Aspetto | `index.astro` (hub) | Calcolatori | Note |
|---|---|---|---|
| Approccio CSS | Tailwind utility-first + `var(--aw-color-*)` | CSS scritto a mano + `<style is:global>` con palette duplicata in ogni file | Due dialetti diversi |
| Border radius card | `rounded-sm` (~4px) | `12px` (8px in pensione-int) | ❌ |
| Font weight H2 | `font-bold` (700) | `font-weight: 600` | ❌ |
| Bg sezione griglia | `bg-[rgb(245_241_232)]` (`#F5F1E8`) | `var(--ivory)` (`#EEF7F6`) | ❌ Hub usa CLAUDE.md, non sito |
| Bottoni primari | `px-8 py-4 rounded-sm font-semibold` | `padding: 13px 28px; border-radius: 8px; font-weight: 600` | ❌ |

**L'hub è coerente con la pagina home / `PlaceholderCalcolatore` / pattern AstroWind del sito.** I calcolatori si sono creati un dialetto parallelo. La scelta di refactor non è solo "uniformare i 7 calcolatori tra loro", ma anche "decidere se il dialetto-calcolatori va riassorbito nel pattern Tailwind del sito o se va canonizzato come 'design system applicazioni' separato".

**Domanda chiave per il committente:** vuoi
- (A) **Allinea i calcolatori al dialetto Tailwind del sito** (più radicale, ma elimina la duplicazione)
- (B) **Mantieni il dialetto CSS-vars dei calcolatori, normalizzalo, e adegua l'hub a esso** (meno invasivo per i calcolatori)
- (C) **Mantieni due dialetti, uniformali a colpi al loro interno, lascia che convivano** (compromesso)

Il resto del report assume che la scelta verrà fatta nella Fase 2. Le divergenze sotto descritte vanno risolte in entrambe le strade, solo la sintassi cambia.

---

## 1. BRAND TOKEN

### 1.1 Palette CSS variables nei calcolatori

Tutti e 7 i calcolatori dichiarano in cima al loro `<style is:global>` la **stessa palette duplicata**, con poche eccezioni minime. Le variabili sono tutte hex hardcoded:

```css
--sage: #166963;       --sage-light: #79B9AD;   --sage-dark: #0F4F4A;
--ochre: #AB7F62;      --ochre-light: #C49A7E;  --ochre-dark: #8A6449;
--ivory: rgb(238 247 246);  --ivory-warm: rgb(245 250 249);
--charcoal: #373D42;
--emerald: #00A652;
--gray-soft: #DDE4E2;  --gray-text: #6B7672;
--shadow-soft: 0 4px 20px rgba(55, 61, 66, 0.06);
--radius: 12px;
```

**Mappatura sui token globali del sito:**
| Var calcolatori | Hex | Token globale equivalente | Nota |
|---|---|---|---|
| `--sage` | `#166963` | `--aw-color-primary` | OK, stesso valore |
| `--sage-light` | `#79B9AD` | `--aw-color-secondary` | OK, stesso valore |
| `--sage-dark` | `#0F4F4A` | non esiste globalmente | Variante locale |
| `--ochre` | `#AB7F62` | `--aw-color-accent` | OK, stesso valore |
| `--ochre-light` | `#C49A7E` | non esiste globalmente | Variante locale |
| `--ochre-dark` | `#8A6449` | non esiste globalmente | Variante locale |
| `--ivory` | `#EEF7F6` | `bg-cream` (CSS class su `<section>`) | OK, stesso valore |
| `--ivory-warm` | `#F5FAF9` | non esiste globalmente | Variante locale |
| `--charcoal` | `#373D42` | `--aw-color-text-heading` | OK, stesso valore |
| `--emerald` | `#00A652` | non esiste globalmente | **Brand accent del logo, non globalizzato** |
| `--gray-soft` | `#DDE4E2` | non esiste globalmente | Neutro locale |
| `--gray-text` | `#6B7672` | `--aw-color-text-muted`? In realtà `text-muted` è `#B5AEA9` → **sono colori diversi** | ⚠️ Discrepanza |

**Conclusione 1.1:** la palette dei calcolatori è coerente al loro interno e con il sito SOLO per `sage`, `sage-light`, `ochre`, `ivory`, `charcoal`. Le altre 7 varianti (-dark, -light, ivory-warm, emerald, gray-soft, gray-text) sono "private" dei calcolatori e dovrebbero essere centralizzate in un foglio di stile condiviso (è il primo motivo di duplicazione).

### 1.2 Divergenze nelle CSS variables

| File | Divergenza | Linea |
|---|---|---|
| `pensione-integrativa.astro` | `--radius: 8px` (vs `12px` ovunque) | 330 |
| `semplice-vs-composto.astro` | aggiunge `--charcoal-light: #4A5057`, `--emerald-light: #4DC585`, `--emerald-dark: #008440`, `--shadow-card: 0 8px 30px rgba(55, 61, 66, 0.08)` | 416–420 |

### 1.3 Rogue colors hardcoded (NON corrispondono ai token brand)

#### `pensione-integrativa.astro`
| Linea | Hex | Funzione | Problema |
|---|---|---|---|
| 254 | `#FAF4EA` | bg nota inline forfettari | beige caldo NON brand |
| 467, 1482 | `#E8F0EC` | bg info-callout / risultato OK | verde chiaro NON brand |
| 468, 1484 | `#C7DACD` | border info-callout | verde grigio NON brand |
| 1170 | `#C75D5D` | testo errore form | rosso NON brand |
| 1483 | `#3A4A3F` | testo risultato OK | verde scuro NON brand |
| 1491 | `#FDECEC` | bg risultato errore | rosa NON brand |
| 1492 | `#A04040` | testo risultato errore | rosso scuro NON brand |
| 1493 | `#F5C2C2` | border risultato errore | rosa NON brand |

**Note:** pensione-integrativa è cronologicamente il primo calcolatore costruito (palette del sito non ancora consolidata). Va totalmente normalizzato.

#### `interesse-composto.astro`
| Linea | Hex | Funzione | Problema |
|---|---|---|---|
| 466 | `#0a7d3f` | colore badge percentuale "buono" | verde NON brand (sostituibile con `--emerald` o tinta) |

#### `rendita.astro`
| Linea | Hex | Funzione | Problema |
|---|---|---|---|
| 737 | `rgba(0, 166, 82, 0.15)` | bg badge prudente | OK (è emerald 15%, accettabile) |
| 739 | `rgba(220, 38, 38, 0.12)` + `#c0392b` | bg/colore badge "aggressivo" | **rosso NON brand** ⚠️ Eccezione voluta |
| 751, 753 | `#c0392b` | border-left + colore alert "aggressivo" | rosso NON brand ⚠️ Eccezione voluta |
| 786 | `#0a7d3f` | colore badge percentuale "buono" | verde NON brand |
| 938-939 | `#c0392b` | cliff chart border + label | rosso NON brand ⚠️ Eccezione voluta (Fase 4) |
| 1363 | `red: '#c0392b'` (palette JS) | usato in chart per scenario aggressivo | NON brand |

**Nota Fase 4:** il rosso in rendita per scenario "aggressivo / cliff" è documentato come eccezione voluta nel brief. Va comunque scelto un rosso brand (es. derivato da ochre saturato, o un hex dedicato `--alert-red`) e centralizzato.

#### `index.astro` (hub)
| Linea | Hex | Funzione | Problema |
|---|---|---|---|
| 33 | `bg-[rgb(245_241_232)]` (`#F5F1E8`) | bg sezione griglia | **È l'avorio del CLAUDE.md, NON quello del sito (`#EEF7F6`)** ⚠️ Bug |

#### Codici "innocui" ma duplicati
- `#FFFFFF` per Chart.js tooltip background (8 occorrenze): innocuo, può restare o passare a token.
- `#0F4F4A` per Chart.js tooltip titleColor (5 occorrenze): è `--sage-dark`, duplicato in JS.
- `#373D42`, `#6B7672`, `#166963`, `#00A652`, `#79B9AD`, `#AB7F62` ricorrenti in JS Chart.js (~30 occorrenze totali): tutti brand ma duplicati in ogni file. **Da estrarre in `chart-theme.ts`.**

---

## 2. CARD STYLES

### 2.1 Card form/risultati

| File | Selector | Padding | Border | Radius | Shadow |
|---|---|---|---|---|---|
| `interesse-composto` | `.calc-ic .card` | `28px 30px` | `1px solid rgba(22, 105, 99, 0.15)` | 12px | `--shadow-soft` |
| `mutuo` | `.calc-mu .card` | `26px 28px` | `1px solid rgba(22, 105, 99, 0.15)` | 12px | `--shadow-soft` |
| `rendimento-obbligazioni` | `.calc-ob .card` | `26px 28px` | `1px solid rgba(22, 105, 99, 0.15)` | 12px | `--shadow-soft` |
| `rendita` | `.calc-rd .card` | `26px 28px` | `1px solid rgba(22, 105, 99, 0.15)` | 12px | `--shadow-soft` |
| `isee` | `.calc-isee .card` | `26px 28px` | `1px solid rgba(22, 105, 99, 0.15)` | 12px | `--shadow-soft` |
| `semplice-vs-composto` | `.calc-svc .card` | `26px 28px` | `1px solid rgba(22, 105, 99, 0.15)` | 12px | `--shadow-soft` |
| `pensione-integrativa` | nessun `.card`, ha invece `.form-container`, `.results-section` (`padding: 40px 45px`), `.side-disclaimer` | varî | varî | 8px | dipende |

**Divergenze:**
- `interesse-composto` ha `padding: 28px 30px` mentre i 5 fratelli hanno `padding: 26px 28px`. Differenza di 2px, ma sistematica.
- `pensione-integrativa` non usa il pattern `.card` ma una struttura ad-hoc (`.form-container`, `.results-section`, `.side-disclaimer`). **Va riscritto adottando il pattern `.card`.**
- Nessun calcolatore usa `rounded-2xl` (16px) come da brief. Tutti hanno radius 12px (i 6 fratelli) o 8px (pensione). Da decidere se 12px è il valore canonico (tendo a sì) o se forzarlo a 16px (`rounded-2xl`).

### 2.2 Naming dei root selectors (problema di ergonomia)

Ogni calcolatore ha un nome di prefisso diverso e arbitrario:

| File | Root selector |
|---|---|
| `interesse-composto` | `.calc-ic` |
| `mutuo` | `.calc-mu` |
| `rendimento-obbligazioni` | `.calc-ob` |
| `rendita` | `.calc-rd` |
| `isee` | `.calc-isee` |
| `semplice-vs-composto` | `.calc-svc` |
| `pensione-integrativa` | `.calc-wrapper` (anomalia) |

**Implicazione:** ogni stile è duplicato per 7 prefissi diversi. Non si può scrivere `.calc-card { ... }` una sola volta in un foglio condiviso. Refactor opzioni:
- (A) introdurre una root class condivisa `.calc` e tenere i prefissi attuali solo dove serve scopo (es. animazioni specifiche)
- (B) eliminare i prefissi e usare classi semantiche globali (`.calc-card`, `.calc-input`, ecc.) con CSS condiviso

---

## 3. TIPOGRAFIA

### 3.1 H1 (calc-header h1)

| File | font-size | font-family | font-weight | letter-spacing |
|---|---|---|---|---|
| `pensione-integrativa` | `clamp(1.6rem, 3.5vw, 2.1rem)` | `var(--aw-font-heading, 'Manrope', sans-serif)` | 600 | -0.01em |
| `interesse-composto` | `clamp(1.7rem, 3.6vw, 2.2rem)` | idem | 600 | -0.01em |
| `mutuo` | `clamp(1.7rem, 3.6vw, 2.2rem)` | idem | 600 | -0.01em |
| `rendimento-obbligazioni` | `clamp(1.7rem, 3.6vw, 2.2rem)` | idem | 600 | -0.01em |
| `rendita` | `clamp(1.7rem, 3.6vw, 2.2rem)` | idem | 600 | -0.01em |
| `isee` | `clamp(1.7rem, 3.6vw, 2.2rem)` | idem | 600 | -0.01em |
| `semplice-vs-composto` | `clamp(1.9rem, 4vw, 2.6rem)` | `var(--aw-font-serif, 'Playfair Display', Georgia, serif)` | 600 | -0.02em |

**Divergenze:**
- 5 fratelli concordano su `clamp(1.7rem, 3.6vw, 2.2rem)`.
- `pensione-integrativa` è leggermente più piccolo.
- `semplice-vs-composto` è volutamente più grande e usa serif (eccezione narrativa, Fase 4).

### 3.2 Card-title (H2 dentro le card)

5 fratelli concordano:
```css
font-size: 1.15rem; font-weight: 600; color: var(--sage-dark);
font-family: var(--aw-font-heading, 'Manrope', sans-serif);
margin: 0 0 18px; letter-spacing: -0.01em;
```

`interesse-composto` ha `margin: 0 0 20px` (vs `18px`). Differenza minima ma rilevabile.
`pensione-integrativa` non ha `.card-title` (struttura diversa).

### 3.3 Chart-card title (titolo card del grafico)

Tutti i 6 fratelli (mu, ic, ob, rd, isee, svc) lo dichiarano in serif:
```css
.calc-XX .chart-card .card-title {
  font-family: var(--aw-font-serif, 'Playfair Display', Georgia, serif);
  font-size: 1.3rem;
  font-weight: 600;
  ...
}
```

**Bug:** `--aw-font-serif` è Manrope (vedi §0.2), quindi il "serif elegante" voluto NON appare. Va in fallback Georgia su browser/OS che non hanno Playfair installato. Risultato: alcune macchine vedono Georgia, altre vedono Manrope. Inconsistenza cross-device.

### 3.4 CTA-section h2 (titolo finale "Vuoi una consulenza?")

| File | font-size | Note |
|---|---|---|
| `interesse-composto` | `clamp(1.9rem, 4vw, 2.4rem)` | Più grande |
| `mutuo` | `clamp(1.5rem, 3.5vw, 1.85rem)` | Più piccolo |
| `rendimento-obbligazioni` | `clamp(1.5rem, 3.5vw, 1.85rem)` | Idem |
| `isee` | `clamp(1.5rem, 3.5vw, 1.85rem)` | Idem |
| `rendita` | `clamp(1.85rem, 4.2vw, 2.4rem)` | Più grande |
| `semplice-vs-composto` | `clamp(1.5rem, 3.5vw, 1.95rem)` | Lievemente diverso |
| `pensione-integrativa` | `1.85rem` (no clamp) | Statico |

**Divergenze:** ogni calcolatore ha la sua dimensione, vanno uniformati.

### 3.5 Numeri risultato grandi (result-value-xl)

5 fratelli (ic, mu, ob, rd, isee) concordano: `clamp(1.7rem, 3.6vw, 2.1rem)`.
`semplice-vs-composto` ha 3 dimensioni distinte per i suoi atti narrativi: `clamp(1.7rem, 3.6vw, 2.1rem)` per il classico + clamp più grandi per gli atti (Fase 4 - eccezione).
`pensione-integrativa` ha numeri inline con dimensioni varie.

---

## 4. INPUT FORM

### 4.1 Input text/number

| File | padding | border | radius | font-size | focus |
|---|---|---|---|---|---|
| `interesse-composto` | `11px 14px` | `1.5px solid var(--gray-soft)` | 8px | `0.95rem` | `border emerald + box-shadow rgba(0,166,82,0.15)` |
| `mutuo` | `10px 12px` | idem | 8px | `0.95rem` | idem |
| `rendimento-obbligazioni` | `10px 12px` | idem | 8px | `0.95rem` | idem |
| `rendita` | `11px 12px` | idem | 8px | `0.95rem` | idem |
| `isee` | `10px 12px` | idem | 8px | `0.95rem` | idem |
| `semplice-vs-composto` | `10px 12px` | idem | 8px | `0.95rem` | idem |
| `pensione-integrativa` | `11px 14px` | idem | **6px** | `0.97rem` | **solo border, no shadow** |

**Divergenze:**
- 4 fratelli concordano su `10px 12px`. `interesse-composto` e `pensione-integrativa` su `11px 14px`. `rendita` su `11px 12px`.
- `pensione-integrativa` ha radius 6px (vs 8px), font 0.97rem (vs 0.95rem), focus diverso.

### 4.2 input-with-suffix padding-right

| File | padding-right |
|---|---|
| `mutuo`, `isee`, `svc` | `60px` |
| `rendimento-obbligazioni` | `42px` |
| `rendita` | `36px` |
| `interesse-composto` | `36px` |

**Divergenze:** ogni file decide il padding-right del suffisso a occhio in base al simbolo. Da unificare: scegliere una convenzione (es. `48px` per `€`/`%`, `60px` per testo lungo come `€/anno`).

### 4.3 Range inputs (slider)

I 5 fratelli che hanno slider (mu, ic, ob, rd, svc) usano lo stesso pattern:
```css
height: 6px;
::-webkit-slider-thumb { width: 22px; height: 22px; background: var(--emerald); ... }
```

`semplice-vs-composto` Atto 2 ha uno slider "drammatico": `height: 10px`, thumb `30x30`. **Eccezione voluta (Fase 4).**

### 4.4 Radio button accent-color

- `pensione-integrativa`: `accent-color: var(--sage)` ⚠️
- TUTTI altri: `accent-color: var(--emerald)`

**Divergenza:** pensione usa sage per radio/checkbox, tutti gli altri emerald.

---

## 5. BOTTONI

### 5.1 .btn-primary

5 fratelli (ic, mu, ob, rd, isee, svc) concordano:
```css
background: var(--sage); color: var(--ivory);
:hover { background: var(--sage-dark); }
```
con `padding: 13px 28px; border-radius: 8px; font-size: 0.95rem; font-weight: 600; min-height: 48px`.

`pensione-integrativa`:
```css
background: var(--sage); color: var(--ivory);  // OK
:hover { background: var(--sage-dark); }       // OK
border-radius: 6px;                            // ❌ 6px vs 8px
font-size: 0.93rem;                            // ❌ 0.93 vs 0.95
```
+ ha un terzo bottone `.btn-cta` (background ochre) che gli altri non hanno.

### 5.2 Index hub (`index.astro`)

L'hub usa Tailwind:
```html
<a class="px-8 py-4 bg-[var(--aw-color-primary)] hover:bg-[var(--aw-color-secondary)] text-white font-semibold rounded-sm transition-all hover:shadow-lg font-heading">
```
- `rounded-sm` (4px) vs 8px nei calcolatori.
- `font-semibold` (600) come i calcolatori, OK.
- `hover:bg-[var(--aw-color-secondary)]` (sage-light) vs `hover:bg-var(--sage-dark)` nei calcolatori. **Comportamento hover invertito** (l'hub schiarisce, i calcolatori scuriscono).

### 5.3 Stati focus

- Calcolatori: tutti definiscono `:focus-visible` con `outline: 2px solid var(--emerald)` su summary/details, ma sui bottoni il focus è ereditato dall'input/anchor di default browser.
- Hub: nessuno stato focus esplicito.

**Divergenza generale:** non c'è uno stato focus ben definito, accessibile e uniforme per i bottoni primari.

---

## 6. GRAFICI CHART.JS

### 6.1 Palette colori

Ogni file definisce il proprio oggetto `COLORS` con hex hardcoded:

| File | Tipo | Colori |
|---|---|---|
| `mutuo` | piano ammortamento | `interessi: '#00A652'`, `capitale: '#79B9AD'` |
| `interesse-composto` | crescita capitale | `iniziale: '#79B9AD'`, `versamenti: '#373D42'`, `interessi: '#00A652'` |
| `rendimento-obbligazioni` | breakeven/valore | `breakeven: '#373D42'`, `valore: '#00A652'` |
| `rendita` | scenari | `emerald: '#00A652'`, `sage: '#166963'`, `sageLight: '#79B9AD'`, `ochre: '#AB7F62'`, `ochreDark: '#8A6449'`, `charcoal: '#373D42'`, `grayText: '#6B7672'`, **`red: '#c0392b'`** |
| `isee` | composizione/scenari | inline per dataset: `'#373D42'`, `'#166963'`, `'#00A652'`, `'#AB7F62'` |
| `semplice-vs-composto` | linee + atti | `semplice: '#79B9AD'`, `composto: '#00A652'`, `compostoArea: 'rgba(0, 166, 82, 0.15)'`, `sageDark: '#0F4F4A'`, `ochre: '#AB7F62'`, `charcoal: '#373D42'` |

**Divergenze:**
- Stessi 5-6 hex code ricorrono ma in 6 oggetti diversi.
- Naming inconsistente: `interessi`/`emerald`/`composto` puntano tutti a `#00A652` ma con 3 nomi diversi.
- `rendita` introduce un rosso `#c0392b` non brand.

### 6.2 Tooltip styling Chart.js

Tutti i 6 fratelli hanno un blocco tooltip molto simile:
```js
{
  backgroundColor: '#FFFFFF',
  borderColor: 'rgba(22, 105, 99, 0.25)',
  borderWidth: 1,
  titleColor: '#0F4F4A',
  titleFont: { family: 'Manrope, sans-serif', weight: 700, size: 13 },
  bodyColor: '#373D42',
  bodyFont: { family: 'Manrope, sans-serif', size: 12 },
  padding: 12,
  cornerRadius: 8,
  ...
}
```

5 fratelli aggiungono `footerColor`, `footerFont`. Le piccole differenze (cornerRadius, padding) variano ±2px senza ragione.

**Da estrarre in `chart-theme.ts` come `TOOLTIP_DEFAULTS`.**

### 6.3 Animazioni

| File | Prima render | Update |
|---|---|---|
| `mutuo` | `{ duration: 600, easing: 'easeOutQuart' }` | disabilitata via `animation: false` post-rAF |
| `rendita` | varie | varie |
| `isee` | `{ duration: 500 }` | nessuna |
| `semplice-vs-composto` (classic) | `{ duration: 1500 }` | disabilitata post-rAF |
| `semplice-vs-composto` (race) | animazione manuale via `setTimeout` (4500ms totali) | replay esplicito |

**Divergenze:** durata animazione iniziale tra 500 e 1500ms. **Standardizzare a 600ms per tutti i grafici "normali" + 1500ms per quello narrativo (svc classic) + 4500ms per svc race chart (eccezione).**

### 6.4 Heights chart-wrap

| File | Desktop | Mobile |
|---|---|---|
| `mutuo` | 380px | 280px |
| `interesse-composto` | 380px | 280px |
| `rendimento-obbligazioni` | 380px | 280px |
| `rendita` | 380 (default) / 320 secondary / 360 cliff | 320 / 240 / 320 |
| `isee` | 130 stacked / 320 scenari | 260 |
| `semplice-vs-composto` | 360 classic / 380 atto | 280 / 300 |

**Convenzione emergente:** standard 380/280. `isee` e `svc` hanno casi specifici legittimi (stacked bar piccola, race chart più alto). Da formalizzare le 2-3 dimensioni canoniche.

### 6.5 Grid line color

Tutti i fratelli usano `rgba(22, 105, 99, 0.1)` o `0.12` o `0.15` per griglia. Tre valori diversi. **Standardizzare a uno (suggerisco `0.1`).**

---

## 7. SPAZIATURE

### 7.1 Padding root container

Tutti uniformi:
```css
padding: 40px 20px 60px;  /* desktop */
padding: 25px 16px 40px;  /* @media (max-width: 880px) */
```

### 7.2 Spacing tra sezioni

I `<section class="card">` hanno `margin-bottom: 30px` o `24px`. Divergenze:
- `mutuo`, `ic`, `ob`: `margin-bottom: 30px` (chart-card)
- `isee`: `margin-bottom: 24px`
- `svc`: `margin-bottom: 24px`
- `rd`: `margin-bottom: 30px`

### 7.3 Main-grid gap

Tutti: `gap: 24px`. Uniforme. ✓

### 7.4 Form-row-2 gap (riga a 2 colonne)

| File | gap |
|---|---|
| `mutuo`, `ic`, `ob`, `rd`, `isee`, `svc` | `14px` |
| `pensione-integrativa` | non usa form-row-2 |

Uniforme nei 6 fratelli. ✓

### 7.5 Form-group margin-bottom

| File | mb |
|---|---|
| Mutuo, ic, ob, rd, isee, svc | `16px` |
| Pensione-integrativa | `22px` |

---

## 8. ANIMAZIONI E TRANSIZIONI

### 8.1 Durate transizioni input/btn

- Calcolatori (6 fratelli): `transition: border-color 0.18s ease, box-shadow 0.18s ease;`
- Pensione-integrativa: `transition: border-color 0.2s ease;` (solo border)
- Hub Tailwind: `transition-all duration-300` (300ms vs 180ms)

**Divergenza:** 180ms vs 200ms vs 300ms sui transition.

### 8.2 Animazione fade della pagina

`tailwind.config.js` definisce `animation.fade: 'fadeInUp 1s both'`. Solo l'hub e qualche pagina del sito la usano. I calcolatori non la invocano. Coerente con la natura "applicativa" dei calcolatori (non narrativa eccetto svc).

---

## 9. LAYOUT E STRUTTURA

### 9.1 Max-width

- Calcolatori: `max-width: 1200px` ovunque (uniforme).
- Hub: `max-w-6xl` (1152px) per griglia, `max-w-3xl` (768px) per CTA, `max-w-4xl` (896px) per hero.

**Divergenza:** calcolatori più larghi di tutto il resto del sito.

### 9.2 Pattern 2-colonne

5 fratelli (mu, ic, ob, rd, isee, svc): `grid-template-columns: 1fr 1fr; gap: 24px`. Uniforme.
Pensione-integrativa: `1fr 2fr 1fr` (3 colonne) con disclaimer laterali. **Pattern unico.**

### 9.3 Sezione "Come funziona"

Tutti i fratelli hanno un `<details class="math-details">` collassabile. Pattern uniforme. ✓ ottima.
Pensione-integrativa lo ha statico (non collassabile). **Divergenza.**

### 9.4 CTA finale

Tutti i fratelli hanno la struttura:
```
<section class="cta-section">
  <div class="eyebrow">...</div>
  <h2>...</h2>
  <p>...</p>
  <div class="cta-buttons">
    <a class="btn btn-primary">Prenota una consulenza</a>
    <a class="btn btn-secondary">Torna ai calcolatori</a>
  </div>
</section>
```
Pattern uniforme. ✓

Pensione-integrativa ha invece un form di contatto inline + CTA: pattern diverso.

### 9.5 Disclaimer finale

Tutti i fratelli hanno `<div class="final-disclaimer">` con stile uniforme:
```css
background: var(--ivory-warm);
border-left: 3px solid var(--ochre);
border-radius: 4px;
padding: 18px 22px;
font-size: 0.82rem;
color: var(--gray-text);
```

Pensione-integrativa ha disclaimer come paragrafo separato senza wrapper. **Da uniformare.**

---

## 10. CONTENT PATTERN

### 10.1 Pattern hero (calc-header)

Tutti uniformi:
```html
<header class="calc-header">
  <h1>...</h1>
  <p>...</p>
</header>
```

### 10.2 Banner informativi

- `isee`: ha `.info-banner` (sfondo sage chiaro) per "Aggiornato alla normativa 2026". **Eccezione voluta (Fase 4).**
- Altri calcolatori: nessun banner.

### 10.3 Atti narrativi

Solo `semplice-vs-composto` ha gli atti narrativi (ivory, emerald-chiaro, ochre-chiaro, charcoal-scuro). **Eccezione voluta (Fase 4).**

---

## 11. SOMMARIO DELLE DIVERGENZE PER PRIORITÀ

### Priorità ALTA (impatto visivo immediato)
1. ⚠️ **`pensione-integrativa.astro` ha pattern strutturale completamente diverso** dagli altri 6 (root selector, no `.card`, no `.card-title`, radius 6/8px, focus diverso, btn diverso). **Refactor pesante necessario.**
2. ⚠️ **Hub `index.astro` usa pattern Tailwind diverso dai calcolatori** + bg `#F5F1E8` (CLAUDE.md, non sito). **Decidere se uniformare l'hub al sito o ai calcolatori.**
3. ⚠️ **CLAUDE.md ha palette obsoleta** che induce in errore. Va aggiornato a fine refactor.
4. ⚠️ **Fraunces installato ma non caricato**: i `var(--aw-font-serif, 'Playfair Display', …)` falliscono in fallback Georgia. Decidere (A) Manrope ovunque o (B) caricare Fraunces.
5. ⚠️ **Rogue colors in pensione-integrativa** (8+ hex non brand): bg verdi, rossi error, beige.
6. ⚠️ **Rosso `#c0392b` in `rendita`** per scenari "aggressivo": eccezione voluta ma il rosso non è in palette brand.

### Priorità MEDIA (impatto sull'uniformità interna)
7. **Padding card disuniforme** (`28x30` vs `26x28`): 1 file (`ic`) discorda.
8. **Padding input disuniforme** (`10x12` vs `11x14` vs `11x12`): 3 valori diversi.
9. **input-with-suffix padding-right** (36/42/60px): 3 valori diversi senza criterio.
10. **CTA-section h2 size** ha 5 dimensioni diverse tra i 7 calcolatori.
11. **Chart-wrap heights** non centralizzati (5 valori diversi).
12. **Tooltip Chart.js duplicato** in 6 file (~300 righe duplicate totali).
13. **Animation duration** Chart.js (500/600/1500ms): 3 valori diversi.
14. **Grid line color Chart.js** (`rgba(22,105,99,0.1)` vs 0.12 vs 0.15).
15. **Naming root selectors** (`.calc-mu`, `.calc-ic`, `.calc-wrapper`, ecc.) impedisce il riuso CSS.

### Priorità BASSA (cosmetica, da risolvere col refactor)
16. `--radius: 8px` in pensione vs `12px` ovunque.
17. `accent-color: var(--sage)` in pensione (radio) vs `--emerald` ovunque.
18. Margin card-title: 18px vs 20px (1 file).
19. `--shadow-card` aggiuntivo solo in svc.
20. Differenze 1-2px qua e là.

### Priorità ALTA (funzionali, NON dovrebbero esistere)
21. **Tooltip backgroundColor `#FFFFFF` hardcoded** invece di un token: in dark mode (se mai introdotto) sarebbe sbagliato. Va via via centralizzato.

---

## 12. ECCEZIONI VOLUTE DA PRESERVARE (Fase 4)

Le seguenti sono **scelte di comunicazione documentate**, NON divergenze:

1. **`semplice-vs-composto`**:
   - 4 atti con sfondi diversi (ivory, emerald-bg, ochre-bg, charcoal-bg)
   - H1 più grande in serif (clamp 1.9–2.6rem)
   - Numeri "time machine" giganti
   - Slider drammatico (10px tracker)
   - Animazione race chart 4500ms
   - **Tutti questi pattern usano gli stessi token brand**, solo combinati per espressività narrativa.

2. **`rendita`**:
   - Bordo ochre vistoso sul cliff chart
   - Badge rosso `#c0392b` per scenari "aggressivo"
   - **Suggerimento Fase 2:** centralizzare un token `--alert-red` (es. `#c0392b` o variante) per usi futuri.

3. **`isee`**:
   - Banner sage chiaro "Aggiornato alla normativa 2026"
   - **Eccezione voluta**, è informazione contestuale.

---

## 13. PROPOSTE PER LA FASE 2

In base a questo audit, le decisioni-chiave da prendere prima di scrivere codice:

### Decisione D1 — Approccio CSS
- (A) **CSS-vars condivise + classi semantiche** (`.calc-card`, `.calc-input`, `.calc-btn-primary`) in un foglio globale. I calcolatori importano. Mantengo lo stile attuale, lo deduplico e centralizzo.
- (B) **Tailwind utility-first** uniformato all'hub (rounded-sm 4px, font-heading, var(--aw-color-*)). Riscrittura più pesante, allinea calcolatori al resto del sito.
- (C) Ibrido: `@apply` Tailwind in classi semantiche.

### Decisione D2 — Tipografia heading
- (A) **Tutto Manrope.** Rimuovo i `var(--aw-font-serif, 'Playfair…')` dai calcolatori. Coerente con `CustomStyles.astro` attuale.
- (B) **Aggiungo Fraunces** in `CustomStyles.astro`, lo uso per `--aw-font-heading` o un nuovo `--aw-font-serif`. Coerente con CLAUDE.md aspirazionale.

### Decisione D3 — Radius/dimensioni canoniche
- Card radius: **12px** (proposta) o 16px (`rounded-2xl` brief) o 4px (`rounded-sm` hub)
- Input padding: **`10px 12px`** (proposta, è la maggioranza)
- input-with-suffix padding-right: **48px** uniforme (proposta)
- Btn radius: **8px** (proposta, maggioranza)

### Decisione D4 — Hub
- Aggiorno l'hub al pattern dei calcolatori (rounded 12px, font-weight 600, bg-cream sito) **oppure** lascio l'hub al pattern Tailwind del sito e adeguo solo i calcolatori.

### Decisione D5 — Pensione-integrativa
- Refactor totale per allinearlo agli altri 6 (richiede più tempo, ma è dovuto).
- Non posso "uniformarlo a metà": va riscritto per pattern.

### Decisione D6 — Token rosso "alert"
- Introduco `--alert-red: #c0392b` (e lo dichiaro come token per stati aggressivi/error nei calcolatori) **oppure** sostituisco con sfumature di ochre.

### Decisione D7 — Index.astro hub bg
- Sostituisco `bg-[rgb(245_241_232)]` (#F5F1E8 di CLAUDE.md) con `bg-[rgb(238_247_246)]` (#EEF7F6 del sito) o con la classe `.bg-cream` esistente.

### Decisione D8 — CLAUDE.md
- Aggiornare la sezione "Identità visiva" del CLAUDE.md con i token effettivi del sito (o mantenerla aspirazionale e specificare che la palette in `CustomStyles.astro` è quella reale).

---

## 14. CHECKLIST DI PRIORITÀ AL REFACTOR

Lavoro stimato per categoria (ordine consigliato dei commit):

- [ ] **Step 0** — Decisioni D1–D8 con il committente.
- [ ] **Step 1** — Bug `index.astro`: sostituire `#F5F1E8` con `#EEF7F6` (commit "fix(calcolatori-hub): align ivory bg to site token").
- [ ] **Step 2** — Creare `src/styles/calcolatori-tokens.css` (palette + radius + shadow + spacing) e `src/lib/calcolatori/chart-theme.ts` (commit Fase 2).
- [ ] **Step 3** — Refactor calcolatore per calcolatore (in ordine di "facilità"):
   1. `interesse-composto.astro` (pochi rogue, padding `28x30`→`26x28`).
   2. `mutuo.astro` (poco da modificare).
   3. `rendimento-obbligazioni.astro` (poco da modificare).
   4. `rendita.astro` (rogue rossi da centralizzare).
   5. `isee.astro` (banner OK, qualche pulizia chart).
   6. `semplice-vs-composto.astro` (eccezioni narrative da preservare).
   7. `pensione-integrativa.astro` (refactor pesante).
- [ ] **Step 4** — Allinea hub al sistema scelto.
- [ ] **Step 5** — Verifica accessibilità (focus, aria-live, contrasto).
- [ ] **Step 6** — Aggiorna CLAUDE.md.
- [ ] **Step 7** — Push.

---

## 15. CONFERMA DI BLOCCO

Come da brief Fase 1, **non procedo alla Fase 2** finché non confermi:

1. Il report ti sembra completo e accurato.
2. Quale opzione scegliere per **D1, D2, D3, D4, D5, D6, D7, D8**.
3. (Opzionale) Eventuali divergenze che ti sembrano importanti e che non ho catturato.

Se vuoi che approfondisca un punto specifico (es. estrazione completa di tutti i token Chart.js per file, mappa pixel-perfetto delle differenze input, ecc.) lo faccio prima del refactor.
