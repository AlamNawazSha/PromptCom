'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  History, 
  FileText, 
  HelpCircle, 
  Lock, 
  Menu, 
  X, 
  Activity,
  ChevronDown,
  FileCode
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const navLinks = [
    { name: 'Scanner', href: '/', icon: ShieldAlert },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: History },
    { name: 'Report', href: '/report', icon: FileText },
    { name: 'PRD & Docs', href: '/docs', icon: FileCode },
    { name: 'How It Works', href: '/about', icon: HelpCircle },
    { name: 'Security', href: '/security', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#05070b]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 p-2 shadow-[0_0_15px_rgba(0,245,255,0.2)] group-hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all">
            <ShieldAlert className="h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">SCAMSHIELD</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              Fake Offer & Phishing Inspector
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,245,255,0.15)]'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right HUD Controls: System Status & User Profile */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SYSTEM ONLINE</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {statusOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-[#090d16] p-4 shadow-2xl backdrop-blur-xl z-50">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" /> System Subsystems
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">100% HEALTH</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>AI Engine (Gemini)</span>
                    <span className="text-emerald-400">READY</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Deterministic Rules</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>URL Intelligence</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>SSRF Firewall</span>
                    <span className="text-cyan-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>RDAP Domain Intel</span>
                    <span className="text-emerald-400">STANDBY</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white border border-cyan-400/30">
              SEC
            </div>
            <span className="text-xs font-medium text-slate-300">Analyst Mode</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d16] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
