'use client';

import React, { useState } from 'react';
import { 
  SeniorProfile, Medication, MedicationDoseLog, DoctorAppointment, 
  DailyWellnessLog, CaregiverAlert, CareCircleMember, CareJournalEntry, AIInsight 
} from '@/lib/types';
import { 
  Heart, ShieldCheck, AlertTriangle, Calendar, Phone, Activity, 
  BellRing, Clock, CheckCircle2, Award, Sparkles, UserCheck, Plus, Edit3, Trash2, Pill, Send
} from 'lucide-react';
import { FamilyCareCircle } from './FamilyCareCircle';
import { SmartMedicationTimeline } from './SmartMedicationTimeline';
import { CareJournal } from './CareJournal';
import { CareNestIntelligence } from './CareNestIntelligence';
import { EditMedicationModal } from './EditMedicationModal';
import { EditAppointmentModal } from './EditAppointmentModal';

interface FamilyViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
  appointments: DoctorAppointment[];
  wellnessLogs: DailyWellnessLog[];
  alerts: CaregiverAlert[];
  members: CareCircleMember[];
  journal: CareJournalEntry[];
  aiInsights: AIInsight[];
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
  onAddJournalNote?: (note: string) => void;
  onAddMedication: (med: Medication) => void;
  onUpdateMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onAddAppointment: (apt: DoctorAppointment) => void;
  onUpdateAppointment: (apt: DoctorAppointment) => void;
  onDeleteAppointment: (id: string) => void;
}

