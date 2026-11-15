'use client';

import React, { useState } from 'react';
import { SeniorProfile, Medication, DoctorAppointment, MedicationDoseLog } from '@/lib/types';
import { 
  Stethoscope, Plus, Camera, AlertCircle, Calendar, Trash2, Edit3, 
  Sparkles, CheckCircle2, ShieldAlert, Pill, Clock, AlertTriangle, Send, FileText
} from 'lucide-react';
import { ParsedMedicationResult } from '@/lib/gemini';

interface CaretakerViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  appointments: DoctorAppointment[];
  doseLogs: MedicationDoseLog[];
  onAddMedication: (med: Medication) => void;
  onUpdateMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onAddAppointment: (apt: DoctorAppointment) => void;
  onDeleteAppointment: (id: string) => void;
  onTriggerAppointmentEmail: (apt: DoctorAppointment) => void;
}

export function CaretakerView({
  senior,
  medications,
  appointments,
  doseLogs,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onAddAppointment,
  onDeleteAppointment,
  onTriggerAppointmentEmail,
}: CaretakerViewProps) {
  // Modal states
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showAddAptModal, setShowAddAptModal] = useState(false);

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

    // Call API with sample prescription
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
    // Reset fields
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
    <div className="space-y-8 pb-12">
      {/* Hero Banner: Clinical Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white shadow-xl shadow-indigo-600/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Stethoscope className="w-4 h-4 text-indigo-200" />
              <span>Caretaker & Clinical Coordinator Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Clinical Regimen & Safety Hub
            </h1>
            <p className="text-indigo-100 text-base sm:text-lg max-w-xl font-medium">
              Oversee {senior.name}&apos;s medication schedules, AI optical prescription scans, and doctor appointments.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowScannerModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm shadow-md hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5 text-indigo-600" />
              <span>AI Prescription Scanner</span>
            </button>

            <button
              onClick={() => setShowAddMedModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-md active:scale-95 transition-all border border-indigo-400"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </button>

            <button
              onClick={() => setShowAddAptModal(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-white font-bold text-sm shadow-md active:scale-95 transition-all border border-indigo-400/30"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Critical Safety & Allergy Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Active Allergies & Conditions
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {senior.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"
                  >
                    Allergy: {allergy}
                  </span>
                ))}
                {senior.chronicConditions.map((cond) => (
                  <span
                    key={cond}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
            <div>Primary Physician: <strong>{senior.primaryDoctor.name}</strong></div>
            <div>Emergency Contact: <strong>{senior.emergencyContact.name} ({senior.emergencyContact.phone})</strong></div>
          </div>
        </div>
      </div>

      {/* Medication Regimen Management Matrix */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-indigo-600" />
              <span>Active Medication Regimen ({medications.length} Prescriptions)</span>
            </h2>
            <p className="text-sm text-slate-500">
              Manage dosages, timings, food requirements, and stock inventory.
            </p>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">{med.name}</h3>
                  <p className="text-xs text-indigo-700 font-semibold">{med.purpose}</p>
                </div>
                <button
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove Medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Dosage & Times</span>
                  <span className="font-bold text-slate-800">{med.dosage}</span>
                  <span className="text-slate-500 block">At: {med.scheduledTimes.join(', ')}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Food & Form</span>
                  <span className="font-bold text-slate-800 capitalize">{med.form}</span>
                  <span className="text-slate-500 block">{med.withFood.replace('_', ' ')}</span>
                </div>
              </div>

              {med.specialInstructions && (
                <div className="text-xs bg-amber-50/70 border border-amber-200/60 text-amber-900 p-2.5 rounded-xl">
                  <strong>Notes:</strong> {med.specialInstructions}
                </div>
              )}

              {/* Safety / Dietary Warnings */}
              {med.dietaryInteractions && med.dietaryInteractions.length > 0 && (
                <div className="text-xs bg-rose-50 border border-rose-200 text-rose-900 p-2.5 rounded-xl flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Warning:</strong> {med.dietaryInteractions.join(', ')}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Prescribed by: {med.prescribedBy}</span>
                <span className="font-bold text-slate-700">Stock: {med.stockCount} pills</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Appointments & Clinic Visits */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <span>Upcoming Medical Appointments & Routines</span>
            </h2>
            <p className="text-sm text-slate-500">
              Coordinated doctor visits with automated preparation reminder dispatch.
            </p>
          </div>

          <button
            onClick={() => setShowAddAptModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appointment</span>
          </button>
        </div>

        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{apt.doctorName}</h3>
                  <p className="text-xs font-semibold text-emerald-700">{apt.specialty} • {apt.clinicName}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    📅 {apt.date} at {apt.time}
                  </span>

                  <button
                    onClick={() => onTriggerAppointmentEmail(apt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                    title="Send Email Reminder to Family & Senior"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder Email</span>
                  </button>

                  <button
                    onClick={() => onDeleteAppointment(apt.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {apt.preparationInstructions.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <strong className="text-slate-900">Preparation Checklist:</strong>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    AI Prescription & Pill Bottle Scanner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Multimodal Optical Extraction & Drug Interaction Inspector (Gemini API)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Test Sample Triggers */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose Sample Clinical Prescription to Scan:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('norvasc')}
                  disabled={isScanning}
                  className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 active:scale-95 transition-all text-left group"
                >
                  <div className="font-extrabold text-indigo-900 text-sm group-hover:text-indigo-950">
                    📄 Rx Sample: Amlodipine 5mg
                  </div>
                  <div className="text-xs text-indigo-700 mt-1">
                    Triggers synergy interaction check with Lisinopril
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan('amoxil')}
                  disabled={isScanning}
                  className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-left group"
                >
                  <div className="font-extrabold text-slate-900 text-sm group-hover:text-slate-950">
                    💊 Blister Pack: Amoxicillin 500mg
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Antibiotic with allergy warning check
                  </div>
                </button>
              </div>
            </div>

            {/* Scanner status */}
            {isScanning && (
              <div className="p-8 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-3">
                <div className="inline-block animate-spin text-indigo-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="font-bold text-indigo-950 text-base">
                  Analyzing Prescription with Gemini Multimodal Vision...
                </div>
                <p className="text-xs text-indigo-700">
                  Extracting dosage, food contraindications, and auditing drug-drug conflicts.
                </p>
              </div>
            )}

            {/* Scanned Result Card */}
            {scannedResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900">
                      {scannedResult.name} ({scannedResult.dosage})
                    </h4>
                    <p className="text-xs text-slate-500">Generic: {scannedResult.genericName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    ✓ High Confidence Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
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
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Add New Medication to Regimen</h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewMedication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Amlodipine"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g. 5 mg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Form</label>
                  <select
                    value={newMedForm}
                    onChange={(e) => setNewMedForm(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="pill">Pill / Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="liquid">Liquid</option>
                    <option value="injection">Injection</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pill Color</label>
                  <input
                    type="text"
                    value={newMedColor}
                    onChange={(e) => setNewMedColor(e.target.value)}
                    placeholder="e.g. White"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Time</label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Food Requirement</label>
                <select
                  value={newMedWithFood}
                  onChange={(e) => setNewMedWithFood(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="with_meal">Take with meal</option>
                  <option value="after_meal">Take after meal</option>
                  <option value="before_meal">Take before meal (empty stomach)</option>
                  <option value="anytime">Anytime / With or without food</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purpose / Indication</label>
                <input
                  type="text"
                  value={newMedPurpose}
                  onChange={(e) => setNewMedPurpose(e.target.value)}
                  placeholder="e.g. Blood pressure management"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Special Instructions for Arthur</label>
                <input
                  type="text"
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  placeholder="e.g. Take with a full glass of water. Stand up slowly."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md"
                >
                  Save to Arthur&apos;s Regimen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Appointment Form */}
      {showAddAptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Schedule Doctor Appointment</h3>
              <button
                onClick={() => setShowAddAptModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Raymond Vance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialty</label>
                  <input
                    type="text"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={newDocClinic}
                    onChange={(e) => setNewDocClinic(e.target.value)}
                    placeholder="e.g. St. Jude Hospital"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDocDate}
                    onChange={(e) => setNewDocDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={newDocTime}
                    onChange={(e) => setNewDocTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Preparation Instructions (separated by semicolon)
                </label>
                <textarea
                  rows={2}
                  value={newDocPrep}
                  onChange={(e) => setNewDocPrep(e.target.value)}
                  placeholder="e.g. Fasting 8 hours; Bring blood pressure log"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddAptModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md"
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
