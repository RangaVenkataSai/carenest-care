'use client';

import React from 'react';
import { Medication } from '@/lib/types';
import { Eye, CheckCircle2, Volume2, X, Pill, ShieldCheck, AlertCircle } from 'lucide-react';

interface PillVerifierModalProps {
  medication: Medication | null;
  onClose: () => void;
  onConfirmMatch: (med: Medication) => void;
}

export function PillVerifierModal({
  medication,
  onClose,
  onConfirmMatch,
}: PillVerifierModalProps) {
  if (!medication) return null;

  const handleReadAppearance = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const text = `Verifying ${medication.name}. The pill should be ${medication.pillColor} in color and ${medication.pillShape} in shape. Your dosage is ${medication.dosage}. ${medication.specialInstructions}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    window.speechSynthesis.speak(u);
  };

  // Determine realistic CSS representation of the pill
  let pillBg = 'bg-white border-slate-300';
  let pillShapeClass = 'w-24 h-24 rounded-full'; // round default
  let pillText = medication.dosage;

  if (medication.pillColor.toLowerCase().includes('yellow')) {
    pillBg = 'bg-amber-100 border-amber-300 text-amber-900';
  } else if (medication.pillColor.toLowerCase().includes('amber') || medication.pillColor.toLowerCase().includes('orange')) {
    pillBg = 'bg-orange-100 border-orange-300 text-orange-950';
  } else if (medication.pillColor.toLowerCase().includes('blue')) {
    pillBg = 'bg-blue-100 border-blue-300 text-blue-900';
  } else {
    pillBg = 'bg-slate-50 border-slate-300 text-slate-800 shadow-inner';
  }

  if (medication.pillShape.toLowerCase().includes('oval')) {
    pillShapeClass = 'w-32 h-20 rounded-full';
  } else if (medication.pillShape.toLowerCase().includes('oblong') || medication.pillShape.toLowerCase().includes('capsule')) {
    pillShapeClass = 'w-36 h-16 rounded-full';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-[#167C80] text-center animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
              <Eye className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h3 className="font-extrabold text-base text-[#263238]">Visual Pill Identifier</h3>
              <p className="text-xs text-[#546E7A]">Compare the pill in your hand before taking</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Visual Pill Representation */}
        <div className="py-6 px-4 rounded-3xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#546E7A]">
            Expected Visual Appearance
          </span>

          {/* Interactive Pill graphic */}
          <div className="flex items-center justify-center py-4">
            <div
              className={`border-4 flex items-center justify-center font-black text-sm tracking-wider shadow-md transform hover:scale-105 transition-transform ${pillShapeClass} ${pillBg}`}
            >
              <span>{pillText}</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-[#263238] space-y-1">
            <p>
              Color: <strong>{medication.pillColor}</strong> • Shape: <strong>{medication.pillShape}</strong>
            </p>
            <p className="text-[#546E7A]">
              Dosage: <strong className="text-[#167C80]">{medication.dosage}</strong> ({medication.form.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] text-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#167C80] text-sm">{medication.name}</span>
            <button
              onClick={handleReadAppearance}
              className="text-xs font-bold text-[#167C80] hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" /> Read Aloud
            </button>
          </div>
          <p className="text-[#263238] leading-relaxed">
            {medication.specialInstructions || 'Take with a full glass of water after your meal.'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => onConfirmMatch(medication)}
            className="w-full py-4 rounded-2xl bg-[#1B8354] hover:bg-[#156c45] active:scale-95 text-white font-extrabold text-base shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Yes, The Pill In My Hand Matches!</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#F8F7F2] hover:bg-[#E6E4DC] text-[#263238] font-bold text-xs"
          >
            Not Sure / Ask Caregiver for Help
          </button>
        </div>
      </div>
    </div>
  );
}
