import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponseSchema, GeminiResponse } from '../validation/schemas';
import { SYSTEM_SECURITY_INSTRUCTION, buildAnalysisPrompt } from './prompt-templates';
import { RuleBasedAnalyzer } from '../rules/rule-analyzer';
import { AiAnalysisResult, RiskLevel } from '@/types';

export class GeminiAnalysisService {
  private genAI: GoogleGenerativeAI | null = null;
  private ruleAnalyzer: RuleBasedAnalyzer;

  constructor() {
    this.ruleAnalyzer = new RuleBasedAnalyzer();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
    }
  }

  /**
   * Analyzes text using Google Gemini with automatic deterministic fallback
   */
  public async analyzeText(untrustedText: string, categoryHint: string = 'AUTO_DETECT'): Promise<AiAnalysisResult> {
    // 1. Check if Gemini API key is configured
    if (!this.genAI) {
      return this.generateRuleBasedFallback(
        untrustedText,
        categoryHint,
        'AI semantic analysis unavailable (GEMINI_API_KEY not configured). Result generated using deterministic cybersecurity rules.'
      );
    }

    try {
      // 2. Initialize model with system instruction
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_SECURITY_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature for deterministic analysis
        },
      });

      const prompt = buildAnalysisPrompt(untrustedText, categoryHint);
      const result = await model.generateContent(prompt);
      const rawResponseText = result.response.text();

      // Clean markdown fences if any
      let cleanJson = rawResponseText.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanJson);
      const validated: GeminiResponse = GeminiResponseSchema.parse(parsed);

      return {
        classification: validated.classification as RiskLevel,
        confidence: validated.confidence,
        summary: validated.summary,
        redFlags: validated.redFlags.map(rf => ({
          category: rf.category as any,
          severity: rf.severity,
          title: rf.title,
          evidence: rf.evidence,
          explanation: rf.explanation,
          recommendedAction: rf.recommendedAction,
        })),
        positiveSignals: validated.positiveSignals,
        entities: validated.entities,
        recommendedActions: validated.recommendedActions,
        questionsToVerify: validated.questionsToVerify,
        extractedIndicators: validated.extractedIndicators,
        isFallback: false,
      };
    } catch (error: any) {
      console.warn('Gemini API call or validation failed, falling back to rule engine:', error?.message);
      return this.generateRuleBasedFallback(
        untrustedText,
        categoryHint,
        `AI semantic analysis temporarily unavailable (${error?.message?.slice(0, 80) || 'API timeout'}). Result generated using local security rules.`
      );
    }
  }

  /**
   * Deterministic rule-based fallback generator
   */
  public generateRuleBasedFallback(content: string, categoryHint: string, fallbackNotice: string): AiAnalysisResult {
    const ruleResult = this.ruleAnalyzer.analyze(content, categoryHint);

    let classification: RiskLevel = 'LOW';
    if (ruleResult.overallTextRiskScore >= 80) {
      classification = 'CRITICAL';
    } else if (ruleResult.overallTextRiskScore >= 60) {
      classification = 'HIGH_RISK';
    } else if (ruleResult.overallTextRiskScore >= 40) {
      classification = 'SUSPICIOUS';
    } else if (ruleResult.overallTextRiskScore >= 20) {
      classification = 'GUARDED';
    }

    const entitiesRecord: Record<string, string> = {};
    for (const ent of ruleResult.entities) {
      if (ent.entityType === 'COMPANY') entitiesRecord.company = ent.value;
      if (ent.entityType === 'JOB_TITLE') entitiesRecord.jobTitle = ent.value;
      if (ent.entityType === 'SALARY') entitiesRecord.salary = ent.value;
      if (ent.entityType === 'EMAIL') entitiesRecord.email = ent.value;
      if (ent.entityType === 'PHONE') entitiesRecord.phone = ent.value;
      if (ent.entityType === 'PAYMENT_AMOUNT') entitiesRecord.paymentAmount = ent.value;
      if (ent.entityType === 'PAYMENT_METHOD') entitiesRecord.paymentMethod = ent.value;
      if (ent.entityType === 'UPI_ID') entitiesRecord.paymentMethod = `UPI (${ent.value})`;
    }

    const recommendedActions: string[] = [];
    if (ruleResult.paymentRiskScore > 40) {
      recommendedActions.push('Do NOT send any upfront payment, registration fee, or equipment reimbursement.');
      recommendedActions.push('Report the payment handle/account to your banking institution if already attempted.');
    }
    if (ruleResult.phishingRiskScore > 30) {
      recommendedActions.push('Do NOT reveal one-time passwords (OTPs), netbanking credentials, or sensitive documents.');
    }
    if (ruleResult.jobScamRiskScore > 30) {
      recommendedActions.push('Verify the recruiter identity and opening through the company official careers website.');
    }
    if (ruleResult.rentalRiskScore > 30) {
      recommendedActions.push('Never transfer a rental deposit before a physical walk-through and signed agreement.');
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('Verify all communications independently through established contact channels.');
    }

    const summary = ruleResult.findings.length > 0
      ? `Analysis identified ${ruleResult.findings.length} security concern(s) including ${ruleResult.findings[0].title}. ${fallbackNotice}`
      : `No significant scam patterns detected by local heuristic rules. Automated analysis cannot guarantee legitimacy. ${fallbackNotice}`;

    return {
      classification,
      confidence: 80,
      summary,
      redFlags: ruleResult.findings,
      positiveSignals: ruleResult.findings.length === 0 ? ['No known upfront payment demand keywords detected'] : [],
      entities: entitiesRecord,
      recommendedActions,
      questionsToVerify: [
        'Did you apply for this position through an official job portal?',
        'Is the email address from a corporate domain rather than a free webmail service?',
        'Has a physical meeting or video interview occurred with official company personnel?',
      ],
      extractedIndicators: ruleResult.findings.map(f => f.title),
      isFallback: true,
    };
  }
}
