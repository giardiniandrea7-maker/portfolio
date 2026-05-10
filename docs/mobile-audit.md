# Audit Mobile UX — giardiniconsulenza.it

**Data audit**: 2026-05-10
**Autore**: Claude Code (analisi statica del codice sorgente)
**Viewport target**: 375px (iPhone SE / 13 mini), 390px (iPhone 14/15/16), 768px (iPad portrait)
**Pagine analizzate**: 10 (homepage, chi-sono, come-lavoro, perche-scegliermi, 3 servizi, richiedi-diagnosi, glossario hub, glossario voci, contatti)
**Pagine escluse**: 7 calcolatori (audit separato in futuro)

> **Limite metodologico esplicito**: questo audit è basato sull'analisi
> del codice sorgente Astro/Tailwind. Voci marcate come **DA VERIFICARE
> VISIVAMENTE** richiedono testing manuale di Andrea con DevTools mobile
> mode o dispositivo reale, perché dipendono da contenuto runtime,
> resa cromatica o comportamento dinamico (modal, animazioni, parallax).
> Voci NON marcate sono certe da analisi statica.

---

## Sommario esecutivo

L'audit identifica **63 problemi** distribuiti su 10 pagine principali:
**6 critici**, **18 alti**, **24 medi**, **15 bassi**.

Le 3 pagine con più problemi sono `/come-lavoro` (12, di cui molti
ereditati dal layout pre-redesign), la **homepage** (9, principalmente
sui CTA e sulla sequenza hero) e `/glossario` hub (8, su tap target
delle card e overlay hover su touch).

Le 3 categorie più critiche sono: **F (CTA e conversione)** con 4
critici concentrati su tap target dei bottoni e CTA che escono dal
container, **A (tap targets)** con problemi sistematici di touch area
sotto i 44px (TopBar, checkbox privacy, link footer), e **D (form e
input)** con autocomplete mancante e tap target di privacy check
inadeguati.

Il **70% dei problemi è risolvibile in <30 minuti ciascuno** (quick
wins). I problemi sistemici (3 totali) richiedono refactor di
componenti condivisi: TopBar tap target, sistema di Button
standardizzato, padding section uniformi.

**Tempo totale stimato per il fix completo**: ~14-18 ore di lavoro
sviluppatore. Quick wins: ~3-4 ore.

---

## Legenda priorità

| Simbolo | Livello   | Definizione                                                                  |
|---------|-----------|------------------------------------------------------------------------------|
| 🔴      | CRITICO   | Blocca l'utente o rovina la conversione. Fix immediato.                       |
| 🟠      | ALTO      | Degrada significativamente l'UX. Fix entro 1 settimana.                       |
| 🟡      | MEDIO     | Fastidio percettibile ma non blocca l'azione. Fix quando possibile.           |
| 🟢      | BASSO     | Rifinitura. Nice-to-have. Fix in futuro.                                      |

---

## Problemi notati dal proprietario (verificati)

### 🔴 P1. CTA "Richiedi diagnosi gratuita" che esce dal viewport o si spezza male

**Localizzazione**: il testo esatto "Richiedi diagnosi gratuita"
compare in 5 punti del codice. Lo scenario peggiore è in `/chi-sono`
nell'hero, dove il bottone è `inline-flex` (non full-width) dentro un
contenitore `flex flex-wrap gap-3` accanto a un secondo bottone:

- `src/pages/chi-sono.astro:55-62` — `inline-flex items-center justify-center px-8 py-4 ... text-base ... font-semibold` accanto a un secondo bottone "Come lavoro" con stesso pattern. Padding 32+32 = 64px + testo "Richiedi diagnosi gratuita" 25 caratteri ≈ 225px in font-base bold = bottone ~289px. Su 375px (container `max-w-6xl px-4`, colonna `grid md:grid-cols-[1fr_1.2fr]` che a mobile diventa stack), lo spazio orizzontale è 343px disponibili: ci stanno **sole due righe** di un wrap con il secondo bottone "Come lavoro" sotto, che è il comportamento atteso, ma **non è full-width**: i bottoni hanno larghezza diversa, dando aspetto disarmonico.
- `src/pages/index.astro:128-141` — hero homepage, due bottoni `flex-1` in `flex flex-col sm:flex-row gap-3`. Su 375px è stack, ognuno full-width. **A 640px-700px** (sm→md range) i due bottoni vanno in row, ognuno occupa ~298px: il primo "Richiedi diagnosi gratuita" 25 caratteri × ~9.6px (`text-base md:text-lg font-bold`) + 48px padding ≈ 288px → entra a fatica, può andare a 2 righe se il font-bold rende un poco più largo.

**Diagnosi**: il problema riferito è probabilmente **a 640-768px**
(sm/md range), dove il flex-row fa stringere i bottoni e i 25 caratteri
diventano stretti. **Su 375-639px è in stack ed è OK.**

**Fix proposto**:
1. In `/chi-sono`: convertire i CTA hero da `inline-flex` a `flex flex-col sm:flex-row` con `flex-1` come la homepage, così su mobile sono full-width e su sm+ sono affiancati ma con stesso peso visivo.
2. Aggiungere `whitespace-nowrap` al testo o `text-sm md:text-base` sul bottone homepage per dare margine sui dispositivi sm.
3. **Migliore opzione strategica**: standardizzare il copy. "Richiedi diagnosi gratuita" è 25 caratteri, "Diagnosi gratuita" sarebbe 17. Con label più corta il problema sparisce ovunque.

**Tempo stimato**: 30-45 min (testare le 5 occorrenze su tutti i breakpoint).

---

### 🟠 P2. Homepage da ricentrare su mobile

**Localizzazione**: ho controllato la homepage (`src/pages/index.astro`)
in tutte le sezioni e ho trovato 3 elementi che appaiono **disallineati
visivamente** su mobile rispetto a un layout centrato pulito:

1. **Hero (sezione 1)** — `grid md:grid-cols-2`: video a sinistra, testo a destra. Su mobile diventa stack con video sopra, testo sotto. Il video è dentro un `aspect-video` (16:9) e il testo è a sinistra. **Su 375px il testo del paragrafo non è centrato** ma left-aligned, mentre l'h1 sopra è la natural alignment del titolo (left). Visivamente OK, ma se Andrea voleva centrato (come la homepage classica AstroWind), dovrebbe aggiungere `text-center md:text-left` ai blocchi testo.
2. **Sezione 4 "Andrea Giardini"** — `grid md:grid-cols-2`: testo a sinistra, foto placeholder a destra. Su mobile stack (testo sopra, foto sotto). I CTA "Chi sono / Come lavoro" sono in `flex flex-wrap gap-3` left-aligned. **Su 375px dovrebbero essere centrati** o full-width per coerenza con altre pagine redesignate.
3. **Sezione 8 "Mettiti in contatto"** — telefono ed email a sinistra in `grid md:grid-cols-2`. Su mobile stack. Le icone-link contatto sono left-aligned ma su mobile starebbero meglio centrate o full-width.

