'use client';

import React from 'react';
import { UserRole, SeniorProfile, CaregiverAlert } from '@/lib/types';
import { Shield, Heart, Stethoscope, User, Bell, RefreshCw, KeyRound, Type, Eye, Home } from 'lucide-react';

interface HeaderProps {
  senior: SeniorProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  alerts: CaregiverAlert[];
  onOpenAlerts: () => void;
  onResetData: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onToggleFontSize: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onViewLandingPage?: () => void;
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
  highContrast,
  onToggleHighContrast,
  onViewLandingPage,
}: HeaderProps) {
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E4DC] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#167C80] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#263238]">
                  Care<span className="text-[#167C80]">Nest</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F3F3] text-[#167C80] border border-[#B7D4C2]">
                  Connected Care
                </span>
              </div>
              <p className="text-[11px] text-[#546E7A] font-medium hidden sm:block">
                Connected Care. Independent Living.
              </p>
            </div>
          </div>

          {/* Passcode Badge & Circle ID */}
          <div className="hidden md:flex items-center gap-2 bg-[#F8F7F2] border border-[#E6E4DC] px-3.5 py-1.5 rounded-xl text-xs">
            <KeyRound className="w-3.5 h-3.5 text-[#167C80]" />
            <span className="text-[#546E7A]">Care Circle:</span>
            <strong className="text-[#263238] tracking-widest font-mono">{senior.circleCode}</strong>
          </div>

          {/* Role Switcher Tabs (3 Distinct User Experiences) */}
          <div className="flex items-center bg-[#F8F7F2] p-1 rounded-2xl border border-[#E6E4DC]">
            <button
              onClick={() => onRoleChange('elderly')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'elderly'
                  ? 'bg-[#167C80] text-white shadow-xs scale-[1.02]'
                  : 'text-[#546E7A] hover:text-[#263238] hover:bg-white'
              }`}
              title="Senior Persona - High-contrast, Voice reader, Single-tap actions"
            >
              <User className="w-4 h-4" />
              <span>Senior</span>
            </button>

            <button
              onClick={() => onRoleChange('family')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'family'
                  ? 'bg-[#167C80] text-white shadow-xs scale-[1.02]'
                  : 'text-[#546E7A] hover:text-[#263238] hover:bg-white'
              }`}
              title="Family Guardian Persona - Peace of mind feed & Adherence tracking"
            >
              <Heart className="w-4 h-4" />
              <span>Family</span>
            </button>

            <button
              onClick={() => onRoleChange('caretaker')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'caretaker'
                  ? 'bg-[#167C80] text-white shadow-xs scale-[1.02]'
                  : 'text-[#546E7A] hover:text-[#263238] hover:bg-white'
              }`}
              title="Caretaker Persona - Medication schedules, AI scanner, Appointments"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Caregiver</span>
            </button>
          </div>

          {/* Accessibility Controls & Landing Switcher */}
          <div className="flex items-center gap-2">
            {/* High Contrast Mode */}
            <button
              onClick={onToggleHighContrast}
              className={`p-2.5 rounded-xl border transition-colors ${
                highContrast
                  ? 'bg-black text-white border-black'
                  : 'border-[#E6E4DC] text-[#546E7A] hover:bg-[#F8F7F2]'
              }`}
              title="Toggle High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Font Size Toggle */}
            <button
              onClick={onToggleFontSize}
              className="p-2.5 rounded-xl border border-[#E6E4DC] text-[#546E7A] hover:bg-[#F8F7F2] transition-colors"
              title={`Adjust Font Size (Current: ${fontSize})`}
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Notification Center */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2.5 rounded-xl border border-[#E6E4DC] text-[#546E7A] hover:bg-[#F8F7F2] transition-colors"
              title="Alerts and Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D32F2F] text-[9px] font-bold text-white shadow-xs ring-2 ring-white">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Landing Page Home Link */}
            {onViewLandingPage && (
              <button
                onClick={onViewLandingPage}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#546E7A] hover:text-[#167C80] hover:bg-[#F8F7F2] rounded-xl border border-[#E6E4DC] transition-colors"
                title="View Product Landing Page"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Landing Page</span>
              </button>
            )}

            {/* Reset Demo */}
            <button
              onClick={onResetData}
              className="hidden xl:flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-[#546E7A] hover:text-[#D32F2F] transition-colors"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
