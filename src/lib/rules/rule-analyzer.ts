import { SCAM_PATTERNS, ScamPattern } from './patterns';
import { ScanFindingItem, ScanEntityItem } from '@/types';

export interface RuleAnalysisOutput {
  findings: ScanFindingItem[];
  entities: ScanEntityItem[];
  paymentRiskScore: number;  // 0 - 100
  urgencyRiskScore: number;  // 0 - 100
  jobScamRiskScore: number;  // 0 - 100
  rentalRiskScore: number;   // 0 - 100
  phishingRiskScore: number; // 0 - 100
  overallTextRiskScore: number; // 0 - 100
  detectedCategory: string;
}

export class RuleBasedAnalyzer {
  /**
   * Main analysis execution on raw text content
   */
  public analyze(content: string, analysisTypeHint?: string): RuleAnalysisOutput {
    const findings: ScanFindingItem[] = [];
    let paymentRaw = 0;
    let urgencyRaw = 0;
    let jobRaw = 0;
    let rentalRaw = 0;
    let phishingRaw = 0;

    // 1. Evaluate Deterministic Regex Patterns
    for (const pattern of SCAM_PATTERNS) {
      const match = pattern.regex.exec(content);
      if (match) {
        // Extract 40 characters before and after match as evidence
        const startIndex = Math.max(0, match.index - 30);
        const endIndex = Math.min(content.length, match.index + match[0].length + 40);
        const evidenceSnippet = '...' + content.substring(startIndex, endIndex).replace(/\s+/g, ' ') + '...';

        findings.push({
          category: pattern.category,
          severity: pattern.severity,
          title: pattern.title,
          evidence: evidenceSnippet,
          explanation: pattern.explanation,
          recommendedAction: pattern.recommendedAction,
        });

        // Accumulate raw weights
        switch (pattern.category) {
          case 'PAYMENT':
            paymentRaw += pattern.weight;
            break;
          case 'URGENCY':
            urgencyRaw += pattern.weight;
            break;
          case 'JOB_SCAM':
            jobRaw += pattern.weight;
            break;
          case 'RENTAL_SCAM':
            rentalRaw += pattern.weight;
            if (pattern.id.includes('deposit')) {
              paymentRaw += pattern.weight;
            }
            break;
          case 'PHISHING':
            phishingRaw += pattern.weight;
            break;
        }
      }
    }

    // 2. Extract Entities from the text
    const entities = this.extractEntities(content);

    // If an explicit payment entity (e.g. ₹18,500) was found alongside job/registration keywords, elevate payment risk
    const hasPaymentAmount = entities.some(e => e.entityType === 'PAYMENT_AMOUNT');
    const hasUpi = entities.some(e => e.entityType === 'UPI_ID' || e.entityType === 'PAYMENT_METHOD');
    if (hasPaymentAmount && (jobRaw > 0 || rentalRaw > 0 || paymentRaw > 0)) {
      paymentRaw += 20;
    }
    if (hasUpi) {
      paymentRaw += 25;
      if (entities.some(e => e.entityType === 'UPI_ID') && !findings.some(f => f.title.includes('UPI'))) {
        findings.push({
          category: 'PAYMENT',
          severity: 'HIGH',
          title: 'Direct UPI VPA Payment Handle Detected',
          evidence: entities.find(e => e.entityType === 'UPI_ID')?.value || 'UPI ID',
          explanation: 'Communication directs financial payment or verification fees to a personal Unified Payments Interface (UPI) VPA handle rather than an official corporate bank account.',
          recommendedAction: 'Never transfer funds via UPI for job recruitment, registration, or unseen rental properties.',
        });
      }
    }

    // 3. Normalize sub-scores between 0 and 100
    const paymentRiskScore = Math.min(100, Math.round(paymentRaw * 1.5));
    const urgencyRiskScore = Math.min(100, Math.round(urgencyRaw * 2.2));
    const jobScamRiskScore = Math.min(100, Math.round(jobRaw * 1.6));
    const rentalRiskScore = Math.min(100, Math.round(rentalRaw * 1.6));
    const phishingRiskScore = Math.min(100, Math.round(phishingRaw * 1.5));

    // Calculate aggregated text risk score
    const maxSub = Math.max(paymentRiskScore, jobScamRiskScore, rentalRiskScore, phishingRiskScore);
    const avgSub = (paymentRiskScore + urgencyRiskScore + jobScamRiskScore + rentalRiskScore + phishingRiskScore) / 5;
    const overallTextRiskScore = Math.min(100, Math.round(maxSub * 0.7 + avgSub * 0.3));

    // Categorization detection
    let detectedCategory = analysisTypeHint || 'GENERAL';
    if (!analysisTypeHint || analysisTypeHint === 'AUTO_DETECT') {
      if (rentalRiskScore > jobScamRiskScore && rentalRiskScore > 30) {
        detectedCategory = 'RENTAL_DEPOSIT';
      } else if (jobScamRiskScore > 20 || /salary|job|recruiter|interview|joining|hiring|role/i.test(content)) {
        detectedCategory = 'JOB_OFFER';
      } else if (phishingRiskScore > 30 || /password|otp|account|login|verify/i.test(content)) {
        detectedCategory = 'GENERAL_PHISHING';
      } else if (paymentRiskScore > 30) {
        detectedCategory = 'PAYMENT_REQUEST';
      }
    }

    return {
      findings,
      entities,
      paymentRiskScore,
      urgencyRiskScore,
      jobScamRiskScore,
      rentalRiskScore,
      phishingRiskScore,
      overallTextRiskScore,
      detectedCategory,
    };
  }

