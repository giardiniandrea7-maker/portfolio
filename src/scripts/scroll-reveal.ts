/* =============================================================
   SCROLL REVEAL — giardiniconsulenza.it
   Osserva gli elementi con classe .reveal e aggiunge
   .reveal-visible quando entrano nel viewport. Compatibile con
   Astro View Transitions: re-inizializza ad ogni astro:page-load.
   ============================================================= */

let observer: IntersectionObserver | null = null;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function revealAllImmediately(): void {
  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    el.classList.add('reveal-visible');
  });
}

function initScrollReveal(): void {
  // Disconnetti eventuale observer precedente (navigazione View Transitions)
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Se l'utente preferisce motion ridotto, mostra tutto subito.
  if (prefersReducedMotion()) {
    revealAllImmediately();
    return;
  }

  // Fallback: browser senza IntersectionObserver — mostra tutto.
  if (typeof IntersectionObserver === 'undefined') {
    revealAllImmediately();
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    // Salta elementi già visibili (es. ricaricamento dopo scroll)
    if (el.classList.contains('reveal-visible')) return;

    // Se l'elemento è già abbastanza dentro il viewport al primo
    // tick (above the fold), rivelalo subito senza animazione di
    // attesa scroll — evita l'effetto "vuoto" sotto la hero.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      // piccolo delay per non collidere con la sequenza hero
      window.setTimeout(() => el.classList.add('reveal-visible'), 50);
      return;
    }

    observer!.observe(el);
  });
}

// Astro View Transitions: il listener si registra una sola volta,
// ma viene chiamato ad ogni navigazione (incluso il primo load).
document.addEventListener('astro:page-load', initScrollReveal);
