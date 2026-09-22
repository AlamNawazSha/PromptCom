import { RiskLevel, ThreatScoresBreakdown } from '@/types';

export interface ScoringWeights {
  textWeight: number;      // default: 0.25
  paymentWeight: number;   // default: 0.20
  urlWeight: number;       // default: 0.20
  domainWeight: number;    // default: 0.15
  identityWeight: number;  // default: 0.10
  urgencyWeight: number;   // default: 0.10
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  textWeight: 0.25,
  paymentWeight: 0.20,
  urlWeight: 0.20,
  domainWeight: 0.15,
  identityWeight: 0.10,
  urgencyWeight: 0.10,
};

export class ThreatScoringEngine {
  private weights: ScoringWeights;

  constructor(customWeights: Partial<ScoringWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Calculates the composite Scam Threat Index (0–100%) based on multi-factor weighted evaluation
   */
  public calculateScore(breakdown: ThreatScoresBreakdown): {
    score: number;
    riskLevel: RiskLevel;
    confidence: number;
  } {
    // 1. Clamp each sub-risk between 0 and 100 to prevent manipulation
    const textRisk = this.clamp(breakdown.textRisk, 0, 100);
    const paymentRisk = this.clamp(breakdown.paymentRisk, 0, 100);
    const urlRisk = this.clamp(breakdown.urlRisk, 0, 100);
    const domainRisk = this.clamp(breakdown.domainRisk, 0, 100);
    const identityRisk = this.clamp(breakdown.identityRisk, 0, 100);
    const urgencyRisk = this.clamp(breakdown.urgencyRisk, 0, 100);

    // 2. Weighted calculation
    let rawWeightedScore =
      textRisk * this.weights.textWeight +
      paymentRisk * this.weights.paymentWeight +
      urlRisk * this.weights.urlWeight +
      domainRisk * this.weights.domainWeight +
      identityRisk * this.weights.identityWeight +
      urgencyRisk * this.weights.urgencyWeight;

    // 3. Security Override Rules:
    // If critical signals are detected (e.g. upfront payment demand or acute scam pattern),
    // ensure the score is pushed into HIGH_RISK or CRITICAL to avoid dangerous false negatives
    if (textRisk >= 60) {
      rawWeightedScore = Math.max(rawWeightedScore, Math.round(textRisk * 0.95));
    }
    if (paymentRisk >= 50) {
      rawWeightedScore = Math.max(rawWeightedScore, 70);
    }
    if (paymentRisk >= 75) {
      rawWeightedScore = Math.max(rawWeightedScore, 75);
    }
    if (paymentRisk >= 90) {
      rawWeightedScore = Math.max(rawWeightedScore, 85);
    }
    if (identityRisk >= 75) { // e.g. asking for OTP / passwords
      rawWeightedScore = Math.max(rawWeightedScore, 82);
    }
    if (urlRisk >= 75 && domainRisk >= 60) {
      rawWeightedScore = Math.max(rawWeightedScore, 75);
    }

    const finalScore = this.clamp(Math.round(rawWeightedScore), 0, 100);

    // 4. Map to discrete RiskLevel
    const riskLevel = this.getRiskLevel(finalScore);

    // 5. Compute confidence index based on input depth and signal convergence
    const nonZeroSignals = [textRisk, paymentRisk, urlRisk, domainRisk, identityRisk, urgencyRisk].filter(s => s > 0).length;
    const confidence = this.clamp(Math.round(60 + (nonZeroSignals * 6)), 50, 98);

    return {
      score: finalScore,
      riskLevel,
      confidence,
    };
  }

  /**
   * Translates numerical threat index (0-100) into standardized risk classification
   */
  public getRiskLevel(score: number): RiskLevel {
    if (score <= 20) return 'LOW';
    if (score <= 40) return 'GUARDED';
    if (score <= 60) return 'SUSPICIOUS';
    if (score <= 80) return 'HIGH_RISK';
    return 'CRITICAL';
  }

  private clamp(val: number, min: number, max: number): number {
    if (isNaN(val)) return min;
    return Math.max(min, Math.min(max, val));
  }
}
