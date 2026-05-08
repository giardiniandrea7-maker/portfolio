// =============================================================================
// Tema centralizzato per i grafici Chart.js dei calcolatori
// -----------------------------------------------------------------------------
// Fonte unica di verità per:
//   • palette colori (allineata ai token brand del sito)
//   • tipografia tooltip/label
//   • default tooltip
//   • durate animazioni
//
// Tutti i calcolatori importano da qui:
//   import { CHART_COLORS, CHART_TOOLTIP, CHART_FONT_FAMILY } from '~/lib/calcolatori/chart-theme';
//
// Niente più hex code hardcoded sparsi nei singoli file.
// =============================================================================

/** Palette colori brand per i grafici. */
export const CHART_COLORS = {
  // Brand primari
  emerald:        '#00A652',
  emeraldSoft:    'rgba(0, 166, 82, 0.15)',
  emeraldLine:    'rgba(0, 166, 82, 0.6)',
  sage:           '#166963',
  sageDark:       '#0F4F4A',
  sageLight:      '#79B9AD',
  ochre:          '#AB7F62',
  ochreLight:     '#C49A7E',
  ochreDark:      '#8A6449',
  charcoal:       '#373D42',

  // Stati semantici
  alertRed:       '#c0392b',
  alertRedSoft:   'rgba(220, 38, 38, 0.12)',

  // Neutri
  white:          '#FFFFFF',
  grayText:       '#6B7672',
  gridLine:       'rgba(22, 105, 99, 0.1)',
  gridLineSoft:   'rgba(22, 105, 99, 0.07)',
  borderTooltip:  'rgba(22, 105, 99, 0.25)',
} as const;

/** Famiglia font condivisa per tutti i grafici. */
export const CHART_FONT_FAMILY = 'Manrope, sans-serif';

/** Dimensioni e pesi standard. */
export const CHART_TYPOGRAPHY = {
  fontFamily: CHART_FONT_FAMILY,
  titleSize: 13,
  titleWeight: 700 as const,
  bodySize: 12,
  footerSize: 12,
  footerWeight: 700 as const,
  tickSize: 11,
  tickColor: CHART_COLORS.grayText,
} as const;

/**
 * Configurazione tooltip standard per tutti i calcolatori.
 * Va spread-ata nel `plugins.tooltip` di Chart.js, eventualmente con
 * override locali per `callbacks` (label/title/footer).
 *
 * Esempio:
 *   tooltip: { ...CHART_TOOLTIP, callbacks: { ... } }
 */
export const CHART_TOOLTIP = {
  backgroundColor: CHART_COLORS.white,
  borderColor: CHART_COLORS.borderTooltip,
  borderWidth: 1,
  titleColor: CHART_COLORS.sageDark,
  titleFont: { family: CHART_FONT_FAMILY, weight: 700 as const, size: 13 },
  bodyColor: CHART_COLORS.charcoal,
  bodyFont: { family: CHART_FONT_FAMILY, size: 12 },
  footerColor: CHART_COLORS.charcoal,
  footerFont: { family: CHART_FONT_FAMILY, weight: 700 as const, size: 12 },
  padding: 12,
  cornerRadius: 8,
  displayColors: true,
  boxPadding: 4,
} as const;

/** Configurazione asse X standard (etichette categorie). */
export const CHART_AXIS_X = {
  grid: { display: false },
  border: { display: false },
  ticks: {
    color: CHART_COLORS.grayText,
    font: { family: CHART_FONT_FAMILY, size: 11 },
  },
};

/** Configurazione asse Y standard (valori numerici). */
export const CHART_AXIS_Y = {
  beginAtZero: true,
  grid: { color: CHART_COLORS.gridLine, lineWidth: 1 },
  border: { display: false },
  ticks: {
    color: CHART_COLORS.grayText,
    font: { family: CHART_FONT_FAMILY, size: 11 },
  },
};

/** Durate animazioni standard. */
export const CHART_ANIMATION = {
  /** Animazione standard al primo render (es. line/bar normali). */
  default: { duration: 600, easing: 'easeOutQuart' as const },
  /** Animazione lunga per grafici "didattici" (es. crescita capitale a 30+ anni). */
  long:    { duration: 1500, easing: 'easeOutQuart' as const },
  /** Niente animazione (per gli update successivi al primo render). */
  none:    false as const,
};

/**
 * Helper: formatter euro short (5K, 1.2M, ecc.) per i ticks Y.
 * Importato dai calcolatori per uniformità.
 */
export function fmtEuroShortChart(v: number): string {
  if (!Number.isFinite(v)) return '';
  const a = Math.abs(v);
  if (a >= 1_000_000) {
    const m = v / 1_000_000;
    return (Number.isInteger(m) ? m.toString() : m.toFixed(1).replace('.', ',')) + 'M €';
  }
  if (a >= 1_000) return Math.round(v / 1000) + 'K €';
  return Math.round(v) + ' €';
}
