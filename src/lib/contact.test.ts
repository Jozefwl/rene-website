import { describe, expect, it } from 'vitest';
import { buildQuoteMessage, mailtoLink, whatsappLink } from './contact';

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
