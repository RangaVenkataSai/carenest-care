'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import { Eye, Volume2, Sparkles, CheckCircle2, ZoomIn, Pill as PillIcon, Package } from 'lucide-react';
import { VoiceLanguage, speakText } from '@/lib/voiceAssistant';

interface MedicineVisualCardProps {
  medication: Medication;
  mode?: 'hero' | 'compact' | 'zen';
  voiceLang?: VoiceLanguage;
  onEnlarge?: () => void;
}

export function MedicineVisualCard({
  medication,
  mode = 'hero',
  voiceLang = 'en',
  onEnlarge,
}: MedicineVisualCardProps) {
  const [activeTab, setActiveTab] = useState<'pill' | 'bottle'>('pill');
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fallback realistic CSS rendering if image is loading or fails
  const isYellow = medication.pillColor.toLowerCase().includes('yellow');
  const isAmber = medication.pillColor.toLowerCase().includes('amber') || medication.pillColor.toLowerCase().includes('orange');
  const isBlue = medication.pillColor.toLowerCase().includes('blue');

  let pillGrad = 'from-slate-100 via-white to-slate-200 border-slate-300 text-slate-800';
  if (isYellow) {
    pillGrad = 'from-amber-200 via-yellow-100 to-amber-300 border-amber-400 text-amber-950';
  } else if (isAmber) {
    pillGrad = 'from-amber-400 via-orange-300 to-amber-500 border-amber-600 text-white';
  } else if (isBlue) {
    pillGrad = 'from-sky-200 via-blue-100 to-sky-300 border-blue-400 text-blue-950';
  }

  const isOval = medication.pillShape.toLowerCase().includes('oval');
  const isCapsule = medication.pillShape.toLowerCase().includes('oblong') || medication.pillShape.toLowerCase().includes('capsule');

  const shapeClass = isCapsule
    ? 'w-28 h-12 rounded-full'
    : isOval
    ? 'w-24 h-16 rounded-full'
    : 'w-20 h-20 rounded-full';

  const handleSpeakAppearance = (e: React.MouseEvent) => {
    e.stopPropagation();

    let textToSpeak = '';
    if (voiceLang === 'te') {
      textToSpeak = `ఈ మందు ${medication.name}. దీని రంగు ${medication.pillColor}, ఆకారం ${medication.pillShape}. మోతాదు ${medication.dosage}. మీ చేతిలోని మాత్రతో సరిపోల్చుకోండి.`;
    } else if (voiceLang === 'hi') {
      textToSpeak = `यह दवाई ${medication.name} है। इसका रंग ${medication.pillColor} और आकार ${medication.pillShape} है। मात्रा ${medication.dosage} है। अपनी गोली का मिलान करें।`;
    } else {
      textToSpeak = `Identifying ${medication.name}. Look for a ${medication.pillColor} ${medication.pillShape} pill with imprint ${
        medication.pillImprint || medication.dosage
      }.`;
    }

    speakText(textToSpeak, voiceLang);
  };

  // Compact Thumbnail View for list items
  if (mode === 'compact') {
    return (
      <div
        onClick={() => setIsZoomed(true)}
        className="relative group cursor-pointer shrink-0"
        title="Tap to see actual medicine photo"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#B7D4C2] group-hover:border-[#167C80] shadow-2xs bg-white flex items-center justify-center transition-all group-hover:scale-105">
          {medication.imageUrl && !imageError ? (
            <img
              src={medication.imageUrl}
              alt={medication.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`flex items-center justify-center font-bold text-[10px] shadow-inner border ${shapeClass} ${pillGrad}`}>
              <span>{medication.pillImprint || medication.dosage}</span>
            </div>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#167C80] text-white shadow-2xs">
          <ZoomIn className="w-3 h-3" />
        </span>

        {/* Modal for Compact Zoom */}
        {isZoomed && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-[#167C80] animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase text-[#167C80]">Medicine Visual Identifier</span>
                  <h4 className="font-extrabold text-lg text-[#263238]">{medication.name}</h4>
                </div>
                <button
                  onClick={() => setIsZoomed(false)}
                  className="text-[#546E7A] hover:text-[#263238] text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-[#E6E4DC] bg-slate-50 flex items-center justify-center">
                {medication.imageUrl ? (
                  <img src={medication.imageUrl} alt={medication.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`flex items-center justify-center font-black text-sm shadow-md border-2 ${shapeClass} ${pillGrad}`}>
                    <span>{medication.pillImprint || medication.dosage}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] text-xs text-left space-y-1">
                <div><strong>Color:</strong> {medication.pillColor} • <strong>Shape:</strong> {medication.pillShape}</div>
                {medication.pillImprint && <div><strong>Pill Imprint:</strong> {medication.pillImprint}</div>}
                <div><strong>Dosage:</strong> {medication.dosage}</div>
              </div>

              <button
                onClick={() => setIsZoomed(false)}
                className="w-full py-2.5 rounded-xl bg-[#167C80] text-white text-xs font-bold"
              >
                Close Visual
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Zen Mode View (Huge pill render for cognitive clarity)
  if (mode === 'zen') {
    return (
      <div className="space-y-4">
        <div className="relative mx-auto max-w-sm h-56 rounded-3xl overflow-hidden border-4 border-[#167C80] shadow-lg bg-white flex items-center justify-center group">
          {medication.imageUrl && !imageError ? (
            <img
              src={medication.imageUrl}
              alt={medication.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-8 flex flex-col items-center justify-center space-y-2">
              <div
                className={`bg-gradient-to-br border-4 flex items-center justify-center font-black text-xl tracking-wider shadow-xl ${shapeClass} ${pillGrad}`}
              >
                <span>{medication.pillImprint || medication.dosage}</span>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-[#167C80] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Match This Pill in Hand</span>
          </div>

          <button
            onClick={handleSpeakAppearance}
            className="absolute bottom-3 right-3 bg-white/95 text-[#167C80] hover:bg-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs border border-[#B7D4C2] flex items-center gap-1.5 transition-all active:scale-95"
            title="Hear pill appearance description"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear Description</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-[#E8F3F3] text-[#167C80] border border-[#B7D4C2]">
            🎨 Color: {medication.pillColor}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#F8F7F2] text-[#263238] border border-[#E6E4DC]">
            📐 Shape: {medication.pillShape}
          </span>
          {medication.pillImprint && (
            <span className="px-3 py-1 rounded-full bg-white text-[#263238] border border-[#E6E4DC]">
              🔤 Imprint: {medication.pillImprint}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Hero Mode (Default on Next Medication Focus Card)
  return (
    <div className="bg-[#F8F7F2] rounded-2xl border-2 border-[#B7D4C2] p-4 sm:p-5 space-y-4">
      {/* Top Header of the Visual Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E4DC] pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white text-[#167C80] border border-[#B7D4C2] shadow-2xs">
            <Eye className="w-4 h-4" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C80] block">
              Elderly Visual Pill Identifier
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-[#263238]">
              Look for this exact pill before consuming
            </h4>
          </div>
        </div>

        {/* View Switcher: Actual Pill vs Prescription Bottle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#E6E4DC] text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pill')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'pill'
                ? 'bg-[#167C80] text-white shadow-2xs'
                : 'text-[#546E7A] hover:text-[#263238]'
            }`}
          >
            <PillIcon className="w-3.5 h-3.5" />
            <span>Pill Photo</span>
          </button>
          {medication.bottleImageUrl && (
            <button
              onClick={() => setActiveTab('bottle')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                activeTab === 'bottle'
                  ? 'bg-[#167C80] text-white shadow-2xs'
                  : 'text-[#546E7A] hover:text-[#263238]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Bottle Label</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image & Comparison Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Photo Canvas */}
        <div className="md:col-span-5 relative">
          <div
            onClick={() => setIsZoomed(true)}
            className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white relative cursor-pointer group flex items-center justify-center"
          >
            {activeTab === 'pill' ? (
              medication.imageUrl && !imageError ? (
                <img
                  src={medication.imageUrl}
                  alt={medication.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="p-6 flex flex-col items-center justify-center space-y-2">
                  <div
                    className={`bg-gradient-to-br border-4 flex items-center justify-center font-black text-sm tracking-wider shadow-md ${shapeClass} ${pillGrad}`}
                  >
                    <span>{medication.pillImprint || medication.dosage}</span>
                  </div>
                  <span className="text-[11px] text-[#546E7A] font-semibold">
                    {medication.pillColor} {medication.pillShape}
                  </span>
                </div>
              )
            ) : (
              <img
                src={medication.bottleImageUrl}
                alt={`${medication.name} bottle`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}

            {/* Tap to zoom hint */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 opacity-90 group-hover:opacity-100">
              <ZoomIn className="w-3 h-3" />
              <span>Tap to Enlarge</span>
            </div>
          </div>
        </div>

        {/* Visual Inspection Checklist & Physical Cues */}
        <div className="md:col-span-7 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E6E4DC] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#546E7A] block">
              Visual Verification Checklist (Arthur, check these 3 cues):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B8354] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#546E7A] block font-semibold">Color</span>
                  <strong className="text-[#263238]">{medication.pillColor}</strong>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B8354] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#546E7A] block font-semibold">Shape</span>
                  <strong className="text-[#263238]">{medication.pillShape}</strong>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B8354] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#546E7A] block font-semibold">Imprint</span>
                  <strong className="text-[#167C80] font-mono">{medication.pillImprint || medication.dosage}</strong>
                </div>
              </div>
            </div>

            {medication.visualDescription && (
              <p className="text-xs text-[#546E7A] leading-relaxed pt-1 italic">
                &ldquo;{medication.visualDescription}&rdquo;
              </p>
            )}
          </div>

          {/* Audio Appearance Reader */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSpeakAppearance}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#E8F3F3] text-[#167C80] font-bold text-xs border border-[#B7D4C2] shadow-2xs transition-colors active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>
                {voiceLang === 'hi'
                  ? 'दवाई का रूप रंग सुनें (Audio)'
                  : voiceLang === 'te'
                  ? 'మందు రూపం వివరాలు వినండి'
                  : 'Hear Appearance Description'}
              </span>
            </button>

            <span className="text-[11px] font-semibold text-[#1B8354] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Visual Match Guaranteed
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Contrast Zoom Modal */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border-4 border-[#167C80] text-center animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
              <div className="text-left">
                <span className="text-xs font-bold uppercase text-[#167C80]">Large High-Contrast Identifier</span>
                <h3 className="text-2xl font-black text-[#263238]">{medication.name} ({medication.dosage})</h3>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-2 text-[#546E7A] hover:text-[#263238] text-xl font-bold rounded-xl hover:bg-[#F8F7F2]"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#E6E4DC] bg-slate-100 flex items-center justify-center">
              {medication.imageUrl ? (
                <img src={medication.imageUrl} alt={medication.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`flex items-center justify-center font-black text-xl shadow-lg border-4 ${shapeClass} ${pillGrad}`}>
                  <span>{medication.pillImprint || medication.dosage}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] text-sm text-[#263238] space-y-1 text-left">
              <p><strong>Color & Shape:</strong> {medication.pillColor} ({medication.pillShape})</p>
              <p><strong>Imprint on Pill:</strong> <strong className="text-[#167C80] font-mono">{medication.pillImprint || medication.dosage}</strong></p>
              <p><strong>Instructions:</strong> {medication.specialInstructions}</p>
            </div>

            <button
              onClick={() => setIsZoomed(false)}
              className="w-full py-4 rounded-2xl bg-[#167C80] hover:bg-[#126366] text-white font-extrabold text-base shadow-xs"
            >
              ✓ Pill Verified in Hand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
