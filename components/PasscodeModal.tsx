'use client';

import React, { useState } from 'react';
import { Shield, KeyRound, User, Heart, Stethoscope, ArrowRight, Lock } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface PasscodeModalProps {
  isOpen: boolean;
  expectedPasscode: string;
  onSuccess: (role: UserRole) => void;
}

export function PasscodeModal({ isOpen, expectedPasscode, onSuccess }: PasscodeModalProps) {
  const [inputCode, setInputCode] = useState(expectedPasscode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim() === expectedPasscode.trim()) {
      onSuccess(selectedRole);
    } else {
      setErrorMsg(`Invalid Care Circle Passcode. For demo evaluation, use: ${expectedPasscode}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Care Circle Secure Access</h2>
          <p className="text-xs text-slate-500">
            Enter the 6-digit Care Circle Passcode to access Arthur Pendelton&apos;s healthcare management ecosystem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Care Circle Passcode
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
                className="w-full text-center text-2xl tracking-[0.3em] font-mono font-bold py-3 px-4 border-2 border-slate-200 rounded-2xl focus:border-blue-600 focus:outline-hidden bg-slate-50"
                placeholder="892144"
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errorMsg && <p className="text-xs text-red-600 font-semibold mt-1.5">{errorMsg}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Access Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('elderly')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === 'elderly'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-xs">Senior</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('family')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === 'family'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs">Family</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('caretaker')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === 'caretaker'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs">Caretaker</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Enter Care Circle</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Catalyst 2026 Solo AI Hackathon • Passcode: <span className="font-mono font-bold text-slate-600">892144</span>
        </p>
      </div>
    </div>
  );
}
