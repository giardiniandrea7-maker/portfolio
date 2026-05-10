/* =============================================================
   SMOOTH SCROLL (Lenis) — giardiniconsulenza.it
   Scroll fluido stile Apple/Awwwards. Disabilitato su mobile e
   per utenti con prefers-reduced-motion. Compatibile View
   Transitions: distrutto su astro:before-swap, ricreato su
   astro:page-load.
   ============================================================= */

import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

function isMobile(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 768px)').matches
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function destroySmoothScroll(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  document.documentElement.classList.remove('lenis', 'lenis-smooth');
}

export function initSmoothScroll(): void {
  // Pulisci sempre prima di ricreare (View Transitions)
  destroySmoothScroll();

  if (isMobile() || prefersReducedMotion()) return;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    // Ignora elementi marcati [data-lenis-prevent] (es. dropdown,
    // contenitori scroll interni) per non rubare il loro scroll.
  });

  // Aggiunge classi CSS che Lenis usa per il proprio styling
  document.documentElement.classList.add('lenis', 'lenis-smooth');

  function raf(time: number) {
    lenisInstance?.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);
}

// Init/teardown agganciati al ciclo di Astro View Transitions.
// astro:page-load fira anche al primo caricamento.
document.addEventListener('astro:page-load', initSmoothScroll);
document.addEventListener('astro:before-swap', destroySmoothScroll);
