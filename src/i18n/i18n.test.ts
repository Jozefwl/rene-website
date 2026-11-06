import { describe, expect, it } from 'vitest';
import sk from './sk';
import en from './en';

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** All key paths, including array lengths, so missing items are caught too. */
function shape(value: Json, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${prefix}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}]/u;

describe('translations', () => {
  it('sk and en have the same keys and list lengths', () => {
    expect(shape(en as unknown as Json)).toEqual(shape(sk as unknown as Json));
  });

  it('no empty strings (except the optional Slovak language note)', () => {
    const empty = (d: Json, p = ''): string[] =>
      typeof d === 'string'
        ? d.trim() === '' ? [p] : []
        : Array.isArray(d)
          ? d.flatMap((v, i) => empty(v, `${p}[${i}]`))
          : d && typeof d === 'object'
            ? Object.entries(d).flatMap(([k, v]) => empty(v, p ? `${p}.${k}` : k))
            : [];
    expect(empty(sk as unknown as Json)).toEqual(['contact.languageNote']);
    expect(empty(en as unknown as Json)).toEqual([]);
  });

  it('contains no emoji', () => {
    expect(JSON.stringify(sk)).not.toMatch(emoji);
    expect(JSON.stringify(en)).not.toMatch(emoji);
  });
});
