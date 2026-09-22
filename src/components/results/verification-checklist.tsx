'use client';

import React, { useState } from 'react';
import { VerificationChecklistItem } from '@/types';
import { CheckSquare, Square, ListChecks, CheckCircle2, RotateCcw } from 'lucide-react';

interface VerificationChecklistProps {
  initialItems: VerificationChecklistItem[];
}

export function VerificationChecklist({ initialItems }: VerificationChecklistProps) {
  const [items, setItems] = useState<VerificationChecklistItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const resetAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-cyan-400" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            Interactive Verification Checklist
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400">
            {completedCount}/{items.length} Completed ({progressPercent}%)
          </span>
          {completedCount > 0 && (
            <button
              onClick={resetAll}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-3 rounded-xl p-3 border cursor-pointer select-none transition-all text-xs font-mono ${
                item.checked
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-200 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
              >
                {item.checked ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-500" />
                )}
              </button>

              <div className="flex-1">
                <span className={item.checked ? 'line-through text-slate-400' : ''}>
                  {item.text}
                </span>
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 shrink-0">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
