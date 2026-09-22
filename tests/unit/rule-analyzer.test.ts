import { describe, it, expect } from 'vitest';
import { RuleBasedAnalyzer } from '../../src/lib/rules/rule-analyzer';

describe('RuleBasedAnalyzer Unit Tests', () => {
  const analyzer = new RuleBasedAnalyzer();

  it('detects upfront registration / onboarding fees', () => {
    const text = 'To secure your job, please pay a registration fee of ₹20,000.';
    const res = analyzer.analyze(text);
    expect(res.findings.length).toBeGreaterThan(0);
    expect(res.findings.some(f => f.category === 'PAYMENT')).toBe(true);
    expect(res.paymentRiskScore).toBeGreaterThanOrEqual(40);
  });

  it('detects laptop / equipment purchase demands', () => {
    const text = 'You must purchase laptop equipment from our vendor before joining.';
    const res = analyzer.analyze(text);
    expect(res.findings.some(f => f.title.includes('Equipment'))).toBe(true);
  });

  it('detects advance rental deposit requests before physical viewing', () => {
    const text = 'Please send a deposit before viewing the apartment to hold your reservation.';
    const res = analyzer.analyze(text);
    expect(res.findings.some(f => f.category === 'RENTAL_SCAM')).toBe(true);
    expect(res.rentalRiskScore).toBeGreaterThanOrEqual(40);
  });

  it('detects credential and OTP harvesting demands', () => {
    const text = 'Please share your OTP and netbanking password to verify your account.';
    const res = analyzer.analyze(text);
    expect(res.findings.some(f => f.category === 'PHISHING')).toBe(true);
    expect(res.phishingRiskScore).toBeGreaterThanOrEqual(50);
  });

  it('extracts structured entities like email, salary, payment amounts, and UPI IDs', () => {
    const text = `Position of Senior React Engineer at Acme Technologies. 
Salary: ₹15 LPA. Contact hr@acme.com or 9876543210. 
Pay ₹5,000 via UPI to payment@okaxis within 2 hours.`;
    const entities = analyzer.extractEntities(text);

    expect(entities.some(e => e.entityType === 'EMAIL' && e.value === 'hr@acme.com')).toBe(true);
    expect(entities.some(e => e.entityType === 'PAYMENT_AMOUNT' && e.value.includes('5,000'))).toBe(true);
    expect(entities.some(e => e.entityType === 'UPI_ID')).toBe(true);
    expect(entities.some(e => e.entityType === 'DEADLINE')).toBe(true);
  });
});
