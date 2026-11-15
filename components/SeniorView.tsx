'use client';

import React, { useState } from 'react';
import { SeniorProfile, Medication, MedicationDoseLog, DoctorAppointment, DailyWellnessLog } from '@/lib/types';
import { 
  CheckCircle2, Clock, Volume2, Heart, ShieldAlert, Sparkles, 
  Coffee, Pill, PhoneCall, Smile, Meh, Frown, Calendar, Info, 
  MessageSquare, ChevronRight, HelpCircle, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeniorViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
  appointments: DoctorAppointment[];
  wellnessLogs: DailyWellnessLog[];
  onMarkDoseTaken: (logId: string) => void;
  onSnoozeDose: (logId: string) => void;
  onLogWellness: (mood: 'thriving' | 'good' | 'tired' | 'unwell', pain: number) => void;
  onTriggerSOS: () => void;
}

export function SeniorView({
  senior,
  medications,
  doseLogs,
  appointments,
  wellnessLogs,
  onMarkDoseTaken,
  onSnoozeDose,
  onLogWellness,
  onTriggerSOS,
}: SeniorViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wellnessSuccess, setWellnessSuccess] = useState(false);
  const [inspectMedication, setInspectMedication] = useState<Medication | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Time-aware greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Group doses
  const pendingDoses = doseLogs.filter((d) => d.status === 'pending');
  const takenDoses = doseLogs.filter((d) => d.status === 'taken');
  const snoozedDoses = doseLogs.filter((d) => d.status === 'snoozed');

  const totalDoses = doseLogs.length;
  const takenCount = takenDoses.length;
  const progressPercent = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;

  // Next upcoming dose
  const nextDose = pendingDoses[0] || snoozedDoses[0];
  const matchingMedication = nextDose
    ? medications.find((m) => m.id === nextDose.medicationId)
    : null;

  // Next upcoming appointment
  const nextAppointment = appointments.find((a) => a.status === 'upcoming');

  // Web Speech synthesis voice reader
  const handleReadScheduleAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Voice assistant is not supported by your browser.');
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = `${timeGreeting}, ${senior.preferredName}. Let's make today a healthy day. `;
    if (pendingDoses.length === 0) {
      textToSpeak += `You have taken all your scheduled medicines for today. You are doing wonderful!`;
    } else {
      textToSpeak += `You have ${pendingDoses.length} dose ${pendingDoses.length === 1 ? 'due' : 'due today'}. `;
      if (nextDose) {
        textToSpeak += `Your next medicine is ${nextDose.medicationName}, scheduled for ${nextDose.scheduledTime}. `;
        if (matchingMedication?.specialInstructions) {
          textToSpeak += `Note: ${matchingMedication.specialInstructions}`;
        }
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.88; // Comfortable pace for seniors
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleTakeMedication = (logId: string, medName: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    // Audio chime synthesis
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio not permitted
    }

    // Vocal encouragement
    if ('speechSynthesis' in window) {
      const confirmSpeech = new SpeechSynthesisUtterance(`Wonderful job, ${senior.preferredName}! ${medName} marked as taken.`);
      confirmSpeech.rate = 0.95;
      window.speechSynthesis.speak(confirmSpeech);
    }

    onMarkDoseTaken(logId);
  };

  const handleAskCareNestAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    // Simple plain-English health routine answers tailored for Arthur
    const q = aiQuestion.toLowerCase();
    if (q.includes('grapefruit') || q.includes('fruit') || q.includes('food')) {
      setAiAnswer('Atorvastatin (your cholesterol medicine taken at 8:00 PM) interacts with grapefruit. Please do not drink grapefruit juice or eat fresh grapefruit with meals.');
    } else if (q.includes('metformin') || q.includes('sugar') || q.includes('diabetes')) {
      setAiAnswer('Metformin is for blood sugar. Always take it with your breakfast and dinner to avoid stomach upset.');
    } else if (q.includes('doctor') || q.includes('appointment')) {
      setAiAnswer(`Your next doctor visit is with ${nextAppointment?.doctorName || 'Dr. Vance'} on ${nextAppointment?.date || 'Thursday'} at ${nextAppointment?.time || '10:30 AM'}.`);
    } else {
      setAiAnswer(`Hello Arthur! All your medicines are organized on schedule. You have taken ${takenCount} of ${totalDoses} doses today. If you feel unwell, press the Call Caregiver button.`);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 1. Personalized Welcome Banner */}
      <section className="bg-gradient-to-r from-[#167C80] to-[#126366] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              👴 Senior Independence Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {timeGreeting}, {senior.preferredName}.
            </h1>
            <p className="text-teal-100 text-lg font-medium">
              Let&apos;s make today a healthy day.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Read Aloud Button */}
            <button
              onClick={handleReadScheduleAloud}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-base shadow-sm transition-all ${
                isSpeaking
                  ? 'bg-white text-[#167C80] ring-4 ring-teal-200 animate-pulse'
                  : 'bg-white text-[#263238] hover:bg-[#F8F7F2] active:scale-95'
              }`}
            >
              <Volume2 className="w-5 h-5 text-[#167C80]" />
              <span>{isSpeaking ? 'Reading Aloud...' : 'Read My Schedule'}</span>
            </button>

            {/* Quick Emergency SOS */}
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-base bg-[#D32F2F] hover:bg-red-700 text-white shadow-sm active:scale-95 border-2 border-red-400"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Today's Health Overview */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DC] pb-4">
          <h2 className="text-xl font-bold text-[#263238] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#167C80]" />
            <span>Today&apos;s Health Overview</span>
          </h2>
          <span className="text-xs font-bold text-[#167C80] bg-[#E8F3F3] px-3 py-1 rounded-full border border-[#B7D4C2]">
            {takenCount} of {totalDoses} Medicines Taken ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-[#F8F7F2] rounded-full h-3.5 border border-[#E6E4DC] overflow-hidden">
            <div
              className="bg-[#167C80] h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Overview Grid: Next Med, Upcoming Visit, Daily Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1: Next Medication */}
          <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#546E7A]">
              Next Medication
            </span>
            {nextDose ? (
              <div>
                <h4 className="font-extrabold text-base text-[#263238]">
                  {nextDose.medicationName}
                </h4>
                <p className="text-xs text-[#167C80] font-semibold">
                  Due at {nextDose.scheduledTime} • {nextDose.dosage}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#1B8354] font-bold">
                ✓ All medications completed for today!
              </p>
            )}
          </div>

          {/* Item 2: Upcoming Appointment */}
          <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#546E7A]">
              Next Doctor Visit
            </span>
            {nextAppointment ? (
              <div>
                <h4 className="font-extrabold text-base text-[#263238]">
                  {nextAppointment.doctorName}
                </h4>
                <p className="text-xs text-[#546E7A]">
                  📅 {new Date(nextAppointment.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {nextAppointment.time}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#546E7A]">No upcoming visits this week</p>
            )}
          </div>

          {/* Item 3: Daily Health Checklist */}
          <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#546E7A]">
              Daily Routine Checklist
            </span>
            <div className="space-y-1 text-xs text-[#263238]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B8354]" />
                <span>Morning blood pressure recorded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B8354]" />
                <span>4 glasses of water drank</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#167C80]" />
                <span>20-min afternoon garden walk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Primary Next Medication Focus Card */}
      {nextDose && (
        <section className="bg-white rounded-3xl border-2 border-[#167C80] shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#167C80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#167C80]"></span>
              </span>
              <span className="text-sm font-extrabold tracking-wider text-[#167C80] uppercase">
                Ready to Take • Target Time: {nextDose.scheduledTime}
              </span>
            </div>

            <button
              onClick={() => matchingMedication && setInspectMedication(matchingMedication)}
              className="text-xs font-bold text-[#167C80] hover:underline flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              <span>View Instructions</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black text-[#263238] tracking-tight">
                  {nextDose.medicationName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg text-sm font-bold bg-[#E8F3F3] text-[#167C80]">
                    Dosage: {nextDose.dosage}
                  </span>
                  {matchingMedication?.pillColor && (
                    <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-[#F8F7F2] border border-[#E6E4DC] text-[#546E7A]">
                      Color: {matchingMedication.pillColor} ({matchingMedication.pillShape})
                    </span>
                  )}
                  {matchingMedication?.withFood && (
                    <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-[#F0F6F2] text-[#1B8354]">
                      {matchingMedication.withFood.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right sm:border-l border-[#E6E4DC] sm:pl-6">
                <span className="text-xs font-bold uppercase text-[#546E7A] tracking-wider">Scheduled For</span>
                <div className="text-3xl font-black text-[#263238]">{nextDose.scheduledTime}</div>
              </div>
            </div>

            {matchingMedication?.specialInstructions && (
              <div className="p-4 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] text-sm text-[#263238]">
                💡 <strong>Reminder:</strong> {matchingMedication.specialInstructions}
              </div>
            )}

            {/* Giant One-Tap Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleTakeMedication(nextDose.id, nextDose.medicationName)}
                className="py-5 px-6 rounded-2xl bg-[#1B8354] hover:bg-[#156c45] active:scale-[0.98] text-white font-black text-xl shadow-sm transition-all flex items-center justify-center gap-3 border-2 border-[#1B8354]"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>I TOOK THIS MEDICINE</span>
              </button>

              <button
                onClick={() => onSnoozeDose(nextDose.id)}
                className="py-5 px-6 rounded-2xl bg-[#F8F7F2] hover:bg-[#E6E4DC] active:scale-[0.98] text-[#263238] font-bold text-lg border-2 border-[#E6E4DC] transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-6 h-6 text-[#546E7A]" />
                <span>Remind Me in 15 Min</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Today's Full Medication List Overview */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-[#263238] flex items-center gap-2">
          <Pill className="w-5 h-5 text-[#167C80]" />
          <span>All Today&apos;s Medications</span>
        </h3>

        <div className="space-y-3">
          {doseLogs.map((log) => {
            const isTaken = log.status === 'taken';
            const med = medications.find((m) => m.id === log.medicationId);

            return (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isTaken
                    ? 'bg-[#F0F6F2]/70 border-[#B7D4C2] text-[#263238]'
                    : 'bg-white border-[#E6E4DC] hover:border-[#167C80]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isTaken ? 'bg-[#1B8354] text-white' : 'bg-[#E8F3F3] text-[#167C80]'
                    }`}
                  >
                    {isTaken ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-[#263238]">{log.medicationName}</h4>
                    <p className="text-xs text-[#546E7A]">
                      Scheduled: <strong>{log.scheduledTime}</strong> • {log.dosage}
                      {med?.withFood && ` • ${med.withFood.replace('_', ' ')}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isTaken ? (
                    <span className="text-xs font-bold text-[#1B8354] bg-white px-3 py-1.5 rounded-full border border-[#B7D4C2]">
                      ✓ Taken at {new Date(log.takenAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTakeMedication(log.id, log.medicationName)}
                      className="px-4 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold transition-colors"
                    >
                      Mark Taken
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Upcoming Appointment Card with Preparation Notes */}
      {nextAppointment && (
        <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
            <h3 className="text-xl font-bold text-[#263238] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#167C80]" />
              <span>Upcoming Doctor Appointment</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3F3] text-[#167C80]">
              📅 {nextAppointment.date} at {nextAppointment.time}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] space-y-1">
              <h4 className="font-bold text-base text-[#263238]">{nextAppointment.doctorName}</h4>
              <p className="text-xs font-semibold text-[#167C80]">{nextAppointment.specialty}</p>
              <p className="text-xs text-[#546E7A]">{nextAppointment.clinicName}</p>
              <p className="text-xs text-[#546E7A]">{nextAppointment.location}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] space-y-2 text-xs">
              <strong className="text-[#167C80] block text-sm">Preparation Instructions:</strong>
              <ul className="list-disc list-inside space-y-1 text-[#263238]">
                {nextAppointment.preparationInstructions.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
              {nextAppointment.accompaniedBy && (
                <p className="text-xs font-semibold text-[#167C80] pt-1">
                  🚗 Accompanying: {nextAppointment.accompaniedBy}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. Quick Assistance & Ask CareNest AI */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
        <h3 className="text-xl font-bold text-[#263238] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#167C80]" />
          <span>Quick Assistance & Family Updates</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Quick Action 1: Call Caregiver */}
          <a
            href="tel:+15554329011"
            className="p-5 rounded-2xl bg-[#F8F7F2] hover:bg-[#E8F3F3] border border-[#E6E4DC] hover:border-[#167C80] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="p-2.5 rounded-xl bg-white border border-[#E6E4DC] text-[#167C80] inline-block mb-2">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#263238]">Call Caregiver</h4>
              <p className="text-xs text-[#546E7A]">Direct line to Nurse Elena Vance, RN</p>
            </div>
            <span className="text-xs font-bold text-[#167C80] pt-3 group-hover:underline">
              Tap to Call →
            </span>
          </a>

          {/* Quick Action 2: Call Daughter */}
          <a
            href={`tel:${senior.emergencyContact.phone}`}
            className="p-5 rounded-2xl bg-[#F8F7F2] hover:bg-[#FDF3EF] border border-[#E6E4DC] hover:border-[#F2A58A] transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="p-2.5 rounded-xl bg-white border border-[#E6E4DC] text-[#D32F2F] inline-block mb-2">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#263238]">Call Sarah (Daughter)</h4>
              <p className="text-xs text-[#546E7A]">{senior.emergencyContact.phone}</p>
            </div>
            <span className="text-xs font-bold text-[#D32F2F] pt-3 group-hover:underline">
              Tap to Call →
            </span>
          </a>

          {/* Quick Action 3: Ask CareNest AI */}
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="p-5 rounded-2xl bg-[#F8F7F2] hover:bg-[#E8F3F3] border border-[#E6E4DC] hover:border-[#167C80] transition-all flex flex-col justify-between text-left group"
          >
            <div className="space-y-1">
              <div className="p-2.5 rounded-xl bg-white border border-[#E6E4DC] text-[#167C80] inline-block mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#263238]">Ask CareNest AI</h4>
              <p className="text-xs text-[#546E7A]">Friendly spoken answers about your routine</p>
            </div>
            <span className="text-xs font-bold text-[#167C80] pt-3 group-hover:underline">
              {showAIChat ? 'Hide Assistant ↑' : 'Open Assistant →'}
            </span>
          </button>
        </div>

        {/* Inline AI Assistant Dialog */}
        {showAIChat && (
          <div className="p-5 rounded-2xl bg-[#E8F3F3]/50 border border-[#B7D4C2] space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#167C80] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Ask CareNest AI (Voice or Text)
              </span>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-xs font-bold text-[#546E7A] hover:text-[#263238]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAskCareNestAI} className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="e.g., Can I eat grapefruit with my dinner pill? or When is my doctor visit?"
                className="flex-1 p-3 rounded-xl border border-[#E6E4DC] bg-white text-xs focus:ring-2 focus:ring-[#167C80] focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Ask AI
              </button>
            </form>

            {aiAnswer && (
              <div className="p-4 rounded-xl bg-white border border-[#B7D4C2] text-xs space-y-2">
                <p className="text-[#263238] font-medium leading-relaxed">{aiAnswer}</p>
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      const u = new SpeechSynthesisUtterance(aiAnswer);
                      u.rate = 0.9;
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="text-[11px] font-bold text-[#167C80] flex items-center gap-1 hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen Aloud
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Medication Instruction Modal */}
      {inspectMedication && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E6E4DC]">
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#263238]">{inspectMedication.name}</h3>
                <p className="text-xs text-[#546E7A]">Dosage: {inspectMedication.dosage}</p>
              </div>
              <button
                onClick={() => setInspectMedication(null)}
                className="text-[#546E7A] hover:text-[#263238] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#263238]">
              <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC]">
                <strong>Purpose:</strong> {inspectMedication.purpose}
              </div>
              <div className="p-3 rounded-xl bg-[#E8F3F3] border border-[#B7D4C2]">
                <strong>Special Instructions:</strong> {inspectMedication.specialInstructions}
              </div>
              {inspectMedication.dietaryInteractions && inspectMedication.dietaryInteractions.length > 0 && (
                <div className="p-3 rounded-xl bg-[#FDF3EF] border border-[#F2A58A] text-[#D32F2F]">
                  <strong>Dietary Rules:</strong> {inspectMedication.dietaryInteractions.join(', ')}
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectMedication(null)}
              className="w-full py-3 rounded-xl bg-[#167C80] text-white font-bold text-xs shadow-xs"
            >
              Close Instructions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
