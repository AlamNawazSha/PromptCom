import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ScamShield AI — Fake Offer Letter & Phishing Inspector',
  description:
    'AI-powered cybersecurity scanner detecting fraudulent job offers, upfront equipment fees, rental deposit traps, and phishing URLs before they cost you.',
  keywords: [
    'scam detector',
    'fake job offer letter',
    'phishing scanner',
    'rental deposit scam',
    'fraud prevention',
    'cybersecurity inspection',
    'threat index',
  ],
  authors: [{ name: 'ScamShield Security Operations' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05070b] text-slate-100 flex flex-col font-sans cyber-grid selection:bg-cyan-500/30 selection:text-cyan-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
