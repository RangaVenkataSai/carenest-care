'use client';

import React, { useState, useEffect } from 'react';
import { CareCircleState, UserRole, Medication, DoctorAppointment, CaregiverAlert } from '@/lib/types';
import { getInitialOrSavedState, saveState, resetToSeedData, getSavedRole, saveRole } from '@/lib/storage';
import { Header } from '@/components/Header';
import { SeniorView } from '@/components/SeniorView';
import { FamilyView } from '@/components/FamilyView';
import { CaretakerView } from '@/components/CaretakerView';
import { EmailPreviewModal, EmailModalData } from '@/components/EmailPreviewModal';
import { AlertsDrawer } from '@/components/AlertsDrawer';
import { EmergencySOSModal } from '@/components/EmergencySOSModal';
import { PasscodeModal } from '@/components/PasscodeModal';

export default function Home() {
  const [state, setState] = useState<CareCircleState | null>(null);
  const [role, setRole] = useState<UserRole>('elderly');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(true);

  // Modal states
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  // Initialize state from storage / seedData
  useEffect(() => {
    const saved = getInitialOrSavedState();
    const savedRole = getSavedRole();
    setState(saved);
    setRole(savedRole);
  }, []);

  // Update storage whenever state changes
  const updateAndSaveState = (newState: CareCircleState) => {
    setState(newState);
    saveState(newState);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    saveRole(newRole);
  };

  const handleToggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const handleResetData = () => {
    if (confirm('Reset Arthur Pendelton’s Care Circle demo data back to default initial state?')) {
      const reset = resetToSeedData();
      setState(reset);
    }
  };

  // Medication Dose actions
  const handleMarkDoseTaken = (logId: string) => {
    if (!state) return;
    const nowIso = new Date().toISOString();
    const targetLog = state.doseLogs.find((d) => d.id === logId);

    const updatedLogs = state.doseLogs.map((log) => {
      if (log.id === logId) {
        return {
          ...log,
          status: 'taken' as const,
          takenAt: nowIso,
          confirmedBy: role,
          confirmedByName: role === 'elderly' ? state.senior.preferredName : role === 'family' ? 'Sarah' : 'Nurse Elena',
        };
      }
      return log;
    });

    // Create an alert event in feed
    const newAlert: CaregiverAlert = {
      id: `alt_${Date.now()}`,
      type: 'missed_dose',
      severity: 'low',
      title: `Medication Confirmed: ${targetLog?.medicationName || 'Scheduled Dose'}`,
      message: `${state.senior.preferredName} successfully confirmed taking ${targetLog?.medicationName} (${targetLog?.dosage}).`,
      timestamp: nowIso,
      recipientEmail: state.senior.emergencyContact.email,
      delivered: true,
      acknowledged: true,
    };

    updateAndSaveState({
      ...state,
      doseLogs: updatedLogs,
      alerts: [newAlert, ...state.alerts],
    });
  };

  const handleSnoozeDose = (logId: string) => {
    if (!state) return;
    const updatedLogs = state.doseLogs.map((log) => {
      if (log.id === logId) {
        return {
          ...log,
          status: 'snoozed' as const,
          notes: 'Snoozed for 15 minutes by patient',
        };
      }
      return log;
    });

    updateAndSaveState({
      ...state,
      doseLogs: updatedLogs,
    });
  };

  const handleLogWellness = (mood: 'thriving' | 'good' | 'tired' | 'unwell', pain: number) => {
    if (!state) return;
    const now = new Date();
    const newLog = {
      id: `well_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      mood,
      energyLevel: mood === 'thriving' || mood === 'good' ? ('high' as const) : ('low' as const),
      painScale: pain,
      waterGlasses: 4,
      notes: `Senior self-check: Mood is ${mood}, pain scale is ${pain}/10.`,
    };

    updateAndSaveState({
      ...state,
      wellnessLogs: [newLog, ...state.wellnessLogs],
    });
  };

  // Dispatch Email Notification (Proactive System)
  const handleTriggerEmail = async (
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
  ) => {
    if (!state) return;

    const recipient = state.senior.emergencyContact.email;
    const recipientName = state.senior.emergencyContact.name;

    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          recipientName,
          type,
          subject:
            type === 'missed_dose_escalation'
              ? `[CRITICAL ALERT] Missed Dose Escalation for ${state.senior.name}`
              : type === 'upcoming_dose'
              ? `Medication Reminder: ${details.medicationName}`
              : type === 'doctor_appointment'
              ? `Medical Appointment Notice: ${details.doctorName}`
              : `🚨 EMERGENCY SOS SIGNAL - ${state.senior.name}`,
          seniorName: state.senior.name,
          details,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmailModalData({
          isOpen: true,
          type,
          recipient: data.recipient,
          subject: data.subject,
          status: data.status,
          htmlPreview: data.htmlPreview,
          timestamp: data.timestamp,
        });

        // Add to alert list
        const newAlert: CaregiverAlert = {
          id: `alt_${Date.now()}`,
          type,
          severity: type === 'emergency_sos' || type === 'missed_dose_escalation' ? 'critical' : 'medium',
          title: data.subject,
          message: details.notes || `Autonomous proactive email notification dispatched to ${recipient}.`,
          timestamp: data.timestamp,
          recipientEmail: recipient,
          delivered: true,
          acknowledged: false,
        };

        updateAndSaveState({
          ...state,
          alerts: [newAlert, ...state.alerts],
        });
      }
    } catch (err) {
      console.error('Failed to trigger email:', err);
    }
  };

  // Caretaker additions/deletions
  const handleAddMedication = (med: Medication) => {
    if (!state) return;
    const newLogs = med.scheduledTimes.map((time, idx) => ({
      id: `log_${Date.now()}_${idx}`,
      medicationId: med.id,
      medicationName: `${med.name} ${med.dosage}`,
      dosage: med.dosage,
      scheduledTime: time,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
    }));

    updateAndSaveState({
      ...state,
      medications: [med, ...state.medications],
      doseLogs: [...state.doseLogs, ...newLogs],
    });
  };

  const handleDeleteMedication = (id: string) => {
    if (!state) return;
    updateAndSaveState({
      ...state,
      medications: state.medications.filter((m) => m.id !== id),
      doseLogs: state.doseLogs.filter((d) => d.medicationId !== id),
    });
  };

  const handleAddAppointment = (apt: DoctorAppointment) => {
    if (!state) return;
    updateAndSaveState({
      ...state,
      appointments: [apt, ...state.appointments],
    });
  };

  const handleDeleteAppointment = (id: string) => {
    if (!state) return;
    updateAndSaveState({
      ...state,
      appointments: state.appointments.filter((a) => a.id !== id),
    });
  };

  const handleConfirmSOS = () => {
    setSosModalOpen(false);
    handleTriggerEmail('emergency_sos', {
      notes: 'Patient pressed One-Tap Emergency Assistance beacon.',
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-bold animate-pulse text-lg">
          Loading CareNest AI Ecosystem...
        </div>
      </div>
    );
  }

  const fontSizeClass =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className={`min-h-screen bg-slate-100/60 font-sans text-slate-900 ${fontSizeClass}`}>
      {/* Header Bar */}
      <Header
        senior={state.senior}
        currentRole={role}
        onRoleChange={handleRoleChange}
        alerts={state.alerts}
        onOpenAlerts={() => setAlertsOpen(true)}
        onResetData={handleResetData}
        fontSize={fontSize}
        onToggleFontSize={handleToggleFontSize}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {role === 'elderly' && (
          <SeniorView
            senior={state.senior}
            medications={state.medications}
            doseLogs={state.doseLogs}
            wellnessLogs={state.wellnessLogs}
            onMarkDoseTaken={handleMarkDoseTaken}
            onSnoozeDose={handleSnoozeDose}
            onLogWellness={handleLogWellness}
            onTriggerSOS={() => setSosModalOpen(true)}
          />
        )}

        {role === 'family' && (
          <FamilyView
            senior={state.senior}
            medications={state.medications}
            doseLogs={state.doseLogs}
            appointments={state.appointments}
            wellnessLogs={state.wellnessLogs}
            alerts={state.alerts}
            onTriggerEmailSimulation={handleTriggerEmail}
          />
        )}

        {role === 'caretaker' && (
          <CaretakerView
            senior={state.senior}
            medications={state.medications}
            appointments={state.appointments}
            doseLogs={state.doseLogs}
            onAddMedication={handleAddMedication}
            onUpdateMedication={() => {}}
            onDeleteMedication={handleDeleteMedication}
            onAddAppointment={handleAddAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onTriggerAppointmentEmail={(apt) =>
              handleTriggerEmail('doctor_appointment', {
                doctorName: apt.doctorName,
                clinicName: apt.clinicName,
                appointmentDate: apt.date,
                appointmentTime: apt.time,
                prepInstructions: apt.preparationInstructions,
              })
            }
          />
        )}
      </main>

      {/* Passcode Modal (Can be toggled or used on entry) */}
      <PasscodeModal
        isOpen={!isPasscodeUnlocked}
        expectedPasscode={state.senior.circleCode}
        onSuccess={(selectedRole) => {
          setIsPasscodeUnlocked(true);
          handleRoleChange(selectedRole);
        }}
      />

      {/* Notifications Drawer */}
      <AlertsDrawer
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={state.alerts}
        onAcknowledgeAlert={(alertId) => {
          const updated = state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
          updateAndSaveState({ ...state, alerts: updated });
        }}
      />

      {/* Email Dispatch Preview Modal */}
      <EmailPreviewModal
        data={emailModalData}
        onClose={() => setEmailModalData(null)}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        senior={state.senior}
        onConfirmSOS={handleConfirmSOS}
      />
    </div>
  );
}
