import React from 'react';
import { RiskLevel } from '@/types';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RiskBadge({ level, size = 'md', showIcon = true }: RiskBadgeProps) {
  const configs: Record<
    RiskLevel,
    { label: string; bg: string; text: string; border: string; glow: string; Icon: any }
  > = {
    LOW: {
      label: 'LOW RISK',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      Icon: ShieldCheck,
    },
    GUARDED: {
      label: 'GUARDED',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      Icon: ShieldAlert,
    },
    SUSPICIOUS: {
      label: 'SUSPICIOUS',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      Icon: AlertTriangle,
    },
    HIGH_RISK: {
      label: 'HIGH RISK',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      Icon: AlertTriangle,
    },
    CRITICAL: {
      label: 'CRITICAL THREAT',
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
      Icon: AlertOctagon,
    },
  };

  const config = configs[level] || configs.GUARDED;
  const { Icon } = config;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider font-semibold border ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
