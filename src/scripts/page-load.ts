// Esegue fn al primo caricamento e dopo ogni navigazione con View Transitions.
// Serve perché un modulo può essere valutato dopo il primo `astro:page-load`:
// in quel caso l'evento iniziale andrebbe perso. fn gira una sola volta per pagina:
// le View Transitions sostituiscono il <body>, che fa da chiave.
export function onPageLoad(fn: () => void) {
  let lastBody: HTMLElement | null = null;
  const run = () => {
    if (lastBody === document.body) return;
    lastBody = document.body;
    fn();
  };

  document.addEventListener('astro:page-load', run);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
