'use client';

import React, { useState, useEffect } from 'react';
import { SeniorProfile } from '@/lib/types';
import { ShieldAlert, PhoneCall, AlertTriangle, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center border-4 border-red-600 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-red-600">EMERGENCY ASSISTANCE</h2>
          <p className="text-base font-semibold text-slate-700">
            Broadcasting emergency distress alert to {senior.emergencyContact.name} ({senior.emergencyContact.phone}).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 font-extrabold text-lg">
          {countdown > 0 ? (
            <span>Auto-dispatching in <strong className="text-2xl text-red-600">{countdown}</strong> seconds...</span>
          ) : (
            <span>🚨 SOS Broadcast Dispatched!</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onConfirmSOS();
            }}
            className="flex-1 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            DISPATCH NOW
          </button>

          <button
            onClick={onClose}
            className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors"
          >
            Cancel / False Alarm
          </button>
        </div>
      </div>
    </div>
  );
}
