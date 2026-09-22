'use client';

import React, { useEffect, useState } from 'react';
import { RiskLevel, ThreatScoresBreakdown } from '@/types';
import { RiskBadge } from './risk-badge';
import { Shield, AlertTriangle, CreditCard, Globe, Lock, Clock } from 'lucide-react';

interface CircularGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  confidence: number;
  breakdown?: ThreatScoresBreakdown;
  size?: number;
}

export function CircularGauge({
  score,
  riskLevel,
  confidence,
  breakdown,
  size = 280,
}: CircularGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Smooth counter animation from 0 to target score
  useEffect(() => {
    let start = 0;
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeProgress * score);
      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // SVG Gauge calculations
  const strokeWidth = 16;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Sweep across 270 degrees (3/4 circle)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * displayScore) / 100;

  // Color mapping based on score
  const getThemeColors = () => {
    if (score <= 20) {
      return {
        stroke: '#10b981', // emerald
        glow: 'rgba(16, 185, 129, 0.4)',
        bgGradient: 'from-emerald-500/10 to-transparent',
      };
    }
    if (score <= 40) {
      return {
        stroke: '#06b6d4', // cyan
        glow: 'rgba(6, 182, 212, 0.4)',
        bgGradient: 'from-cyan-500/10 to-transparent',
      };
    }
    if (score <= 60) {
      return {
        stroke: '#f59e0b', // amber
        glow: 'rgba(245, 158, 11, 0.4)',
        bgGradient: 'from-amber-500/10 to-transparent',
      };
    }
    if (score <= 80) {
      return {
        stroke: '#f97316', // orange
        glow: 'rgba(249, 115, 22, 0.5)',
        bgGradient: 'from-orange-500/15 to-transparent',
      };
    }
    return {
      stroke: '#ef4444', // crimson
      glow: 'rgba(239, 68, 68, 0.6)',
      bgGradient: 'from-rose-500/20 to-transparent',
    };
  };

  const colors = getThemeColors();

  return (
    <div className="flex flex-col items-center">
      {/* Circular Gauge Centerpiece */}
      <div className="relative flex items-center justify-center p-2" style={{ width: size, height: size }}>
        {/* Ambient Glow Background */}
        <div
          className="absolute inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
          style={{ background: colors.glow }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[135deg] transform transition-all"
        >
          {/* Track background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated score indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${colors.stroke})`,
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center Readout HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            SCAM THREAT INDEX
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-5xl md:text-6xl font-black tracking-tight font-mono text-white"
              style={{ textShadow: `0 0 20px ${colors.glow}` }}
            >
              {displayScore}
            </span>
            <span className="text-2xl font-bold font-mono text-slate-400">%</span>
          </div>

          <div className="mt-2">
            <RiskBadge level={riskLevel} size="md" />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>Confidence:</span>
            <span className="text-cyan-400 font-bold">{confidence}%</span>
          </div>
        </div>
      </div>

      {/* Sub-Risk Factor Metric Grid */}
      {breakdown && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-xl">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">Text Risk</span>
            <span className="text-sm font-bold font-mono text-white">{breakdown.textRisk}%</span>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">Payment</span>
            <span className={`text-sm font-bold font-mono ${breakdown.paymentRisk > 50 ? 'text-rose-400' : 'text-slate-300'}`}>
              {breakdown.paymentRisk}%
            </span>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">URL Risk</span>
            <span className={`text-sm font-bold font-mono ${breakdown.urlRisk > 40 ? 'text-amber-400' : 'text-slate-300'}`}>
              {breakdown.urlRisk}%
            </span>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">Domain</span>
            <span className="text-sm font-bold font-mono text-slate-300">{breakdown.domainRisk}%</span>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">Identity</span>
            <span className={`text-sm font-bold font-mono ${breakdown.identityRisk > 50 ? 'text-rose-400' : 'text-slate-300'}`}>
              {breakdown.identityRisk}%
            </span>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">Urgency</span>
            <span className="text-sm font-bold font-mono text-slate-300">{breakdown.urgencyRisk}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
