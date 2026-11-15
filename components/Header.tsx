'use client';

import React from 'react';
import { UserRole, SeniorProfile, CaregiverAlert } from '@/lib/types';
import { Shield, Heart, Stethoscope, User, Bell, RefreshCw, KeyRound, Volume2, Type } from 'lucide-react';

interface HeaderProps {
  senior: SeniorProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  alerts: CaregiverAlert[];
  onOpenAlerts: () => void;
  onResetData: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onToggleFontSize: () => void;
}

export function Header({
  senior,
  currentRole,
  onRoleChange,
  alerts,
  onOpenAlerts,
  onResetData,
  fontSize,
  onToggleFontSize,
}: HeaderProps) {
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  Sentinel<span className="text-blue-600">Care</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  AI Guardian
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Interconnected Geriatric Medication & Care Ecosystem
              </p>
            </div>
          </div>

          {/* Passcode Badge & Circle ID */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <KeyRound className="w-4 h-4 text-slate-500" />
            <div className="text-xs">
              <span className="text-slate-500">Care Circle: </span>
              <strong className="text-slate-800 tracking-wider font-mono">{senior.circleCode}</strong>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => onRoleChange('elderly')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'elderly'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Senior Persona - High-contrast, Voice reader, Single-tap actions"
            >
              <User className="w-4 h-4" />
              <span>Senior</span>
            </button>

            <button
              onClick={() => onRoleChange('family')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'family'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Family Guardian Persona - Peace of mind feed & Adherence tracking"
            >
              <Heart className="w-4 h-4" />
              <span>Family</span>
            </button>

            <button
              onClick={() => onRoleChange('caretaker')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'caretaker'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Caretaker Persona - Medication schedules, AI scanner, Appointments"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Caretaker</span>
            </button>
          </div>

          {/* Quick Actions & Accessibility Controls */}
          <div className="flex items-center gap-2">
            {/* Font Size Toggle for Seniors */}
            <button
              onClick={onToggleFontSize}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title={`Toggle Font Size (Current: ${fontSize})`}
            >
              <Type className="w-5 h-5" />
            </button>

            {/* Notification Center */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Alerts and Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={onResetData}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Reset Demo Data to Initial State"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
