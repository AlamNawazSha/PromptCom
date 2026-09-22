# SCAMSHIELD AI
### "Detect the red flags before they cost you."
**Fake Offer Letter, Rental Trap & Phishing Inspector**

---

## 🛡️ Executive Summary

**ScamShield AI** is an enterprise-grade digital forensics and anti-phishing web application designed to protect job seekers, renters, and everyday internet users from devastating advance-fee fraud, counterfeit appointment letters, equipment reimbursement traps, and credential-harvesting phishing URLs.

Unlike superficial AI chatbot wrappers, ScamShield AI operates a multi-layered detection architecture:
1. **Deterministic Rule Engine**: Zero-latency regex pattern recognition extracting upfront payment demands, registration fee traps, fake corporate HR emails, and urgency manipulation.
2. **SSRF-Protected URL Intelligence**: Strict firewall blocking server-side request forgery (private IP ranges, localhost, link-local addresses, and cloud metadata endpoints), evaluating typosquatting, IDN homographs, punycode, and credential harvesting paths.
3. **Authentic RDAP Domain Intelligence**: Real-time IANA RDAP queries discovering verifiable domain age and registrar data—with a strict **Zero-Fabrication Guarantee** (never inventing WHOIS data).
4. **Google Gemini AI Semantic Reasoning**: In-depth contextual evaluation utilizing strict prompt injection delimiters and schema validation.
5. **Deterministic Multi-Factor Scoring**: Weighted Scam Threat Index (0–100%) providing explainable, quoted evidence for every flagged finding.

---

## ⚡ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Recharts
- **Database & ORM**: Prisma ORM with SQLite (`dev.db`) for instant zero-configuration local execution (compatible with PostgreSQL in production)
- **AI Engine**: Google Gemini API (`@google/generative-ai`) with offline rule-based fallback
- **Security**: SSRF Guard (private IP & metadata blocklist), Sliding-window Rate Limiting, SHA-256 Privacy Hashing, Zod runtime validation, Enterprise CSP & HSTS Headers
- **Performance & Efficiency**: Sub-millisecond In-Memory LRU & TTL Caching Subsystem (DNS, RDAP, Brand Intel, and Scan Payloads), O(N) Levenshtein matrix memory optimization, concurrent database aggregation
- **Testing**: Vitest unit & integration test suite (34 automated tests across 6 test suites)

---

## 🚀 Quick Start (One-Step Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v20 and v24)
- **npm**: v9.0.0 or higher

### 1. Installation
Clone or navigate to the repository directory and run:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (a default template is provided in `.env.example`):
```env
# Database Connection (SQLite by default for zero-setup local dev)
DATABASE_URL="file:./dev.db"

# Google Gemini API Key (Optional: Falls back to deterministic rule engine if empty or offline)
GEMINI_API_KEY="your-gemini-api-key-here"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Rate Limiting
SCAN_RATE_LIMIT=30
SCAN_RATE_WINDOW_MS=60000
```

> **Note on AI Fallback**: If `GEMINI_API_KEY` is not provided, the application runs automatically in **Deterministic Rule Fallback Mode** with zero crashes, fully assessing threat indices and explainable red flags.

### 3. Database Initialization & Seeding
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed initial threat telemetry and demo scans
node --experimental-strip-types prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Testing

Execute the comprehensive Vitest suite:
```bash
npm test
```

### Verified Test Cases (10 Mandatory Scenarios):
1. **TEST 1**: Normal job offer with no payment demands $\rightarrow$ Low/Guarded risk
2. **TEST 2**: Job offer asking for ₹20,000 registration fee $\rightarrow$ High risk
3. **TEST 3**: Job offer requiring equipment payment before joining $\rightarrow$ High risk
4. **TEST 4**: Rental listing requesting deposit before property viewing $\rightarrow$ High risk
5. **TEST 5**: Message asking for OTP / passwords $\rightarrow$ Critical threat
6. **TEST 6**: URL containing IP address $\rightarrow$ Elevated URL risk
7. **TEST 7**: Punycode / IDN homograph domain $\rightarrow$ Elevated URL risk
8. **TEST 8**: Plain HTTP login URL $\rightarrow$ Elevated credential risk
9. **TEST 9**: Abnormally long / obfuscated URL $\rightarrow$ URL risk indicator
10. **TEST 10**: Gemini API unavailable $\rightarrow$ Transparent rule-based fallback without errors

### Typecheck & Production Build
```bash
# Strict TypeScript validation
npm run typecheck

# Production Next.js build
npm run build
```

---

## 📊 Application Architecture

