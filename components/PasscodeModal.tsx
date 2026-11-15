'use client';

import React, { useState } from 'react';
import { Shield, KeyRound, User, Heart, Stethoscope, ArrowRight, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface PasscodeModalProps {
  isOpen: boolean;
  expectedPasscode: string;
  onSuccess: (role: UserRole) => void;
  onClose?: () => void;
}

export function PasscodeModal({ isOpen, expectedPasscode, onSuccess, onClose }: PasscodeModalProps) {
  const [inputCode, setInputCode] = useState(expectedPasscode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const rolePermissions = {
    elderly: [
      'Self-Dose Confirmation & Audio Guidance',
      'Daily Wellness & Mood Check-in',
      'One-Tap Emergency SOS Beacon',
      'High-Contrast Senior-First View',
    ],
    family: [
      'Real-Time Medication Adherence Tracking',
      'Autonomous Missed Dose Escalation Alerts',
      'Care Journal & Family Updates Stream',
      'Direct Attending Caregiver Line',
    ],
    caretaker: [
      'Full Medication Regimen Management (CRUD)',
      'AI Optical Prescription Scanner (Gemini Vision)',
      'Clinical Drug Interaction & Food Warning Checker',
      'Doctor Appointments & Prep Reminder Dispatch',
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      if (inputCode.trim() === expectedPasscode.trim()) {
        onSuccess(selectedRole);
      } else {
        setErrorMsg(`Invalid Care Circle Passcode. For hackathon evaluation, enter: ${expectedPasscode}`);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6E4DC] text-center animate-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E8F3F3] text-[#167C80] flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#263238] tracking-tight">
            Secure Care Circle Access
          </h2>
          <p className="text-xs text-[#546E7A] max-w-sm mx-auto">
            Enter the shared 6-digit passcode to access Arthur Pendelton&apos;s healthcare profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Step 1: Passcode input */}
          <div>
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase tracking-wider mb-2">
              1. Shared Care Passcode
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={8}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full text-center text-2xl tracking-[0.35em] font-mono font-bold py-3.5 px-4 border-2 border-[#E6E4DC] rounded-2xl focus:border-[#167C80] focus:outline-hidden bg-[#F8F7F2] text-[#263238]"
                placeholder="892144"
              />
              <KeyRound className="w-5 h-5 text-[#546E7A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errorMsg && (
              <p className="text-xs text-[#D32F2F] font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Step 2: Role selection */}
          <div>
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase tracking-wider mb-2">
              2. Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('elderly')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === 'elderly'
                    ? 'border-[#167C80] bg-[#E8F3F3] text-[#167C80] font-bold shadow-xs'
                    : 'border-[#E6E4DC] bg-white text-[#546E7A] hover:bg-[#F8F7F2]'
                }`}
              >
                <User className="w-5 h-5 mb-1" />
                <span className="text-xs">Senior</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('family')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === 'family'
                    ? 'border-[#167C80] bg-[#E8F3F3] text-[#167C80] font-bold shadow-xs'
                    : 'border-[#E6E4DC] bg-white text-[#546E7A] hover:bg-[#F8F7F2]'
                }`}
              >
                <Heart className="w-5 h-5 mb-1" />
                <span className="text-xs">Family</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('caretaker')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === 'caretaker'
                    ? 'border-[#167C80] bg-[#E8F3F3] text-[#167C80] font-bold shadow-xs'
                    : 'border-[#E6E4DC] bg-white text-[#546E7A] hover:bg-[#F8F7F2]'
                }`}
              >
                <Stethoscope className="w-5 h-5 mb-1" />
                <span className="text-xs">Caregiver</span>
              </button>
            </div>
          </div>

          {/* Step 3: Granted Permissions Preview */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] text-xs space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#546E7A] tracking-wider block">
              Granted Permissions for {selectedRole.toUpperCase()}:
            </span>
            <div className="space-y-1 text-[#263238]">
              {rolePermissions[selectedRole].map((perm, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B8354] shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-4 rounded-2xl bg-[#167C80] hover:bg-[#126366] active:scale-95 text-white font-extrabold text-base shadow-xs transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span>Verifying Passcode...</span>
            ) : (
              <>
                <span>Enter Care Circle</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-[#546E7A] pt-1 border-t border-[#E6E4DC]">
          <span>Catalyst 2026 Solo AI Hackathon</span>
          <span>Passcode: <strong className="font-mono text-[#167C80]">892144</strong></span>
        </div>
      </div>
    </div>
  );
}
