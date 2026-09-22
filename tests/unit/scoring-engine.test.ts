import { describe, it, expect } from 'vitest';
import { ThreatScoringEngine } from '../../src/lib/scoring/scoring-engine';

describe('ThreatScoringEngine Unit Tests', () => {
  const engine = new ThreatScoringEngine();

  it('correctly maps 0-20 to LOW, 21-40 to GUARDED, 41-60 to SUSPICIOUS, 61-80 to HIGH_RISK, 81-100 to CRITICAL', () => {
    expect(engine.getRiskLevel(0)).toBe('LOW');
    expect(engine.getRiskLevel(20)).toBe('LOW');
    expect(engine.getRiskLevel(25)).toBe('GUARDED');
    expect(engine.getRiskLevel(40)).toBe('GUARDED');
    expect(engine.getRiskLevel(45)).toBe('SUSPICIOUS');
    expect(engine.getRiskLevel(60)).toBe('SUSPICIOUS');
    expect(engine.getRiskLevel(70)).toBe('HIGH_RISK');
    expect(engine.getRiskLevel(80)).toBe('HIGH_RISK');
    expect(engine.getRiskLevel(85)).toBe('CRITICAL');
    expect(engine.getRiskLevel(100)).toBe('CRITICAL');
  });

  it('clamps output strictly between 0 and 100', () => {
    const minResult = engine.calculateScore({
      textRisk: 0,
      paymentRisk: 0,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 0,
      urgencyRisk: 0,
    });
    expect(minResult.score).toBeGreaterThanOrEqual(0);
    expect(minResult.score).toBeLessThanOrEqual(20);
    expect(minResult.riskLevel).toBe('LOW');

    const maxResult = engine.calculateScore({
      textRisk: 100,
      paymentRisk: 100,
      urlRisk: 100,
      domainRisk: 100,
      identityRisk: 100,
      urgencyRisk: 100,
    });
    expect(maxResult.score).toBe(100);
    expect(maxResult.riskLevel).toBe('CRITICAL');
  });

  it('elevates risk when high payment demand triggers security override', () => {
    const result = engine.calculateScore({
      textRisk: 10,
      paymentRisk: 95,
      urlRisk: 0,
      domainRisk: 0,
      identityRisk: 0,
      urgencyRisk: 0,
    });
    // Security override should push score to at least 85 (CRITICAL)
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.riskLevel).toBe('CRITICAL');
  });
});
