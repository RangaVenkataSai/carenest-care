'use client';

import React, { useState } from 'react';
import { SeniorProfile, Medication, DoctorAppointment, MedicationDoseLog, CareJournalEntry } from '@/lib/types';
import { 
  Stethoscope, Plus, Camera, AlertCircle, Calendar, Trash2, 
  Sparkles, ShieldAlert, Pill, Clock, AlertTriangle, Send, CheckSquare, Square
} from 'lucide-react';
import { ParsedMedicationResult } from '@/lib/gemini';

interface CaretakerViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  appointments: DoctorAppointment[];
  doseLogs: MedicationDoseLog[];
  journal: CareJournalEntry[];
  onAddMedication: (med: Medication) => void;
  onUpdateMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onAddAppointment: (apt: DoctorAppointment) => void;
  onDeleteAppointment: (id: string) => void;
  onTriggerAppointmentEmail: (apt: DoctorAppointment) => void;
  onAddJournalNote?: (note: string) => void;
}

export function CaretakerView({
  senior,
  medications,
  appointments,
  doseLogs,
  journal,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onAddAppointment,
  onDeleteAppointment,
  onTriggerAppointmentEmail,
  onAddJournalNote,
}: CaretakerViewProps) {
  // Modal states
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showAddAptModal, setShowAddAptModal] = useState(false);

  // Daily Care Checklist state
  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>([
    { id: 'c1', label: 'Check and record morning blood pressure (Target: <130/80)', done: true },
    { id: 'c2', label: 'Verify weekly pill organizer restock for morning and evening', done: true },
    { id: 'c3', label: 'Inspect lower extremities for edema / ankle swelling (Amlodipine guard)', done: false },
    { id: 'c4', label: 'Ensure zero grapefruit or grapefruit juice served at dinner', done: true },
    { id: 'c5', label: 'Review upcoming cardiology preparation requirements with Sarah', done: false },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // AI Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ParsedMedicationResult | null>(null);

  // New medication form state
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedForm, setNewMedForm] = useState<'pill' | 'capsule' | 'liquid' | 'injection' | 'inhaler'>('pill');
  const [newMedColor, setNewMedColor] = useState('White');
  const [newMedShape, setNewMedShape] = useState('Round');
  const [newMedFrequency, setNewMedFrequency] = useState<'once_daily' | 'twice_daily' | 'three_times_daily' | 'as_needed'>('once_daily');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedWithFood, setNewMedWithFood] = useState<'before_meal' | 'with_meal' | 'after_meal' | 'anytime'>('with_meal');
  const [newMedPurpose, setNewMedPurpose] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedPrescriber, setNewMedPrescriber] = useState(senior.primaryDoctor.name);
  const [newMedStock, setNewMedStock] = useState('30');

  // New appointment form state
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocClinic, setNewDocClinic] = useState('');
  const [newDocDate, setNewDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDocTime, setNewDocTime] = useState('10:00');
  const [newDocPrep, setNewDocPrep] = useState('Fasting 8 hours required; bring current med list');

  const handleSimulateScan = async (sampleType: 'norvasc' | 'amoxil') => {
    setIsScanning(true);
    setScannedResult(null);

    try {
      const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const existingMedNames = medications.map((m) => m.name);

      const res = await fetch('/api/ai/scan-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: sampleBase64,
          sampleType,
          existingMedications: existingMedNames,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setScannedResult(json.data);
      }
    } catch (e) {
      console.error('Scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyScannedToForm = () => {
    if (!scannedResult) return;
    setNewMedName(scannedResult.name);
    setNewMedDosage(scannedResult.dosage);
    setNewMedForm(scannedResult.form);
    setNewMedColor(scannedResult.pillColor);
    setNewMedShape(scannedResult.pillShape);
    setNewMedFrequency(scannedResult.frequency);
    setNewMedTime(scannedResult.scheduledTimes[0] || '09:00');
    setNewMedWithFood(scannedResult.withFood);
    setNewMedPurpose(scannedResult.purpose);
    setNewMedInstructions(scannedResult.specialInstructions);
    setNewMedPrescriber(scannedResult.prescribedBy);

    setShowScannerModal(false);
    setShowAddMedModal(true);
  };

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
      frequency: newMedFrequency,
      scheduledTimes: [newMedTime],
      withFood: newMedWithFood,
      purpose: newMedPurpose || 'Prescribed health management',
      specialInstructions: newMedInstructions,
      prescribedBy: newMedPrescriber || 'Attending Physician',
      prescribedDate: new Date().toISOString().split('T')[0],
      stockCount: parseInt(newMedStock, 10) || 30,
      refillReminderThreshold: 7,
      safetyWarnings: scannedResult?.safetyWarnings || [],
      dietaryInteractions: scannedResult?.dietaryInteractions || [],
    };

    onAddMedication(med);
    setShowAddMedModal(false);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedPurpose('');
    setNewMedInstructions('');
    setScannedResult(null);
  };

  const handleSaveNewAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocClinic) return;

    const apt: DoctorAppointment = {
      id: `apt_${Date.now()}`,
      doctorName: newDocName,
      specialty: newDocSpecialty || 'General Care',
      clinicName: newDocClinic,
      location: 'Medical Center Campus',
      phone: '+1 (555) 902-1200',
      date: newDocDate,
      time: newDocTime,
      durationMinutes: 30,
      preparationInstructions: newDocPrep.split(';').map((s) => s.trim()).filter(Boolean),
      status: 'upcoming',
    };

    onAddAppointment(apt);
    setShowAddAptModal(false);
    setNewDocName('');
    setNewDocClinic('');
    setNewDocSpecialty('');
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Hero: Caregiver Clinical Hub Banner */}
      <section className="bg-gradient-to-r from-[#167C80] to-[#105C5F] text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              🩺 Caregiver & Nurse Portal • Clinical Workspace
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Clinical Regimen & Safety Hub
            </h1>
            <p className="text-teal-100 text-base sm:text-lg max-w-xl font-medium">
              Oversee {senior.name}&apos;s medication schedules, AI optical prescription scans, and doctor visits.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowScannerModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white text-[#167C80] font-extrabold text-sm shadow-xs hover:bg-[#F8F7F2] active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5 text-[#167C80]" />
              <span>AI Prescription Scanner</span>
            </button>

            <button
              onClick={() => setShowAddMedModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm shadow-xs active:scale-95 transition-all border border-white/20"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </button>

            <button
              onClick={() => setShowAddAptModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm shadow-xs active:scale-95 transition-all border border-white/20"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Patient Critical Allergies & Vitals Bar */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF3EF] text-[#D32F2F] flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-[#546E7A] tracking-wider">
                Active Allergies & Clinical Profile
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {senior.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDF3EF] text-[#D32F2F] border border-[#F2A58A]"
                  >
                    Allergy: {allergy}
                  </span>
                ))}
                {senior.chronicConditions.map((cond) => (
                  <span
                    key={cond}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F7F2] text-[#263238] border border-[#E6E4DC]"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-[#546E7A] md:text-right border-t md:border-t-0 md:border-l border-[#E6E4DC] pt-3 md:pt-0 md:pl-6">
            <div>Primary Doctor: <strong className="text-[#263238]">{senior.primaryDoctor.name}</strong></div>
            <div>Emergency Proxy: <strong className="text-[#263238]">{senior.emergencyContact.name} ({senior.emergencyContact.phone})</strong></div>
          </div>
        </div>
      </section>

      {/* 3. Daily Caregiver Clinical Checklist */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
          <h2 className="text-lg font-bold text-[#263238] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#167C80]" />
            <span>Daily Care Checklist (Nurse Elena, RN)</span>
          </h2>
          <span className="text-xs font-semibold text-[#167C80] bg-[#E8F3F3] px-3 py-1 rounded-full border border-[#B7D4C2]">
            {checklist.filter((c) => c.done).length} of {checklist.length} Tasks Complete
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                item.done
                  ? 'bg-[#F0F6F2]/70 border-[#B7D4C2] text-[#263238]'
                  : 'bg-[#F8F7F2] border-[#E6E4DC] text-[#263238] hover:border-[#167C80]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={item.done ? 'text-[#1B8354]' : 'text-[#546E7A]'}>
                  {item.done ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </span>
                <span className={item.done ? 'line-through text-[#546E7A]' : 'font-medium'}>
                  {item.label}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#546E7A]">
                {item.done ? '✓ Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Active Medication Regimen Matrix */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#263238] flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#167C80]" />
              <span>Medication Regimen Matrix ({medications.length} Active Prescriptions)</span>
            </h2>
            <p className="text-xs text-[#546E7A]">
              Oversee dosages, pill inventory, food requirements, and safety warnings.
            </p>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
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
                <button
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-1.5 text-[#546E7A] hover:text-[#D32F2F] rounded-lg hover:bg-white transition-colors"
                  title="Remove Medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                  <strong>Notes:</strong> {med.specialInstructions}
                </div>
              )}

              {/* Safety / Dietary Warnings */}
              {med.dietaryInteractions && med.dietaryInteractions.length > 0 && (
                <div className="text-xs bg-[#FDF3EF] border border-[#F2A58A] text-[#D32F2F] p-2.5 rounded-xl flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                  <div>
                    <strong>Warning:</strong> {med.dietaryInteractions.join(', ')}
                  </div>
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

      {/* 5. Doctor Appointments & Hospital Visits */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#263238] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#167C80]" />
              <span>Upcoming Doctor Appointments & Routines</span>
            </h2>
            <p className="text-xs text-[#546E7A]">
              Coordinated clinic visits with automated email preparation reminder dispatch.
            </p>
          </div>

          <button
            onClick={() => setShowAddAptModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B8354] hover:bg-[#156c45] text-white text-xs font-bold shadow-xs transition-colors"
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
                    onClick={() => onTriggerAppointmentEmail(apt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold transition-colors"
                    title="Send Email Reminder to Family & Senior"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder Email</span>
                  </button>

                  <button
                    onClick={() => onDeleteAppointment(apt.id)}
                    className="p-1.5 text-[#546E7A] hover:text-[#D32F2F] rounded-lg hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {apt.preparationInstructions.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-[#E6E4DC] text-xs space-y-1">
                  <strong className="text-[#263238]">Preparation Checklist:</strong>
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

      {/* MODAL 1: AI Prescription Scanner */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E6E4DC]">
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#E8F3F3] text-[#167C80]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#263238]">
                    AI Prescription & Pill Bottle Scanner
                  </h3>
                  <p className="text-xs text-[#546E7A]">
                    Google Gemini 2.0 Flash Vision OCR & Clinical Interaction Auditor
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowScannerModal(false)}
                className="text-[#546E7A] hover:text-[#263238] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Test Sample Triggers */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
                Choose Sample Clinical Prescription to Scan:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('norvasc')}
                  disabled={isScanning}
                  className="p-4 rounded-2xl border-2 border-[#B7D4C2] bg-[#E8F3F3]/50 hover:bg-[#E8F3F3] active:scale-95 transition-all text-left group"
                >
                  <div className="font-extrabold text-[#167C80] text-sm">
                    📄 Rx Sample: Amlodipine 5mg
                  </div>
                  <div className="text-xs text-[#546E7A] mt-1">
                    Triggers blood pressure synergy audit with Lisinopril
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan('amoxil')}
                  disabled={isScanning}
                  className="p-4 rounded-2xl border-2 border-[#E6E4DC] bg-[#F8F7F2] hover:bg-[#E6E4DC] active:scale-95 transition-all text-left group"
                >
                  <div className="font-extrabold text-[#263238] text-sm">
                    💊 Blister Pack: Amoxicillin 500mg
                  </div>
                  <div className="text-xs text-[#546E7A] mt-1">
                    Triggers Penicillin cross-allergy alert
                  </div>
                </button>
              </div>
            </div>

            {/* Scanner status */}
            {isScanning && (
              <div className="p-8 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] text-center space-y-3">
                <div className="inline-block animate-spin text-[#167C80]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="font-bold text-[#167C80] text-base">
                  Analyzing Prescription with Gemini Multimodal Vision...
                </div>
                <p className="text-xs text-[#546E7A]">
                  Extracting dosage, food contraindications, and auditing drug-drug conflicts.
                </p>
              </div>
            )}

            {/* Scanned Result Card */}
            {scannedResult && (
              <div className="bg-[#F8F7F2] border border-[#E6E4DC] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
                  <div>
                    <h4 className="font-extrabold text-lg text-[#263238]">
                      {scannedResult.name} ({scannedResult.dosage})
                    </h4>
                    <p className="text-xs text-[#546E7A]">Generic: {scannedResult.genericName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0F6F2] text-[#1B8354] border border-[#B7D4C2]">
                    ✓ OCR Match Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#263238]">
                  <div><strong>Form:</strong> {scannedResult.form} ({scannedResult.pillColor}, {scannedResult.pillShape})</div>
                  <div><strong>Frequency:</strong> {scannedResult.frequency.replace('_', ' ')}</div>
                  <div><strong>Food Instruction:</strong> {scannedResult.withFood.replace('_', ' ')}</div>
                  <div><strong>Prescriber:</strong> {scannedResult.prescribedBy}</div>
                </div>

                {/* Drug Conflict Check */}
                {scannedResult.drugInteractionsWithExisting.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl space-y-1">
                    <strong className="text-amber-900 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Potential Drug Interaction Detected:
                    </strong>
                    {scannedResult.drugInteractionsWithExisting.map((inter, idx) => (
                      <p key={idx} className="text-xs text-amber-950">
                        • <strong>With {inter.interactingDrug} ({inter.severity}):</strong> {inter.description}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApplyScannedToForm}
                  className="w-full py-3 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Load into Medication Form & Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Add Medication Manual Form */}
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

      {/* MODAL 3: Add Appointment Form */}
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
                  className="px-5 py-2 rounded-xl bg-[#1B8354] hover:bg-[#156c45] text-white text-xs font-bold shadow-xs"
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
