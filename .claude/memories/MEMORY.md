# Memoria — andrea-giardini

## Sotto-Progetti Attivi

<!-- Nessun sotto-progetto registrato. Vengono creati solo su richiesta esplicita. -->

## Note Generali

<!-- Informazioni durature sul workspace che non appartengono a una singola giornata. -->

---

## 2026-11-06
**Tasks**:
**Keywords**: vademecum-fideuram, compliance, logo-firma, qualifica, paternita, og-v4, icone-v3
**Riassunto**: Sito reso conforme al Vademecum comunicazione Fideuram (branch `compliance-vademecum`, 10 commit, unito in main `b10454c`). Tolti logo AG, logo Fideuram e loghi OCF/IVASS; qualifica uniforme; dicitura di paternità; testi riformulati in chiave di metodo.

### Dettaglio

#### (senza task)
- Regole Vademecum R1–R9 (qualifica, loghi, paternità, contenuti vietati, prodotti, fonti, nomi nei domini/URL, contatti, foto) valgono per ogni modifica futura ai testi.
- `src/components/LogoFirma.astro`: se esiste `public/logo-firma.svg|png` lo mostra, altrimenti fallback testuale (Playfair + "Consulente Finanziario di Fideuram"). Usato in header, menu mobile, footer.
- Formule qualifica centralizzate in `siteQualifica` (`navigation.ts`): `estesa` / `breve`. Titoli pagina "— Consulente Finanziario di Fideuram".
- Icone v3 provvisorie (cerchio verde #006837) da `npm run icons`; v2 → 301 alle v3. Eliminati `logo.png`, `logo-ag.png`, `fideuram-logo.svg`, `public/images/certificazioni/`, `scripts/brand-assets.mjs` e lo script npm `brand`.
- Anteprima social `og-home-v4.jpg` solo testo (`npm run og`); v2/v3 → 301.
- Restano aperti: logo firma ufficiale, icone social (dubbio), form ed email verso casella aziendale, foto ufficio con documenti sulla scrivania da verificare.

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
- Anteprima social (`3b85be0`, su main): `scripts/og-image.mjs` (`npm run og`) genera `public/og/og-home-v2.jpg` con sharp; Pango legge solo TTF → lo script converte i WOFF di @fontsource in TTF. `adaptOpenGraphImages` lascia invariate le immagini in public/. `logo-nuovo.svg` non ancora fornito (OG usa monogramma AG, favicon invariati).
- Pages CMS + logo AG (`363783b`, su main): `.pages.yml` (Articoli su src/data/post, media public/images/blog); `Image.astro` serve i file di public/ senza ottimizzarli (`publicFileOptimizer`); slug articoli senza data; pagina articolo con ShareBar, sommario, barra lettura. `npm run brand` genera favicon/icone/`logo-ag.png` da `logo.png`. Anteprima social ora `og-home-v3.jpg`.
- Pulizia versione vecchia (`f0b9752`/`c800f86`): restano solo /, /consulenza, /servizi, /imprese, /blog, /contatti, /privacy-policy (ex /privacy), /cookie-policy, /note-legali (tenuta per obblighi legali), 404. Redirect 301 in `public/_redirects`. Eliminati calcolatori, glossario, vecchie pagine, widget AstroWind, Calendly. L'utente usa già Pages CMS (commit "via Pages CMS" su main): fare sempre fetch/pull prima di unire. `src/data/post/.gitkeep` tiene la cartella.
- Form/email (`8f68e7c`): `PUBLIC_WEB3FORMS_KEY` impostata via API su Pages (Production+Preview) con token Wrangler (scope pages:write, zone:read). Email resa da `site/EmailLink` (composta via JS) contro l'email obfuscation di Cloudflare. Web3Forms blocca curl e HeadlessChrome: per i test usare UA override.
- Icone v2 (`19c5521`): `npm run icons` (scripts/icons.mjs) genera favicon-v2.svg/ico, favicon-32-v2, apple-touch-icon-v2, icon-192/512-v2, maskable, mask-icon-v2, site-v2.webmanifest da `logo-ag.png`; `npm run brand` ora genera solo logo-ag.png. Vecchi nomi icone → 301 ai v2. Token Wrangler non può fare purge cache né toccare impostazioni zona.
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
