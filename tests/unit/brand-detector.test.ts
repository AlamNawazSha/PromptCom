import { describe, it, expect } from 'vitest';
import { detectBrandImpersonation, levenshteinDistance } from '../../src/lib/url/brand-detector';

describe('Brand Impersonation & Typosquatting Unit Tests', () => {
  it('calculates correct Levenshtein distance', () => {
    expect(levenshteinDistance('google', 'google')).toBe(0);
    expect(levenshteinDistance('google', 'g00gle')).toBe(2);
    expect(levenshteinDistance('paypal', 'paypa1')).toBe(1);
    expect(levenshteinDistance('apple', 'appl')).toBe(1);
  });

  it('detects character substitutions / leetspeak mimicry (micros0ft, paypa1, goog1e)', () => {
    const res1 = detectBrandImpersonation('micros0ft.com');
    expect(res1.hasMismatch).toBe(true);
    expect(res1.matchedBrand).toBe('Microsoft');

    const res2 = detectBrandImpersonation('paypa1.co');
    expect(res2.hasMismatch).toBe(true);
    expect(res2.matchedBrand).toBe('PayPal');
  });

  it('detects brand name prepended with deception keywords (e.g. microsoft-login.xyz)', () => {
    const res = detectBrandImpersonation('microsoft-login-portal.com');
    expect(res.hasMismatch).toBe(true);
    expect(res.matchedBrand).toBe('Microsoft');
  });

  it('does NOT flag authentic brand domains', () => {
    const resGoogle = detectBrandImpersonation('google.com');
    expect(resGoogle.hasMismatch).toBe(false);

    const resSubdomain = detectBrandImpersonation('careers.google.com');
    expect(resSubdomain.hasMismatch).toBe(false);

    const resMsft = detectBrandImpersonation('login.microsoft.com');
    expect(resMsft.hasMismatch).toBe(false);
  });
});
