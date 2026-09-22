export interface BrandTarget {
  name: string;
  primaryDomain: string;
  aliases: string[];
}

export const MONITORED_BRANDS: BrandTarget[] = [
  { name: 'Google', primaryDomain: 'google.com', aliases: ['google', 'gmail', 'alphabet'] },
  { name: 'Microsoft', primaryDomain: 'microsoft.com', aliases: ['microsoft', 'office365', 'outlook', 'azure'] },
  { name: 'Amazon', primaryDomain: 'amazon.com', aliases: ['amazon', 'aws'] },
  { name: 'Apple', primaryDomain: 'apple.com', aliases: ['apple', 'icloud'] },
  { name: 'Meta', primaryDomain: 'meta.com', aliases: ['meta', 'facebook', 'instagram', 'whatsapp'] },
  { name: 'PayPal', primaryDomain: 'paypal.com', aliases: ['paypal'] },
  { name: 'Netflix', primaryDomain: 'netflix.com', aliases: ['netflix'] },
  { name: 'Telegram', primaryDomain: 'telegram.org', aliases: ['telegram', 't.me'] },
  { name: 'Infosys', primaryDomain: 'infosys.com', aliases: ['infosys'] },
  { name: 'TCS', primaryDomain: 'tcs.com', aliases: ['tcs', 'tataconsultancy'] },
  { name: 'Accenture', primaryDomain: 'accenture.com', aliases: ['accenture'] },
  { name: 'Wipro', primaryDomain: 'wipro.com', aliases: ['wipro'] },
  { name: 'Deloitte', primaryDomain: 'deloitte.com', aliases: ['deloitte'] },
  { name: 'State Bank of India', primaryDomain: 'onlinesbi.sbi', aliases: ['sbi', 'onlinesbi'] },
  { name: 'HDFC Bank', primaryDomain: 'hdfcbank.com', aliases: ['hdfc', 'hdfcbank'] },
  { name: 'ICICI Bank', primaryDomain: 'icicibank.com', aliases: ['icici', 'icicibank'] },
];

/**
 * Calculates Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) {
    matrix[i] = [i];
  }
  for (let i = 0; i <= an; ++i) {
    matrix[0][i] = i;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Normalizes lookalike characters (leetspeak: 0 -> o, 1/l -> l, vv -> w)
 */
export function normalizeLookalikes(input: string): string {
  return input
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/!/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/vv/g, 'w')
    .replace(/rn/g, 'm');
}

export interface BrandMatchResult {
  hasMismatch: boolean;
  matchedBrand: string | null;
  targetDomain: string | null;
  similarityType?: 'TYPOSQUAT' | 'SUBDOMAIN_PREPEND' | 'LEETSPEAK';
  explanation?: string;
}

/**
 * Detects whether a given domain is potentially impersonating a recognized high-profile brand
 */
export function detectBrandImpersonation(domain: string): BrandMatchResult {
  const cleanDomain = domain.toLowerCase().trim();

  for (const brand of MONITORED_BRANDS) {
    // If the domain exactly ends with the legitimate primary domain, it is genuine
    if (cleanDomain === brand.primaryDomain || cleanDomain.endsWith(`.${brand.primaryDomain}`)) {
      continue;
    }

    // Extract base domain name without TLD
    const parts = cleanDomain.split('.');
    const baseDomain = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    const normalizedBase = normalizeLookalikes(baseDomain);

    for (const alias of brand.aliases) {
      // 1. Direct substring in deceptive context (e.g. micros0ft-login, paypal-security, google-verify)
      if (
        normalizedBase.includes(alias) &&
        normalizedBase !== alias &&
        (normalizedBase.includes('-') || normalizedBase.includes('login') || normalizedBase.includes('verify') || normalizedBase.includes('support'))
      ) {
        return {
          hasMismatch: true,
          matchedBrand: brand.name,
          targetDomain: brand.primaryDomain,
          similarityType: 'SUBDOMAIN_PREPEND',
          explanation: `Potential brand mismatch detected: The domain '${cleanDomain}' includes '${alias}' combined with security/login keywords, but does not belong to ${brand.name} (${brand.primaryDomain}).`,
        };
      }

      // 2. Leetspeak substitution (e.g., paypa1, micros0ft, goog1e)
      if (normalizedBase === alias && baseDomain !== alias) {
        return {
          hasMismatch: true,
          matchedBrand: brand.name,
          targetDomain: brand.primaryDomain,
          similarityType: 'LEETSPEAK',
          explanation: `Potential brand mismatch detected: The domain '${cleanDomain}' uses character substitution lookalikes (e.g., '${baseDomain}' for '${alias}') mimicking ${brand.name}.`,
        };
      }

      // 3. Edit distance check (distance of 1 with length >= 5)
      if (alias.length >= 5) {
        const distance = levenshteinDistance(baseDomain, alias);
        if (distance === 1) {
          return {
            hasMismatch: true,
            matchedBrand: brand.name,
            targetDomain: brand.primaryDomain,
            similarityType: 'TYPOSQUAT',
            explanation: `Potential brand mismatch detected: The domain '${cleanDomain}' has a 1-character difference from '${alias}' (${brand.name}), characteristic of typosquatting.`,
          };
        }
      }
    }
  }

  return {
    hasMismatch: false,
    matchedBrand: null,
    targetDomain: null,
  };
}
