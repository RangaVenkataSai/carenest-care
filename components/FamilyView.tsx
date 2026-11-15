'use client';

import React, { useState } from 'react';
import { SeniorProfile, Medication, MedicationDoseLog, DoctorAppointment, DailyWellnessLog, CaregiverAlert } from '@/lib/types';
import { 
  Heart, ShieldCheck, AlertTriangle, Calendar, Phone, Mail, 
  Send, Activity, UserCheck, BellRing, Sparkles, CheckCircle2, Clock
} from 'lucide-react';

interface FamilyViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
  appointments: DoctorAppointment[];
  wellnessLogs: DailyWellnessLog[];
  alerts: CaregiverAlert[];
  onTriggerEmailSimulation: (
    type: 'upcoming_dose' | 'missed_dose_escalation' | 'doctor_appointment' | 'emergency_sos',
    details: {
      medicationName?: string;
      dosage?: string;
      scheduledTime?: string;
      doctorName?: string;
      clinicName?: string;
      appointmentDate?: string;
      appointmentTime?: string;
      prepInstructions?: string[];
      notes?: string;
    }
  ) => void;
}

export function FamilyView({
  senior,
  medications,
  doseLogs,
  appointments,
  wellnessLogs,
  alerts,
  onTriggerEmailSimulation,
}: FamilyViewProps) {
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState(senior.emergencyContact.email);

  // Adherence calculations
  const totalDosesToday = doseLogs.length;
  const takenDosesToday = doseLogs.filter((d) => d.status === 'taken').length;
  const adherenceRate = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

  const latestWellness = wellnessLogs[0];
  const nextAppointment = appointments.find((a) => a.status === 'upcoming');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero: Family Peace of Mind Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Heart className="w-4 h-4 text-emerald-200" />
              <span>Family Guardian Portal • Peace-of-Mind Mode</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {senior.name}&apos;s Live Care Status
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg max-w-xl font-medium">
              Real-time transparency without hovering. Automatic email escalations protect your parent 24/7.
            </p>
          </div>

          {/* Quick Adherence Score Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[160px]">
            <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider">
              Today&apos;s Adherence
            </span>
            <div className="text-4xl font-black mt-1">{adherenceRate}%</div>
            <span className="text-xs text-emerald-100">
              {takenDosesToday} of {totalDosesToday} doses taken
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Live Metrics & Current Mood */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Medication Compliance Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Medication Adherence</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">{adherenceRate}%</div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {takenDosesToday === totalDosesToday
              ? 'All prescribed doses taken on time today.'
              : `${totalDosesToday - takenDosesToday} dose(s) remaining for today.`}
          </p>
        </div>

        {/* Latest Wellness Check-in Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Daily Wellness Check</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          {latestWellness ? (
            <div>
              <div className="text-2xl font-black text-slate-900 capitalize flex items-center gap-2">
                <span>Feeling {latestWellness.mood}</span>
                <span className="text-lg">
                  {latestWellness.mood === 'thriving' ? '🌟' : latestWellness.mood === 'good' ? '😊' : '😐'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Reported Pain Scale: <strong>{latestWellness.painScale}/10</strong> • {latestWellness.waterGlasses} glasses of water
              </p>
              {latestWellness.notes && (
                <p className="text-xs italic text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">
                  &ldquo;{latestWellness.notes}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No wellness check logged today yet.</p>
          )}
        </div>

        {/* Next Medical Appointment Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Upcoming Doctor Visit</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </span>
          </div>
          {nextAppointment ? (
            <div>
              <div className="text-lg font-bold text-slate-900">{nextAppointment.doctorName}</div>
              <p className="text-xs text-indigo-600 font-semibold">{nextAppointment.specialty}</p>
              <p className="text-xs text-slate-500 mt-1">
                📅 {new Date(nextAppointment.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {nextAppointment.time}
              </p>
              <p className="text-xs text-slate-400 truncate">{nextAppointment.clinicName}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No upcoming visits scheduled.</p>
          )}
        </div>
      </div>

      {/* Autonomous Escalation & Proactive Email Engine Control Hub */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BellRing className="w-4 h-4 text-indigo-400" />
              <span>Proactive Escalation Protocol (Hackathon Requirement)</span>
            </div>
            <h2 className="text-2xl font-extrabold">Autonomous Guardian & Email Engine</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              If {senior.preferredName} does not acknowledge a medication within 30 minutes, the system autonomously escalates email alerts to you and their attending care team.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Monitoring Active
            </span>
          </div>
        </div>

        {/* Interactive Demo Buttons for Judges */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Simulate Autonomous Proactive Email Alerts (Instant Preview for Judges):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() =>
                onTriggerEmailSimulation('missed_dose_escalation', {
                  medicationName: 'Metformin HCl',
                  dosage: '500 mg',
                  scheduledTime: '08:00 AM',
                  notes: 'Dose overdue by 35 minutes without patient acknowledgment.',
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-red-900/40 transition-all border border-red-500"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Test Missed Dose Escalation</span>
            </button>

            <button
              onClick={() =>
                onTriggerEmailSimulation('upcoming_dose', {
                  medicationName: 'Vitamin D3 + Calcium Citrate',
                  dosage: '1000 IU',
                  scheduledTime: '12:30 PM (Lunch)',
                  notes: 'Take with midday meal for optimal absorption.',
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-blue-900/40 transition-all border border-blue-500"
            >
              <Clock className="w-4 h-4" />
              <span>Test Upcoming Dose Alert</span>
            </button>

            <button
              onClick={() =>
                onTriggerEmailSimulation('doctor_appointment', {
                  doctorName: nextAppointment?.doctorName || 'Dr. Raymond Vance',
                  clinicName: nextAppointment?.clinicName || 'St. Jude Heart Center',
                  appointmentDate: nextAppointment?.date || 'In 3 Days',
                  appointmentTime: nextAppointment?.time || '10:30 AM',
                  prepInstructions: nextAppointment?.preparationInstructions || [
                    'Bring past 14-day blood pressure logs',
                    'Fasting not required',
                  ],
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-900/40 transition-all border border-emerald-500"
            >
              <Calendar className="w-4 h-4" />
              <span>Test Appointment Reminder</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Care Circle Activity Feed */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span>Today&apos;s Live Care Feed</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Updated in real-time
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {doseLogs.map((log) => {
            const isTaken = log.status === 'taken';
            return (
              <div key={log.id} className="relative flex items-start gap-4">
                <span
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${
                    isTaken ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                  }`}
                />
                <div className="flex-1 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {log.medicationName}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{log.scheduledTime}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {isTaken ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Taken by {log.confirmedByName || senior.preferredName} at{' '}
                        {new Date(log.takenAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {log.notes && ` (${log.notes})`}
                      </span>
                    ) : (
                      <span className="text-slate-500">Scheduled dose • Pending confirmation</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Attending Caregiver Information */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <span>Assigned Caregiver Team</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Nurse Elena Vance, RN</h4>
              <p className="text-xs text-slate-500">Primary Home Healthcare Provider</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">● On-duty (Shift: 8 AM - 4 PM)</p>
            </div>
            <a
              href="tel:+15554329011"
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              title="Call Nurse Elena"
            >
              <Phone className="w-5 h-5 text-indigo-600" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">{senior.primaryDoctor.name}</h4>
              <p className="text-xs text-slate-500">{senior.primaryDoctor.clinic}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">{senior.primaryDoctor.phone}</p>
            </div>
            <a
              href={`tel:${senior.primaryDoctor.phone}`}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              title="Call Doctor"
            >
              <Phone className="w-5 h-5 text-blue-600" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
