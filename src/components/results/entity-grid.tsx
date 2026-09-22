import React from 'react';
import { ScanEntityItem } from '@/types';
import { 
  Building2, 
  Briefcase, 
  Coins, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Clock,
  MapPin,
  QrCode
} from 'lucide-react';

interface EntityGridProps {
  entities: ScanEntityItem[];
}

export function EntityGrid({ entities }: EntityGridProps) {
  if (!entities || entities.length === 0) return null;

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'COMPANY': return Building2;
      case 'JOB_TITLE': return Briefcase;
      case 'SALARY': return Coins;
      case 'EMAIL': return Mail;
      case 'PHONE': return Phone;
      case 'URL': return Globe;
      case 'PAYMENT_AMOUNT': return CreditCard;
      case 'PAYMENT_METHOD': return CreditCard;
      case 'UPI_ID': return QrCode;
      case 'DEADLINE': return Clock;
      case 'LOCATION': return MapPin;
      default: return Briefcase;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <span>🔍</span> Structured Entity Detection
        </h4>
        <span className="text-[11px] font-mono text-slate-400">
          {entities.length} Key Parameters Extracted
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {entities.map((item, idx) => {
          const Icon = getEntityIcon(item.entityType);
          const isHighRisk = (item.riskScore || 0) >= 60;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-xl p-3 border text-xs font-mono transition-all ${
                isHighRisk
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isHighRisk ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-cyan-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {item.entityType.replace('_', ' ')}
                </span>
                <span className="text-white font-medium break-all block mt-0.5">
                  {item.value}
                </span>
                {isHighRisk && (
                  <span className="text-[10px] text-rose-400 font-bold uppercase mt-1 inline-block">
                    Elevated Risk Indicator
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
