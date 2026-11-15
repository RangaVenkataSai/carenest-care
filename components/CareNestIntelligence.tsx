'use client';

import React, { useState } from 'react';
import { AIInsight } from '@/lib/types';
import { Sparkles, ShieldAlert, Clock, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';

interface CareNestIntelligenceProps {
  insights: AIInsight[];
  onTakeAction?: (insight: AIInsight) => void;
}

export function CareNestIntelligence({ insights, onTakeAction }: CareNestIntelligenceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(insights[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DC] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F3F3] text-[#167C80] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#263238]">CareNest Intelligence</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F3F3] text-[#167C80]">
                Proactive Insights
              </span>
            </div>
            <p className="text-xs text-[#546E7A]">
              Autonomous schedule safety & adherence pattern detection
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-semibold text-[#546E7A] bg-[#F8F7F2] px-3 py-1.5 rounded-xl border border-[#E6E4DC]">
            Safety Guard Active
          </span>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => {
          const isExpanded = expandedId === insight.id;

          let badgeBg = 'bg-[#E8F3F3] text-[#167C80] border-[#B7D4C2]';
          let icon = <Sparkles className="w-4 h-4 text-[#167C80]" />;

          if (insight.severity === 'caution') {
            badgeBg = 'bg-[#FDF3EF] text-[#D32F2F] border-[#F2A58A]';
            icon = <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />;
          } else if (insight.severity === 'advisory') {
            badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
            icon = <Clock className="w-4 h-4 text-amber-700" />;
          }

          return (
            <div
              key={insight.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-[#167C80]/40 bg-[#F8F7F2]/50 shadow-xs'
                  : 'border-[#E6E4DC] bg-white hover:border-[#B7D4C2]'
              }`}
            >
              <div
                onClick={() => toggleExpand(insight.id)}
                className="p-4 cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${badgeBg}`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#263238]">{insight.title}</h3>
                    <p className="text-xs text-[#546E7A] mt-0.5 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-[#546E7A] hover:text-[#263238] p-1 shrink-0"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expandable Reasoning Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#E6E4DC]/60 text-xs space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-[#E6E4DC] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#167C80]">
                      <Info className="w-3.5 h-3.5" />
                      <span>Why this insight was generated:</span>
                    </div>
                    <p className="text-[#546E7A] leading-relaxed pl-5">
                      {insight.reason}
                    </p>
                  </div>

                  {insight.actionLabel && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTakeAction?.(insight);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white font-semibold text-xs shadow-xs transition-colors"
                      >
                        {insight.actionLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] text-[11px] text-[#546E7A] flex items-center gap-2">
        <span className="font-bold text-[#167C80]">Clinical Guardrail:</span>
        <span>
          CareNest Intelligence provides adherence & schedule support. It does not provide medical diagnoses or alter prescriptions.
        </span>
      </div>
    </div>
  );
}
