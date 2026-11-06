// Single source of truth for René's business details.
// Change things here and every page (both languages) updates.

export const business = {
  brand: 'R&R Autodoprava',
  legalName: 'René Rilák',
  ico: '56533870',
  dic: '1128002711',
  // Not a VAT payer: no IČ DPH.
  address: {
    street: 'Štefanovce 35',
    postalCode: '094 01',
    city: 'Tovarné',
    country: 'SK',
  },
  registry: 'Okresný úrad Vranov nad Topľou',
  base: 'Humenné',
  phone: '+421 949 320 426',
  phoneHref: 'tel:+421949320426',
  whatsappNumber: '421949320426',
  email: 'rene.rilak@gmail.com',
  phoneHours: { open: '07:00', close: '19:00' },
  towns: [
    'Humenné',
    'Snina',
    'Vranov nad Topľou',
    'Strážske',
    'Michalovce',
    'Stropkov',
    'Svidník',
    'Prešov',
    'Košice',
  ],
  van: {
    model: 'Peugeot Boxer L4H2',
    year: 2012,
    volumeM3: 15,
    payloadT: 1.5,
    cargo: { length: 4.07, width: 1.87, widthArches: 1.42, height: 1.93 },
    rearDoor: { width: 1.56, height: 1.79 },
  },
  // Filled in later; empty links are not rendered.
  social: {
    facebook: '',
    instagram: '',
  },
  site: 'https://rrautodoprava.sk',
} as const;

export type Business = typeof business;
