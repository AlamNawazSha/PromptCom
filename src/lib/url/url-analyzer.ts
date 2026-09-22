import { URL } from 'url';
import { UrlForensicsResult, ScanFindingItem } from '@/types';
import { detectBrandImpersonation } from './brand-detector';
import { validateSafeUrl } from '../security/ssrf-guard';

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'click', 'buzz',
  'club', 'loan', 'racing', 'country', 'stream', 'download', 'win', 'bid',
  'date', 'faith', 'accountant', 'cricket', 'party', 'science', 'gdn',
]);

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'ow.ly',
  'buff.ly', 'rebrand.ly', 'shorturl.at', 'rb.gy', 'v.gd',
]);

const CREDENTIAL_PATH_KEYWORDS = [
  'login', 'signin', 'sign-in', 'log-in', 'verify', 'verification',
  'auth', 'authenticate', 'secure', 'account', 'banking', 'wallet',
  'password', 'credential', 'update-billing', 'security-check', 'kyc',
];

export class UrlAnalyzer {
  /**
   * Performs deep forensics and threat analysis on a target URL
   */
  public async analyzeUrl(inputUrl: string): Promise<UrlForensicsResult> {
    // 1. SSRF Safety Check first
    const ssrfCheck = await validateSafeUrl(inputUrl);
    if (!ssrfCheck.isSafe) {
      throw new Error(ssrfCheck.blockedReason || 'URL blocked for security reasons');
    }

    let parsed: URL;
    let urlString = inputUrl.trim();
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = `https://${urlString}`;
    }

    try {
      parsed = new URL(urlString);
    } catch {
      throw new Error('Invalid URL format');
    }

    const protocol = parsed.protocol.replace(':', '').toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port || null;
    const pathname = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();
    const normalizedUrl = parsed.toString();

    // Extract domain, subdomains, and TLD
    const domainParts = hostname.split('.');
    let tld = '';
    let domain = hostname;
    let subdomain = '';

    if (domainParts.length >= 2) {
      // Check for compound TLDs like .co.uk, .com.au, .co.in
      const lastPart = domainParts[domainParts.length - 1];
      const secondLastPart = domainParts[domainParts.length - 2];
      const isCompoundTld = ['co', 'com', 'org', 'net', 'gov', 'edu'].includes(secondLastPart) && lastPart.length === 2;

      if (isCompoundTld && domainParts.length >= 3) {
        tld = `${secondLastPart}.${lastPart}`;
        domain = `${domainParts[domainParts.length - 3]}.${tld}`;
        subdomain = domainParts.slice(0, domainParts.length - 3).join('.');
      } else {
        tld = lastPart;
        domain = `${secondLastPart}.${tld}`;
        subdomain = domainParts.slice(0, domainParts.length - 2).join('.');
      }
    }

    const detectedRedFlags: ScanFindingItem[] = [];
    let riskScore = 0;

