import { describe, expect, it } from 'vitest';
import { buildQuoteMessage, gmailLink, mailtoLink, whatsappLink } from './contact';

describe('buildQuoteMessage', () => {
  it('builds a Slovak message and skips empty fields', () => {
    const msg = buildQuoteMessage({ from: 'Humenné', to: ' Košice ', cargo: '', phone: '0949' }, 'sk');
    expect(msg).toBe('Dobrý deň,\nmám záujem o prepravu.\n\nOdkiaľ: Humenné\nKam: Košice\nTelefón: 0949');
  });

  it('builds an English message', () => {
    expect(buildQuoteMessage({ date: '1. 12. 2026' }, 'en')).toBe(
      'Hello,\nI would like to request a transport.\n\nDate: 1. 12. 2026',
    );
  });
});

describe('links', () => {
  it('whatsapp link without and with text', () => {
    expect(whatsappLink()).toBe('https://wa.me/421949320426');
    expect(whatsappLink('Ahoj & čau')).toBe('https://wa.me/421949320426?text=Ahoj%20%26%20%C4%8Dau');
  });

  it('mailto link encodes subject and body', () => {
    expect(mailtoLink('Cenová ponuka', 'a\nb')).toBe(
      'mailto:rene.rilak@gmail.com?subject=Cenov%C3%A1%20ponuka&body=a%0Ab',
    );
  });
});

describe('gmailLink', () => {
  it('opens Gmail compose with recipient, subject and body', () => {
    const url = new URL(gmailLink('Cenová ponuka', 'a\nb'));
    expect(url.origin + url.pathname).toBe('https://mail.google.com/mail/');
    expect(url.searchParams.get('view')).toBe('cm');
    expect(url.searchParams.get('to')).toBe('rene.rilak@gmail.com');
    expect(url.searchParams.get('su')).toBe('Cenová ponuka');
    expect(url.searchParams.get('body')).toBe('a\nb');
  });
});
