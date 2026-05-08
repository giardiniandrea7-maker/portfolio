export type Calcolatore = {
  slug: string;
  titolo: string;
  descrizione: string;
  href: string;
  disponibile: boolean;
  icona?: string;
};

export const calcolatori: Calcolatore[] = [
  {
    slug: 'pensione-integrativa',
    titolo: 'Stimatore Pensione Integrativa',
    descrizione:
      'Stima il tuo risparmio fiscale annuo e il montante che avrai accumulato alla data di pensionamento.',
    href: '/calcolatori/pensione-integrativa',
    disponibile: true,
    icona: 'tabler:umbrella',
  },
  {
    slug: 'interesse-composto',
    titolo: 'Calcolatore di Interesse Composto',
    descrizione:
      'Stima il capitale finale ottenuto dall’accumulo degli interessi nel corso degli anni partendo da un capitale iniziale, con eventuali versamenti periodici.',
    href: '/calcolatori/interesse-composto',
    disponibile: true,
    icona: 'tabler:trending-up',
  },
  {
    slug: 'rendimento-obbligazioni',
    titolo: 'Calcolatore di Rendimento per Obbligazioni e BTP',
    descrizione:
      'Calcola rendimento (assoluto, percentuale, annuo), capitale finale, tempo residuo ed eventuale credito d’imposta per BTP, BOT, CTZ, CCT e obbligazioni.',
    href: '/calcolatori/rendimento-obbligazioni',
    disponibile: false,
    icona: 'tabler:certificate',
  },
  {
    slug: 'mutuo',
    titolo: 'Calcolatore Rata Mutuo',
    descrizione:
      'Comprendi l’impatto finanziario di un mutuo sulla tua situazione: rata periodica, totale interessi e piano di ammortamento.',
    href: '/calcolatori/mutuo',
    disponibile: false,
    icona: 'tabler:home',
  },
  {
    slug: 'rendita',
    titolo: 'Calcolatore Rendita',
    descrizione:
      'Capisci quanto capitale serve per vivere di rendita o quale rendita può generare il capitale che hai oggi, in base a stile di vita e rendimento atteso.',
    href: '/calcolatori/rendita',
    disponibile: false,
    icona: 'tabler:wallet',
  },
  {
    slug: 'isee',
    titolo: 'Calcolatore ISEE',
    descrizione:
      'Simulazione dell’ISEE per stimare l’accesso a sconti universitari, bonus statali, agevolazioni per servizi sociali e molto altro.',
    href: '/calcolatori/isee',
    disponibile: false,
    icona: 'tabler:file-invoice',
  },
  {
    slug: 'semplice-vs-composto',
    titolo: 'Interesse Semplice vs. Interesse Composto',
    descrizione:
      'Strumento didattico per percepire numericamente la differenza tra interesse semplice e composto al crescere del tempo.',
    href: '/calcolatori/semplice-vs-composto',
    disponibile: false,
    icona: 'tabler:scale',
  },
];