    // 2. IP Host Check (e.g., http://192.0.2.1/login)
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || (hostname.startsWith('[') && hostname.endsWith(']'));
    if (isIpHost) {
      riskScore += 45;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'HIGH',
        title: 'Direct IP Address Used in Hostname',
        evidence: hostname,
        explanation: 'Legitimate services use registered domain names with SSL certificates. Raw IP address hosts are heavily associated with malware C2 and phishing sites.',
        recommendedAction: 'Do not access sites hosted on bare IP addresses or provide any credentials.',
      });
    }

    // 3. Insecure Protocol Check (HTTP instead of HTTPS)
    if (protocol === 'http') {
      riskScore += 25;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'MEDIUM',
        title: 'Unencrypted HTTP Connection (No HTTPS)',
        evidence: `http://${hostname}`,
        explanation: 'The link uses insecure HTTP without encryption. Transmitted credentials, passwords, or personal data can be intercepted or altered via man-in-the-middle attacks.',
        recommendedAction: 'Never submit passwords, payment details, or personal information on plain HTTP pages.',
      });
    }

    // 4. Punycode / IDN Homograph Attack Check
    const isPunycode = hostname.includes('xn--');
    if (isPunycode) {
      riskScore += 40;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'HIGH',
        title: 'Punycode / IDN Homograph Domain Detected',
        evidence: hostname,
        explanation: 'The domain uses internationalized punycode encoding (starts with xn--). Attackers use visual lookalike characters (Cyrillic/Greek) to mimic trusted brand names.',
        recommendedAction: 'Exercise extreme caution. Do not trust the visual appearance of the domain name.',
      });
    }

    // 5. Suspicious or Abused TLD Check
    const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld.toLowerCase());
    if (hasSuspiciousTld) {
      riskScore += 20;
      detectedRedFlags.push({
        category: 'DOMAIN_INTEL',
        severity: 'MEDIUM',
        title: `High-Risk Top-Level Domain (.${tld})`,
        evidence: `.${tld}`,
        explanation: `The .${tld} TLD has a statistically elevated association with spam campaigns and short-lived phishing operations according to global cybersecurity telemetry.`,
        recommendedAction: 'Verify the identity of the sender independently through established business directories.',
      });
    }

    // 6. Excessive Subdomains Check (e.g. login.secure.paypal.com.sub.xyz)
    const hasExcessiveSubdomains = domainParts.length > 4;
    if (hasExcessiveSubdomains) {
      riskScore += 25;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'MEDIUM',
        title: 'Excessive Subdomain Stacking',
        evidence: hostname,
        explanation: 'The hostname contains more than 4 domain levels. Attackers stack subdomains to disguise the real root domain on mobile browsers with truncated URL bars.',
        recommendedAction: 'Inspect the right-most root domain carefully before interacting.',
      });
    }

    // 7. URL Shortener Check
    const isShortener = KNOWN_SHORTENERS.has(domain.toLowerCase());
    if (isShortener) {
      riskScore += 15;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'LOW',
        title: 'Obfuscated Shortened Link',
        evidence: domain,
        explanation: 'The URL uses a link shortener service, hiding the true destination web address from initial inspection.',
        recommendedAction: 'Use link expanders or caution before opening shortened links received in unverified emails or SMS.',
      });
    }

    // 8. Credential Harvesting Path Keywords
    const hasCredentialKeywords = CREDENTIAL_PATH_KEYWORDS.some(kw => pathname.includes(kw));
    if (hasCredentialKeywords) {
      // If combined with plain HTTP or suspicious TLD, elevate severity
      const isHighRiskCombo = protocol === 'http' || hasSuspiciousTld || isIpHost;
      riskScore += isHighRiskCombo ? 35 : 15;
      detectedRedFlags.push({
        category: 'PHISHING',
        severity: isHighRiskCombo ? 'HIGH' : 'MEDIUM',
        title: 'Authentication / Credential Harvesting Path Detected',
        evidence: pathname,
        explanation: `The URL path contains authentication-sensitive endpoints (${pathname}). Phishing kits typically stage fake login forms at these paths.`,
        recommendedAction: 'Verify the browser address bar has the authentic company domain before entering credentials.',
      });
    }

    // 9. Suspicious Query Parameters (token, redirect, email target)
    const hasSuspiciousParams = /[?&](?:redirect|target|email|user|url|auth_token|goto)=/i.test(search);
    if (hasSuspiciousParams) {
      riskScore += 15;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'LOW',
        title: 'Suspicious Open Redirect / Tracking Query Parameter',
        evidence: search.slice(0, 80),
        explanation: 'The link contains embedded redirect or pre-filled credential parameters often used in open-redirect phishing or automated victim tracking.',
        recommendedAction: 'Do not follow automated redirects or click pre-authenticated links.',
      });
    }

    // 10. Brand Impersonation & Typosquatting Check
    const brandCheck = detectBrandImpersonation(hostname);
    let matchedBrand = null;
    let hasTyposquatting = false;

    if (brandCheck.hasMismatch) {
      riskScore += 45;
      matchedBrand = brandCheck.matchedBrand;
      hasTyposquatting = true;
      detectedRedFlags.push({
        category: 'BRAND_MISMATCH',
        severity: 'HIGH',
        title: `Potential Brand Impersonation: ${brandCheck.matchedBrand}`,
        evidence: hostname,
        explanation: brandCheck.explanation || `The domain appears to mimic ${brandCheck.matchedBrand}.`,
        recommendedAction: `Navigate directly to the official website (${brandCheck.targetDomain}) instead of clicking this link.`,
      });
    }

    // 11. Abnormal URL Length Check (> 150 characters)
    if (urlString.length > 150) {
      riskScore += 15;
      detectedRedFlags.push({
        category: 'URL_ANOMALY',
        severity: 'LOW',
        title: 'Abnormally Long / Encoded URL',
        evidence: `${urlString.slice(0, 100)}... (${urlString.length} characters)`,
        explanation: 'Extremely long URLs often conceal malicious redirect payloads or obfuscated script injection parameters.',
        recommendedAction: 'Be cautious of lengthy, parameter-heavy links from unknown senders.',
      });
    }

    return {
      normalizedUrl,
      protocol,
      hostname,
      domain,
      subdomain,
      tld,
      port,
      pathname,
      search,
      isIpHost,
      isPunycode,
      isShortener,
      hasSuspiciousTld,
      hasExcessiveSubdomains,
      hasCredentialKeywords,
      hasSuspiciousParams,
      hasTyposquatting,
      matchedBrand,
      detectedRedFlags,
      riskScore: Math.min(100, riskScore),
    };
  }
}
