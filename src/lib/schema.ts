import { business } from '../data/business';
import type { Lang } from '../i18n';

/** schema.org MovingCompany data for search engines. */
export function businessSchema(lang: Lang, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: business.brand,
    legalName: business.legalName,
    taxID: business.ico,
    description,
    url,
    inLanguage: lang,
    telephone: business.phone.replace(/\s/g, ''),
    email: business.email,
    image: new URL('/og-image.png', business.site).href,
    logo: new URL('/apple-touch-icon.png', business.site).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressCountry: business.address.country,
    },
    areaServed: [
      ...business.towns.map((name) => ({ '@type': 'City', name })),
      { '@type': 'Country', name: 'Slovakia' },
    ],
    paymentAccepted: 'Cash, Bank transfer, Invoice',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: business.phoneHours.open,
      closes: business.phoneHours.close,
    },
    knowsLanguage: 'sk',
  };
}
