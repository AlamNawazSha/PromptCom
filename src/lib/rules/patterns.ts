export interface ScamPattern {
  id: string;
  category: 'PAYMENT' | 'JOB_SCAM' | 'RENTAL_SCAM' | 'URGENCY' | 'PHISHING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  regex: RegExp;
  explanation: string;
  recommendedAction: string;
  weight: number; // 0 - 35
}

export const SCAM_PATTERNS: ScamPattern[] = [
  // --- PAYMENT RED FLAGS ---
  {
    id: 'pay-reg-fee',
    category: 'PAYMENT',
    severity: 'HIGH',
    title: 'Upfront Registration / Onboarding Fee Demand',
    regex: /(?:pay|send|transfer|deposit|remit)\s+(?:[\w\s]{0,40}?)?(?:registration|onboarding|processing|interview|application|entry)\s*(?:fee|charges?|cost|deposit|amount)/i,
    explanation: 'The communication demands payment for recruitment, onboarding, or application fees. Legitimate employers never charge candidates for job opportunities.',
    recommendedAction: 'Do not transfer any funds. Terminate contact immediately and verify directly on the company’s official careers portal.',
    weight: 32,
  },
  {
    id: 'pay-equipment-laptop',
    category: 'PAYMENT',
    severity: 'HIGH',
    title: 'Equipment Purchase / Laptop Reimbursement Scam',
    regex: /(?:pay|buy|purchase|reimburse|fund|fee\s+for|charge\s+for)\s+(?:[\w\s]{0,30}?)?(?:laptop|equipment|home\s*office|workstation|software\s*license|courier\s*fee|hardware|dispatch)/i,
    explanation: 'Scammers frequently direct candidates to pay upfront for equipment or software licenses with a promise of later reimbursement.',
    recommendedAction: 'Legitimate employers supply hardware directly or set up enterprise procurement. Never buy equipment through an unverified vendor.',
    weight: 30,
  },
  {
    id: 'pay-training-bgv',
    category: 'PAYMENT',
    severity: 'HIGH',
    title: 'Mandatory Paid Training or Background Verification Fee',
    regex: /(?:pay|deposit|fee\s+for)\s+(?:mandatory|compulsory|pre-employment)?\s*(?:training|certification|background\s*check|verification|clearance|security\s*check)\s*(?:fee|charges?|cost)?/i,
    explanation: 'Demanding fees for pre-employment training or third-party background checks is a classic fraudulent hiring indicator.',
    recommendedAction: 'Official corporate background screenings are funded directly by the employer. Refuse payment.',
    weight: 28,
  },
  {
    id: 'pay-refundable-deposit',
    category: 'PAYMENT',
    severity: 'HIGH',
    title: 'Deceptive "Refundable" Security Deposit',
    regex: /refundable\s+(?:[\w\s]{0,35}?)?(?:deposit|caution\s*money|amount|sum|fee|charges?)/i,
    explanation: 'The sender claims the fee is 100% refundable after joining or training. This is a common tactic to lower the victim’s psychological guard.',
    recommendedAction: 'Remember that legitimate companies never require "refundable deposits" to hold an offer.',
    weight: 30,
  },
  {
    id: 'pay-upi-pressure',
    category: 'PAYMENT',
    severity: 'HIGH',
    title: 'Direct UPI / Personal Account Payment Request',
    regex: /(?:(?:send|pay|transfer|remit|deposit)\s+(?:[\w\s]{0,25}?)?(?:via|through|to|using)\s*(?:upi|gpay|google\s*pay|phonepe|paytm|vpa|qr\s*code|personal\s*account)|(?:payment|money|amount|fee|deposit|funds)\s+(?:[\w\s]{0,20}?)?(?:via|through|to|using)\s*(?:upi|gpay|phonepe|paytm|vpa|qr\s*code))\b/i,
    explanation: 'Requesting hiring or rental fees via personal UPI apps or personal bank accounts bypasses formal accounting and indicates fraud.',
    recommendedAction: 'Never send money via personal UPI handles for corporate or rental transactions.',
    weight: 28,
  },
  {
    id: 'pay-crypto-giftcard',
    category: 'PAYMENT',
    severity: 'CRITICAL',
    title: 'Irreversible Crypto or Gift Card Payment Demand',
    regex: /(?:bitcoin|crypto|usdt|btc|ethereum|gift\s*card|itunes|steam\s*card|amazon\s*pay\s*voucher)/i,
    explanation: 'Demanding cryptocurrency or gift cards is a definitive hallmark of untraceable financial fraud.',
    recommendedAction: 'Cease all communications immediately. No legitimate business or landlord requires crypto or gift card payments.',
    weight: 35,
  },

  // --- JOB SCAM INDICATORS ---
  {
    id: 'job-guaranteed-hire',
    category: 'JOB_SCAM',
    severity: 'HIGH',
    title: 'Guaranteed Employment Without Formal Interview',
    regex: /(?:selected\s+without|no\s+interview|direct\s+selection|100%\s*guaranteed\s+(?:job|placement|selection)|appointed\s+directly)/i,
    explanation: 'Reputable companies require thorough technical/behavioral interviews. Direct selection without an interview is an acute warning sign.',
    recommendedAction: 'Verify the authenticity of the recruiter and application on the official employer website.',
    weight: 25,
  },
  {
    id: 'job-free-email-hr',
    category: 'JOB_SCAM',
    severity: 'HIGH',
    title: 'Corporate HR Using Public Free Webmail (Gmail/Yahoo/Hotmail)',
    regex: /(?:from|contact|email|reach|send\s*resume)\s*[:=]?\s*[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|proton\.me|yandex\.com)/i,
    explanation: 'The claimed corporate entity is conducting recruitment from a generic public email provider rather than a verified company domain.',
    recommendedAction: 'Official corporate communications originate from verified corporate domain names (e.g., name@google.com, not google-careers@gmail.com).',
    weight: 25,
  },
  {
    id: 'job-immediate-joining-pressure',
    category: 'JOB_SCAM',
    severity: 'MEDIUM',
    title: 'Immediate Unrealistic Joining / Offer Expiration Pressure',
    regex: /(?:join\s+immediately|must\s+join\s+within\s*24\s*hours|offer\s+expires\s+(?:today|in\s*\d+\s*hours)|spot\s+offer)/i,
    explanation: 'Scammers apply intense artificial deadlines to rush victims into paying before they can consult friends or verify credentials.',
    recommendedAction: 'Take your time to conduct independent due diligence. Real job offers accommodate reasonable review periods.',
    weight: 18,
  },
  {
    id: 'job-remote-data-entry-unrealistic-pay',
    category: 'JOB_SCAM',
    severity: 'MEDIUM',
    title: 'Exaggerated Salary for Minimal Remote Effort (Bait Offer)',
    regex: /(?:earn|salary|stipend)\s*(?:of|is|:)?\s*(?:₹|\$|€|rs\.?)\s*(?:[5-9]\d{4,}|[1-9]\d{5,})\s*(?:per\s*(?:day|week|month|hour)|daily|weekly)\s*(?:for\s+part\s*time|typing|data\s*entry|form\s*filling|sms\s*sending)/i,
    explanation: 'Unusually inflated earnings for low-skill remote tasks (e.g., typing, liking videos, review writing) are classic advance-fee bait.',
    recommendedAction: 'Compare salary figures against industry salary benchmarks on Glassdoor or LinkedIn.',
    weight: 20,
  },

  // --- RENTAL SCAM INDICATORS ---
  {
    id: 'rental-deposit-before-viewing',
    category: 'RENTAL_SCAM',
    severity: 'HIGH',
    title: 'Advance Rental Deposit Demanded Before Physical Property Viewing',
    regex: /(?:pay|deposit|token|advance|hold\s*deposit|reserve)\s+(?:before|prior\s+to|without)\s+(?:visiting|viewing|inspection|seeing\s+the\s+flat|physical\s+visit)/i,
    explanation: 'Legitimate landlords and brokers only collect security deposits after a physical viewing and signed lease agreement.',
    recommendedAction: 'Never send advance booking fees or security tokens before inspecting the property in person.',
    weight: 32,
  },
  {
    id: 'rental-overseas-landlord',
    category: 'RENTAL_SCAM',
    severity: 'HIGH',
    title: 'Unavailable / Overseas Landlord Story',
    regex: /(?:currently\s+abroad|out\s+of\s+country|working\s+overseas|keys\s+will\s+be\s+couriered|cannot\s+meet\s+in\s+person|military\s+deployment|relocated\s+for\s+work)/i,
    explanation: 'Scammers claim to be overseas to explain why they cannot show the apartment, promising to courier the keys upon receiving payment.',
    recommendedAction: 'Do not deal with absentee owners who cannot arrange local agent representation with verifiable credentials.',
    weight: 24,
  },

  // --- PHISHING & CREDENTIAL THEFT ---
  {
    id: 'phish-otp-password',
    category: 'PHISHING',
    severity: 'CRITICAL',
    title: 'Request for OTP, Passwords, or Banking Credentials',
    regex: /(?:share|provide|enter|send|verify|give)\s+(?:your\s+)?(?:otp|one\s*time\s*password|pin|cvv|netbanking|login\s*credentials|password|atm\s*pin)\b/i,
    explanation: 'No legitimate employer, bank, or rental agency will EVER ask for your one-time passwords, netbanking pins, or account passwords.',
    recommendedAction: 'Never reveal OTPs or passwords under any circumstances. If shared, contact your bank immediately to freeze your account.',
    weight: 35,
  },
  {
    id: 'phish-account-suspended',
    category: 'PHISHING',
    severity: 'HIGH',
    title: 'Account Suspension / Deactivation Threat',
    regex: /(?:account\s+(?:has\s+been|will\s+be)\s+(?:suspended|blocked|terminated|disabled|restricted)|action\s+required\s+within\s*24\s*hours|kyc\s+expired)/i,
    explanation: 'Fear-based pretexting engineered to panic the recipient into clicking phishing links or releasing credentials.',
    recommendedAction: 'Log in only through the service’s official mobile app or bookmark; never click links in unexpected security warnings.',
    weight: 25,
  },

  // --- URGENCY & PSYCHOLOGICAL MANIPULATION ---
  {
    id: 'urgency-countdown',
    category: 'URGENCY',
    severity: 'MEDIUM',
    title: 'Severe Artificial Time Limit / Deadline Pressure',
    regex: /(?:within\s*(?:1|2|3|4|5|12|24)\s*hours|immediate\s+action\s+required|act\s+now|last\s*chance|expires\s+in\s*\d+\s*minutes)/i,
    explanation: 'Psychological pressure designed to suppress critical scrutiny and prompt impulsive compliance.',
    recommendedAction: 'Slow down. Malicious actors depend on panic and urgency to execute their scams.',
    weight: 15,
  },
];
