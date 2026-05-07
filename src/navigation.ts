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
      title: 'Contatti',
      links: [
        { text: 'andrea@giardiniconsulenza.it', href: 'mailto:andrea@giardiniconsulenza.it' },
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
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/andreagiardini.finanza/' },
    { ariaLabel: 'WhatsApp', icon: 'tabler:brand-whatsapp', href: '#' },
    { ariaLabel: 'Email', icon: 'tabler:mail', href: 'mailto:andrea@giardiniconsulenza.it' },
  ],
  footNote: '',
};
