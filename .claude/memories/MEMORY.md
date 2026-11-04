# Memoria — andrea-giardini

## Sotto-Progetti Attivi

<!-- Nessun sotto-progetto registrato. Vengono creati solo su richiesta esplicita. -->

## Note Generali

<!-- Informazioni durature sul workspace che non appartengono a una singola giornata. -->

---

## 2026-11-04
**Tasks**:
**Keywords**: restyle-home, home-a-fasce, branch-restyle-home, palette-sage-ochre, playfair
**Riassunto**: Restyle a fasce (home, /consulenza, /servizi, /blog, /contatti) sul branch `restyle-home`, poi unito in fast-forward su `main` e pubblicato (`b4d9df2`). Restano molti [TODO] di contenuto e la variabile `PUBLIC_WEB3FORMS_KEY` su Cloudflare.

### Dettaglio

#### (senza task)
- Nuovi componenti in `src/components/home/`; la home usa `Layout.astro` diretto (header/footer propri), le altre pagine restano su `PageLayout`.
- Palette home aggiunta a Tailwind (`sage`, `ochre`, `ochre-dark`, `ivory`, `linen`, `charcoal`, `emerald-brand`); `cream` evitato perché collide con `section.bg-cream` di CustomStyles.
- Installato `@fontsource/playfair-display` (solo header home).
- Immagini/loghi caricati automaticamente se presenti (`src/utils/home-assets.ts`), altrimenti segnaposto [TODO].
- Lavoro non mio già presente nel working tree (pagine eliminate/modificate su `fix/button-alignment-main`) lasciato fuori dal commit.
- Pagina `/consulenza` (commit `331780d`): parti comuni estratte in `src/components/site/` (`SiteLayout`, `SiteHeader`, `SiteFooter`, `SectionTitle`, `Placeholder`); menu con ancore assolute (`/#...`) e voce attiva per pathname fuori dalla home.
- Pagina `/servizi` (`src/pages/servizi/index.astro`, commit `ec86d27`): estratti `site/Pillar`, `site/PillarGrid`, `site/CtaBand` (rimosso `consulenza/Pilastri`); voci specializzazioni della home linkano a `/servizi#investimenti` e `/servizi#patrimonio`. Sottopagine `servizi/*.astro` hanno modifiche preesistenti non mie, lasciate fuori dai commit.
- Pagine `/blog` (lista + singolo post) e `/contatti` rifatte (commit `9cb4d93`): form Web3Forms via `site/Web3Form` + `site/FormField` + `src/scripts/web3form.ts`, chiave da `PUBLIC_WEB3FORMS_KEY` (`.env` locale non versionato; va impostata anche su Cloudflare Pages). Ricerca blog client-side su `<template>` con tutti i post; 9 post/pagina. Dati ufficio centralizzati in `siteOffice` (`navigation.ts`). ContactPoint aggiunto in `StructuredData.astro`, file ancora untracked dell'utente, non committato.
- Dati reali (commit `ecddfc1`): email agiardini@fideuram.it, P.IVA 13494670014, ufficio Via Agostino Tolosano 88 Faenza, LinkedIn, Area clienti alfabeto.fideuram.it. Consenso cookie proprio (`site/CookieConsent` + `scripts/consent.ts`, chiave `gc-consent`, 6 mesi): Calendly e Google Maps solo dopo consenso. Pagine legali riscritte con `site/LegalPage`.
- Restyle desktop + palette dai colori del logo Fideuram (verde #006937, arancio #E04403 → token `brand`, `ember`, `sand`), pubblicato su main (`d0ac248`). Rimosse fascia consulente+cliente, screenshot piattaforma, case di gestione. Mancano `servizi-patrimonio.jpg` e `fideuram-logo-white.svg`.
- Ramo `imprese` (push solo del ramo, non su main): fascia imprenditori in home + pagina `/imprese`; nuovi `site/SplitHero` e `site/IconGrid` (riusati da hero e specializzazioni home). Regole di linguaggio imprese: niente offerta/soluzioni/garantire/subito ecc. (formule legali OCF escluse).
- Insidia: un vecchio `astro dev` può restare acceso su 4322: verificare la porta reale di `npm run preview` prima di testare.
- Insidia: in produzione gli script possono perdere il primo `astro:page-load` → usare `onPageLoad` (`src/scripts/page-load.ts`).
- Insidia ricorrente: classi `flex`/`grid`/`block` annullano l'attributo `hidden` → usare `[&:not([hidden])]:flex`.

---

## 2026-08-13
**Tasks**:
**Keywords**: inizializzazione-workspace, setup-globale, struttura-standard
**Riassunto**: Workspace inizializzata alla struttura standard delle regole globali. Creati `.claude_interactions/` e le sottocartelle di `.claude/`, generato il mirror `setup-globale/`.

### Dettaglio

#### (senza task)
- Inizializzazione additiva: nessun file preesistente e stato spostato o eliminato. La `.claude/` conteneva solo `grounded-memory.json`, lasciato al suo posto.
- Mirror `setup-globale/` allineato al manifest globale con timestamp `2026-08-13 12:58`.

---

## Storico pre-daily

<!-- Vuoto: la workspace nasce gia con la struttura per giornate. -->
