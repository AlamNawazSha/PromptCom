export type RiskLevel = 'LOW' | 'GUARDED' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL';

export type ScanType = 'TEXT' | 'URL' | 'DOCUMENT';

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingCategory =
  | 'PAYMENT'
  | 'JOB_SCAM'
  | 'RENTAL_SCAM'
  | 'URGENCY'
  | 'PHISHING'
  | 'URL_ANOMALY'
  | 'DOMAIN_INTEL'
  | 'BRAND_MISMATCH'
  | 'GENERAL';

export interface ScanFindingItem {
  id?: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  explanation: string;
  recommendedAction: string;
}

export type EntityType =
  | 'COMPANY'
  | 'PERSON'
  | 'JOB_TITLE'
  | 'SALARY'
  | 'LOCATION'
  | 'EMAIL'
  | 'PHONE'
  | 'URL'
  | 'PAYMENT_AMOUNT'
  | 'PAYMENT_METHOD'
  | 'UPI_ID'
  | 'DEADLINE';

export interface ScanEntityItem {
  entityType: EntityType;
  value: string;
  riskScore?: number;
}

export interface DomainIntelResult {
  domain: string;
  domainAgeDays: number | null;
  registrar: string | null;
  registrationDate: string | null;
  isHttps: boolean;
  hasValidCert: boolean;
  reputationScore: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'UNKNOWN';
  isSuspiciousTld: boolean;
  isPunycode: boolean;
  hasExcessiveSubdomains: boolean;
  brandMismatch: string | null;
  rawRdap?: string | null;
  notes?: string[];
}

export interface UrlForensicsResult {
  normalizedUrl: string;
  protocol: string;
  hostname: string;
  domain: string;
  subdomain: string;
  tld: string;
  port: string | null;
  pathname: string;
  search: string;
  isIpHost: boolean;
  isPunycode: boolean;
  isShortener: boolean;
  hasSuspiciousTld: boolean;
  hasExcessiveSubdomains: boolean;
  hasCredentialKeywords: boolean;
  hasSuspiciousParams: boolean;
  hasTyposquatting: boolean;
  matchedBrand: string | null;
  detectedRedFlags: ScanFindingItem[];
  riskScore: number;
}

export interface AiAnalysisResult {
  classification: RiskLevel;
  confidence: number;
  summary: string;
  redFlags: ScanFindingItem[];
  positiveSignals: string[];
  entities: Partial<Record<string, string>>;
  recommendedActions: string[];
  questionsToVerify: string[];
  extractedIndicators: string[];
  isFallback?: boolean;
}

export interface ThreatScoresBreakdown {
  textRisk: number;       // 0-100 (Weight: 25%)
  paymentRisk: number;    // 0-100 (Weight: 20%)
  urlRisk: number;        // 0-100 (Weight: 20%)
  domainRisk: number;     // 0-100 (Weight: 15%)
  identityRisk: number;   // 0-100 (Weight: 10%)
  urgencyRisk: number;    // 0-100 (Weight: 10%)
}

export interface ScanResultPayload {
  id: string;
  scanType: ScanType;
  threatScore: number; // 0-100
  riskLevel: RiskLevel;
  confidence: number;
  inputPreview: string;
  rawUrl?: string;
  domain?: string;
  summary: string;
  isOfflineFallback: boolean;
  createdAt: string;
  breakdown: ThreatScoresBreakdown;
  findings: ScanFindingItem[];
  entities: ScanEntityItem[];
  domainCheck?: DomainIntelResult | null;
  positiveSignals: string[];
  recommendedActions: string[];
  verificationChecklist: VerificationChecklistItem[];
}

export interface VerificationChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'IDENTITY' | 'PAYMENT' | 'DOMAIN' | 'LEGAL' | 'GENERAL';
}

export interface DemoScenario {
  id: string;
  title: string;
  category: 'JOB_FEE' | 'RENTAL' | 'SUSPICIOUS_URL' | 'LEGITIMATE';
  description: string;
  type: ScanType;
  content: string;
  expectedRisk: RiskLevel;
}
