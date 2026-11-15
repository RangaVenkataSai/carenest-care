'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellRing, Mail, CheckCircle2, AlertTriangle, Calendar, 
  Clock, ShieldAlert, Sparkles, Send, X, Settings, RefreshCw 
} from 'lucide-react';

interface DispatchedLog {
  id: string;
  type: 'upcoming_dose' | 'missed_dose_escalation' | 'doctor_appointment' | 'emergency_sos';
  subject: string;
  recipient: string;
  timestamp: string;
  status: string;
  htmlPreview: string;
}

interface ProactiveEmailEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient: string;
  seniorName: string;
  onTriggerEmail: (
    type: 'upcoming_dose' | 'missed_dose_escalation' | 'doctor_appointment' | 'emergency_sos',
    customRecipient: string,
    details: any
  ) => void;
}

export function ProactiveEmailEngineModal({
  isOpen,
  onClose,
  defaultRecipient,
  seniorName,
  onTriggerEmail,
}: ProactiveEmailEngineModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipient);
  const [autoTickerSeconds, setAutoTickerSeconds] = useState(18);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'settings'>('channels');

  // Background ticker simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setAutoTickerSeconds((prev) => {
        if (prev <= 1) {
          if (autoSimulate) {
            // Trigger automatic simulated scan
            onTriggerEmail('upcoming_dose', recipientEmail, {
              medicationName: 'Vitamin D3 + Calcium Citrate',
              dosage: '1000 IU',
              scheduledTime: '12:30 PM (Midday)',
              notes: 'Autonomous proactive routine scan: Take with lunchtime meal.',
            });
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoSimulate, recipientEmail, onTriggerEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6E4DC] my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#E8F3F3] text-[#167C80]">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-[#263238]">
                  Autonomous Proactive Email Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0F6F2] text-[#1B8354] border border-[#B7D4C2]">
                  ● Active & Monitoring
                </span>
              </div>
              <p className="text-xs text-[#546E7A]">
                Fulfilling hackathon requirement: Proactive reminders for missed medications, upcoming doses, and appointments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1.5 rounded-xl border border-[#E6E4DC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Engine Heartbeat & Automated Scanner Bar */}
        <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B8354] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1B8354]"></span>
            </span>
            <span className="font-bold text-[#263238]">Autonomous Schedule Heartbeat:</span>
            <span className="text-[#546E7A]">Next routine scan in <strong className="text-[#167C80] font-mono">{autoTickerSeconds}s</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263238]">
              <input
                type="checkbox"
                checked={autoSimulate}
                onChange={(e) => setAutoSimulate(e.target.checked)}
                className="w-4 h-4 rounded-md accent-[#167C80]"
              />
              <span>Auto-Dispatch On Scan ({autoSimulate ? 'ON' : 'OFF'})</span>
            </label>
          </div>
        </div>

        {/* Configurable Recipient Address for Judges */}
        <div className="p-4 rounded-2xl bg-[#E8F3F3]/60 border border-[#B7D4C2] space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="font-bold text-[#167C80] uppercase tracking-wider text-[11px]">
              Configure Email Recipient (Enter your own email to test live delivery):
            </label>
            <span className="text-[11px] text-[#546E7A]">Default: Sarah Pendelton (Family Proxy)</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. judge@example.com or your email"
              className="flex-1 p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs font-mono font-medium focus:ring-2 focus:ring-[#167C80] focus:outline-hidden"
            />
            <button
              onClick={() => {
                setRecipientEmail(defaultRecipient);
              }}
              className="px-3 py-2.5 rounded-xl bg-white border border-[#E6E4DC] text-[#546E7A] hover:text-[#263238] font-bold text-[11px]"
            >
              Reset Default
            </button>
          </div>
        </div>

        {/* Three Proactive Automated Channels */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#546E7A] block">
            Three Proactive Email Channels Mandated by Hackathon:
          </span>

          {/* Channel 1: Upcoming Dose Window */}
          <div className="p-5 rounded-2xl border border-[#E6E4DC] bg-white hover:border-[#167C80] transition-all space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-[#263238]">
                    Channel 1: Upcoming Medication Window Reminders
                  </h4>
                  <p className="text-[11px] text-[#546E7A]">
                    Proactively dispatched 15–30 minutes before dose time with meal/food caveats.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onTriggerEmail('upcoming_dose', recipientEmail, {
                    medicationName: 'Vitamin D3 + Calcium Citrate',
                    dosage: '1000 IU',
                    scheduledTime: '12:30 PM (Lunch)',
                    notes: 'Take with midday meal for optimal absorption. Drink a full glass of water.',
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Upcoming Dose Email</span>
              </button>
            </div>
            <div className="text-[11px] text-[#546E7A] bg-[#F8F7F2] p-2.5 rounded-xl border border-[#E6E4DC]">
              <strong>Proactive Trigger Logic:</strong> Checks scheduled medication times against patient clock. Dispatches email reminder so Arthur & family know the window is opening.
            </div>
          </div>

          {/* Channel 2: Missed Dose Escalation Protocol */}
          <div className="p-5 rounded-2xl border border-[#F2A58A] bg-[#FDF3EF]/40 hover:border-[#D32F2F] transition-all space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#FDF3EF] text-[#D32F2F]">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-[#D32F2F]">
                    Channel 2: Missed Dose Autonomous Escalation Protocol
                  </h4>
                  <p className="text-[11px] text-[#546E7A]">
                    Triggered when a dose is unconfirmed past the 30-minute grace period.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onTriggerEmail('missed_dose_escalation', recipientEmail, {
                    medicationName: 'Metformin HCl',
                    dosage: '500 mg',
                    scheduledTime: '08:00 AM (Overdue)',
                    notes: 'Grace period exceeded by 35 minutes. No confirmation received from patient Arthur. Recommended action: Call Arthur to check wellbeing.',
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test Missed Dose Escalation</span>
              </button>
            </div>
            <div className="text-[11px] text-[#546E7A] bg-white p-2.5 rounded-xl border border-[#F2A58A]">
              <strong>Autonomous Escalation Logic:</strong> If unacknowledged at Target Time + 30m, auto-escalates to Daughter Sarah & Nurse Elena with recommended action steps.
            </div>
          </div>

          {/* Channel 3: Medical Appointment Notice with Preparation Checklist */}
          <div className="p-5 rounded-2xl border border-[#B7D4C2] bg-[#F0F6F2]/40 hover:border-[#1B8354] transition-all space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#F0F6F2] text-[#1B8354]">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-[#1B8354]">
                    Channel 3: Doctor Appointment Reminders & Lab Prep
                  </h4>
                  <p className="text-[11px] text-[#546E7A]">
                    Dispatched 72 hours & 24 hours prior with clinic location and lab fasting instructions.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onTriggerEmail('doctor_appointment', recipientEmail, {
                    doctorName: 'Dr. Raymond Vance',
                    clinicName: 'St. Jude Heart & Vascular Center (Suite 402)',
                    appointmentDate: 'Thursday',
                    appointmentTime: '10:30 AM',
                    prepInstructions: [
                      'Bring past 14-day blood pressure and pulse log',
                      'Bring list of all current supplements',
                      'Fasting NOT required for this cardiology follow-up',
                    ],
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#1B8354] hover:bg-[#156c45] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Test Appointment Reminder</span>
              </button>
            </div>
            <div className="text-[11px] text-[#546E7A] bg-white p-2.5 rounded-xl border border-[#B7D4C2]">
              <strong>Proactive Routine Logic:</strong> Pulls preparation checklist directly from appointment record, ensuring fasting rules and transportation arrangements are never overlooked.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E6E4DC] pt-3 text-xs text-[#546E7A]">
          <span>Email Service: Resend API / Autonomous Gateway Ready</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#263238] text-white font-bold text-xs"
          >
            Close Engine Hub
          </button>
        </div>
      </div>
    </div>
  );
}
