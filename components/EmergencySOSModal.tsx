'use client';

import React, { useState, useEffect } from 'react';
import { SeniorProfile } from '@/lib/types';
import { ShieldAlert, X } from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  senior: SeniorProfile;
  onConfirmSOS: () => void;
}

export function EmergencySOSModal({ isOpen, onClose, senior, onConfirmSOS }: EmergencySOSModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirmSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onConfirmSOS]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center border-4 border-[#D32F2F] animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-[#FDF3EF] text-[#D32F2F] flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-[#D32F2F]">EMERGENCY ASSISTANCE</h2>
          <p className="text-base font-semibold text-[#263238]">
            Broadcasting emergency distress alert to {senior.emergencyContact.name} ({senior.emergencyContact.phone}).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FDF3EF] border border-[#F2A58A] text-[#D32F2F] font-extrabold text-base">
          {countdown > 0 ? (
            <span>Auto-dispatching in <strong className="text-2xl text-[#D32F2F]">{countdown}</strong> seconds...</span>
          ) : (
            <span>🚨 SOS Distress Beacon Dispatched!</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onConfirmSOS();
            }}
            className="flex-1 py-4 px-6 rounded-2xl bg-[#D32F2F] hover:bg-red-700 text-white font-extrabold text-base shadow-sm active:scale-95 transition-all"
          >
            DISPATCH NOW
          </button>

          <button
            onClick={onClose}
            className="py-4 px-6 rounded-2xl bg-[#F8F7F2] hover:bg-[#E6E4DC] text-[#263238] font-bold text-base transition-colors"
          >
            Cancel / False Alarm
          </button>
        </div>
      </div>
    </div>
  );
}