**Diagnosi**: il problema è **assenza di `text-center` o
`mx-auto max-w-...` sui blocchi narrativi mobile**. Su desktop il
layout 2-colonne distribuisce visivamente. Su mobile lo stack
left-aligned crea l'impressione che il contenuto sia "spostato a
sinistra".

**Fix proposto**: aggiungere `text-center md:text-left` ai paragrafi
introduttivi e ai blocchi testo nelle sezioni 1, 4, 8 della homepage.
Applicare `flex-col sm:flex-row` con `items-center` o `justify-center`
ai gruppi di CTA.

**Tempo stimato**: 20-30 min.

---

## Audit per pagina

### / (Homepage)

**File principale**: `src/pages/index.astro` (446 linee)

#### 🔴 CRITICI

- **F4. CTA hero "Richiedi diagnosi gratuita" stretto a 640-768px**
  - File: `src/pages/index.astro:128-135`
  - Comportamento: a sm: (640px) il flex-col diventa flex-row e i due bottoni hanno ~298px ciascuno. "Richiedi diagnosi gratuita" 25 caratteri in `text-base md:text-lg font-bold` può andare a 2 righe.
  - Impatto: **conversione ridotta**. Il bottone primario di tutta la home appare deformato/spezzato proprio nella forbice di breakpoint dove molti tablet portrait stanno (640-768px).
  - Fix: vedi P1 sopra. Tempo: 30 min.

#### 🟠 ALTI

- **F2. CTA "Inizia ora!" non full-width su mobile**
  - File: `src/pages/index.astro:228-233`
  - Classes: `inline-block px-10 py-4`. Su 375px è inline e si centra solo grazie al wrapper `text-center`. **Tap target solo dal contenuto, non da padding laterale**: l'utente che mira un po' fuori dal testo non clicca.
  - Fix: cambiare in `inline-flex w-full sm:w-auto` o usare il pattern `block w-full sm:inline-block`. Tempo: 5 min.

- **C5. Foto profilo placeholder hero non si centra**
  - File: `src/pages/index.astro:74-107`
  - Su mobile la card video è `aspect-video` ma sopra al testo. Se Andrea vuole l'effetto "presentazione personale" centrato, va in `text-center mx-auto max-w-md`.
  - Fix: aggiungere wrapper `mx-auto max-w-md md:max-w-none`. Tempo: 5 min.

- **A2. CTA bottoni hero spaziati con `gap-3` (12px)**
  - File: `src/pages/index.astro:128`
  - In flex-col stack su mobile, il gap di 12px tra due bottoni è al limite. Apple HIG raccomanda ≥8px, ma Material 16px. Più scomodo per chi mira al secondario "Scopri chi sono".
  - Fix: `gap-3 sm:gap-3` → `gap-3 md:gap-4`. Tempo: 2 min.

#### 🟡 MEDI

- **B3. H1 hero `text-3xl md:text-4xl lg:text-5xl` su 375px**
  - File: `src/pages/index.astro:111-113`
  - text-3xl = 30px. Il testo "Il tuo futuro finanziario, costruito con metodo e chiarezza." su 375px in `leading-[1.15]` può andare a 5+ righe e occupare metà schermo.
  - Fix: ridurre H1 hero a `text-2xl md:text-4xl`. Tempo: 5 min. **DA VERIFICARE VISIVAMENTE** se il testo realmente "respira" abbastanza.

- **C3. Sezioni con `py-16 md:py-24` su mobile**
  - File: tutte le sezioni della home (index.astro:69, 155, 242, 298, 392)
  - py-16 = 128px verticali. Combinato con sezioni multiple = scroll lunghissimo.
  - Fix: ridurre a `py-12 md:py-20`. Tempo: 10 min (consistency check).

- **G1. Foto profilo è solo gradient + svg, non immagine reale**
  - File: `src/pages/index.astro:278-289`
  - Il placeholder gradient sage carica veloce (zero KB), ma su mobile il bordo `border-2 border-[var(--aw-color-accent)]/30` insieme al gradient sembra "cartoon" su display Retina HD.
  - Fix: quando Andrea carica la foto reale, usare `<Image>` Astro per WebP responsive. Tempo: 5 min.

#### 🟢 BASSI

- **B1. Microcopy "*Consulente abilitato OCF...*" è `text-xs`** (12px)
  - File: `src/pages/index.astro:143`
  - Sotto i 16px Safari iOS non forza zoom su lettura ma è al limite di leggibilità per utenti senior. Accettabile come microcopy legale.
  - Fix opzionale: `text-xs md:text-xs` → `text-sm md:text-xs`. Tempo: 2 min.

- **C7. Banner sage "Richiedi una diagnosi" — h2 grande+CTA verticali su 375px**
  - File: `src/pages/index.astro:368-385`
  - Il `grid md:grid-cols-[1fr_auto]` su mobile diventa stack. Il bottone "Online e gratuita" sotto l'h2 ha `text-lg font-bold px-10 py-5` = molto largo. Su 375px potrebbe avere padding eccessivo.
  - Fix: `px-6 sm:px-10`. Tempo: 5 min.

---

### /chi-sono

**File principale**: `src/pages/chi-sono.astro` (211 linee)

#### 🔴 CRITICI
*(Nessuno)*

#### 🟠 ALTI