  /**
   * Extracts structured entities from unstructured text using high-precision regex
   */
  public extractEntities(content: string): ScanEntityItem[] {
    const entities: ScanEntityItem[] = [];

    // Email extraction
    const emailMatches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
      const uniqueEmails = Array.from(new Set(emailMatches));
      for (const email of uniqueEmails) {
        const isFreeEmail = /(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com)$/i.test(email);
        entities.push({
          entityType: 'EMAIL',
          value: email,
          riskScore: isFreeEmail ? 60 : 10,
        });
      }
    }

    // Phone numbers (Indian and international formats)
    const phoneMatches = content.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4,6}\b/g);
    if (phoneMatches) {
      const validPhones = Array.from(new Set(phoneMatches)).filter(p => p.replace(/\D/g, '').length >= 10);
      for (const phone of validPhones.slice(0, 3)) {
        entities.push({
          entityType: 'PHONE',
          value: phone.trim(),
          riskScore: 20,
        });
      }
    }

    // Payment amounts (₹, Rs, $, €, etc. or numbers following fee/deposit/payment keywords)
    const amountMatches = content.match(/(?:(?:₹|rs\.?|inr|\$|usd|€|eur)\s*[\d,]+(?:\.\d{2})?|(?:fee|deposit|payment|amount|sum|transfer|charge|charges)\s+(?:of\s+)?(?:₹|rs\.?|inr|\$|usd|€|eur)?\s*[\d,]{3,}(?:\.\d{2})?)/gi);
    if (amountMatches) {
      const uniqueAmounts = Array.from(new Set(amountMatches));
      for (const amount of uniqueAmounts) {
        entities.push({
          entityType: 'PAYMENT_AMOUNT',
          value: amount.trim(),
          riskScore: 70,
        });
      }
    }

    // UPI IDs (e.g., example@upi, name@okhdfcbank, etc.)
    const upiMatches = content.match(/\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g);
    if (upiMatches) {
      const upiHandles = ['upi', 'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'paytm', 'ybl', 'ibl', 'axl', 'postbank'];
      for (const item of upiMatches) {
        const parts = item.split('@');
        if (parts.length === 2 && upiHandles.includes(parts[1].toLowerCase())) {
          entities.push({
            entityType: 'UPI_ID',
            value: item,
            riskScore: 80,
          });
        }
      }
    }

    // Salary mentions (e.g. 12 LPA, ₹8,00,000/year, $75,000/yr)
    const salaryMatch = content.match(/(?:salary|stipend|ctc|package)\s*(?:is|of|:)?\s*(?:₹|\$|€|rs\.?)?\s*[\d,]+(?:\s*(?:lpa|per\s*(?:month|year|annum)|\/yr|\/mo))?/i);
    if (salaryMatch) {
      entities.push({
        entityType: 'SALARY',
        value: salaryMatch[0].trim(),
        riskScore: 10,
      });
    }

    // Job Title mentions
    const jobTitleMatch = content.match(/(?:position\s+of|role\s+of|hiring\s+for|job\s+title\s*:?)\s*([a-zA-Z\s]{3,35})(?:\.|\n|,|$)/i);
    if (jobTitleMatch && jobTitleMatch[1]) {
      entities.push({
        entityType: 'JOB_TITLE',
        value: jobTitleMatch[1].trim(),
        riskScore: 0,
      });
    }

    // Deadlines / Urgency
    const deadlineMatch = content.match(/(?:within\s*\d+\s*(?:hours|hrs|days|minutes)|by\s*(?:today|tomorrow|midnight|[0-9]{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+))/i);
    if (deadlineMatch) {
      entities.push({
        entityType: 'DEADLINE',
        value: deadlineMatch[0].trim(),
        riskScore: 50,
      });
    }

    // Company / Organization extraction
    const companyMatch = content.match(/(?:at|company|organization|firm|employer)\s*[:=]?\s*([A-Z][a-zA-Z0-9&.\s]{2,40}(?:Technologies|Tech|Solutions|Pvt|Ltd|Inc|Corp|Services|LLC|Group))/i);
    if (companyMatch && companyMatch[1]) {
      entities.push({
        entityType: 'COMPANY',
        value: companyMatch[1].trim(),
        riskScore: 10,
      });
    }

    // Payment methods
    if (/upi|google\s*pay|gpay|phonepe|paytm/i.test(content)) {
      entities.push({ entityType: 'PAYMENT_METHOD', value: 'UPI / Mobile Wallet', riskScore: 70 });
    }
    if (/wire\s*transfer|bank\s*transfer|neft|rtgs|imps/i.test(content)) {
      entities.push({ entityType: 'PAYMENT_METHOD', value: 'Direct Bank Transfer / Wire', riskScore: 50 });
    }
    if (/crypto|bitcoin|usdt/i.test(content)) {
      entities.push({ entityType: 'PAYMENT_METHOD', value: 'Cryptocurrency (Irreversible)', riskScore: 95 });
    }
    if (/gift\s*card|voucher/i.test(content)) {
      entities.push({ entityType: 'PAYMENT_METHOD', value: 'Gift Card Voucher', riskScore: 90 });
    }

    return entities;
  }
}
