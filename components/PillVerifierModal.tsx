'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import { Eye, CheckCircle2, Volume2, X, Pill, ShieldCheck, AlertCircle, ZoomIn } from 'lucide-react';
import { VoiceLanguage, speakText } from '@/lib/voiceAssistant';

interface PillVerifierModalProps {
  medication: Medication | null;
  voiceLang?: VoiceLanguage;
  onClose: () => void;
  onConfirmMatch: (med: Medication) => void;
}

export function PillVerifierModal({
  medication,
  voiceLang = 'en',
  onClose,
  onConfirmMatch,
}: PillVerifierModalProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'diagram'>('photo');

  if (!medication) return null;

  const handleReadAppearance = () => {
    let text = '';
    if (voiceLang === 'te') {
      text = `మందు ధృవీకరణ: ${medication.name}. దీని రంగు ${medication.pillColor}, ఆకారం ${medication.pillShape}. మోతాదు ${medication.dosage}. మీ చేతిలోని మాత్రతో సరిపోల్చుకోండి.`;
    } else if (voiceLang === 'hi') {
      text = `दवाई की पहचान: ${medication.name}. इसका रंग ${medication.pillColor} और आकार ${medication.pillShape} है। मात्रा ${medication.dosage} है। अपनी गोली का मिलान करें।`;
    } else {
      text = `Verifying ${medication.name}. The pill should be ${medication.pillColor} in color and ${medication.pillShape} in shape with imprint ${
        medication.pillImprint || medication.dosage
      }. Your dosage is ${medication.dosage}. ${medication.specialInstructions}`;
    }

    speakText(text, voiceLang);
  };

  // Determine realistic CSS representation of the pill
  const isYellow = medication.pillColor.toLowerCase().includes('yellow');
  const isAmber = medication.pillColor.toLowerCase().includes('amber') || medication.pillColor.toLowerCase().includes('orange');
  const isBlue = medication.pillColor.toLowerCase().includes('blue');

  let pillBg = 'bg-white border-slate-300 text-slate-800 shadow-inner';
  if (isYellow) {
    pillBg = 'bg-amber-100 border-amber-300 text-amber-900';
  } else if (isAmber) {
    pillBg = 'bg-orange-100 border-orange-300 text-orange-950';
  } else if (isBlue) {
    pillBg = 'bg-blue-100 border-blue-300 text-blue-900';
  }

  let pillShapeClass = 'w-24 h-24 rounded-full';
  if (medication.pillShape.toLowerCase().includes('oval')) {
    pillShapeClass = 'w-32 h-20 rounded-full';
  } else if (medication.pillShape.toLowerCase().includes('oblong') || medication.pillShape.toLowerCase().includes('capsule')) {
    pillShapeClass = 'w-36 h-16 rounded-full';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#167C80] text-center animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
              <Eye className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h3 className="font-extrabold text-base text-[#263238]">Visual Pill Identifier</h3>
              <p className="text-xs text-[#546E7A]">Compare the pill in your hand before swallowing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Real Medicine Image Display */}
        <div className="p-4 rounded-3xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#167C80] flex items-center gap-1">
              <Pill className="w-3.5 h-3.5" />
              <span>Physical Medicine Appearance</span>
            </span>

            {medication.imageUrl && (
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E6E4DC] text-[10px] font-bold">
                <button
                  onClick={() => setActiveTab('photo')}
                  className={`px-2 py-0.5 rounded-md ${activeTab === 'photo' ? 'bg-[#167C80] text-white' : 'text-[#546E7A]'}`}
                >
                  Photo
                </button>
                <button
                  onClick={() => setActiveTab('diagram')}
                  className={`px-2 py-0.5 rounded-md ${activeTab === 'diagram' ? 'bg-[#167C80] text-white' : 'text-[#546E7A]'}`}
                >
                  Diagram
                </button>
              </div>
            )}
          </div>

          {/* Image Container */}
          <div className="w-full h-48 sm:h-52 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white flex items-center justify-center">
            {activeTab === 'photo' && medication.imageUrl ? (
              <img
                src={medication.imageUrl}
                alt={medication.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`border-4 flex items-center justify-center font-black text-sm tracking-wider shadow-md ${pillShapeClass} ${pillBg}`}
              >
                <span>{medication.pillImprint || medication.dosage}</span>
              </div>
            )}
          </div>

          {/* Visual Cues */}
          <div className="grid grid-cols-3 gap-2 text-xs text-left bg-white p-3 rounded-2xl border border-[#E6E4DC]">
            <div>
              <span className="text-[10px] text-[#546E7A] block font-bold uppercase">Color</span>
              <strong className="text-[#263238]">{medication.pillColor}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#546E7A] block font-bold uppercase">Shape</span>
              <strong className="text-[#263238]">{medication.pillShape}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#546E7A] block font-bold uppercase">Imprint</span>
              <strong className="text-[#167C80] font-mono">{medication.pillImprint || medication.dosage}</strong>
            </div>
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
