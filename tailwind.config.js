import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        // Palette pagine a fasce, dai colori del logo Fideuram: verde #006937 (principale)
        // e arancio #E04403 (accento, quasi complementare: solo linee, sottolineature, stati attivi).
        // Proporzioni indicative: 60% neutri caldi, 30% verde, 10% arancio.
        brand: { DEFAULT: '#006937', light: '#1F7F4D', dark: '#00482A' },
        ember: { DEFAULT: '#E04403', light: '#F8DCCB', dark: '#B33602' },
        sand: '#ECE3D4',
        ivory: '#F6F3ED',
        linen: '#FAF8F4',
        charcoal: { DEFAULT: '#1E2421', light: '#2A322E' },
        'emerald-brand': '#00A652',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        playfair: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
      },

      animation: {
        fade: 'fadeInUp 1s both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