export function FamilyView({
  senior,
  medications,
  doseLogs,
  appointments,
  wellnessLogs,
  alerts,
  members,
  journal,
  aiInsights,
  onTriggerEmailSimulation,
  onAddJournalNote,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
}: FamilyViewProps) {
  // Modal states for family management
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<DoctorAppointment | null>(null);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddAptModal, setShowAddAptModal] = useState(false);

  // New medication form state
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedForm, setNewMedForm] = useState<'pill' | 'capsule' | 'liquid' | 'injection' | 'inhaler'>('pill');
  const [newMedColor, setNewMedColor] = useState('White');
  const [newMedShape, setNewMedShape] = useState('Round');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedWithFood, setNewMedWithFood] = useState<'before_meal' | 'with_meal' | 'after_meal' | 'anytime'>('with_meal');
  const [newMedPurpose, setNewMedPurpose] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  // New appointment form state
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocClinic, setNewDocClinic] = useState('');
  const [newDocDate, setNewDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDocTime, setNewDocTime] = useState('10:00');
  const [newDocPrep, setNewDocPrep] = useState('Bring medication list and recent blood pressure log');

  // Adherence metric
  const totalDosesToday = doseLogs.length;
  const takenDosesToday = doseLogs.filter((d) => d.status === 'taken').length;
  const adherenceRate = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

  const latestWellness = wellnessLogs[0];
  const nextAppointment = appointments.find((a) => a.status === 'upcoming');

  const handleSaveNewMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedDosage) return;

    const med: Medication = {
      id: `med_${Date.now()}`,
      name: newMedName,
      dosage: newMedDosage,
      form: newMedForm,
      pillColor: newMedColor,
      pillShape: newMedShape,
      frequency: 'once_daily',
      scheduledTimes: [newMedTime],
      withFood: newMedWithFood,
      purpose: newMedPurpose || 'Family-coordinated prescription',
      specialInstructions: newMedInstructions,
      prescribedBy: senior.primaryDoctor.name,
      prescribedDate: new Date().toISOString().split('T')[0],
      stockCount: 30,
      refillReminderThreshold: 7,
    };

    onAddMedication(med);
    setShowAddMedModal(false);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedPurpose('');
    setNewMedInstructions('');
  };

  const handleSaveNewAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocClinic) return;

    const apt: DoctorAppointment = {
      id: `apt_${Date.now()}`,
      doctorName: newDocName,
      specialty: newDocSpecialty || 'General Care',
      clinicName: newDocClinic,
      location: 'Medical Center',
      phone: '+1 (555) 902-1200',
      date: newDocDate,
      time: newDocTime,
      durationMinutes: 30,
      preparationInstructions: newDocPrep.split(';').map((s) => s.trim()).filter(Boolean),
      status: 'upcoming',
      accompaniedBy: 'Sarah (Daughter)',
    };

    onAddAppointment(apt);
    setShowAddAptModal(false);
    setNewDocName('');
    setNewDocClinic('');
    setNewDocSpecialty('');
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Hero: Sophisticated Family Health Overview Banner */}
      <section className="bg-gradient-to-r from-[#167C80] to-[#126366] text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              ❤️ Authorized Family Proxy Portal • Full Management Access
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {senior.name}&apos;s Care Profile
            </h1>
            <p className="text-teal-100 text-base sm:text-lg max-w-xl font-medium">
              As an authorized family member, you have full access to view, add, and edit medication schedules, track adherence, and coordinate upcoming doctor visits.
            </p>
          </div>

          {/* Quick Management Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowAddMedModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white text-[#167C80] font-extrabold text-xs shadow-xs hover:bg-[#F8F7F2] active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>

            <button
              onClick={() => setShowAddAptModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-xs active:scale-95 transition-all border border-white/20 flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>

            {/* Adherence Score Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[140px] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
                Adherence Rate
              </span>
              <div className="text-3xl font-black mt-0.5">{adherenceRate}%</div>
              <span className="text-[11px] text-teal-100">
                {takenDosesToday}/{totalDosesToday} doses taken
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Grid: Compliance, Wellness, Next Doctor Visit */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance */}
        <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-[#546E7A] tracking-wider">
              Medication Adherence Tracking
            </span>
            <span className="p-2 rounded-xl bg-[#F0F6F2] text-[#1B8354]">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-[#263238]">{adherenceRate}%</div>
          <div className="w-full bg-[#F8F7F2] rounded-full h-2.5 overflow-hidden border border-[#E6E4DC]">
            <div
              className="bg-[#1B8354] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
          <p className="text-xs text-[#546E7A]">
            {takenDosesToday === totalDosesToday
              ? 'All daily doses taken on schedule.'
              : `${totalDosesToday - takenDosesToday} dose(s) pending for today.`}
          </p>
        </div>

        {/* Daily Wellness */}
        <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-[#546E7A] tracking-wider">
              Daily Wellness Check
            </span>
            <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          {latestWellness ? (
            <div>
              <div className="text-2xl font-black text-[#263238] capitalize flex items-center gap-2">
                <span>Feeling {latestWellness.mood}</span>
                <span className="text-lg">
                  {latestWellness.mood === 'thriving' ? '🌟' : latestWellness.mood === 'good' ? '😊' : '😐'}
                </span>
              </div>
              <p className="text-xs text-[#546E7A] mt-1">
                Pain Scale: <strong>{latestWellness.painScale}/10</strong> • {latestWellness.waterGlasses} glasses of water
              </p>
              {latestWellness.notes && (
                <p className="text-xs italic text-[#546E7A] mt-2 bg-[#F8F7F2] p-2.5 rounded-xl border border-[#E6E4DC]">
                  &ldquo;{latestWellness.notes}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#546E7A]">No wellness check logged today yet.</p>
          )}
        </div>

        {/* Next Appointment */}
        <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-[#546E7A] tracking-wider">
              Upcoming Doctor Visit
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Calendar className="w-5 h-5" />
            </span>
          </div>
          {nextAppointment ? (
            <div>
              <div className="text-lg font-bold text-[#263238]">{nextAppointment.doctorName}</div>
              <p className="text-xs text-[#167C80] font-semibold">{nextAppointment.specialty}</p>
              <p className="text-xs text-[#546E7A] mt-1">
                📅 {new Date(nextAppointment.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {nextAppointment.time}
              </p>
              <p className="text-xs text-[#546E7A] truncate">{nextAppointment.clinicName}</p>
            </div>
          ) : (
            <p className="text-sm text-[#546E7A]">No upcoming visits scheduled.</p>
          )}
        </div>
      </section>

      {/* 3. Medication Schedule Management (Authorized View, Add, Edit, Delete) */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#263238] flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#167C80]" />
              <span>Medication Schedule Management ({medications.length} Prescriptions)</span>
            </h2>
            <p className="text-xs text-[#546E7A]">
              Authorized family members can view, add, edit, and adjust medication schedules.
            </p>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className="bg-[#F8F7F2] border border-[#E6E4DC] rounded-2xl p-5 hover:border-[#167C80] transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-[#263238]">{med.name}</h3>
                  <p className="text-xs text-[#167C80] font-semibold">{med.purpose}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingMedication(med)}
                    className="p-1.5 text-[#546E7A] hover:text-[#167C80] rounded-lg hover:bg-white transition-colors"
                    title="Edit Medication Schedule"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMedication(med.id)}
                    className="p-1.5 text-[#546E7A] hover:text-[#D32F2F] rounded-lg hover:bg-white transition-colors"
                    title="Remove Medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#E6E4DC]">
                  <span className="text-[#546E7A] block font-bold uppercase text-[10px]">Dosage & Times</span>
                  <span className="font-bold text-[#263238]">{med.dosage}</span>
                  <span className="text-[#546E7A] block">At: {med.scheduledTimes.join(', ')}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#E6E4DC]">
                  <span className="text-[#546E7A] block font-bold uppercase text-[10px]">Food & Form</span>
                  <span className="font-bold text-[#263238] capitalize">{med.form}</span>
                  <span className="text-[#546E7A] block">{med.withFood.replace('_', ' ')}</span>
                </div>
              </div>

              {med.specialInstructions && (
                <div className="text-xs bg-[#E8F3F3] border border-[#B7D4C2] text-[#263238] p-2.5 rounded-xl">
                  <strong>Instructions:</strong> {med.specialInstructions}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#546E7A] pt-1 border-t border-[#E6E4DC]">
                <span>Prescribed by: {med.prescribedBy}</span>
                <span className="font-bold text-[#263238]">Stock: {med.stockCount} pills</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Doctor Appointments Management (Authorized View, Add, Edit, Reminders) */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#263238] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#167C80]" />
              <span>Upcoming Doctor Appointments & Routines</span>
            </h2>
            <p className="text-xs text-[#546E7A]">
              Monitor upcoming clinic visits, edit preparation instructions, and send reminder emails.
            </p>
          </div>

          <button
            onClick={() => setShowAddAptModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>

        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border border-[#E6E4DC] bg-[#F8F7F2] hover:bg-white transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#263238]">{apt.doctorName}</h3>
                  <p className="text-xs font-semibold text-[#167C80]">{apt.specialty} • {apt.clinicName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3F3] text-[#167C80]">
                    📅 {apt.date} at {apt.time}
                  </span>

                  <button
                    onClick={() =>
                      onTriggerEmailSimulation('doctor_appointment', {
                        doctorName: apt.doctorName,
                        clinicName: apt.clinicName,
                        appointmentDate: apt.date,
                        appointmentTime: apt.time,
                        prepInstructions: apt.preparationInstructions,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold transition-colors"
                    title="Send Email Reminder"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder</span>
                  </button>

                  <button
                    onClick={() => setEditingAppointment(apt)}
                    className="p-1.5 text-[#546E7A] hover:text-[#167C80] rounded-lg hover:bg-white transition-colors"
                    title="Edit Appointment"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteAppointment(apt.id)}
                    className="p-1.5 text-[#546E7A] hover:text-[#D32F2F] rounded-lg hover:bg-white transition-colors"
                    title="Cancel Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {apt.preparationInstructions.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-[#E6E4DC] text-xs space-y-1">
                  <strong className="text-[#263238]">Preparation Instructions:</strong>
                  <ul className="list-disc list-inside text-[#546E7A] space-y-0.5">
                    {apt.preparationInstructions.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Family Care Circle (Signature Feature C) */}
      <FamilyCareCircle senior={senior} members={members} />

      {/* 6. CareNest Intelligence (Signature Feature A) */}
      <CareNestIntelligence
        insights={aiInsights}
        onTakeAction={(insight) => {
          alert(`CareNest Intelligence action triggered: "${insight.title}"`);
        }}
      />

      {/* 7. Smart Medication Timeline (Signature Feature B) */}
      <SmartMedicationTimeline
        medications={medications}
        doseLogs={doseLogs}
      />

      {/* 8. Autonomous Escalation & Proactive Email Engine Hub */}
      <section className="bg-gradient-to-br from-[#263238] to-[#126366] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold uppercase tracking-wider mb-2">
              <BellRing className="w-3.5 h-3.5" />
              <span>Proactive Escalation Protocol (Hackathon Requirement)</span>
            </div>
            <h2 className="text-2xl font-extrabold">Autonomous Guardian & Email Engine</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mt-1">
              If {senior.preferredName} does not acknowledge a scheduled dose within 30 minutes, CareNest autonomously dispatches escalation emails to you and their attending care team.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B8354] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1B8354]"></span>
            </span>
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
              Monitoring Active
            </span>
          </div>
        </div>

        {/* Interactive Triggers for Judges */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Simulate Autonomous Proactive Email Alerts (Instant Preview for Judges):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() =>
                onTriggerEmailSimulation('missed_dose_escalation', {
                  medicationName: 'Metformin HCl',
                  dosage: '500 mg',
                  scheduledTime: '08:00 AM',
                  notes: 'Dose unconfirmed for >30 minutes. Autonomous safety escalation triggered.',
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#D32F2F] hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all border border-red-400"
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
                  notes: 'Take with midday lunch for optimal absorption.',
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#167C80] hover:bg-[#126366] active:scale-95 text-white font-bold text-xs shadow-sm transition-all border border-teal-400"
            >
              <Clock className="w-4 h-4" />
              <span>Test Upcoming Dose Alert</span>
            </button>

            <button
              onClick={() =>
                onTriggerEmailSimulation('doctor_appointment', {
                  doctorName: nextAppointment?.doctorName || 'Dr. Raymond Vance',
                  clinicName: nextAppointment?.clinicName || 'St. Jude Heart Center',
                  appointmentDate: nextAppointment?.date || 'Thursday',
                  appointmentTime: nextAppointment?.time || '10:30 AM',
                  prepInstructions: nextAppointment?.preparationInstructions || [
                    'Bring past 14-day blood pressure logs',
                    'Fasting not required',
                  ],
                })
              }
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#1B8354] hover:bg-[#156c45] active:scale-95 text-white font-bold text-xs shadow-sm transition-all border border-emerald-400"
            >
              <Calendar className="w-4 h-4" />
              <span>Test Appointment Reminder</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. Care Journal (Signature Feature D) */}
      <CareJournal entries={journal} onAddNote={onAddJournalNote} />

      {/* 10. Caregiver Quick Contact Channel */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs">
        <h3 className="text-base font-bold text-[#263238] mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#167C80]" />
          <span>Assigned Caregiver Channel</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#263238]">Nurse Elena Vance, RN</h4>
              <p className="text-xs text-[#546E7A]">Primary Home Health Provider</p>
              <p className="text-xs text-[#1B8354] font-semibold mt-1">● On Duty (8 AM - 4 PM)</p>
            </div>
            <a
              href="tel:+15554329011"
              className="p-3 rounded-xl bg-white border border-[#E6E4DC] text-[#167C80] hover:bg-[#E8F3F3] transition-colors"
              title="Call Nurse Elena"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#263238]">{senior.primaryDoctor.name}</h4>
              <p className="text-xs text-[#546E7A]">{senior.primaryDoctor.clinic}</p>
              <p className="text-xs text-[#546E7A] font-mono mt-1">{senior.primaryDoctor.phone}</p>
            </div>
            <a
              href={`tel:${senior.primaryDoctor.phone}`}
              className="p-3 rounded-xl bg-white border border-[#E6E4DC] text-[#167C80] hover:bg-[#E8F3F3] transition-colors"
              title="Call Doctor"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* MODAL: Edit Medication Schedule */}
      <EditMedicationModal
        medication={editingMedication}
        isOpen={Boolean(editingMedication)}
        onClose={() => setEditingMedication(null)}
        onSave={(updated) => {
          onUpdateMedication(updated);
          setEditingMedication(null);
        }}
      />

      {/* MODAL: Edit Appointment */}
      <EditAppointmentModal
        appointment={editingAppointment}
        isOpen={Boolean(editingAppointment)}
        onClose={() => setEditingAppointment(null)}
        onSave={(updated) => {
          onUpdateAppointment(updated);
          setEditingAppointment(null);
        }}
      />

      {/* MODAL: Add Medication Manual Form */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E6E4DC]">
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
              <h3 className="text-lg font-bold text-[#263238]">Add New Medication to Regimen</h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-[#546E7A] hover:text-[#263238] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewMedication} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Amlodipine"
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs focus:ring-2 focus:ring-[#167C80]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g. 5 mg"
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs focus:ring-2 focus:ring-[#167C80]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Form</label>
                  <select
                    value={newMedForm}
                    onChange={(e) => setNewMedForm(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  >
                    <option value="pill">Pill / Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="liquid">Liquid</option>
                    <option value="injection">Injection</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Pill Color</label>
                  <input
                    type="text"
                    value={newMedColor}
                    onChange={(e) => setNewMedColor(e.target.value)}
                    placeholder="e.g. White"
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Daily Time</label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Food Requirement</label>
                <select
                  value={newMedWithFood}
                  onChange={(e) => setNewMedWithFood(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                >
                  <option value="with_meal">Take with meal</option>
                  <option value="after_meal">Take after meal</option>
                  <option value="before_meal">Take before meal (empty stomach)</option>
                  <option value="anytime">Anytime / With or without food</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Purpose / Indication</label>
                <input
                  type="text"
                  value={newMedPurpose}
                  onChange={(e) => setNewMedPurpose(e.target.value)}
                  placeholder="e.g. Blood pressure management"
                  className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Special Instructions for Arthur</label>
                <input
                  type="text"
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  placeholder="e.g. Take with water. Stand up slowly."
                  className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E4DC]">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E4DC] text-[#546E7A] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs"
                >
                  Save to Regimen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Appointment Form */}
      {showAddAptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E6E4DC]">
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
              <h3 className="text-lg font-bold text-[#263238]">Schedule Doctor Appointment</h3>
              <button
                onClick={() => setShowAddAptModal(false)}
                className="text-[#546E7A] hover:text-[#263238] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAppointment} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Raymond Vance"
                  className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Specialty</label>
                  <input
                    type="text"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={newDocClinic}
                    onChange={(e) => setNewDocClinic(e.target.value)}
                    placeholder="e.g. St. Jude Hospital"
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDocDate}
                    onChange={(e) => setNewDocDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={newDocTime}
                    onChange={(e) => setNewDocTime(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                  Preparation Instructions (separated by semicolon)
                </label>
                <textarea
                  rows={2}
                  value={newDocPrep}
                  onChange={(e) => setNewDocPrep(e.target.value)}
                  placeholder="e.g. Fasting 8 hours; Bring blood pressure log"
                  className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E4DC]">
                <button
                  type="button"
                  onClick={() => setShowAddAptModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E4DC] text-[#546E7A] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
