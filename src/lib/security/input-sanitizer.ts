import crypto from 'crypto';

/**
 * Hashes input string with SHA-256 for privacy-preserving indexing
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

/**
 * Generates a safe preview of the input, redacting potential credit card numbers,
 * bank account numbers, passwords, and sensitive OTP tokens.
 */
export function createSafePreview(content: string, maxLength: number = 240): string {
  let sanitized = content.trim();

  // Redact credit card patterns (16 digits)
  sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CARD]');

  // Redact 6-digit OTP codes preceded by OTP / code
  sanitized = sanitized.replace(/(otp|code|pin|password|passcode)\s*[:=]?\s*\b\d{4,8}\b/gi, '$1: [REDACTED_CREDENTIAL]');

  // Redact private bank accounts (9 to 18 consecutive digits)
  sanitized = sanitized.replace(/\b\d{9,18}\b/g, '[REDACTED_ACCOUNT]');

  // Strip excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return sanitized.slice(0, maxLength) + '...';
}

/**
 * Basic HTML tag stripping for XSS prevention in display
 */
export function sanitizePlainText(input: string): string {
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .trim();
}
