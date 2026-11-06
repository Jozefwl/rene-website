import sk from './sk';
import en from './en';
import type { Dict } from './sk';

export type Lang = 'sk' | 'en';
export const languages: Lang[] = ['sk', 'en'];
export const defaultLang: Lang = 'sk';

const dicts: Record<Lang, Dict> = { sk, en };

export function useTranslations(lang: Lang): Dict {
  return dicts[lang];
}

/** Paths of the same page in each language. Keys are page ids. */
export const routes = {
  home: { sk: '/', en: '/en/' },
  privacy: { sk: '/ochrana-osobnych-udajov/', en: '/en/privacy/' },
} as const;

export type PageId = keyof typeof routes;

export function otherLang(lang: Lang): Lang {
  return lang === 'sk' ? 'en' : 'sk';
}
