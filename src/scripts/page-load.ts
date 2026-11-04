// Esegue fn al primo caricamento e dopo ogni navigazione con View Transitions.
// Serve perché un modulo può essere valutato dopo il primo `astro:page-load`:
// in quel caso l'evento iniziale andrebbe perso. Le funzioni passate devono
// essere idempotenti (proteggersi con data-ready).
export function onPageLoad(fn: () => void) {
  document.addEventListener('astro:page-load', fn);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}
