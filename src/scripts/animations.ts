/* =============================================================
   ANIMAZIONI (Motion) — giardiniconsulenza.it
   Sostituisce lo scroll-reveal vanilla con Motion: stesse classi
   .reveal / .reveal-stagger come trigger ma animazioni più ricche,
   controllo fine dell'easing e supporto magnetic / count-up / hero
   sequence / parallax.
   Compatibile Astro View Transitions: cleanup su before-swap.
   ============================================================= */

import { animate, inView, stagger } from 'motion';

// Set di elementi già animati: evita di ri-triggerare l'animazione
// se l'elemento esce e rientra in viewport durante la sessione.
const animatedElements = new WeakSet<Element>();
let inViewCleanups: Array<() => void> = [];
let magneticCleanups: Array<() => void> = [];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

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

function revealAllImmediately(): void {
  document.querySelectorAll<HTMLElement>('.reveal, [data-hero-element]').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

// ---------- SCROLL REVEAL ----------

/**
 * Restituisce true se l'elemento è ATTUALMENTE in viewport
 * (anche solo parzialmente) o lo ha già attraversato.
 * Usato per evitare la race condition: elementi già visibili al
 * momento dell'init non passano dall'IntersectionObserver di Motion
 * (che potrebbe non fire-are se il timing va storto), ma ricevono
 * subito lo stato finale.
 */
function isAlreadyInOrPastViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  // top sopra il bordo basso del viewport: già intersecato o vicino
  return rect.top < vh && rect.bottom > -200;
}

function showInstant(el: HTMLElement): void {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
}

function initScrollReveal(): void {
  // ----- .reveal singoli (NON figli di .reveal-stagger) -----
  const standaloneReveal = Array.from(
    document.querySelectorAll<HTMLElement>('.reveal')
  ).filter((el) => !el.parentElement?.classList.contains('reveal-stagger'));

  standaloneReveal.forEach((el) => {
    if (animatedElements.has(el)) return;

    // FIX RACE: se al momento dell'init è già in/oltre viewport, mostralo
    // subito senza animazione e SENZA registrare l'observer.
    if (isAlreadyInOrPastViewport(el)) {
      animatedElements.add(el);
      showInstant(el);
      return;
    }

    const cleanup = inView(
      el,
      () => {
        if (animatedElements.has(el)) return;
        animatedElements.add(el);
        // Edge case: in load lentissimi la failsafe CSS può aver già
        // portato l'elemento a opacity:1. Re-animarlo da [0,1] causerebbe
        // un flash visibile. Skip animazione e congela lo stato visibile.
        const op = parseFloat(window.getComputedStyle(el).opacity);
        if (op > 0.95) {
          showInstant(el);
          return;
        }
        animate(
          el,
          { opacity: [0, 1], transform: ['translateY(40px)', 'translateY(0)'] },
          { duration: 0.7, ease: EASE_OUT }
        );
      },
      { amount: 0.15, margin: '0px 0px -50px 0px' }
    );
    inViewCleanups.push(cleanup);
  });

  // ----- .reveal-stagger -----
  document.querySelectorAll<HTMLElement>('.reveal-stagger').forEach((container) => {
    const children = Array.from(
      container.querySelectorAll<HTMLElement>(':scope > *')
    );
    if (children.length === 0) return;

    // FIX RACE: container già in viewport → mostra tutti i figli istante.
    if (isAlreadyInOrPastViewport(container)) {
      children.forEach((c) => {
        if (animatedElements.has(c)) return;
        animatedElements.add(c);
        showInstant(c);
      });
      return;
    }

    // Stato iniziale dei figli (anti-FOUC) prima di registrare l'observer
    children.forEach((child) => {
      if (!animatedElements.has(child)) {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
      }
    });

    const cleanup = inView(
      container,
      () => {
        const toAnimate = children.filter((c) => !animatedElements.has(c));
        if (toAnimate.length === 0) return;
        toAnimate.forEach((c) => animatedElements.add(c));

        animate(
          toAnimate,
          { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
          {
            duration: 0.6,
            delay: stagger(0.08, { startDelay: 0.1 }),
            ease: EASE_OUT,
          }
        );
      },
      { amount: 0.1, margin: '0px 0px -50px 0px' }
    );
    inViewCleanups.push(cleanup);
  });
}

/**
 * Rete di sicurezza: dopo 2s dall'init, scansiona tutti i .reveal
 * e .reveal-stagger>* con computed opacity ancora 0 e che dovrebbero
 * essere visibili (in/vicino al viewport). Forza visibilità.
 * Coperture residuali per ogni race condition non prevista.
 */
function safetyNet(): number {
  return window.setTimeout(() => {
    const force = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // entro 200px dal bordo basso del viewport o sopra
      if (rect.top < vh + 200) {
        el.style.transition = 'opacity 0.4s, transform 0.4s';
        showInstant(el);
        // eslint-disable-next-line no-console
        console.warn('[scroll-reveal] safety net forced visibility on:', el);
      }
    };

    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      if (window.getComputedStyle(el).opacity === '0') force(el);
    });

    document
      .querySelectorAll<HTMLElement>('.reveal-stagger > *')
      .forEach((child) => {
        if (window.getComputedStyle(child).opacity === '0') force(child);
      });
  }, 2000);
}