```
src/
├── app/
│   ├── layout.tsx               # Cyber HUD Shell, Global CSS, Security Metadata
│   ├── page.tsx                 # Cybersecurity Landing, Main Scanner Hub, HUD
│   ├── dashboard/page.tsx       # SOC Operations Center (Metrics, Charts, Audit Log)
│   ├── history/page.tsx         # Filterable Audit Log & CSV Export
│   ├── scan/[id]/page.tsx       # Detailed Forensic Scan Report
│   ├── report/page.tsx          # Print-Ready Executive Security Dossier
│   ├── about/page.tsx           # Mission, Problem Statement & Architecture
│   ├── security/page.tsx        # SSRF Protections, Prompt Injection Defenses
│   ├── privacy/page.tsx         # Data Minimization & History Purge
│   └── api/
│       ├── scan/route.ts        # Text and Document Forensics Endpoint
│       ├── url-scan/route.ts    # URL Forensics & RDAP Domain Intel Endpoint
│       ├── scans/route.ts       # Audit Log Query & Telemetry Metrics Endpoint
│       ├── scans/[id]/route.ts  # Single Scan Lookup & Secure Delete Endpoint
│       ├── domain/[domain]/     # RDAP Domain Intelligence Endpoint
│       └── demo/route.ts        # Presets API
├── components/
│   ├── navbar.tsx               # Navigation Bar with Real-time System Status HUD
│   ├── footer.tsx               # Legal Disclaimers & Quick Navigation
│   ├── scanner/
│   │   ├── main-scanner.tsx     # Tab Switcher (Message / URL / Document)
│   │   ├── message-scanner.tsx  # Text Input, Presets, Analysis Modes
│   │   ├── url-scanner.tsx      # URL Input with SSRF Indicator
│   │   ├── document-scanner.tsx # Drag & Drop Client-Parsed Document Inspector
│   │   └── scan-pipeline.tsx    # Multi-Stage HUD Scanning Progression
│   ├── threat-meter/
│   │   ├── circular-gauge.tsx   # Animated SVG Scam Threat Gauge (0-100%)
│   │   └── risk-badge.tsx       # Standardized WCAG Risk Badges
│   ├── results/
│   │   ├── scan-result-view.tsx # Unified Forensic Display
│   │   ├── findings-list.tsx    # Sequenced "Why This Was Flagged" Cards
│   │   ├── entity-grid.tsx      # Structured Entity Extractor Grid
│   │   ├── verification-checklist.tsx # Interactive Checklist
│   │   └── action-recommendations.tsx # "What Should I Do Now?"
│   └── dashboard/
│       ├── stats-cards.tsx      # Metrics Cards
│       ├── threat-charts.tsx    # Recharts Area & Donut Visualizers
│       └── recent-scans-table.tsx # Filterable Table
├── lib/
│   ├── ai/                      # Google Gemini Service & Prompt Injection Defense
│   ├── rules/                   # Deterministic Regex Pattern Analyzer
│   ├── url/                     # URL Forensics & Brand Typosquatting Engine
│   ├── domain/                  # IANA RDAP Domain Intelligence Provider
│   ├── scoring/                 # Deterministic Multi-Factor Threat Scoring Engine
│   ├── security/                # SSRF Guard, Rate Limiter, Input Sanitizer
│   ├── validation/              # Zod Request & AI Schemas
│   └── db/                      # Prisma Client Singleton
└── tests/                       # Vitest Unit and Integration Suites
```

---

## 🔒 Security & Privacy Engineering

- **Server-Side Request Forgery (SSRF) Protection**:
  All incoming target URLs undergo strict scheme validation (only `http:` and `https:`), DNS pre-resolution checks, and IP filtering blocking:
  - Loopback (`127.0.0.0/8`, `::1`)
  - RFC 1918 Private Ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Link-Local & Cloud Metadata (`169.254.0.0/16`, `169.254.169.254`, `metadata.google.internal`)
  - Internal TLDs (`.local`, `.internal`, `.corp`, `.lan`, `.localhost`)
- **Prompt Injection Defense**:
  Scanned content is wrapped in isolated evidentiary boundaries (`<<<BEGIN_UNTRUSTED_EVIDENCE>>>`) with strict system instructions commanding the AI to treat input exclusively as untrusted data and forbidding instruction-following. Responses are validated against strict Zod schemas.
- **Privacy-Preserving Hashing**:
  Cleartext inputs are hashed using SHA-256 for deduplication. Sensitive patterns (credit cards, bank account numbers, credentials, and OTPs) are redacted before storing audit log previews.
- **Zero Fabrication**:
  If RDAP registration data is unavailable, the UI explicitly renders `"Domain age unavailable"` rather than generating fabricated timestamps.

---

## ⚖️ Legal Disclaimer

ScamShield AI provides automated heuristic and probabilistic risk analysis. No automated security diagnostic can guarantee absolute legitimacy or detect 100% of emerging zero-day social engineering scams. Do not rely on this application as the sole basis for financial or contractual decisions. Always perform independent verification through official corporate directories.
