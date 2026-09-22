import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ScamShield database with initial telemetry...');

  // 1. Create Analyst user
  const user = await prisma.user.upsert({
    where: { email: 'analyst@scamshield.ai' },
    update: {},
    create: {
      email: 'analyst@scamshield.ai',
      name: 'Security Analyst',
      role: 'ADMIN',
    },
  });

  // 2. Seed Scan 1: Fake Offer with UPI registration fee
  await prisma.scan.upsert({
    where: { id: 'scan_demo_job_001' },
    update: {},
    create: {
      id: 'scan_demo_job_001',
      userId: user.id,
      scanType: 'TEXT',
      threatScore: 82,
      riskLevel: 'CRITICAL',
      confidence: 95,
      inputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      inputPreview: 'Congratulations! You have been selected for the position of Software Developer. Your salary will be ₹12 LPA. To complete your onboarding, you must pay a refundable equipment and registration fee of ₹18,500 within 2 hours.',
      summary: 'Critical threat identified. Upfront equipment and registration fee demand via personal UPI under artificial 2-hour deadline.',
      isOfflineFallback: false,
      findings: {
        create: [
          {
            category: 'PAYMENT',
            severity: 'HIGH',
            title: 'Upfront Registration / Onboarding Fee Demand',
            evidence: '...pay a refundable equipment and registration fee of ₹18,500 within 2 hours...',
            explanation: 'Legitimate employers never charge candidates for registration or equipment dispatch.',
            recommendedAction: 'Do not transfer funds. Cease communications immediately.',
          },
          {
            category: 'PAYMENT',
            severity: 'HIGH',
            title: 'Direct UPI / Personal Account Payment Request',
            evidence: '...UPI to hr.vertextech@okaxis...',
            explanation: 'Routing corporate fees through personal UPI handles indicates advance-fee recruitment fraud.',
            recommendedAction: 'Never send payments through personal UPI handles for corporate positions.',
          },
          {
            category: 'URGENCY',
            severity: 'MEDIUM',
            title: 'Severe Artificial Time Limit / Deadline Pressure',
            evidence: '...within 2 hours. Offer expires at 5:00 PM today...',
            explanation: 'Artificial countdown engineered to prevent independent due diligence.',
            recommendedAction: 'Slow down. Legitimate employers grant reasonable review windows.',
          },
        ],
      },
      entities: {
        create: [
          { entityType: 'JOB_TITLE', value: 'Software Developer', riskScore: 0 },
          { entityType: 'SALARY', value: '₹12 LPA', riskScore: 10 },
          { entityType: 'PAYMENT_AMOUNT', value: '₹18,500', riskScore: 70 },
          { entityType: 'UPI_ID', value: 'hr.vertextech@okaxis', riskScore: 80 },
          { entityType: 'DEADLINE', value: 'within 2 hours', riskScore: 50 },
        ],
      },
    },
  });

  // 3. Seed Scan 2: Rental deposit scam
  await prisma.scan.upsert({
    where: { id: 'scan_demo_rental_002' },
    update: {},
    create: {
      id: 'scan_demo_rental_002',
      userId: user.id,
      scanType: 'TEXT',
      threatScore: 76,
      riskLevel: 'HIGH_RISK',
      confidence: 90,
      inputHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      inputPreview: 'I am currently working overseas in the UK. Pay refundable token deposit of ₹30,000 via Google Pay today prior to physical visit to courier keys.',
      summary: 'High risk rental fraud indicator. Landlord claims to be overseas and demands advance deposit before physical inspection.',
      isOfflineFallback: false,
      findings: {
        create: [
          {
            category: 'RENTAL_SCAM',
            severity: 'HIGH',
            title: 'Advance Rental Deposit Demanded Before Physical Property Viewing',
            evidence: '...pay refundable token deposit of ₹30,000 via Google Pay today prior to physical visit...',
            explanation: 'Demanding security tokens before physical property walk-through is a typical absentee landlord scam.',
            recommendedAction: 'Never send money before visiting the property in person.',
          },
          {
            category: 'RENTAL_SCAM',
            severity: 'HIGH',
            title: 'Unavailable / Overseas Landlord Story',
            evidence: '...currently working overseas in the UK... keys will be couriered...',
            explanation: 'Excuses for not showing the property in person accompanied by promises of couriering keys.',
            recommendedAction: 'Deal only with verified local agents or landlords who can facilitate in-person inspection.',
          },
        ],
      },
      entities: {
        create: [
          { entityType: 'PAYMENT_AMOUNT', value: '₹30,000', riskScore: 70 },
          { entityType: 'PAYMENT_METHOD', value: 'Google Pay / UPI', riskScore: 70 },
          { entityType: 'LOCATION', value: 'Indiranagar', riskScore: 0 },
        ],
      },
    },
  });

  // 4. Seed Scan 3: Typosquatting Phishing URL
  await prisma.scan.upsert({
    where: { id: 'scan_demo_url_003' },
    update: {},
    create: {
      id: 'scan_demo_url_003',
      userId: user.id,
      scanType: 'URL',
      threatScore: 88,
      riskLevel: 'CRITICAL',
      confidence: 96,
      inputHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      inputPreview: 'https://micros0ft-careers-portal.xyz/login?ref=hr-onboarding',
      rawUrl: 'https://micros0ft-careers-portal.xyz/login?ref=hr-onboarding',
      domain: 'micros0ft-careers-portal.xyz',
      summary: 'Critical phishing site detected. Brand impersonation mimicking Microsoft with leetspeak (0 for o) on high-risk .xyz TLD targeting credentials.',
      isOfflineFallback: false,
      findings: {
        create: [
          {
            category: 'BRAND_MISMATCH',
            severity: 'HIGH',
            title: 'Potential Brand Impersonation: Microsoft',
            evidence: 'micros0ft-careers-portal.xyz',
            explanation: 'The domain uses character substitution lookalikes mimicking Microsoft.',
            recommendedAction: 'Do not enter credentials. Access official microsoft.com portal directly.',
          },
          {
            category: 'DOMAIN_INTEL',
            severity: 'MEDIUM',
            title: 'High-Risk Top-Level Domain (.xyz)',
            evidence: '.xyz',
            explanation: 'The .xyz TLD has an elevated association with disposable phishing campaigns.',
            recommendedAction: 'Verify through official channels.',
          },
          {
            category: 'PHISHING',
            severity: 'HIGH',
            title: 'Authentication / Credential Harvesting Path Detected',
            evidence: '/login',
            explanation: 'URL targets login endpoint on an unverified lookalike domain.',
            recommendedAction: 'Never submit passwords on third-party domains.',
          },
        ],
      },
      domainCheck: {
        create: {
          domain: 'micros0ft-careers-portal.xyz',
          domainAgeDays: 3,
          registrar: 'NameCheap, Inc.',
          registrationDate: '2026-09-18',
          isHttps: true,
          hasValidCert: true,
          reputationScore: 'HIGH_RISK',
          isSuspiciousTld: true,
          isPunycode: false,
          hasExcessiveSubdomains: false,
          brandMismatch: 'Microsoft',
        },
      },
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
