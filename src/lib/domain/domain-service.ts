import { DomainIntelResult } from '@/types';

export interface DomainIntelProvider {
  name: string;
  lookup(domain: string): Promise<Partial<DomainIntelResult>>;
}

/**
 * Standard RDAP (Registration Data Access Protocol) Provider
 * Queries public IANA-compliant RDAP endpoints to discover authentic domain registration dates.
 */
export class RdapIntelProvider implements DomainIntelProvider {
  name = 'RDAP';

  async lookup(domain: string): Promise<Partial<DomainIntelResult>> {
    const cleanDomain = domain.toLowerCase().trim();

    // Do not attempt RDAP for bare IP addresses or localhost
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleanDomain) || cleanDomain === 'localhost') {
      return {
        domain: cleanDomain,
        domainAgeDays: null,
        registrar: null,
        registrationDate: null,
        notes: ['IP-based hosts do not have domain registrar records.'],
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

      const res = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
        headers: { Accept: 'application/rdap+json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          domain: cleanDomain,
          domainAgeDays: null,
          registrar: null,
          registrationDate: null,
          notes: [`RDAP response returned HTTP ${res.status}. Domain age unavailable.`],
        };
      }

      const data = await res.json();
      let registrationDate: string | null = null;
      let registrar: string | null = null;

      // Extract events (registration, expiration, etc.)
      if (Array.isArray(data.events)) {
        const regEvent = data.events.find(
          (e: { eventAction?: string }) => e.eventAction === 'registration' || e.eventAction === 'registered'
        );
        if (regEvent && regEvent.eventDate) {
          registrationDate = regEvent.eventDate.split('T')[0];
        }
      }

      // Extract entities (registrar)
      if (Array.isArray(data.entities)) {
        const regEntity = data.entities.find(
          (e: { roles?: string[] }) => Array.isArray(e.roles) && e.roles.includes('registrar')
        );
        if (regEntity && Array.isArray(regEntity.vcardArray)) {
          const fnField = regEntity.vcardArray[1]?.find((v: unknown[]) => v[0] === 'fn');
          if (fnField && fnField[3]) {
            registrar = String(fnField[3]);
          }
        }
      }

      let domainAgeDays: number | null = null;
      if (registrationDate) {
        const regTimestamp = new Date(registrationDate).getTime();
        if (!isNaN(regTimestamp)) {
          domainAgeDays = Math.max(0, Math.floor((Date.now() - regTimestamp) / (1000 * 60 * 60 * 24)));
        }
      }

      return {
        domain: cleanDomain,
        domainAgeDays,
        registrar,
        registrationDate,
      };
    } catch {
      // Graceful fallback without fabricating data
      return {
        domain: cleanDomain,
        domainAgeDays: null,
        registrar: null,
        registrationDate: null,
        notes: ['Domain age unavailable (RDAP service timed out or endpoint unreachable).'],
      };
    }
  }
}

/**
 * Composite Domain Intelligence Service orchestrating providers
 */
export class DomainService {
  private providers: DomainIntelProvider[] = [new RdapIntelProvider()];

  /**
   * Evaluates domain reputation and registration parameters
   */
  public async getDomainIntelligence(domain: string, isHttps: boolean = true): Promise<DomainIntelResult> {
    let result: Partial<DomainIntelResult> = {
      domain,
      domainAgeDays: null,
      registrar: null,
      registrationDate: null,
      isHttps,
      hasValidCert: isHttps,
      reputationScore: 'UNKNOWN',
      isSuspiciousTld: false,
      isPunycode: domain.includes('xn--'),
      hasExcessiveSubdomains: domain.split('.').length > 3,
      brandMismatch: null,
      notes: [],
    };

    // Query primary provider (RDAP)
    try {
      const rdapData = await this.providers[0].lookup(domain);
      result = { ...result, ...rdapData };
    } catch {
      result.notes?.push('Domain intelligence lookup encountered an error. Proceeded with local heuristics.');
    }

    // Determine reputation based on verifiable evidence (never fabricated)
    if (result.domainAgeDays !== null && result.domainAgeDays !== undefined) {
      if (result.domainAgeDays < 30) {
        result.reputationScore = 'HIGH_RISK';
        result.notes?.push(`Newly registered domain (${result.domainAgeDays} days old). Statistically elevated threat risk.`);
      } else if (result.domainAgeDays < 180) {
        result.reputationScore = 'MEDIUM_RISK';
        result.notes?.push(`Recently registered domain (${result.domainAgeDays} days old).`);
      } else {
        result.reputationScore = 'LOW_RISK';
      }
    } else {
      result.reputationScore = 'UNKNOWN';
    }

    return result as DomainIntelResult;
  }
}
