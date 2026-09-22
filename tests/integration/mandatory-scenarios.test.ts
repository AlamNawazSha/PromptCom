import { describe, it, expect } from 'vitest';
import { RuleBasedAnalyzer } from '../../src/lib/rules/rule-analyzer';
import { UrlAnalyzer } from '../../src/lib/url/url-analyzer';
import { ThreatScoringEngine } from '../../src/lib/scoring/scoring-engine';
import { GeminiAnalysisService } from '../../src/lib/ai/gemini-service';

describe('10 Mandatory Prompt Test Cases', () => {
  const ruleAnalyzer = new RuleBasedAnalyzer();
  const urlAnalyzer = new UrlAnalyzer();
  const scoringEngine = new ThreatScoringEngine();

  // TEST 1: Normal job offer with no payment request. Expected: Low or guarded risk.
  it('TEST 1: Normal job offer with no payment request returns Low or Guarded risk', () => {
    const normalOffer = `Dear Candidate, We are pleased to offer you the position of Software Engineer at Enterprise Corp. Your annual salary will be $90,000. All equipment will be provided on your first day. Please sign and return the attached contract.`;
    const res = ruleAnalyzer.analyze(normalOffer);
    const score = scoringEngine.calculateScore({
      textRisk: res.overallTextRiskScore,
      paymentRisk: res.paymentRiskScore,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 0,
      urgencyRisk: res.urgencyRiskScore,
    });
    expect(['LOW', 'GUARDED']).toContain(score.riskLevel);
    expect(score.score).toBeLessThanOrEqual(40);
  });

  // TEST 2: Job offer asking for ₹20,000 registration fee. Expected: High risk.
  it('TEST 2: Job offer asking for ₹20,000 registration fee returns High risk', () => {
    const feeOffer = `Congratulations! You are selected as Developer. You must pay a registration fee of ₹20,000 to process your offer letter.`;
    const res = ruleAnalyzer.analyze(feeOffer);
    const score = scoringEngine.calculateScore({
      textRisk: res.overallTextRiskScore,
      paymentRisk: res.paymentRiskScore,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 0,
      urgencyRisk: res.urgencyRiskScore,
    });
    expect(['HIGH_RISK', 'CRITICAL']).toContain(score.riskLevel);
    expect(score.score).toBeGreaterThanOrEqual(60);
  });

  // TEST 3: Job offer requiring equipment payment before joining. Expected: High risk.
  it('TEST 3: Job offer requiring equipment payment before joining returns High risk', () => {
    const equipOffer = `You must purchase laptop equipment of ₹35,000 from our vendor before joining. Amount will be reimbursed after 30 days.`;
    const res = ruleAnalyzer.analyze(equipOffer);
    const score = scoringEngine.calculateScore({
      textRisk: res.overallTextRiskScore,
      paymentRisk: res.paymentRiskScore,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 0,
      urgencyRisk: res.urgencyRiskScore,
    });
    expect(['HIGH_RISK', 'CRITICAL']).toContain(score.riskLevel);
    expect(score.score).toBeGreaterThanOrEqual(60);
  });

  // TEST 4: Rental listing requesting deposit before property viewing. Expected: High risk.
  it('TEST 4: Rental listing requesting deposit before property viewing returns High risk', () => {
    const rentalOffer = `I am out of country. Send a deposit before viewing the apartment to confirm your booking and courier keys.`;
    const res = ruleAnalyzer.analyze(rentalOffer);
    const score = scoringEngine.calculateScore({
      textRisk: res.overallTextRiskScore,
      paymentRisk: res.paymentRiskScore,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 0,
      urgencyRisk: res.urgencyRiskScore,
    });
    expect(['HIGH_RISK', 'CRITICAL']).toContain(score.riskLevel);
    expect(score.score).toBeGreaterThanOrEqual(60);
  });

  // TEST 5: Message asking for OTP. Expected: Critical/high risk.
  it('TEST 5: Message asking for OTP returns Critical or High risk', () => {
    const otpMsg = `URGENT: Your account has been suspended. Please share your OTP and netbanking password to verify identity within 2 hours.`;
    const res = ruleAnalyzer.analyze(otpMsg);
    const score = scoringEngine.calculateScore({
      textRisk: res.overallTextRiskScore,
      paymentRisk: res.paymentRiskScore,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 85,
      urgencyRisk: res.urgencyRiskScore,
    });
    expect(['HIGH_RISK', 'CRITICAL']).toContain(score.riskLevel);
    expect(score.score).toBeGreaterThanOrEqual(70);
  });

  // TEST 6: URL containing IP address. Expected: Elevated URL risk.
  it('TEST 6: URL containing IP address returns elevated URL risk', async () => {
    const urlRes = await urlAnalyzer.analyzeUrl('http://198.51.100.42/portal');
    expect(urlRes.isIpHost).toBe(true);
    expect(urlRes.riskScore).toBeGreaterThanOrEqual(40);
    expect(urlRes.detectedRedFlags.some(f => f.title.includes('IP Address'))).toBe(true);
  });

  // TEST 7: Punycode domain. Expected: Elevated URL risk.
  it('TEST 7: Punycode domain returns elevated URL risk', async () => {
    const urlRes = await urlAnalyzer.analyzeUrl('https://xn--pple-43d.com/login');
    expect(urlRes.isPunycode).toBe(true);
    expect(urlRes.riskScore).toBeGreaterThanOrEqual(40);
    expect(urlRes.detectedRedFlags.some(f => f.title.includes('Punycode'))).toBe(true);
  });

  // TEST 8: HTTP login URL. Expected: Elevated risk.
  it('TEST 8: HTTP login URL returns elevated risk', async () => {
    const urlRes = await urlAnalyzer.analyzeUrl('http://example-service.com/login');
    expect(urlRes.protocol).toBe('http');
    expect(urlRes.hasCredentialKeywords).toBe(true);
    expect(urlRes.riskScore).toBeGreaterThanOrEqual(35);
  });

  // TEST 9: Extremely long suspicious URL. Expected: URL risk indicator.
  it('TEST 9: Extremely long suspicious URL returns URL risk indicator', async () => {
    const longParam = 'a'.repeat(160);
    const longUrl = `https://example-careers.com/auth?token=${longParam}`;
    const urlRes = await urlAnalyzer.analyzeUrl(longUrl);
    expect(urlRes.detectedRedFlags.some(f => f.title.includes('Long'))).toBe(true);
  });

  // TEST 10: Gemini API unavailable. Expected: Rule-based fallback.
  it('TEST 10: Gemini API unavailable triggers rule-based fallback without throwing', async () => {
    const geminiService = new GeminiAnalysisService();
    // Analyze with empty or unconfigured API key
    const fallbackResult = await geminiService.analyzeText(
      'Congratulations! Selected for position. Pay refundable fee of ₹15,000.',
      'JOB_OFFER'
    );
    expect(fallbackResult).toBeDefined();
    expect(fallbackResult.isFallback).toBe(true);
    expect(fallbackResult.summary).toContain('Result generated using');
    expect(fallbackResult.redFlags.length).toBeGreaterThan(0);
  });
});