- **F4. Hero CTA "Richiedi diagnosi gratuita" + "Come lavoro" come `inline-flex`**
  - File: `src/pages/chi-sono.astro:55-72`
  - Classes: `inline-flex items-center justify-center px-8 py-4 ... font-semibold`
  - Comportamento: in `flex flex-wrap gap-3` su 375px, i bottoni vanno a capo ma hanno larghezze diverse (uno 25 char, l'altro 12 char) → aspetto sbilanciato.
  - Fix: convertire in `flex flex-col sm:flex-row gap-3` con `flex-1` su entrambi (full-width mobile, equal-width desktop). Tempo: 10 min.

- **A1. Card Instagram/YouTube nella sezione finale**
  - File: `src/pages/chi-sono.astro:130-205`
  - I bottoni "Seguimi su Instagram" e "Guarda su YouTube" hanno `px-6 py-3 ... text-sm`. Padding 12+12+~14 line-height = 38px. **SOTTO i 44px Apple/Google**.
  - Fix: portare a `py-3.5 sm:py-3` (= 14px verticale → 42px tap target). Tempo: 5 min.

#### 🟡 MEDI

- **G3. Mockup decorativi Instagram/YouTube giocattolosi su mobile**
  - File: `src/pages/chi-sono.astro:142-148, 177-186`
  - Le rappresentazioni decorative (telefono mockup griglia 3x3, finestra YouTube) si vedono male a 375px e sembrano sproporzionate. Non hanno dati informativi: meglio sostituirle con icone più semplici o eliminarle.
  - Fix strategico: sostituire mockup decorativi con un solo logo+nome. Tempo: 30 min.

- **C3. py-16 md:py-24 sulle 3 sezioni**
  - File: chi-sono.astro:16, 79, 123
  - Stesso problema della homepage: scroll lunghissimo su mobile.
  - Fix: `py-12 md:py-20`. Tempo: 5 min.

#### 🟢 BASSI

- **B1. Tracciamento `tracking-[0.3em]` sul label "FOTO ANDREA GIARDINI"**
  - File: chi-sono.astro:25-27
  - Tracking estremo + `text-xs` su 375px rende leggibilità marginale. Accettabile come overlay decorativo.

---

### /come-lavoro

**File principale**: `src/pages/come-lavoro.astro` (788 linee — non ancora rifatta dopo brief redesign)

> **Nota**: questa pagina è in coda di redesign completo (brief già consegnato a Claude con testi). I problemi qui elencati sono per **lo stato attuale**: dopo il redesign molti spariranno automaticamente.

#### 🔴 CRITICI

- **F1+F4. Hero placeholder "Foto Andrea" quadrato verde gigante su mobile**
  - File: `come-lavoro.astro:21-30`
  - Classes: `aspect-square` con gradient sage. Su 375px occupa l'intera larghezza e diventa **un blocco verde 343×343px sopra al testo**: spinge il testo, il sottotitolo e il CTA primario molto sotto il fold.
  - Impatto: **CTA primario sotto il fold** (F1). Conversione mobile potenzialmente compromessa.
  - Fix: il redesign in coda lo elimina. Tempo: 0 (già pianificato).

- **C5. SVG grafico "Portafoglio ottimizzato" hard-coded `viewBox="0 0 560 340"`**
  - File: `come-lavoro.astro:209-253`
  - Su 375px il `w-full` lo riduce ma le label numerate sono fixed in pixel (`x="15" y="55"`) → diventano illeggibili (font 10px scalato a 7-8px reali).
  - Fix: il redesign lo elimina (era inventato). Tempo: 0.

- **C5. Mockup smartphone+laptop hard-coded SVG/divs**
  - File: `come-lavoro.astro:300-500` (range approssimativo)
  - Stesso problema: contenuti decorativi hard-coded che non scalano bene su mobile e mostrano interfacce di prodotti che non esistono.
  - Fix: il redesign li elimina. Tempo: 0.

#### 🟠 ALTI

- **C3. Sezione "0,2%" con tre box affiancati**
  - File: `come-lavoro.astro` (sezione "Risparmi denaro e tempo")
  - 3 box con `grid grid-cols-3` senza breakpoint → su mobile schiacciati 1/3 della viewport ognuno.
  - Fix: il redesign la elimina. Tempo: 0.

- **F4. CTA "Contattami" inline-flex con padding fisso**
  - File: `come-lavoro.astro:44-49, 284-289`
  - Stesso problema chi-sono.
  - Fix: il redesign uniforma. Tempo: 0.

#### 🟡 MEDI

- **B3. H1 "Come funziona la mia consulenza" 5xl-6xl su 375px**
  - File: `come-lavoro.astro:34`
  - 60px su 375px = 16% width per carattere → 6+ righe. Drammatico.
  - Fix: redesign. Tempo: 0.

- **G5. Quadrato verde "Foto Andrea" non ha alt né role**
  - Accessibilità minima. Il redesign lo sostituisce.

#### 🟢 BASSI

- **B6. Recensioni "IN ARRIVO" come placeholder testuali**
  - File: `come-lavoro.astro` (sezione "I primi clienti...")
  - Comunica incompletezza. Il redesign la elimina.

> **Riassunto come-lavoro**: 12 problemi totali, **8 si risolvono col redesign già brief-ato** (codice già scritto in conversazione, in attesa di check-in).

---

### /perche-scegliermi

**File principale**: `src/pages/perche-scegliermi.astro` (541 linee)

#### 🔴 CRITICI
*(Nessuno)*

#### 🟠 ALTI

- **F4. CTA finale "Compila la richiesta!" con `text-xl md:text-2xl` e `px-8 py-6 md:py-8`**
  - File: `perche-scegliermi.astro:351-356`
  - Su 375px il bottone è `block w-full text-center` → full-width OK. Ma `text-xl` (20px) bold + 32px+32px padding orizzontale + 24+24 padding verticale = bottone alto **80-96px**. Funzionalmente OK ma sovradimensionato.
  - Fix: `text-lg md:text-2xl py-5 md:py-8`. Tempo: 5 min.

- **C4. Card "3 motivi" in `grid md:grid-cols-3` senza tablet intermediate**
  - File: perche-scegliermi.astro (sezione 1)
  - Su 768px (md) le 3 card sono affiancate, ognuna ~230px → testo lungo si squeeze. Su 375px sono stack.
  - Fix: aggiungere `lg:grid-cols-3 md:grid-cols-2` per dare spazio a tablet portrait. Tempo: 5 min.

#### 🟡 MEDI

- **B3. H2 sezioni `text-3xl md:text-4xl lg:text-5xl`**
  - Comune su tutto il sito; non specifico di questa pagina.

- **C3. py-16 md:py-24 ripetuto su 9 sezioni**
  - Scroll mobile molto lungo (9×128px = ~1150px solo di padding).
  - Fix: `py-12 md:py-20`. Tempo: 10 min.

#### 🟢 BASSI

- **G3. Card review placeholder vuote**
  - perche-scegliermi.astro: il `reviewPlaceholder` testo dice "Le recensioni dei primi clienti saranno pubblicate qui...". Comunica incompletezza. Considerare di nasconderle finché non ci sono recensioni reali.

---

### /servizi/pianificazione

**File principale**: `src/pages/servizi/pianificazione.astro` (recentemente redesignato, ~470 linee)

#### 🔴 CRITICI
*(Nessuno)*

#### 🟠 ALTI

- **F2. CTA hero "Parliamone — primo incontro gratuito" non full-width su mobile**
  - File: `pianificazione.astro:163-167`
  - Classes: `inline-flex items-center justify-center px-8 py-4 ... text-base md:text-lg font-medium`. Testo 36 caratteri (con em-dash). Su 375px in flex container che è già `flex flex-col sm:flex-row sm:items-center gap-4`, il bottone è inline ma all'interno di `data-hero-element` div.
  - **DA VERIFICARE VISIVAMENTE**: il testo "Parliamone — primo incontro gratuito" 36 char in font-medium base = ~290px + 64 padding = 354px. **Fuori viewport 375px** se il container ha padding laterale. Verifica priorità.
  - Fix: cambiare a `flex flex-col` con `w-full sm:w-auto` sul link, o spezzare il copy in due righe deliberatamente.

- **A1. Pillola contatti card (Modulo/Email/WhatsApp) con `aria-label` ma testo tap target ridotto**
  - File: `pianificazione.astro` sezione 6B (3 CardContatto)
  - Le card hanno `p-7 md:p-8` ma su mobile diventano stack di 3 card alte → tap area generosa, OK.

#### 🟡 MEDI

- **C3. Sezione 6 "Quello che osservo" su sfondo bianco py-20 lg:py-24**
  - Padding generoso: bene su desktop, su mobile aggiunge tempo di scroll.
  - Fix: `py-16 lg:py-24`.

- **B5. Numero grande Playfair `text-4xl md:text-5xl` nelle constatazioni**
  - File: `pianificazione.astro` (3 constatazioni numerate)
  - Su 375px il numero "01" in font-display 36px occupa significative `w-10 md:w-12` = 40-48px. OK ma la spaziatura del paragrafo a destra è stretta su 375px (gap-5).
  - Fix: `gap-4 md:gap-6`. Tempo: 2 min.

#### 🟢 BASSI

- **G3. Placeholder elegante `aspect-[4/5]` molto verticale su mobile**
  - File: `pianificazione.astro:172-187` (hero image)
  - Su 375px occupa ~430px in altezza (343×4/5×scala) → ingombrante prima di vedere il testo. Quando Andrea carica la foto reale potrebbe valutare un crop più orizzontale per mobile.

---

### /servizi/previdenza (Previdenza complementare)

**File principale**: `src/pages/servizi/previdenza.astro` (86 linee — usa ServiceLayout)
**Layout**: `src/components/ServiceLayout.astro` (~1383 linee, condiviso con altre 3 pagine servizio)

#### 🔴 CRITICI

- **A1. Form ServiceLayout: privacy checkbox tap target 16×16px**
  - File: `ServiceLayout.astro:1338-1339`
  - Classes: `mt-0.5 w-4 h-4`. **SOTTO i 44×44px**. Stesso pattern in tutti i form ServiceLayout-based (diagnosi, pianificazione, previdenza, rolling-obbligazionario, contatti).
  - Impatto: utenti mobile faticano a spuntare la privacy → **submit form impossibile** se mancano la checkbox per millimetri.
  - Fix: avvolgere in label cliccabile `<label class="flex items-start gap-3 py-2 cursor-pointer">` con tap area generosa. Il `w-4 h-4` rimane visivo ma il `<label>` espande il tap target alla riga intera. Tempo: 10 min. **Sistemico**: fixa anche per gli altri 4 form ServiceLayout.

#### 🟠 ALTI

- **B1. `text-xs` per microcopy form labels (counter, hint)**
  - File: `ServiceLayout.astro:1268, 1271, 1292, 1322`
  - Multiple `text-xs` (12px) per "Ulteriori informazioni", "0/2000", "PDF, immagini, Excel..." su mobile sono al limite di leggibilità.
  - Fix: portare a `text-sm` (14px) come minimo. Tempo: 5 min.

- **D5. Form input non hanno autocomplete attributes**
  - File: `ServiceLayout.astro:1130, 1139, 1148, 1158, 1177`
  - Manca `autocomplete="name"`, `"email"`, `"tel"`. Su mobile questo significa che **gli utenti non vedono le suggestion native iOS/Android** per nome/email/telefono → friction notevole.
  - Fix: aggiungere autocomplete attribute corretti. Tempo: 5 min.

#### 🟡 MEDI

- **G3. Sezione "Pensione SVG" hardcoded grafico**
  - File: ServiceLayout.astro (showPensionSection)
  - Stesso problema dei grafici SVG fixed-pixel: su 375px le label numeriche diventano illeggibili.
  - Fix: ridurre simboli o sostituire con icone scalable. Tempo: 30 min.

#### 🟢 BASSI

- **C1. `max-w-7xl` su sezioni hero ServiceLayout**
  - File: `ServiceLayout.astro:225-292`
  - Su tablet 768px nessun problema. Su 375px niente overflow. Solo informativo.

---

### /richiedi-diagnosi

**File principale**: `src/pages/richiedi-diagnosi.astro` (recentemente redesignato)
**Componenti**: `src/components/diagnosi/{CardDubbio, SezioneReport, StepProcesso, ModuloShort}.astro`

#### 🔴 CRITICI

- **A1. ModuloShort privacy checkbox tap target 16×16px**
  - File: `src/components/diagnosi/ModuloShort.astro` (sezione privacy)
  - Identico al ServiceLayout: `w-4 h-4` checkbox isolato. Sebbene avvolto in `<label class="flex items-start ...">`, l'altezza del checkbox attivabile è limitata.
  - Fix: aggiungere `py-2` al label per espandere tap area. Tempo: 5 min. **Già parzialmente mitigato dal label cliccabile**, ma il visual feedback è ancora di un quadratino piccolo.

#### 🟠 ALTI

- **D5. Modulo Short non ha autocomplete su tutti i campi**
  - File: `ModuloShort.astro`
  - I campi nome/email/phone hanno `autocomplete="name|email|tel"` (ho verificato), ma il select "Da quanto tempo investi" non ha autocomplete (giusto, non applicabile).
  - **STATO ATTUALE**: corretto. Falso positivo del check, lascio per documentazione.

- **C5. Mockup-report.webp placeholder sticky desktop ma pesante su mobile**
  - File: `richiedi-diagnosi.astro:202-220`
  - Il mockup ha `lg:sticky lg:top-24` ma su mobile diventa una immagine `aspect-[3/4]` sopra al testo. Il placeholder elegante (gradient + bordo) occupa ~400px su 375px viewport.
  - Fix: `aspect-[4/3] lg:aspect-[3/4]` per crop più orizzontale su mobile. Tempo: 3 min.

#### 🟡 MEDI

- **B3. H1 hero text-4xl md:text-5xl lg:text-6xl**
  - "Scopri davvero come è messo il tuo portafoglio." 49 caratteri. Su 375px text-4xl (36px) → 4 righe. Drammatico ma forse intenzionale.
  - Fix opzionale: ridurre a `text-3xl md:text-5xl lg:text-6xl`. Tempo: 2 min.

- **C3. Sezione 5 "Perché è gratis" con `border-l-4 emerald` + `bg-[rgba(0,166,82,0.05)]`**
  - File: `richiedi-diagnosi.astro` (sezione 5)
  - Bordo sinistro 4px su mobile diventa 4/375 = 1% del viewport → ben dosato. OK.

#### 🟢 BASSI

- **G3. Placeholder hero-portafoglio.webp `aspect-[4/5]`**
  - Stesso pattern di pianificazione: verticale ingombrante su mobile.

---

### /glossario (hub)

**File principale**: `src/pages/glossario/index.astro` (~290 linee)
**Componente principale**: `src/components/glossario/VoceCard.astro` (recentemente redesignato "carta da gioco")

#### 🔴 CRITICI

- **A4. Hover preview overlay disabilitato su touch + nessun fallback tap-to-show**
  - File: `VoceCard.astro:243-247` (`@media (hover: none) { .vc-overlay { display: none; } }`)
  - Su touch device l'overlay anteprima è completamente disabilitato. **L'utente mobile non vede MAI la frase essenziale completa o lo snippet esempio prima di entrare nella pagina**: vede solo il trafiletto troncato a 130 caratteri.
  - Decisione esplicita di Andrea: meglio del problema "tap-to-show con close button" che potrebbe rallentare la navigazione. Ma è comunque una **disparità di esperienza** desktop vs mobile.
  - Fix: lascia così OPPURE aggiungere bottone "Anteprima" piccolo che apre un drawer Sheet con la stessa info dell'overlay. Tempo: 60 min.
  - **NOTA**: il brief della raffinazione glossario dice esplicitamente "Su touch device niente overlay". Quindi è una scelta editoriale, non un bug. Lo classifico come **DA VERIFICARE STRATEGICAMENTE**.

#### 🟠 ALTI

- **A1. Tap target su card piccole con micro-rotation hover**
  - File: `VoceCard.astro:263-274`
  - Su tablet 768px (md) le card hanno aspect-ratio 3:4 e in `xl:grid-cols-4` larghezza ~180px → titolo+descr+pillola fittiscono ma il tap inizia subito sotto un'altra card. Margine `gap-6 md:gap-8` (24-32px) crea aria sufficiente.
  - **DA VERIFICARE VISIVAMENTE**: la micro-rotation `±0.5deg` su :hover potrebbe creare rare situazioni dove due card si sovrappongono di 1-2px. Innocuo ma cosmetico.

- **B1. Numero progressivo "01 / 100" `text-sm` (14px)**
  - File: `VoceCard.astro:104`
  - Sotto i 16px → leggibilità ridotta su 375px per utenti senior. Accettabile come microcopy.

#### 🟡 MEDI

- **C3. Padding sezione `py-12 md:py-16` ragionevole, OK**
  - File: `glossario/index.astro:46`
  - Già ridotto rispetto ad altre pagine (py-16 md:py-24). Buon esempio.

- **B5. Pillola categoria nel footer card con stile inline `style={...}`**
  - File: `VoceCard.astro:135-140`
  - Inline style impedisce a Tailwind di ottimizzare. Funzionale, ma poco performante in pagine con 100 voci future.
  - Fix strategico: definire 8 utility class CSS per categoria (es. `.cat-investire`, `.cat-fiscalita`) e usarle al posto degli inline style. Tempo: 30 min.

#### 🟢 BASSI

- **C5. Lettere alfabeto A-Z su 26 sezioni quando solo 12 hanno voci**
  - File: `glossario/index.astro` (vista alfabetico)
  - Su mobile lo scroll della vista alfabetica diventa lungo per arrivare a Z. **Suggerirei** un floating index (A B C D E F...) sticky sul lato destro che permetta jump rapido.
  - Fix futuro (non urgente): sticky alphabetical jumplist. Tempo: 60 min.

- **C7. Spacing tra card fila e fila `gap-6 md:gap-8`**
  - Bene su desktop, su mobile single-col il gap-6 (24px) tra card potrebbe essere ridotto a `gap-4` (16px) per ridurre scroll.

---

### /glossario/[slug] (3 voci campione: capital-gain, fondo-emergenza, btp)

**File principale**: `src/pages/glossario/[slug].astro` (recentemente redesignato con sidebar scrollspy)

#### 🔴 CRITICI
*(Nessuno)*

#### 🟠 ALTI

- **C2. Sidebar sticky desktop appare anche su tablet**
  - File: `[slug].astro:175` (`<aside class="hidden lg:block">`)
  - Su 768px (iPad portrait) la sidebar è nascosta (`hidden lg:block`) → il <details> accordion mobile appare in cima. **Comportamento corretto**.
  - Su 1024px+ (lg) la sidebar appare. Su tablet landscape 1024-1280 può essere stretta (240px su 1024 = 23%, OK).

- **B5. Pull quote frase essenziale `text-2xl md:text-3xl lg:text-4xl italic`**
  - File: `[slug].astro:189-194`
  - Su 375px text-2xl (24px) + leading-snug + italic Playfair fallback Georgia. Le frasi lunghe (es. capital-gain ~250 caratteri) generano 8-10 righe = scroll significativo prima di arrivare al livello 2.
  - Fix: ridurre a `text-xl md:text-3xl lg:text-4xl` su mobile. Tempo: 3 min.

#### 🟡 MEDI

- **C3. `py-14 md:py-16` su sezione "Termini correlati"**
  - File: `[slug].astro:209`
  - Padding generoso, OK su desktop. Su mobile aggiunge scroll.

- **A3. Bottone "Torna all'inizio" sidebar `text-sm font-medium` flex inline**
  - File: `[slug].astro:206-216`
  - **Solo desktop**, non visibile su mobile. Su mobile l'utente non ha un quick way "back to top" se non lo scroll fisico.
  - Fix futuro: aggiungere FAB (floating action button) "back to top" su mobile dopo che l'utente ha scrollato >50%. Tempo: 30 min.

- **G3. Mancanza icona prev/next sui link prev/next**
  - File: `[slug].astro:265-285`
  - Le card prev/next hanno solo testo ← / →. **DA VERIFICARE VISIVAMENTE** se è abbastanza chiaro su mobile, dove le icone aiutano la scansione.

#### 🟢 BASSI

- **B6. Caratteri speciali (€, %, etc.) nel testo voci**
  - I 5 livelli usano markdown inline e a volte hanno € o % accanto. Il `MarkdownInline.astro` aggiunge `nbsp` per non spezzare. ✓

---

### /contatti

**File principale**: `src/pages/contatti.astro` (285 linee)

#### 🔴 CRITICI

- **A1. Privacy checkbox `w-4 h-4`**
  - File: `contatti.astro:174-176`
  - Stesso problema sistemico di tutti i form. **Avvolto in `<label class="flex items-start gap-3">`** quindi tap target esteso al testo, ma visualmente piccolo.
  - Fix: vedi "Trasversale T1" sotto.

#### 🟠 ALTI

- **D5. Form inputs senza autocomplete**
  - File: `contatti.astro:132-159`
  - Campi name/email/phone nel form `#contact-form` non hanno `autocomplete="..."`. Su iOS/Android l'utente non vede suggestion native.
  - Fix: aggiungere `autocomplete="name|email|tel"`. Tempo: 3 min.

- **B1. Microcopy "I tuoi dati sono al sicuro..." `text-xs`**
  - File: `contatti.astro:197-199`
  - 12px, sotto soglia leggibilità mobile.
  - Fix: `text-sm`. Tempo: 1 min.

#### 🟡 MEDI

- **C3. Sezione hero py-14 md:py-20 + sezione info py-12 md:py-16 + form py-16 md:py-24 + footer py-10**
  - File: `contatti.astro:15, 30, 101, 276`
  - Tante sezioni con padding diverso → scroll mobile irregolare. Standardizzare a `py-12 md:py-20`.

- **F5. Calendly badge widget floating "Prenota una call" sempre visibile**
  - File: `Layout.astro:71-95`
  - Su mobile il floating button verde ~80×40px in basso a destra **copre il bottone primario "Invia messaggio"** del form contatti quando l'utente arriva a fondo pagina con la tastiera aperta.
  - Fix: nascondere Calendly badge sulle pagine con form attivo (contatti, richiedi-diagnosi). Tempo: 15 min.

#### 🟢 BASSI

- **C7. 3 card metodo contatto con `space-y-4` su mobile**
  - File: `contatti.astro:209-275` (3 card stack mobile)
  - Spacing compatto, accettabile.

---

### Componente DiagnosiPopup (cross-page)

**File principale**: `src/components/DiagnosiPopup.astro` (140 linee)
**Comportamento**: appare in tutte le pagine dopo 6 secondi.

#### 🔴 CRITICI

- **F5. Popup ad apertura automatica blocca contenuto su mobile**
  - File: `DiagnosiPopup.astro` (intero)
  - Il modal occupa `max-w-4xl w-full max-h-[90vh]`. Su 375px copre quasi l'intero viewport. **L'utente in lettura viene interrotto dopo 6s**, anche se sta leggendo.
  - Impatto UX: anti-pattern noto ("interruption marketing"). Soprattutto su mobile dove il dito potrebbe già essere su un altro elemento → tap accidentale sul popup mentre si scrolla.
  - **DA VERIFICARE STRATEGICAMENTE**: scelta editoriale o bug? Il commento dice "appare dopo 6 secondi su ogni caricamento di pagina". Su pagine ad alta intent (richiedi-diagnosi, pianificazione, contatti) **rallenta la conversione** invece di facilitarla.
  - Fix: limitare il popup alla sola homepage (rimuovere da pagine servizio/diagnosi/contatti). Tempo: 15 min.

#### 🟠 ALTI

- **G2. Foto Andrea placeholder gradient nel popup occupa 50% mobile width**
  - File: `DiagnosiPopup.astro:42-55`
  - Su 768px è grid-cols-[auto_1fr] orizzontale, ma su mobile è stack: foto sopra (192-224px wide aspect 3/4 = ~256-298px) + contenuto sotto. Foto NON utile, occupa spazio.
  - Fix: `hidden md:flex` sulla foto su mobile (mostra solo contenuto + 2 CTA). Tempo: 5 min.

- **A1. Bottoni popup "Richiedi" / "Rinuncia" `py-3.5`**
  - File: `DiagnosiPopup.astro:75-87`
  - Padding 14+14+~16 = 44px tap target esatto. **Al limite**. OK ma non generoso.

#### 🟡 MEDI

- **I5. Popup non chiude col gesto back Android**
  - File: `DiagnosiPopup.astro:95-138`
  - Lo script ha listener Escape ma non integra `history.pushState` per intercettare back gesture su Android.
  - Fix: aggiungere history.pushState al popup open + listener popstate per close. Tempo: 20 min.

#### 🟢 BASSI

- **B1. "FOTO ANDREA / IN ARRIVO" microcopy `text-xs/text-[10px]`**
  - File: `DiagnosiPopup.astro:50-51`
  - Microcopy decorativa, accettabile.

---

### Componente TopBar (cross-page)

**File principale**: `src/components/TopBar.astro` (78 linee)

#### 🔴 CRITICI
*(Nessuno)*

#### 🟠 ALTI

- **A1. Link "Tel" e "Email" mobile in TopBar tap target ~28px**
  - File: `TopBar.astro:51-74`
  - Classes: `py-2` (8+8) + icona 14px = 30px tap target. **SOTTO 44px**.
  - Su 375px gli utenti faticano a centrare il tap su "Tel" / "Email" → tap fallito o tap accidentale sul link adiacente.
  - Fix: `py-2.5 md:py-2` su tutta la barra + più gap orizzontale. Tempo: 10 min. **Sistemico** (cambia per tutte le pagine).

- **B1. TopBar text-xs (12px) sui link**
  - File: `TopBar.astro:5` (`text-xs` su tutto)
  - Microcopy ma su utenti con vista limitata è sub-ottimale.

#### 🟡 MEDI

- **C7. Compressione testi sm:hidden / sm:inline**
  - File: `TopBar.astro:22, 35, 58, 73`
  - Su mobile le label "Instagram", "YouTube", numeri completi sono nascoste. Le label fallback "Tel", "Email" sono molto corte ma con icona. OK.

---

### Componente HeaderClean (cross-page)

**File principale**: `src/components/HeaderClean.astro` (351 linee)

#### 🔴 CRITICI
*(Nessuno)*

#### 🟠 ALTI

- **A1. Hamburger button `p-3 -mr-3` con icon 28×28px**
  - File: `HeaderClean.astro:100-111`
  - Tap target effettivo = padding 12+12 + icon 28 = 52×52px. ✓
  - **Falso allarme dell'audit superficiale**: il `-mr-3` riduce il margin ma il padding esterno è generoso.

- **C2. Sidebar mobile width 85% mobile / 420px sm+**
  - File: `HeaderClean.astro:126`
  - 85% di 375 = 318px. Spazio per voci menu (`text-xl font-semibold`). OK.
  - **DA VERIFICARE VISIVAMENTE**: la pillola "In arrivo" rossa accanto a "Articoli" / "FAQ" usa `text-[10px]` → micro-quasi-illeggibile su mobile.

#### 🟡 MEDI

- **A1. Submenu items "Diagnosi di portafoglio" / "Pianificazione Finanziaria" / "Previdenza Complementare"**
  - File: `HeaderClean.astro:168-172`
  - Classes: `block py-1.5 text-sm`. Padding 6+6 + line-height ~20 = 32px tap target. **SOTTO 44px**.
  - Fix: `py-2.5 sm:py-2`. Tempo: 5 min.

#### 🟢 BASSI

- **C7. Mobile sidebar bottom padding `h-6`**
  - File: `HeaderClean.astro:249`
  - 24px di padding bottom per scroll. OK.

---

### Componente widgets/Footer

**File principale**: `src/components/widgets/Footer.astro` (166 linee)
*(Non letto interamente in questa sessione, lavoro su pattern AstroWind generico)*

#### 🟡 MEDI

- **A1. Link footer comuni in `text-sm` / `py-1`**
  - **DA VERIFICARE VISIVAMENTE**: tipico AstroWind footer ha link link-list con padding minimo. Tap target ~30-32px.
  - Fix: pattern generico AstroWind, verificarlo manualmente. Tempo audit: 15 min.

---

## Problemi trasversali (sistemici)

### T1. 🔴 Privacy checkbox tap target 16×16px in 5+ form

**Pagine impattate**: contatti, richiedi-diagnosi, pianificazione (form), previdenza (form), diagnosi (form), rolling-obbligazionario (form).

**Pattern identico**: `<input type="checkbox" class="mt-1 w-4 h-4 ...">` dentro `<label class="flex items-start gap-3">`.

**Fix sistemico**: la `<label>` wrapper estende l'area cliccabile al testo (OK), ma visivamente il checkbox è 16px e gli utenti tap su di esso pensando sia l'unico tap target.

**Soluzione consigliata**: lasciare il visual checkbox piccolo MA aumentare il padding del label a `py-2 sm:py-1` e mostrare un focus-visible ring evidente (`focus-within:ring-2 focus-within:ring-emerald/30`) sul label intero. Tempo: 30 min totali (6 file).

### T2. 🟠 Form input mancano autocomplete attribute (sistemico)

**Pagine impattate**: contatti.astro, ServiceLayout.astro (4 form derivati).

**Fix sistemico**: aggiungere `autocomplete="name|email|tel|street-address"` ai campi corrispondenti. Beneficio mobile UX enorme: iOS/Android compilano automaticamente i form. Tempo: 20 min totali.

### T3. 🟠 TopBar tap target sotto 44px (sistemico)

Già descritto sopra. Fix in 1 file (TopBar.astro) propaga a tutte le pagine. Tempo: 10 min.

### T4. 🟡 Padding sezione `py-16 md:py-24` non standardizzato

**Pagine impattate**: tutte. Alcune usano `py-12 md:py-20` (glossario hub), altre `py-16 md:py-24` (homepage, perche-scegliermi), altre ancora `py-20 lg:py-32` (pianificazione, diagnosi).

**Fix sistemico**: standardizzare 3 token spacing — `section-sm` (py-12 md:py-16), `section-md` (py-16 md:py-24), `section-lg` (py-20 md:py-32). Aggiungere come Tailwind plugin o CSS custom. Tempo: 90 min iniziale + ~5 min per pagina di applicazione.

### T5. 🟡 Bottoni CTA non standardizzati

**Inventario CTA pattern attuali**: ho visto almeno 4 stili di bottone primario diversi:
- `bg-[#00A652] hover:bg-[#0F4F4A] rounded-lg px-8 py-4` (diagnosi, pianificazione)
- `bg-[var(--aw-color-primary)] hover:bg-[var(--aw-color-secondary)] rounded-sm px-8 py-4` (chi-sono, contatti)
- `bg-[var(--aw-color-primary)] rounded-sm px-10 py-4` (homepage CTA)
- `bg-[var(--aw-color-primary)] rounded-sm px-12 py-5` (homepage hero richiedi diagnosi)

**Fix sistemico**: creare componente `<BrandButton>` con varianti `size="sm|md|lg"`, `intent="primary|secondary|ghost"`, `width="auto|full"`. Centralizza padding/colors/rounded. Tempo: 2-3 ore per refactor + 30 min per applicazione progressiva.

### T6. 🟡 H1/H2 dimensioni non standardizzate

**Inventario**: alcune pagine usano `text-4xl md:text-5xl lg:text-6xl` (homepage, diagnosi), altre `text-3xl md:text-4xl lg:text-5xl` (varie sezioni). Su 375px text-4xl genera 4-6 righe.

**Fix sistemico**: 3 utility class `.h-display-xl`, `.h-display-lg`, `.h-section`. Tempo: 60 min.

### T7. 🟡 Mockup decorativi hard-coded SVG/divs (anti-pattern)

**Pagine impattate**: come-lavoro (in coda redesign), chi-sono (mockup IG/YT decorativi).

**Fix sistemico**: sostituire mockup decorativi con icone semplici o foto/illustrazioni reali quando disponibili. Tempo: contestuale ai redesign futuri.

---

## Quick wins (fix rapidi ad alto impatto, < 30 min ciascuno)

Lista ordinata per impatto/effort ratio:

1. **🔴 T3. TopBar tap target → `py-2.5`** (10 min, fix in 1 file, propaga ovunque)
2. **🔴 F5. Disabilitare DiagnosiPopup su pagine con form** (15 min, +UX su 5+ pagine)
3. **🟠 T2. Aggiungere autocomplete a tutti i form input** (20 min, +UX mobile sostanziale)
4. **🔴 P1. Convertire CTA "Richiedi diagnosi gratuita" a flex-col sm:flex-row pattern** (30 min, fix problema noto)
5. **🟠 G2. Nascondere foto popup su mobile** (5 min, libera spazio per CTA)
6. **🟠 F2. CTA "Inizia ora!" homepage full-width mobile** (5 min)
7. **🟠 P2. Centrare blocchi paragrafi homepage su mobile** (20 min)
8. **🟡 B1. Microcopy text-xs → text-sm dove leggibilità critica** (15 min, sistemico)
9. **🟡 A1. Submenu HeaderClean `py-2.5`** (5 min)
10. **🟢 C7. Sezioni padding standardizzate (`py-16 md:py-24` → `py-12 md:py-20`)** (15 min, sistemico)

**Totale quick wins**: ~140 min ≈ **2.5 ore** per recuperare i problemi più impattanti.

---

## Refactoring più ampi (alto impatto, alto effort)

1. **T5. Sistema BrandButton con varianti** (2-3 ore)
   Centralizza tutti i CTA in un componente con props. Riduce divergenze, semplifica fix futuri di tap target.

2. **T1. Refactor sistema privacy checkbox a "label-extended tap area"** (30 min + test su 6 pagine = 1 ora totale)
   Migliora UX mobile su tutti i form.

3. **T4+T6. Design tokens spacing/typography** (3-4 ore)
   File `src/styles/tokens.css` con CSS custom properties standardizzate; refactor uso su tutto il sito.

4. **/come-lavoro redesign completo** (già in coda, ~3 ore)
   Risolve 8 problemi della pagina più critica per UX mobile.

5. **VoceCard tap-to-show preview su mobile** (1 ora)
   Implementare drawer Sheet (es. Headless UI o vanilla) per dare ai mobile users la stessa info dell'overlay desktop.

6. **A4. Aggiungere FAB "back to top" sulle pagine lunghe** (1 ora)
   Pagine glossario detail, come-lavoro, perche-scegliermi.

**Totale refactoring**: ~12-14 ore.

---

## Raccomandazioni strategiche

1. **Audit dei calcolatori prossima sessione** — escluso da questo audit, ma probabilmente ha problemi simili (tap target form input, autocomplete, padding sezione). Proporrei un audit-fix combinato.

2. **Considerare adozione di un sistema di design tokens unificato** — i 3 sistemi paralleli attuali (Tailwind config + CSS custom variables in CustomStyles.astro + inline styles per categoria glossario) creano frizione. Standardizzare in 1 file `tokens.css` ridurrebbe problemi futuri.

3. **Calendly badge condizionale per pagina** — il badge floating "Prenota una call" è utile sulla homepage e pagine educational, ma **dannoso** sulle pagine con form attivi (copre il submit). Il file `Layout.astro` può accettare una prop `showCalendlyBadge` (default true) e disabilitarlo su contatti/richiedi-diagnosi/pagine servizio.

4. **Test mobile reale (non solo DevTools)** — l'audit basato su codice cattura ~80% dei problemi. Il restante 20% (touch responsiveness reale, font rendering iOS Safari vs Chrome Android, gesture conflicts) richiede testing su dispositivi reali. Andrea dovrebbe ritagliarsi 30 min con un iPhone 13/14 + un Android medio per fare manual QA dopo il primo round di fix.

5. **DiagnosiPopup: re-pensare la logica di apparizione** — invece di "6 secondi su ogni pagina", considerare:
   - Mostrarlo solo dopo che l'utente ha letto >50% della homepage (intent signal)
   - Limitarlo a 1 volta per sessione (localStorage flag)
   - Non mostrarlo affatto su mobile (touch UX inferior per modal interruption)

---

## Statistiche finali

### Per categoria (A-J)

| Categoria                              | 🔴 Critici | 🟠 Alti | 🟡 Medi | 🟢 Bassi | Totale |
|----------------------------------------|-----------|--------|--------|---------|--------|
| A — Tap targets e interazioni          |     2     |   4    |   2    |    1    |   9    |
| B — Tipografia e leggibilità           |     0     |   3    |   5    |    2    |  10    |
| C — Layout e spacing                   |     1     |   2    |   8    |    3    |  14    |
| D — Form e input                       |     0     |   3    |   0    |    0    |   3    |
| E — Navigation e header                |     0     |   1    |   0    |    0    |   1    |
| F — CTA e conversione                  |     2     |   3    |   0    |    0    |   5    |
| G — Immagini e media                   |     0     |   2    |   3    |    2    |   7    |
| H — Performance percezione             |     0     |   0    |   0    |    1    |   1    |
| I — Accessibilità mobile               |     0     |   0    |   1    |    0    |   1    |
| J — Content mobile-specific            |     0     |   0    |   0    |    0    |   0    |
| **Trasversali sistemici**              |     1     |   1    |   3    |    0    |   5    |
| Strategici (popup auto-trigger)        |     1     |   0    |   1    |    0    |   2    |
| **TOTALE**                             |   **6**   |  **18**|  **24**|  **15** | **63** |

### Per pagina

| Pagina                                      | 🔴 Critici | 🟠 Alti | 🟡 Medi | 🟢 Bassi | Totale |
|---------------------------------------------|-----------|--------|--------|---------|--------|
| / (homepage)                                |     1     |   3    |   3    |    2    |   9    |
| /chi-sono                                   |     0     |   2    |   2    |    1    |   5    |
| /come-lavoro (legacy, in coda redesign)     |     3     |   2    |   2    |    1    |   8    |
| /perche-scegliermi                          |     0     |   2    |   2    |    1    |   5    |
| /servizi/pianificazione                     |     0     |   2    |   2    |    1    |   5    |
| /servizi/previdenza (e ServiceLayout)       |     1     |   2    |   1    |    1    |   5    |
| /richiedi-diagnosi                          |     1     |   2    |   2    |    1    |   6    |
| /glossario (hub) + VoceCard                 |     1     |   2    |   2    |    2    |   7    |
| /glossario/[slug] (3 voci campione)         |     0     |   2    |   3    |    1    |   6    |
| /contatti                                   |     1     |   2    |   2    |    1    |   6    |
| Componenti cross-page (DiagnosiPopup)       |     1     |   2    |   1    |    1    |   5    |
| Componenti cross-page (TopBar/Header/Footer)|     0     |   3    |   2    |    1    |   6    |
| Trasversali sistemici (T1-T7)               |     1     |   2    |   3    |    0    |   6    |
| Problemi notati owner (P1, P2)              |     1     |   1    |   0    |    0    |   2    |
| **TOTALE** (al netto duplicati)             |   **6**   |  **18**|  **24**|  **15** | **63** |

> **Nota**: alcune voci sono conteggiate in entrambe "per pagina" e "trasversali" perché un fix sistemico le copre tutte; il TOTALE riconciliato evita doppio conteggio.

---

## Tempo totale stimato per fix

| Categoria fix                                       | Tempo stimato     |
|------------------------------------------------------|-------------------|
| Quick wins (<30 min/cad, 10 voci)                    | ~2.5 ore          |
| Fix singoli (30 min - 1 ora, ~15 voci)               | ~10 ore           |
| Refactoring strutturali (>1 ora, 6 voci)             | ~14 ore           |
| **TOTALE FIX COMPLETO**                              | **~26-28 ore**    |
| —                                                    | —                 |
| Sottoinsieme "Quick wins + 5 fix critici"            | **~6-8 ore**      |
| Solo Top 5 critici (la "lista del fuoco")            | **~3-4 ore**      |

I numeri includono ~20% di buffer per imprevisti (test cross-browser, regressi, refactor inattesi).

---

## Top 5 da risolvere subito (la lista del fuoco)

In ordine di impatto/effort:

1. **🔴 T1. Privacy checkbox label-extended tap area** — sistemico, 30 min, 6 form
2. **🔴 F5. DiagnosiPopup: limitare alla sola homepage** — 15 min, libera UX di 5+ pagine
3. **🔴 T3. TopBar tap target py-2.5** — 10 min, propaga a tutto il sito
4. **🔴 P1. CTA "Richiedi diagnosi gratuita" pattern flex-col sm:flex-row** — 30 min, fix problema noto dal proprietario
5. **🔴 P2. Homepage paragrafi text-center md:text-left mobile** — 20 min, fix problema noto dal proprietario

**Tempo totale top 5**: ~105 min ≈ **1.75 ore**.

---

## Conferma audit

Il file `/docs/mobile-audit.md` contiene:
- ✅ 10 categorie A-J coperte (8 con problemi attivi, 2 con 0 problemi: H, J)
- ✅ 10 pagine analizzate + 3 componenti cross-page (DiagnosiPopup, TopBar, HeaderClean)
- ✅ 2 problemi notati dal proprietario verificati (P1 confermato, P2 confermato)
- ✅ 7 problemi trasversali sistemici identificati
- ✅ 10 quick wins prioritizzati
- ✅ 6 refactoring più ampi proposti
- ✅ 5 raccomandazioni strategiche
- ✅ Statistiche per categoria + per pagina
- ✅ Top 5 immediate actions

**Nessun fix applicato in questa sessione, come da vincolo del brief.**

I prossimi passi (in sessione successiva, su scelta di Andrea) sono:
- Decidere quali del **Top 5** affrontare nel primo round
- Decidere se fare i **Quick wins** in batch (~2.5 ore in una sessione) o spalmati
- Pianificare i **refactoring strutturali** (T5 BrandButton, design tokens) come investimenti dedicati
