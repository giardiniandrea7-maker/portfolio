import { getPermalink } from './utils/permalinks';
 
export const headerData = {
  links: [
    { text: 'Chi sono', href: '/#about' },
    { text: 'Percorso', href: '/#resume' },
    { text: 'Servizi', href: '/#portfolio' },
    { text: 'Contatti', href: '/contatti' },
  ],
  actions: [
    {
      text: 'Scrivimi',
      href: '/contatti',
    },
  ],
};
 
// Menu delle pagine a fasce (header a schermo intero + footer condivisi).
// Ancore assolute: funzionano da qualsiasi pagina.
export const siteMenuLinks = [
  { text: 'Chi sono', href: '/#chi-sono' },
  { text: 'Consulenza', href: '/consulenza' },
  { text: 'Servizi', href: '/servizi' },
  { text: 'Blog', href: '/blog' },
  { text: 'Contattami', href: '/contatti' },
];

export const siteContacts = {
  whatsapp: 'https://wa.me/393515456845',
  phone: '+39 351 545 6845',
  phoneHref: 'tel:+393515456845',
  email: 'agiardini@fideuram.it',
  linkedin: 'https://www.linkedin.com/in/andrea-giardini-58923a268',
  instagram: 'https://www.instagram.com/andreagiardini.finanza/',
  areaClientiFideuram: 'https://alfabeto.fideuram.it/content/fideuram/it/login.html',
  vatId: '13494670014',
};

// Società mandante e iscrizioni (fonte: Registro unico degli intermediari IVASS e albo OCF)
export const siteMandante = {
  name: 'Fideuram - Intesa Sanpaolo Private Banking S.p.A.',
  sedeLegale: 'Piazza San Carlo 156, 10121 Torino',
  ruiSection: 'D',
  ruiNumber: 'D000060672',
  reclamiUrl: 'https://www.fideuram.it/reclami-e-risoluzione-controversie/',
};

export const siteRui = {
  number: 'E000832010',
  section: 'E',
  sectionLabel: 'collaboratori degli intermediari iscritti nelle sezioni A, B o D',
  since: '01/09/2026',
};

// Ufficio: usato da footer, mappa e blocco ufficio di /contatti.
// mapsQuery = indirizzo completo per Google Maps (vuoto finché manca l'indirizzo).
export const siteOffice = {
  city: 'Faenza',
  street: 'Via Agostino Tolosano, 88',
  postalCode: '48018',
  locality: 'Faenza',
  region: 'RA',
  address: 'Via Agostino Tolosano, 88 — 48018 Faenza (RA)',
  mapsQuery: 'Via Agostino Tolosano 88, 48018 Faenza RA',
};

export const footerData = {
  links: [
    {
      title: 'Scopri',
      links: [
        { text: 'Chi sono', href: '/chi-sono' },
        { text: 'Richiedi diagnosi gratuita', href: '/richiedi-diagnosi' },
      ],
    },
    {
      title: 'Risorse',
      links: [
        { text: 'Calcolatori', href: '/calcolatori' },
        { text: 'Glossario', href: '/glossario' },
      ],
    },
    {
      title: 'Contatti',
      links: [
        { text: 'agiardini@fideuram.it', href: 'mailto:agiardini@fideuram.it' },
        { text: '+39 351 545 6845', href: 'tel:+393515456845' },
        { text: 'Instagram', href: 'https://www.instagram.com/andreagiardini.finanza/' },
      ],
    },
    {
      title: 'Informazioni',
      links: [
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Cookie Policy', href: '/cookie-policy' },
        { text: 'Note legali', href: '/note-legali' },
        { text: 'Rivedi il consenso cookie', href: '#cookie-settings' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/andreagiardini.finanza/' },
    { ariaLabel: 'WhatsApp', icon: 'tabler:brand-whatsapp', href: 'https://wa.me/393515456845' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/andrea-giardini-58923a268' },
    { ariaLabel: 'Email', icon: 'tabler:mail', href: 'mailto:agiardini@fideuram.it' },
  ],
  footNote: 'Andrea Giardini · P.IVA 13494670014 · Via Agostino Tolosano, 88 — 48018 Faenza (RA)',
};

export const officeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteOffice.mapsQuery)}`;
export const officeDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteOffice.mapsQuery)}`;
