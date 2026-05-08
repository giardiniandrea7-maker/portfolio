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

export const voci: VoceGlossario[] = [
  // I contenuti delle voci verranno popolati allo Step 4.
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
