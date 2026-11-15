'use client';

import React from 'react';
import { 
  Shield, Heart, Stethoscope, User, ArrowRight, Sparkles, Clock, 
  CheckCircle2, BellRing, Lock, PhoneCall, Volume2, Eye, Activity
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export function LandingPage({ onGetStarted, onExploreDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#263238] flex flex-col font-sans selection:bg-[#B7D4C2] selection:text-[#167C80]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#167C80] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#263238]">
                Care<span className="text-[#167C80]">Nest</span>
              </span>
              <p className="text-[11px] font-semibold text-[#546E7A] tracking-wider uppercase hidden sm:block">
                Connected Care. Independent Living.
              </p>
            </div>
          </div>

          {/* Quick Links & CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExploreDemo}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-[#546E7A] hover:text-[#167C80] transition-colors"
            >
              Live Demo
            </button>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#167C80] hover:bg-[#126366] text-white text-sm font-bold shadow-xs transition-all active:scale-95"
            >
              <span>Enter Care Circle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#E6E4DC] bg-gradient-to-b from-white to-[#F8F7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F3F3] text-[#167C80] text-xs font-extrabold tracking-wide uppercase border border-[#B7D4C2]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Elderly Care & Medication Guardian</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#263238] leading-[1.12]">
                Better Care Begins with Connection.
              </h1>

              <p className="text-lg sm:text-xl text-[#546E7A] leading-relaxed max-w-2xl font-normal">
                One connected space for medication routines, healthcare appointments and the people who matter most. Empowering senior independence while giving families 24/7 peace of mind.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-2xl bg-[#167C80] hover:bg-[#126366] text-white font-extrabold text-base shadow-sm active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-[#F8F7F2] text-[#263238] font-bold text-base border-2 border-[#E6E4DC] active:scale-95 transition-all text-center"
                >
                  Explore CareNest (Instant Demo)
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-[#546E7A]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1B8354]" />
                  Passcode-based access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1B8354]" />
                  Gemini Vision OCR
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1B8354]" />
                  Autonomous Escalation
                </span>
              </div>
            </div>

            {/* Right: Modern Healthcare Ecosystem Visual Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl border-2 border-[#E6E4DC] shadow-md p-6 space-y-5">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#167C80]" />
                    <span className="font-bold text-xs text-[#263238]">Care Circle Ecosystem</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#167C80] bg-[#E8F3F3] px-2 py-0.5 rounded-md">
                    Passcode: 892144
                  </span>
                </div>

                {/* Elderly Hub Card */}
                <div className="bg-[#E8F3F3]/60 rounded-2xl p-4 border border-[#B7D4C2] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#167C80] overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80"
                      alt="Arthur"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#167C80] uppercase tracking-wider">
                      Center of Care
                    </span>
                    <h3 className="font-extrabold text-base text-[#263238]">Arthur Pendelton (76)</h3>
                    <p className="text-xs text-[#1B8354] font-semibold">
                      ✓ Morning Meds Taken on Time
                    </p>
                  </div>
                </div>

                {/* Satellite Connectors */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#FDF3EF]/60 p-3 rounded-xl border border-[#F2A58A] space-y-1">
                    <span className="flex items-center gap-1 font-bold text-[#D32F2F] text-[11px]">
                      <Heart className="w-3.5 h-3.5" /> Daughter (Sarah)
                    </span>
                    <p className="text-[11px] text-[#546E7A]">94% Weekly Adherence Peace-of-Mind</p>
                  </div>

                  <div className="bg-[#F0F6F2] p-3 rounded-xl border border-[#B7D4C2] space-y-1">
                    <span className="flex items-center gap-1 font-bold text-[#167C80] text-[11px]">
                      <Stethoscope className="w-3.5 h-3.5" /> Nurse Elena, RN
                    </span>
                    <p className="text-[11px] text-[#546E7A]">AI Optical Scan & Clinical Schedule</p>
                  </div>
                </div>

                {/* AI Safety Pill */}
                <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-[#263238]">
                    <Sparkles className="w-4 h-4 text-[#167C80]" />
                    CareNest Intelligence
                  </span>
                  <span className="text-[11px] text-[#167C80] font-semibold">Zero Conflicts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#167C80] bg-[#E8F3F3] px-3 py-1 rounded-full border border-[#B7D4C2]">
            Beyond Basic Reminders
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238]">
            An Interconnected Healthcare Platform Built for Dignity
          </h2>
          <p className="text-sm sm:text-base text-[#546E7A]">
            Designed from the ground up to solve geriatric polypharmacy confusion, alleviate caregiver burnout, and ensure medication routines are never missed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Senior Dignity */}
          <div className="bg-white p-7 rounded-3xl border border-[#E6E4DC] shadow-xs space-y-4 hover:border-[#167C80] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F3F3] text-[#167C80] flex items-center justify-center font-bold">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#263238]">Senior-First Accessibility</h3>
            <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
              Large 24pt+ typography, Web Speech voice assistant that reads schedules aloud, joyful confetti confirmation, and simple one-tap logging without tech anxiety.
            </p>
          </div>

          {/* Card 2: AI Multimodal Scanner */}
          <div className="bg-white p-7 rounded-3xl border border-[#E6E4DC] shadow-xs space-y-4 hover:border-[#167C80] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F6F2] text-[#1B8354] flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#263238]">AI Optical Rx Scanner</h3>
            <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
              Powered by Google Gemini Multimodal Vision. Caretakers snap a prescription photo; AI extracts dosage, frequency, and cross-checks active meds for drug-drug conflicts.
            </p>
          </div>

          {/* Card 3: Autonomous Escalation */}
          <div className="bg-white p-7 rounded-3xl border border-[#E6E4DC] shadow-xs space-y-4 hover:border-[#167C80] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF3EF] text-[#D32F2F] flex items-center justify-center font-bold">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#263238]">Proactive Escalation Protocol</h3>
            <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
              Passive push alerts get swiped away. CareNest autonomously dispatches escalation emails to designated family members if a critical dose goes unacknowledged past 30 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* The Three User Roles */}
      <section className="py-20 bg-white border-y border-[#E6E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-[#263238]">
              Three Distinct, Tailored Experiences
            </h2>
            <p className="text-sm text-[#546E7A]">
              Every stakeholder gets exactly what they need without cognitive clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#167C80]">
                <User className="w-5 h-5" />
                <span>The Elderly Individual</span>
              </div>
              <h4 className="text-lg font-bold text-[#263238]">Independent Living</h4>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Clear glanceable &quot;What I need to take now&quot; cards, spoken audio readout, daily mood & wellness check-in, and instant Emergency SOS.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#D32F2F]">
                <Heart className="w-5 h-5" />
                <span>The Family Member</span>
              </div>
              <h4 className="text-lg font-bold text-[#263238]">Peace of Mind</h4>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Live compliance score, real-time activity feed, automated escalation status, and direct caregiver communication channel.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#1B8354]">
                <Stethoscope className="w-5 h-5" />
                <span>The Caregiver & Nurse</span>
              </div>
              <h4 className="text-lg font-bold text-[#263238]">Clinical Precision</h4>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Comprehensive medication matrix, drug interaction auditor, doctor appointment planner with preparation checklists, and shift notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Passcode Architecture */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#167C80] to-[#126366] text-white rounded-3xl p-8 sm:p-12 shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Passcode-Based Privacy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Secure Care Circle Passcode Access
            </h2>
            <p className="text-sm text-teal-100 leading-relaxed">
              Family members and caretakers join through a verified 6-digit circle passcode. No passwords for seniors to forget. Role-based boundaries ensure private medical records stay protected.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-2xl bg-white text-[#167C80] font-black text-base shadow-sm hover:bg-[#F8F7F2] active:scale-95 transition-all shrink-0"
          >
            Enter Demo Passcode (892144)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E6E4DC] bg-white py-8 text-xs text-[#546E7A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#167C80]" />
            <span className="font-bold text-[#263238]">CareNest</span>
            <span>— Connected Care. Independent Living.</span>
          </div>
          <div>
            Built for Catalyst 2026 Solo AI Hackathon • Built with Next.js 16 & Google Gemini API
          </div>
        </div>
      </footer>
    </div>
  );
}
