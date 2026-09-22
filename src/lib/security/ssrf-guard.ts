import { URL } from 'url';
import dns from 'dns/promises';
import { dnsCache } from '../cache/memory-cache';

export interface SSRFCheckResult {
  isSafe: boolean;
  blockedReason?: string;
  normalizedUrl?: string;
  hostname?: string;
  ip?: string;
}

// Check IPv4 private and link-local ranges
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [b0, b1] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (b0 >= 224) return true;

  return false;
}

// Check IPv6 private and loopback ranges
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  // Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // Unspecified
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
  // Link-local (fe80::/10)
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // Unique local address (fc00::/7)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // IPv4-mapped IPv6 (::ffff:127.0.0.1, etc.)
  if (normalized.includes('::ffff:')) {
    const v4part = normalized.split('::ffff:')[1];
    if (v4part && isPrivateIPv4(v4part)) return true;
  }
  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'instance-data',
  'local',
  'broadcasthost',
]);

const BLOCKED_DOMAINS_SUFFIXES = [
  '.local',
  '.internal',
  '.corp',
  '.lan',
  '.home',
  '.localhost',
];

/**
 * Validates a URL against SSRF attacks.
 * Blocks private IP ranges, cloud metadata endpoints, dangerous schemes, and internal network targets.
 */
export async function validateSafeUrl(rawUrl: string): Promise<SSRFCheckResult> {
  let parsed: URL;

  // Only auto-prepend https if no scheme is present at all
  let urlToParse = rawUrl.trim();
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(urlToParse)) {
    urlToParse = `https://${urlToParse}`;
  }

  try {
    parsed = new URL(urlToParse);
  } catch {
    return { isSafe: false, blockedReason: 'Malformed or invalid URL syntax' };
  }

  // 1. Protocol validation: Only HTTP and HTTPS are permitted
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return {
      isSafe: false,
      blockedReason: `Dangerous or unsupported protocol '${protocol}'. Only HTTP and HTTPS are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Blacklisted hostnames check
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      isSafe: false,
      hostname,
      blockedReason: `Access to internal host '${hostname}' is strictly forbidden.`,
    };
  }

  // 3. Blacklisted internal domain suffix check
  for (const suffix of BLOCKED_DOMAINS_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return {
        isSafe: false,
        hostname,
        blockedReason: `Access to internal/private domain extension '${suffix}' is strictly forbidden.`,
      };
    }
  }

  // 4. Literal IP check
  const isLiteralIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isLiteralIPv6 = hostname.startsWith('[') && hostname.endsWith(']');
  const cleanIp = isLiteralIPv6 ? hostname.slice(1, -1) : hostname;

  if (isLiteralIPv4) {
    if (isPrivateIPv4(cleanIp)) {
      return {
        isSafe: false,
        hostname,
        ip: cleanIp,
        blockedReason: `Access to private or loopback IP range (${cleanIp}) is blocked for SSRF protection.`,
      };
    }
  } else if (isLiteralIPv6) {
    if (isPrivateIPv6(cleanIp)) {
      return {
        isSafe: false,
        hostname,
        ip: cleanIp,
        blockedReason: `Access to private or loopback IPv6 range (${cleanIp}) is blocked for SSRF protection.`,
      };
    }
  } else {
    // 5. DNS Resolution check with high-speed in-memory cache to prevent DNS rebinding or internal aliases
    try {
      let ipAddresses = dnsCache.get(hostname);
      if (!ipAddresses) {
        const addresses = await dns.lookup(hostname, { all: true });
        ipAddresses = addresses.map((a) => a.address);
        dnsCache.set(hostname, ipAddresses);
      }

      for (const ip of ipAddresses) {
        const isV4 = ip.includes('.');
        if (isV4 && isPrivateIPv4(ip)) {
          return {
            isSafe: false,
            hostname,
            ip,
            blockedReason: `Resolved DNS address (${ip}) belongs to a private network. Access blocked.`,
          };
        }
        if (!isV4 && isPrivateIPv6(ip)) {
          return {
            isSafe: false,
            hostname,
            ip,
            blockedReason: `Resolved DNS address (${ip}) belongs to an internal IPv6 network. Access blocked.`,
          };
        }
      }
    } catch {
      // If DNS lookup fails, do not crash; it might simply be an unregistered domain or intranet name
      // We allow forensics analysis on the string without outbound HTTP fetching
    }
  }

  return {
    isSafe: true,
    normalizedUrl: parsed.toString(),
    hostname,
  };
}
