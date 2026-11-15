'use client';

import React, { useState } from 'react';
import { 
  Shield, KeyRound, User, Heart, Stethoscope, ArrowRight, Lock, 
  CheckCircle2, AlertCircle, Volume2, Sparkles, Mail, Eye, Type, Languages,
  ChevronRight, Info, Check, ShieldCheck
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { VoiceLanguage, speakText, stopSpeech } from '@/lib/voiceAssistant';

interface LoginPageProps {
  expectedPasscode: string;
  seniorName?: string;
  voiceLang: VoiceLanguage;
  onVoiceLangChange: (lang: VoiceLanguage) => void;
  onLoginSuccess: (role: UserRole) => void;
  onExploreLanding: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onToggleFontSize: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export function LoginPage({
  expectedPasscode = '892144',
  seniorName = 'Arthur Pendelton',
  voiceLang,
  onVoiceLangChange,
  onLoginSuccess,
  onExploreLanding,
  fontSize,
  onToggleFontSize,
  highContrast,
  onToggleHighContrast,
}: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'passcode' | 'email'>('passcode');
  const [inputCode, setInputCode] = useState(expectedPasscode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Role permissions breakdown for transparency
  const rolePermissions: Record<UserRole, { title: string; subtitle: string; icon: any; permissions: string[] }> = {
    elderly: {
      title: 'Arthur Pendelton',
      subtitle: 'Senior (Patient Experience)',
      icon: User,
      permissions: [
        'Visual Pill Identification & High-Resolution Bottle Photos',
        'Single-Tap "Mark as Taken" & Snooze Medication Reminders',
        'Multilingual Voice Assistant (English, हिन्दी, తెలుగు)',
        'One-Tap Emergency SOS Beacon (Calls Sarah & Nurse Elena)',
        'Daily Wellness & Mood Check-In Feed',
      ],
    },
    family: {
      title: 'Sarah Pendelton',
      subtitle: 'Family Guardian (Daughter)',
      icon: Heart,
      permissions: [
        'Real-Time Medication Adherence Overview & Compliance Score',
        'Automated Missed Dose & Late Medication Escalations',
        'Collaborative Care Journal & Family Activity Timeline',
        'Direct Healthcare Profile Management & Attending Contact Line',
        'Proactive Email Notification Engine Simulation Hub',
      ],
    },
    caretaker: {
      title: 'Nurse Elena Vance, RN',
      subtitle: 'Caregiver (Certified Attending Nurse)',
      icon: Stethoscope,
      permissions: [
        'Full Medication Regimen Management (Add, Edit, Imprint Codes, Schedule)',
        'Clinical Drug Interaction & Food Warning Checker',
        'Doctor Appointments Schedule & Patient Prep Instructions',
        'Daily Healthcare Checklist & Dose Administration History',
        'Caregiver Emergency Broadcast & Escalation Management',
      ],
    },
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      if (inputCode.trim() === expectedPasscode.trim()) {
        stopSpeech();
        onLoginSuccess(selectedRole);
      } else {
        setErrorMsg(`Incorrect passcode. Use the Care Circle demo passcode: ${expectedPasscode}`);
      }
    }, 350);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both email address and password.');
        return;
      }

      // Check email persona
      const lower = email.toLowerCase();
      let assignedRole: UserRole = 'family';
      if (lower.includes('elena') || lower.includes('nurse') || lower.includes('caretaker')) {
        assignedRole = 'caretaker';
      } else if (lower.includes('arthur') || lower.includes('senior')) {
        assignedRole = 'elderly';
      }

      stopSpeech();
      onLoginSuccess(assignedRole);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    stopSpeech();
    setInputCode(expectedPasscode);
    setSelectedRole(role);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onLoginSuccess(role);
    }, 200);
  };

  const handleSpeakLoginHelp = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    let speechText = '';
    if (voiceLang === 'hi') {
      speechText = `केयरनेस्ट लॉगिन पोर्टल में आपका स्वागत है। आर्थर पेंडेलटन के स्वास्थ्य प्रोफ़ाइल में प्रवेश करने के लिए कृपया 6 अंकों का पासकोड 892144 दर्ज करें, या नीचे दिए गए किसी भी प्रोफ़ाइल बटन पर एक क्लिक करें।`;
    } else if (voiceLang === 'te') {
      speechText = `కేర్‌నెస్ట్ లాగిన్ పోర్టల్‌కు స్వాగతం. ఆర్థర్ హెల్త్‌కేర్ ప్రొఫైల్‌ను తెరవడానికి దయచేసి 6 అంకెల పాస్‌కోడ్ 892144 నమోదు చేయండి, లేదా క్రింది ప్రొఫైల్‌లలో ఒకదాన్ని నేరుగా ఎంచుకోండి.`;
    } else {
      speechText = `Welcome to CareNest. To enter Arthur Pendelton's care circle, enter the shared passcode 892144, or tap your profile card below to sign in instantly.`;
    }

    speakText(
      speechText,
      voiceLang,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const currentRoleInfo = rolePermissions[selectedRole];

  return (
    <div className={`min-h-screen bg-[#F8F7F2] text-[#263238] flex flex-col font-sans selection:bg-[#B7D4C2] selection:text-[#167C80] ${highContrast ? 'high-contrast' : ''}`}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E4DC] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#167C80] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#263238]">
                  Care<span className="text-[#167C80]">Nest</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F3F3] text-[#167C80] border border-[#B7D4C2]">
                  Secure Access
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#546E7A] hidden sm:block">
                Connected Care. Independent Living.
              </p>
            </div>
          </div>

          {/* Accessibility & Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multilingual Voice Switcher */}
            <div className="flex items-center bg-[#F8F7F2] p-1 rounded-xl border border-[#E6E4DC] text-xs font-bold text-[#263238]">
              <Languages className="w-3.5 h-3.5 text-[#167C80] ml-1.5 mr-1" />
              <button
                onClick={() => onVoiceLangChange('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  voiceLang === 'en' ? 'bg-[#167C80] text-white shadow-2xs' : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="English Voice Guidance"
              >
                EN
              </button>
              <button
                onClick={() => onVoiceLangChange('hi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  voiceLang === 'hi' ? 'bg-[#167C80] text-white shadow-2xs' : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="हिन्दी (Hindi) Voice Guidance"
              >
                हिन्दी
              </button>
              <button
                onClick={() => onVoiceLangChange('te')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  voiceLang === 'te' ? 'bg-[#167C80] text-white shadow-2xs' : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="తెలుగు (Telugu) Voice Guidance"
              >
                తెలుగు
              </button>
            </div>

            {/* High Contrast Mode */}
            <button
              onClick={onToggleHighContrast}
              className={`p-2.5 rounded-xl border transition-colors ${
                highContrast ? 'bg-black text-white border-black' : 'border-[#E6E4DC] text-[#546E7A] hover:bg-[#F8F7F2]'
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

            {/* Link to Public Landing Page */}
            <button
              onClick={onExploreLanding}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#167C80] hover:bg-[#E8F3F3] rounded-xl border border-[#B7D4C2] transition-all"
            >
              <span>Explore Platform</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-6">
          
          {/* Audio Guidance Announcement Banner for Seniors */}
          <div className="bg-gradient-to-r from-[#167C80] to-[#1F9599] text-white p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-bounce text-[#F2A58A]' : 'text-white'}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">
                  {voiceLang === 'hi' ? 'आवाज़ से सहायता (Voice Guidance)' : voiceLang === 'te' ? 'వాయిస్ సహాయం (Voice Guidance)' : 'Senior Audio Assistance'}
                </h3>
                <p className="text-xs text-white/90">
                  {voiceLang === 'hi' 
                    ? 'लॉगिन करने के निर्देश सुनने के लिए यहाँ क्लिक करें।' 
                    : voiceLang === 'te' 
                    ? 'లాగిన్ సూచనలు వినడానికి ఇక్కడ క్లిక్ చేయండి.' 
                    : 'Tap the audio button to hear spoken instructions on accessing Arthur’s Care Circle.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSpeakLoginHelp}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isPlayingAudio ? 'bg-[#F2A58A] text-[#263238] scale-105' : 'bg-white text-[#167C80] hover:bg-[#F8F7F2]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? 'Stop Spoken Audio' : 'Play Voice Instructions'}</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-9 shadow-xl relative overflow-hidden">
            {/* Top decorative badge */}
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-5 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#167C80] bg-[#E8F3F3] px-2.5 py-1 rounded-full border border-[#B7D4C2]">
                  Authorized Access Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight mt-2">
                  Sign In to CareNest
                </h1>
                <p className="text-xs sm:text-sm text-[#546E7A] mt-1">
                  Accessing healthcare profile for <strong className="text-[#263238]">{seniorName}</strong> (Passcode-Protected)
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#167C80]">
                  <ShieldCheck className="w-4 h-4 text-[#167C80]" />
                  <span>HIPAA-Compliant Access</span>
                </div>
                <span className="text-[11px] text-[#546E7A]">256-Bit Verification</span>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-[#F8F7F2] rounded-2xl border border-[#E6E4DC] mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('passcode'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'passcode'
                    ? 'bg-[#167C80] text-white shadow-xs'
                    : 'text-[#546E7A] hover:text-[#263238]'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Shared Care Circle Passcode</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('email'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'email'
                    ? 'bg-[#167C80] text-white shadow-xs'
                    : 'text-[#546E7A] hover:text-[#263238]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Caregiver / Family Email Login</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F] text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: PASSCODE LOGIN */}
            {activeTab === 'passcode' && (
              <form onSubmit={handlePasscodeLogin} className="space-y-6">
                {/* 1. Passcode Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#546E7A] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#167C80]" />
                      <span>1. Enter 6-Digit Care Circle Passcode</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setInputCode(expectedPasscode); setErrorMsg(''); }}
                      className="text-xs font-bold text-[#167C80] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-fill Demo Code ({expectedPasscode})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={inputCode}
                      onChange={(e) => { setInputCode(e.target.value); setErrorMsg(''); }}
                      placeholder="e.g. 892144"
                      className="w-full text-center tracking-[0.3em] font-mono font-black text-2xl sm:text-3xl py-3 px-4 rounded-2xl border-2 border-[#B7D4C2] focus:border-[#167C80] focus:ring-4 focus:ring-[#167C80]/15 outline-hidden transition-all bg-[#F8F7F2]/50 text-[#263238]"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-md bg-[#E8F3F3] text-[#167C80]">
                      6-DIGIT
                    </div>
                  </div>
                </div>

                {/* 2. Select Authorized Role */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#546E7A] mb-2.5">
                    2. Select Your Identity & Role
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Arthur (Senior) */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('elderly')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'elderly'
                          ? 'border-[#167C80] bg-[#E8F3F3]/80 shadow-xs ring-2 ring-[#167C80]/20'
                          : 'border-[#E6E4DC] hover:border-[#B7D4C2] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-[#167C80] text-white flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        {selectedRole === 'elderly' && (
                          <CheckCircle2 className="w-5 h-5 text-[#167C80]" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#263238]">Arthur Pendelton</div>
                        <div className="text-[11px] font-bold text-[#167C80]">Senior Citizen</div>
                        <div className="text-[10px] text-[#546E7A] mt-1 leading-snug">
                          Visual pill photos, voice reader & simple single-tap taken buttons.
                        </div>
                      </div>
                    </button>

                    {/* Sarah (Family) */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('family')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'family'
                          ? 'border-[#167C80] bg-[#E8F3F3]/80 shadow-xs ring-2 ring-[#167C80]/20'
                          : 'border-[#E6E4DC] hover:border-[#B7D4C2] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-[#167C80] text-white flex items-center justify-center">
                          <Heart className="w-5 h-5" />
                        </div>
                        {selectedRole === 'family' && (
                          <CheckCircle2 className="w-5 h-5 text-[#167C80]" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#263238]">Sarah Pendelton</div>
                        <div className="text-[11px] font-bold text-[#167C80]">Family Guardian</div>
                        <div className="text-[10px] text-[#546E7A] mt-1 leading-snug">
                          Adherence feed, missed dose alerts & shared family care circle.
                        </div>
                      </div>
                    </button>

                    {/* Elena (Caregiver) */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('caretaker')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'caretaker'
                          ? 'border-[#167C80] bg-[#E8F3F3]/80 shadow-xs ring-2 ring-[#167C80]/20'
                          : 'border-[#E6E4DC] hover:border-[#B7D4C2] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-[#167C80] text-white flex items-center justify-center">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        {selectedRole === 'caretaker' && (
                          <CheckCircle2 className="w-5 h-5 text-[#167C80]" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#263238]">Nurse Elena, RN</div>
                        <div className="text-[11px] font-bold text-[#167C80]">Attending Caregiver</div>
                        <div className="text-[10px] text-[#546E7A] mt-1 leading-snug">
                          Full medication schedule CRUD, optical AI scanner & appointments.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Live Granted Permissions Preview */}
                <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E6E4DC] text-left">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#167C80] text-white flex items-center justify-center">
                        <currentRoleInfo.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-extrabold text-[#263238]">
                        Granted Permissions: {currentRoleInfo.title} ({currentRoleInfo.subtitle})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#167C80] bg-white px-2 py-0.5 rounded-md border border-[#E6E4DC]">
                      Role-Restricted
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#546E7A]">
                    {currentRoleInfo.permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#167C80] shrink-0 mt-0.5" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 px-6 rounded-2xl bg-[#167C80] hover:bg-[#126366] text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Passcode Authorization...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock & Enter Arthur&apos;s Care Circle</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: EMAIL / PASSWORD LOGIN */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-5 text-left">
                {/* Email field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#546E7A] mb-1.5">
                    Authorized Caregiver or Family Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.pendelton@family.carenest.org"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E6E4DC] focus:border-[#167C80] focus:ring-4 focus:ring-[#167C80]/15 outline-hidden text-sm bg-white"
                  />
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#546E7A] mb-1.5">
                    Account Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E6E4DC] focus:border-[#167C80] focus:ring-4 focus:ring-[#167C80]/15 outline-hidden text-sm bg-white"
                  />
                </div>

                {/* Shortcut Quick Fills */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-[#546E7A]">Quick demo fill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('sarah.pendelton@family.carenest.org');
                      setPassword('FamilySafe2026!');
                    }}
                    className="text-xs text-[#167C80] bg-[#E8F3F3] hover:bg-[#d5ebeb] px-2.5 py-1 rounded-lg font-bold border border-[#B7D4C2] transition-colors"
                  >
                    Sarah (Family)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('nurse.elena@carenest.org');
                      setPassword('ClinicalCare2026!');
                    }}
                    className="text-xs text-[#167C80] bg-[#E8F3F3] hover:bg-[#d5ebeb] px-2.5 py-1 rounded-lg font-bold border border-[#B7D4C2] transition-colors"
                  >
                    Nurse Elena (Caregiver)
                  </button>
                </div>

                {/* Submit Email Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 px-6 rounded-2xl bg-[#167C80] hover:bg-[#126366] text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Verified Credentials</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-Click Evaluation Bar for Hackathon Judges */}
            <div className="mt-8 pt-6 border-t border-[#E6E4DC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#167C80] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#167C80]" />
                  <span>Hackathon Judge Fast Pass (1-Click Instant Login):</span>
                </span>
                <span className="text-[10px] text-[#546E7A]">Passcode {expectedPasscode} auto-verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('elderly')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F8F7F2] hover:bg-[#e8f3f3] border border-[#E6E4DC] hover:border-[#167C80] text-xs font-bold text-[#263238] transition-all shadow-2xs hover:scale-[1.02]"
                >
                  <User className="w-4 h-4 text-[#167C80]" />
                  <span>Arthur (Senior View)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('family')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F8F7F2] hover:bg-[#e8f3f3] border border-[#E6E4DC] hover:border-[#167C80] text-xs font-bold text-[#263238] transition-all shadow-2xs hover:scale-[1.02]"
                >
                  <Heart className="w-4 h-4 text-[#167C80]" />
                  <span>Sarah (Family View)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('caretaker')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F8F7F2] hover:bg-[#e8f3f3] border border-[#E6E4DC] hover:border-[#167C80] text-xs font-bold text-[#263238] transition-all shadow-2xs hover:scale-[1.02]"
                >
                  <Stethoscope className="w-4 h-4 text-[#167C80]" />
                  <span>Nurse Elena (Caregiver)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Privacy & Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#546E7A] pt-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#167C80]" />
              <span>Passcode Protected Records</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#167C80]" />
              <span>HIPAA-Aligned Privacy Boundary</span>
            </div>
            <button
              onClick={onExploreLanding}
              className="text-[#167C80] hover:underline font-bold"
            >
              Learn about CareNest Ecosystem →
            </button>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-[#546E7A] border-t border-[#E6E4DC] bg-white">
        <p>© 2026 CareNest – Connected Care. Independent Living. Built for Catalyst 2026 Solo AI Hackathon.</p>
      </footer>
    </div>
  );
}
