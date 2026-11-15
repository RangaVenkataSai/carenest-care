'use client';

import React, { useState, useEffect } from 'react';
import { 
  CareCircleState, UserRole, Medication, DoctorAppointment, 
  CaregiverAlert, CareJournalEntry, ToastMessage, SeniorProfile 
} from '@/lib/types';
import { getInitialOrSavedState, saveState, resetToSeedData, getSavedRole, saveRole, getSavedVoiceLang, saveVoiceLang } from '@/lib/storage';
import { VoiceLanguage } from '@/lib/voiceAssistant';
import { Header } from '@/components/Header';
import { SeniorView } from '@/components/SeniorView';
import { FamilyView } from '@/components/FamilyView';
import { CaretakerView } from '@/components/CaretakerView';
import { LandingPage } from '@/components/LandingPage';
import { EmailPreviewModal, EmailModalData } from '@/components/EmailPreviewModal';
import { AlertsDrawer } from '@/components/AlertsDrawer';
import { EmergencySOSModal } from '@/components/EmergencySOSModal';
import { PasscodeModal } from '@/components/PasscodeModal';
import { HealthcareProfileModal } from '@/components/HealthcareProfileModal';
import { Toast } from '@/components/Toast';
import { ProactiveEmailEngineModal } from '@/components/ProactiveEmailEngineModal';

