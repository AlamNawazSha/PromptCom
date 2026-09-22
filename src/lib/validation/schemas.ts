import { z } from 'zod';

export const ScanTypeEnum = z.enum(['TEXT', 'URL', 'DOCUMENT']);
export const CategoryTypeEnum = z.enum([
  'JOB_OFFER',
  'RENTAL_DEPOSIT',
  'RECRUITER_MESSAGE',
  'PAYMENT_REQUEST',
  'GENERAL_PHISHING',
  'AUTO_DETECT',
]);

export const ScanRequestSchema = z.object({
  content: z.string().min(5, 'Input content must be at least 5 characters').max(50000, 'Input content exceeds maximum length of 50KB'),
  analysisType: CategoryTypeEnum.default('AUTO_DETECT'),
  scanType: ScanTypeEnum.default('TEXT'),
  documentName: z.string().optional(),
});

export const UrlScanRequestSchema = z.object({
  url: z.string().min(3, 'URL must be at least 3 characters').max(2048, 'URL exceeds maximum length'),
});

export const FindingItemSchema = z.object({
  category: z.enum([
    'PAYMENT',
    'JOB_SCAM',
    'RENTAL_SCAM',
    'URGENCY',
    'PHISHING',
    'URL_ANOMALY',
    'DOMAIN_INTEL',
    'BRAND_MISMATCH',
    'GENERAL',
  ]).default('GENERAL'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string().min(1),
  evidence: z.string().default(''),
  explanation: z.string().min(1),
  recommendedAction: z.string().default(''),
});

export const GeminiResponseSchema = z.object({
  classification: z.enum(['SAFE', 'SUSPICIOUS', 'HIGH_RISK', 'CRITICAL']),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(1),
  redFlags: z.array(FindingItemSchema).default([]),
  positiveSignals: z.array(z.string()).default([]),
  entities: z.object({
    company: z.string().optional().default(''),
    person: z.string().optional().default(''),
    jobTitle: z.string().optional().default(''),
    salary: z.string().optional().default(''),
    location: z.string().optional().default(''),
    email: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    url: z.string().optional().default(''),
    paymentAmount: z.string().optional().default(''),
    paymentMethod: z.string().optional().default(''),
  }).default({}),
  recommendedActions: z.array(z.string()).default([]),
  questionsToVerify: z.array(z.string()).default([]),
  extractedIndicators: z.array(z.string()).default([]),
});

export type ScanRequest = z.infer<typeof ScanRequestSchema>;
export type UrlScanRequest = z.infer<typeof UrlScanRequestSchema>;
export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;
