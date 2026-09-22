import { DemoScenario } from '@/types';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-job-fee',
    title: 'Fake Job Offer with UPI Registration Fee',
    category: 'JOB_FEE',
    type: 'TEXT',
    description: 'High-salary software developer offer demanding an immediate refundable onboarding fee via UPI within 2 hours.',
    content: `Congratulations! You have been selected for the position of Software Developer at Vertex Technologies Pvt Ltd. Your salary will be ₹12 LPA (CTC). 

To complete your formal onboarding and dispatch your company laptop workstation, you must pay a refundable equipment and registration fee of ₹18,500 within 2 hours. 

Send the payment through UPI to hr.vertextech@okaxis to secure your position. Offer expires at 5:00 PM today.`,
    expectedRisk: 'HIGH_RISK',
  },
  {
    id: 'demo-rental-trap',
    title: 'Overseas Landlord Advance Deposit Scam',
    category: 'RENTAL',
    type: 'TEXT',
    description: 'Bait apartment listing claiming the owner is overseas and demanding a deposit before any physical viewing.',
    content: `Hello, thanks for your inquiry on the 2BHK furnished flat in Indiranagar. The rent is ₹15,000/month (unusually cheap for this location). 

I am currently working overseas in the UK on a diplomatic project, so I cannot meet you in person to show the flat. Many prospective tenants are interested. If you want me to reserve the apartment and courier the keys directly to you, you must transfer a refundable security deposit of ₹30,000 via Google Pay today prior to physical visit.`,
    expectedRisk: 'HIGH_RISK',
  },
  {
    id: 'demo-phishing-url',
    title: 'Typosquatting Phishing URL (micros0ft-careers)',
    category: 'SUSPICIOUS_URL',
    type: 'URL',
    description: 'Suspicious brand lookalike domain using leetspeak (0 for o) and high-risk .xyz TLD with credential harvesting endpoint.',
    content: 'https://micros0ft-careers-portal.xyz/login?ref=hr-onboarding&redirect=kyc-verify',
    expectedRisk: 'CRITICAL',
  },
  {
    id: 'demo-legitimate-offer',
    title: 'Legitimate Corporate Offer Letter',
    category: 'LEGITIMATE',
    type: 'TEXT',
    description: 'Authentic employment offer with standard formal terms, no payment demands, and reasonable response window.',
    content: `Dear Candidate,

Following your interviews with the engineering team at CloudScale Solutions Inc., we are pleased to offer you the position of Full Stack Engineer. 

Your annual compensation will be ₹14,50,000 per annum, inclusive of comprehensive medical insurance, provident fund, and annual performance bonuses. All necessary workstation hardware will be shipped to your residential address by our IT logistics department at zero cost to you.

Please review the attached formal offer letter and return the signed copy within 7 business days. We look forward to welcoming you to the team.

Sincerely,
Priya Sharma
Talent Acquisition Team
CloudScale Solutions Inc.
careers@cloudscale.com`,
    expectedRisk: 'LOW',
  },
];