export default function Home() {
  const [state, setState] = useState<CareCircleState | null>(null);
  const [role, setRole] = useState<UserRole>('elderly');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('en');
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [emailEngineOpen, setEmailEngineOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  // Initialize state from storage / seedData
  useEffect(() => {
    const saved = getInitialOrSavedState();
    const savedRole = getSavedRole();
    const savedLang = getSavedVoiceLang();
    setState(saved);
    setRole(savedRole);
    setVoiceLang(savedLang);
  }, []);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Update storage whenever state changes
  const updateAndSaveState = (newState: CareCircleState) => {
    setState(newState);
    saveState(newState);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    saveRole(newRole);
    addToast(`Switched to ${newRole.toUpperCase()} experience`, 'info');
  };

  const handleToggleFontSize = () => {
    if (fontSize === 'normal') {
      setFontSize('large');
      addToast('Font size: Large (Senior Accessibility)', 'info');
    } else if (fontSize === 'large') {
      setFontSize('xlarge');
      addToast('Font size: Extra Large', 'info');
    } else {
      setFontSize('normal');
      addToast('Font size: Standard', 'info');
    }
  };

  const handleToggleHighContrast = () => {
    setHighContrast(!highContrast);
    addToast(`High Contrast Mode: ${!highContrast ? 'ON' : 'OFF'}`, 'info');
  };

  const handleVoiceLangChange = (newLang: VoiceLanguage) => {
    setVoiceLang(newLang);
    saveVoiceLang(newLang);
    const label = newLang === 'hi' ? 'हिन्दी (Hindi)' : newLang === 'te' ? 'తెలుగు (Telugu)' : 'English';
    addToast(`Voice Assistant: ${label}`, 'info');
  };

  const handleResetData = () => {
    if (confirm('Reset Arthur Pendelton’s Care Circle demo data back to default initial state?')) {
      const reset = resetToSeedData();
      setState(reset);
      addToast('Demo data reset to initial state', 'success');
    }
  };

  const handleSaveProfile = (updated: SeniorProfile) => {
    if (!state) return;
    const nowIso = new Date().toISOString();
    const updatedState: CareCircleState = {
      ...state,
      senior: updated,
      journal: [
        {
          id: `j_${Date.now()}`,
          timestamp: nowIso,
          authorName: role === 'elderly' ? state.senior.preferredName : role === 'family' ? 'Sarah Pendelton' : 'Nurse Elena, RN',
          authorRole: role === 'elderly' ? 'senior' : role === 'family' ? 'family' : 'caregiver',
          category: 'note',
          title: 'Healthcare Profile Updated',
          description: `Updated conditions (${updated.chronicConditions.join(', ') || 'None'}), allergies (${updated.allergies.join(', ') || 'None'}), and emergency contacts for ${updated.name}.`,
        },
        ...(state.journal || []),
      ],
    };
    updateAndSaveState(updatedState);
    setProfileModalOpen(false);
    addToast('Healthcare profile updated successfully', 'success');
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

    // Feed alert
    const newAlert: CaregiverAlert = {
      id: `alt_${Date.now()}`,
      type: 'missed_dose',
      severity: 'low',
      title: `Medication Confirmed: ${targetLog?.medicationName || 'Scheduled Dose'}`,
      message: `${state.senior.preferredName} confirmed taking ${targetLog?.medicationName} (${targetLog?.dosage}).`,
      timestamp: nowIso,
      recipientEmail: state.senior.emergencyContact.email,
      delivered: true,
      acknowledged: true,
    };

    // Journal Entry
    const newJournal: CareJournalEntry = {
      id: `jnl_${Date.now()}`,
      timestamp: nowIso,
      authorName: role === 'elderly' ? state.senior.preferredName : 'Caregiver',
      authorRole: role === 'elderly' ? 'senior' : 'caregiver',
      category: 'medication',
      title: `${targetLog?.medicationName || 'Medication'} Taken`,
      description: `Confirmed taking scheduled dose (${targetLog?.dosage}) at ${new Date(nowIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    };

    updateAndSaveState({
      ...state,
      doseLogs: updatedLogs,
      alerts: [newAlert, ...state.alerts],
      journal: [newJournal, ...(state.journal || [])],
    });

    addToast(`Confirmed: ${targetLog?.medicationName} taken!`, 'success');
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
    addToast('Medication snoozed for 15 minutes', 'warning');
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

    const newJournal: CareJournalEntry = {
      id: `jnl_${Date.now()}`,
      timestamp: now.toISOString(),
      authorName: state.senior.preferredName,
      authorRole: 'senior',
      category: 'wellness',
      title: 'Daily Wellness Check-in',
      description: `Arthur reported feeling ${mood} with pain scale ${pain}/10.`,
    };

    updateAndSaveState({
      ...state,
      wellnessLogs: [newLog, ...state.wellnessLogs],
      journal: [newJournal, ...(state.journal || [])],
    });

    addToast('Wellness status logged to family feed!', 'success');
  };

  const handleAddJournalNote = (note: string) => {
    if (!state) return;
    const authorName = role === 'elderly' ? state.senior.preferredName : role === 'family' ? 'Sarah' : 'Nurse Elena';
    const newJournal: CareJournalEntry = {
      id: `jnl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName,
      authorRole: role === 'elderly' ? 'senior' : role === 'family' ? 'family' : 'caregiver',
      category: 'note',
      title: 'Care Circle Note',
      description: note,
    };

    updateAndSaveState({
      ...state,
      journal: [newJournal, ...(state.journal || [])],
    });

    addToast('Note saved to Care Journal', 'success');
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
    },
    customRecipient?: string
  ) => {
    if (!state) return;

    const recipient = customRecipient || state.senior.emergencyContact.email;
    const recipientName = customRecipient ? 'Authorized Care Member' : state.senior.emergencyContact.name;

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

        // Add alert
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

        addToast(`Proactive email dispatched to ${recipient}`, 'success');
      }
    } catch (err) {
      console.error('Failed to trigger email:', err);
      addToast('Failed to dispatch notification', 'warning');
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

    addToast(`Added ${med.name} (${med.dosage}) to regimen`, 'success');
  };

  const handleDeleteMedication = (id: string) => {
    if (!state) return;
    updateAndSaveState({
      ...state,
      medications: state.medications.filter((m) => m.id !== id),
      doseLogs: state.doseLogs.filter((d) => d.medicationId !== id),
    });
    addToast('Medication removed from regimen', 'info');
  };

  const handleUpdateMedication = (updated: Medication) => {
    if (!state) return;
    const updatedMeds = state.medications.map((m) => (m.id === updated.id ? updated : m));
    
    // Patient Centered Consent Notice
    const newNotice = {
      id: `upd_${Date.now()}`,
      title: `Schedule Update: ${updated.name}`,
      description: `Dosage is now ${updated.dosage}, scheduled at ${updated.scheduledTimes.join(', ')} (${updated.withFood.replace('_', ' ')}).`,
      updatedBy: role === 'caretaker' ? 'Nurse Elena Vance, RN' : 'Sarah (Daughter)',
      timestamp: new Date().toISOString(),
      status: 'pending_review' as const,
    };

    updateAndSaveState({
      ...state,
      medications: updatedMeds,
      careUpdates: [newNotice, ...(state.careUpdates || [])],
    });
    addToast(`Updated schedule for ${updated.name}`, 'success');
  };

  const handleAcknowledgeCareUpdate = (updateId: string) => {
    if (!state) return;
    const updated = (state.careUpdates || []).map((u) =>
      u.id === updateId ? { ...u, status: 'acknowledged' as const } : u
    );
    updateAndSaveState({
      ...state,
      careUpdates: updated,
    });
    addToast('Schedule update approved by patient', 'success');
  };

  const handleAddAppointment = (apt: DoctorAppointment) => {
    if (!state) return;
    updateAndSaveState({
      ...state,
      appointments: [apt, ...state.appointments],
    });
    addToast(`Scheduled visit with ${apt.doctorName}`, 'success');
  };

  const handleUpdateAppointment = (updated: DoctorAppointment) => {
    if (!state) return;
    const updatedApts = state.appointments.map((a) => (a.id === updated.id ? updated : a));
    updateAndSaveState({
      ...state,
      appointments: updatedApts,
    });
    addToast(`Updated appointment with ${updated.doctorName}`, 'success');
  };

  const handleDeleteAppointment = (id: string) => {
    if (!state) return;
    updateAndSaveState({
      ...state,
      appointments: state.appointments.filter((a) => a.id !== id),
    });
    addToast('Appointment removed', 'info');
  };

  const handleConfirmSOS = () => {
    setSosModalOpen(false);
    handleTriggerEmail('emergency_sos', {
      notes: 'Patient activated One-Tap Emergency Assistance beacon.',
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="text-[#167C80] font-bold animate-pulse text-lg">
          Loading CareNest Healthcare Ecosystem...
        </div>
      </div>
    );
  }

  // Render Landing Page if active
  if (showLandingPage) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setPasscodeModalOpen(true)}
          onExploreDemo={() => {
            setShowLandingPage(false);
            setIsPasscodeUnlocked(true);
          }}
        />
        <PasscodeModal
          isOpen={passcodeModalOpen}
          expectedPasscode={state.senior.circleCode}
          onSuccess={(selectedRole) => {
            setPasscodeModalOpen(false);
            setShowLandingPage(false);
            setIsPasscodeUnlocked(true);
            handleRoleChange(selectedRole);
          }}
          onClose={() => setPasscodeModalOpen(false)}
        />
      </>
    );
  }

  const fontSizeClass =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div
      className={`min-h-screen bg-[#F8F7F2] font-sans text-[#263238] transition-colors ${fontSizeClass} ${
        highContrast ? 'high-contrast' : ''
      }`}
    >
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
        highContrast={highContrast}
        onToggleHighContrast={handleToggleHighContrast}
        voiceLang={voiceLang}
        onVoiceLangChange={handleVoiceLangChange}
        onViewLandingPage={() => setShowLandingPage(true)}
        onOpenEmailHub={() => setEmailEngineOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenPasscodeModal={() => setPasscodeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {role === 'elderly' && (
          <SeniorView
            senior={state.senior}
            medications={state.medications}
            doseLogs={state.doseLogs}
            appointments={state.appointments}
            wellnessLogs={state.wellnessLogs}
            careUpdates={state.careUpdates || []}
            voiceLang={voiceLang}
            onVoiceLangChange={handleVoiceLangChange}
            onMarkDoseTaken={handleMarkDoseTaken}
            onSnoozeDose={handleSnoozeDose}
            onLogWellness={handleLogWellness}
            onTriggerSOS={() => setSosModalOpen(true)}
            onAcknowledgeCareUpdate={handleAcknowledgeCareUpdate}
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
            members={state.members || []}
            journal={state.journal || []}
            aiInsights={state.aiInsights || []}
            onTriggerEmailSimulation={handleTriggerEmail}
            onAddJournalNote={handleAddJournalNote}
            onTakeInsightAction={(insight) => {
              addToast(`AI Insight action logged: ${insight.actionLabel}`, 'info');
              handleAddJournalNote(`CareNest Intelligence: [${insight.title}] -> Handled action: ${insight.actionLabel}`);
            }}
            onAddMedication={handleAddMedication}
            onUpdateMedication={handleUpdateMedication}
            onDeleteMedication={handleDeleteMedication}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {role === 'caretaker' && (
          <CaretakerView
            senior={state.senior}
            medications={state.medications}
            appointments={state.appointments}
            doseLogs={state.doseLogs}
            journal={state.journal || []}
            onAddMedication={handleAddMedication}
            onUpdateMedication={handleUpdateMedication}
            onDeleteMedication={handleDeleteMedication}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
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
            onAddJournalNote={handleAddJournalNote}
          />
        )}
      </main>

      {/* Passcode Modal (Can be triggered whenever needed) */}
      <PasscodeModal
        isOpen={!isPasscodeUnlocked || passcodeModalOpen}
        expectedPasscode={state.senior.circleCode}
        onSuccess={(selectedRole) => {
          setIsPasscodeUnlocked(true);
          setPasscodeModalOpen(false);
          handleRoleChange(selectedRole);
        }}
        onClose={isPasscodeUnlocked ? () => setPasscodeModalOpen(false) : undefined}
      />

      {/* Healthcare Profile Management Modal */}
      {state && (
        <HealthcareProfileModal
          senior={state.senior}
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Notifications Drawer */}
      <AlertsDrawer
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={state.alerts}
        onAcknowledgeAlert={(alertId) => {
          const updated = state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
          updateAndSaveState({ ...state, alerts: updated });
          addToast('Notification acknowledged', 'info');
        }}
      />

      {/* Email Dispatch Preview Modal */}
      <EmailPreviewModal
        data={emailModalData}
        onClose={() => setEmailModalData(null)}
      />

      {/* Proactive Email Engine Hub Modal */}
      <ProactiveEmailEngineModal
        isOpen={emailEngineOpen}
        onClose={() => setEmailEngineOpen(false)}
        defaultRecipient={state.senior.emergencyContact.email}
        seniorName={state.senior.name}
        onTriggerEmail={(type, customRecipient, details) =>
          handleTriggerEmail(type, details, customRecipient)
        }
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        senior={state.senior}
        onConfirmSOS={handleConfirmSOS}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