// ---------- HERO SEQUENCE ----------

function animateHero(): void {
  const heroElements = Array.from(
    document.querySelectorAll<HTMLElement>('[data-hero-element]')
  );
  if (heroElements.length === 0) return;

  // Stato iniziale (avoid FOUC)
  heroElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
  });

  animate(
    heroElements,
    { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
    {
      duration: 0.8,
      delay: stagger(0.15, { startDelay: 0.1 }),
      ease: EASE_OUT,
    }
  );
}

// ---------- MAGNETIC BUTTONS ----------

function cleanupMagnetic(): void {
  magneticCleanups.forEach((fn) => fn());
  magneticCleanups = [];
}

function initMagneticButtons(): void {
  cleanupMagnetic();
  if (isMobile() || prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      animate(
        el,
        { x: x * 0.18, y: y * 0.18 },
        { duration: 0.35, ease: EASE_OUT }
      );
    };
    const onMouseLeave = () => {
      animate(el, { x: 0, y: 0 }, { duration: 0.5, ease: EASE_OUT });
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    magneticCleanups.push(() => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    });
  });
}

// ---------- COUNT-UP (utility esportata) ----------

export function animateCountUp(
  element: HTMLElement,
  from: number,
  to: number,
  duration = 1.0,
  formatter?: (n: number) => string
) {
  if (prefersReducedMotion()) {
    element.textContent = formatter ? formatter(to) : Math.round(to).toString();
    return null;
  }
  return animate(from, to, {
    duration,
    ease: EASE_OUT,
    onUpdate: (value: number) => {
      element.textContent = formatter ? formatter(value) : Math.round(value).toString();
    },
  });
}

/**
 * Crea un updater stateful per un singolo elemento DOM:
 * - primo render → testo settato istantaneamente (no count-up)
 * - successivi → count-up da valore precedente al nuovo
 * - se l'utente lancia un nuovo update mentre uno è in corso, l'animazione
 *   precedente viene cancellata e ne parte una nuova dal frame corrente
 * - rispetta prefers-reduced-motion (sempre istantaneo)
 */
export function createSmartCountUp(
  element: HTMLElement,
  formatter: (n: number) => string,
  duration = 0.7
): (value: number) => void {
  let prev: number | null = null;
  let ctrl: ReturnType<typeof animate> | null = null;

  return (value: number) => {
    if (!Number.isFinite(value)) {
      element.textContent = formatter(value);
      return;
    }

    if (prev === null || prefersReducedMotion()) {
      element.textContent = formatter(value);
      prev = value;
      return;
    }

    if (prev === value) {
      element.textContent = formatter(value);
      return;
    }

    if (ctrl) {
      try {
        ctrl.stop();
      } catch {
        /* ignore */
      }
      ctrl = null;
    }

    ctrl = animate(prev, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v: number) => {
        element.textContent = formatter(v);
      },
    });
    prev = value;
  };
}

// ---------- ORCHESTRATOR ----------

let safetyNetTimer: number | null = null;

function cleanupAll(): void {
  inViewCleanups.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
  inViewCleanups = [];
  cleanupMagnetic();
  if (safetyNetTimer !== null) {
    clearTimeout(safetyNetTimer);
    safetyNetTimer = null;
  }
  // Lascia .animations-ready: e' un flag "JS is alive" non per-pagina.
}

function initAllAnimations(): void {
  cleanupAll();

  // Disattiva la failsafe CSS (animations.css) — JS ha preso in carico.
  document.documentElement.classList.add('animations-ready');

  if (prefersReducedMotion()) {
    revealAllImmediately();
    return;
  }

  // Hero PRIMA dello scroll-reveal: sequenza al caricamento
  if (window.location.pathname === '/') {
    animateHero();
  }

  initScrollReveal();
  initMagneticButtons();

  // Rete di sicurezza: forza visibilità degli elementi rimasti opacity:0.
  safetyNetTimer = safetyNet();
}

/**
 * Doppio requestAnimationFrame: aspetta che il browser abbia
 * completato layout + paint + l'eventuale init di Lenis (smooth scroll)
 * prima di registrare gli observer di Motion. Senza questo, in cold
 * cache l'observer puo' attivarsi su un layout instabile e perdere
 * sezioni che sono "passate" dal viewport durante il riposizionamento.
 */
function safeInit(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initAllAnimations();
    });
  });
}

document.addEventListener('astro:page-load', safeInit);
document.addEventListener('astro:before-swap', cleanupAll);
