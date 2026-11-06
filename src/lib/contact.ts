import { business } from '../data/business';

export interface QuoteRequest {
  from?: string;
  to?: string;
  date?: string;
  cargo?: string;
  name?: string;
  phone?: string;
}

export type Lang = 'sk' | 'en';

const labels: Record<Lang, Record<keyof QuoteRequest | 'greeting' | 'intro', string>> = {
  sk: {
    greeting: 'Dobrý deň,',
    intro: 'mám záujem o prepravu.',
    from: 'Odkiaľ',
    to: 'Kam',
    date: 'Termín',
    cargo: 'Čo sa prepravuje',
    name: 'Meno',
    phone: 'Telefón',
  },
  en: {
    greeting: 'Hello,',
    intro: 'I would like to request a transport.',
    from: 'From',
    to: 'To',
    date: 'Date',
    cargo: 'What is transported',
    name: 'Name',
    phone: 'Phone',
  },
};

/** Builds the plain-text quote message from the filled-in form fields. Empty fields are skipped. */
export function buildQuoteMessage(req: QuoteRequest, lang: Lang = 'sk'): string {
  const l = labels[lang];
  const lines = [l.greeting, l.intro, ''];
  for (const key of ['from', 'to', 'date', 'cargo', 'name', 'phone'] as const) {
    const value = req[key]?.trim();
    if (value) lines.push(`${l[key]}: ${value}`);
  }
  return lines.join('\n').trimEnd();
}

/** WhatsApp click-to-chat link with an optional prefilled message. */
export function whatsappLink(message?: string, number: string = business.whatsappNumber): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** mailto: link with subject and body. */
export function mailtoLink(subject: string, body: string, to: string = business.email): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
