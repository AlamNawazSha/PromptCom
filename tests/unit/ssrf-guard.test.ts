import { describe, it, expect } from 'vitest';
import { validateSafeUrl } from '../../src/lib/security/ssrf-guard';

describe('SSRF Guard Unit Tests', () => {
  it('blocks localhost and loopback targets', async () => {
    const res1 = await validateSafeUrl('http://localhost/admin');
    expect(res1.isSafe).toBe(false);

    const res2 = await validateSafeUrl('http://127.0.0.1:8080');
    expect(res2.isSafe).toBe(false);

    const res3 = await validateSafeUrl('http://127.0.1.5');
    expect(res3.isSafe).toBe(false);
  });

  it('blocks private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', async () => {
    const res10 = await validateSafeUrl('http://10.0.0.1/status');
    expect(res10.isSafe).toBe(false);

    const res172 = await validateSafeUrl('http://172.20.14.2/internal');
    expect(res172.isSafe).toBe(false);

    const res192 = await validateSafeUrl('http://192.168.1.1/router');
    expect(res192.isSafe).toBe(false);
  });

  it('blocks cloud metadata endpoints (169.254.169.254)', async () => {
    const res = await validateSafeUrl('http://169.254.169.254/latest/meta-data/');
    expect(res.isSafe).toBe(false);
    expect(res.blockedReason).toContain('private or loopback IP range');
  });

  it('blocks dangerous non-HTTP schemes (file://, gopher://, ftp://)', async () => {
    const fileRes = await validateSafeUrl('file:///etc/passwd');
    expect(fileRes.isSafe).toBe(false);

    const gopherRes = await validateSafeUrl('gopher://example.com');
    expect(gopherRes.isSafe).toBe(false);
  });

  it('allows public legitimate web URLs', async () => {
    const safeRes = await validateSafeUrl('https://example.com/careers');
    expect(safeRes.isSafe).toBe(true);
    expect(safeRes.hostname).toBe('example.com');
  });
});
