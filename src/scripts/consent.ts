// Gestione del consenso ai cookie e ai contenuti di terze parti
// (Linee guida Garante Privacy del 10/06/2021).
// Categorie: "necessari" (sempre attivi) e "esterni" (Google Maps, Calendly), solo dopo consenso.
// La scelta resta in localStorage per 6 mesi, poi il banner viene riproposto.

export type ConsentCategory = 'esterni';
export interface ConsentState {
  esterni: boolean;
  date: number;
  version: number;
}

const KEY = 'gc-consent';
const VERSION = 1;
const MAX_AGE = 1000 * 60 * 60 * 24 * 182; // ~6 mesi

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as ConsentState;
    if (state.version !== VERSION || Date.now() - state.date > MAX_AGE) return null;
    return state;
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] === true;
}

export function saveConsent(esterni: boolean) {
  const state: ConsentState = { esterni, date: Date.now(), version: VERSION };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage non disponibile: la scelta vale per la sola pagina */
  }
  window.dispatchEvent(new CustomEvent('gc-consent-change', { detail: state }));
}

// Esegue fn ora se il consenso c'è già, altrimenti appena viene dato
export function onConsent(category: ConsentCategory, fn: () => void) {
  if (hasConsent(category)) {
    fn();
    return;
  }
  const handler = (e: Event) => {
    if ((e as CustomEvent<ConsentState>).detail?.[category]) {
      window.removeEventListener('gc-consent-change', handler);
      fn();
    }
  };
  window.addEventListener('gc-consent-change', handler);
}
