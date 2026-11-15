'use client';

import React, { useState } from 'react';
import { SeniorProfile, Medication, MedicationDoseLog, DailyWellnessLog } from '@/lib/types';
import { 
  CheckCircle2, Clock, Volume2, AlertCircle, Heart, ShieldAlert, 
  Sparkles, Coffee, Sun, Moon, Pill, PhoneCall, Smile, Meh, Frown, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeniorViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
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
  wellnessLogs,
  onMarkDoseTaken,
  onSnoozeDose,
  onLogWellness,
  onTriggerSOS,
}: SeniorViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wellnessSuccess, setWellnessSuccess] = useState(false);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Group doses by status
  const pendingDoses = doseLogs.filter((d) => d.status === 'pending');
  const takenDoses = doseLogs.filter((d) => d.status === 'taken');
  const snoozedDoses = doseLogs.filter((d) => d.status === 'snoozed');

  // Next upcoming dose
  const nextDose = pendingDoses[0] || snoozedDoses[0];
  const matchingMedication = nextDose 
    ? medications.find((m) => m.id === nextDose.medicationId) 
    : null;

  // Web Speech synthesis voice reader for accessibility
  const handleReadScheduleAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = `Hello ${senior.preferredName}. ${greeting}. `;
    if (pendingDoses.length === 0) {
      textToSpeak += `You have taken all your scheduled medications for today! You are doing fantastic.`;
    } else {
      textToSpeak += `You have ${pendingDoses.length} medication ${pendingDoses.length === 1 ? 'dose' : 'doses'} scheduled. `;
      if (nextDose) {
        textToSpeak += `Your next medicine is ${nextDose.medicationName}, scheduled for ${nextDose.scheduledTime}. `;
        if (matchingMedication?.specialInstructions) {
          textToSpeak += `Reminder: ${matchingMedication.specialInstructions}`;
        }
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Slower rate for clear senior comprehension
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleTakeMedication = (logId: string, medName: string) => {
    // Joyful celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    // Play pleasant confirmation audio chime using Web Audio API
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
      // Audio not permitted or supported
    }

    // Vocal positive reinforcement
    if ('speechSynthesis' in window) {
      const confirmSpeech = new SpeechSynthesisUtterance(`Thank you ${senior.preferredName}. ${medName} marked as taken.`);
      confirmSpeech.rate = 0.95;
      window.speechSynthesis.speak(confirmSpeech);
    }

    onMarkDoseTaken(logId);
  };

  const handleWellnessSubmit = (mood: 'thriving' | 'good' | 'tired' | 'unwell', pain: number) => {
    onLogWellness(mood, pain);
    setWellnessSuccess(true);
    setTimeout(() => setWellnessSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner with Audio Reader */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sun className="w-4 h-4 text-amber-200" />
              <span>Senior Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {greeting}, {senior.preferredName}!
            </h1>
            <p className="text-amber-100 text-base sm:text-lg max-w-xl font-medium">
              We are keeping track of your health today. Everything is on schedule.
            </p>
          </div>

          {/* Large Voice Assistant Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReadScheduleAloud}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
                isSpeaking
                  ? 'bg-white text-orange-600 ring-4 ring-orange-300 animate-pulse'
                  : 'bg-white text-slate-800 hover:bg-amber-50 active:scale-95'
              }`}
            >
              <Volume2 className={`w-6 h-6 ${isSpeaking ? 'text-orange-600' : 'text-amber-600'}`} />
              <span>{isSpeaking ? 'Reading Aloud...' : 'Read My Schedule'}</span>
            </button>

            {/* Quick Emergency Button */}
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl font-bold text-base bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-700/40 active:scale-95 border-2 border-red-400"
            >
              <ShieldAlert className="w-6 h-6" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Main Action Zone: Primary Next Dose Focus Card */}
      {nextDose ? (
        <section className="bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
              <span className="text-sm font-bold tracking-wider text-amber-900 uppercase">
                Scheduled Next • Due at {nextDose.scheduledTime}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
              Needs Confirmation
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {nextDose.medicationName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-800">
                    <Pill className="w-4 h-4" />
                    <span>Dosage: {nextDose.dosage}</span>
                  </span>
                  {matchingMedication?.pillColor && (
                    <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700">
                      Color: {matchingMedication.pillColor} ({matchingMedication.pillShape})
                    </span>
                  )}
                  {matchingMedication?.withFood && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-800">
                      <Coffee className="w-4 h-4" />
                      <span>{matchingMedication.withFood.replace('_', ' ').toUpperCase()}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Target Time</span>
                <div className="text-3xl font-black text-slate-800">{nextDose.scheduledTime}</div>
              </div>
            </div>

            {matchingMedication?.specialInstructions && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <p className="text-base text-amber-950 font-medium">
                  💡 <strong>Instruction:</strong> {matchingMedication.specialInstructions}
                </p>
              </div>
            )}

            {/* Giant One-Tap Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleTakeMedication(nextDose.id, nextDose.medicationName)}
                className="flex items-center justify-center gap-4 py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xl shadow-lg shadow-emerald-600/30 transition-all border-2 border-emerald-500"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
                <span>I TOOK THIS MEDICINE</span>
              </button>

              <button
                onClick={() => onSnoozeDose(nextDose.id)}
                className="flex items-center justify-center gap-3 py-5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-lg border border-slate-300 transition-all"
              >
                <Clock className="w-6 h-6 text-slate-600" />
                <span>Remind Me in 15 Min</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-emerald-50 rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            All Current Medications Taken!
          </h2>
          <p className="text-emerald-800 text-base sm:text-lg max-w-lg mx-auto">
            Wonderful job, {senior.preferredName}! You are fully up to date with your schedule. Rest well and stay hydrated.
          </p>
        </section>
      )}

      {/* Daily Wellness Quick Check-in */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" />
              <span>How are you feeling right now?</span>
            </h3>
            <p className="text-sm text-slate-500">
              One tap shares your wellness status with {senior.emergencyContact.name}.
            </p>
          </div>

          {wellnessSuccess && (
            <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold animate-bounce">
              ✓ Logged to Family Feed!
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => handleWellnessSubmit('thriving', 0)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all text-emerald-900 group"
          >
            <Smile className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform mb-2" />
            <span className="font-extrabold text-base">Feeling Great</span>
            <span className="text-xs text-emerald-700 font-medium">No pain, energetic</span>
          </button>

          <button
            onClick={() => handleWellnessSubmit('good', 2)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all text-blue-900 group"
          >
            <Smile className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform mb-2" />
            <span className="font-extrabold text-base">Pretty Good</span>
            <span className="text-xs text-blue-700 font-medium">Normal daily rhythm</span>
          </button>

          <button
            onClick={() => handleWellnessSubmit('tired', 3)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 active:scale-95 transition-all text-amber-900 group"
          >
            <Meh className="w-10 h-10 text-amber-600 group-hover:scale-110 transition-transform mb-2" />
            <span className="font-extrabold text-base">A Bit Tired</span>
            <span className="text-xs text-amber-700 font-medium">Need some rest</span>
          </button>

          <button
            onClick={() => handleWellnessSubmit('unwell', 6)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all text-rose-900 group"
          >
            <Frown className="w-10 h-10 text-rose-600 group-hover:scale-110 transition-transform mb-2" />
            <span className="font-extrabold text-base">Not Feeling Well</span>
            <span className="text-xs text-rose-700 font-medium">Alerts family</span>
          </button>
        </div>
      </section>

      {/* Today's Full Medication List Overview */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Pill className="w-6 h-6 text-blue-600" />
          <span>Today&apos;s Medication Timeline</span>
        </h3>

        <div className="space-y-3">
          {doseLogs.map((log) => {
            const med = medications.find((m) => m.id === log.medicationId);
            const isTaken = log.status === 'taken';

            return (
              <div
                key={log.id}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                  isTaken
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                    : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                      isTaken
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isTaken ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-6 h-6" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{log.medicationName}</h4>
                    <p className="text-sm text-slate-500">
                      Scheduled: <strong>{log.scheduledTime}</strong> • {log.dosage}
                      {med?.withFood && ` • ${med.withFood.replace('_', ' ')}`}
                    </p>
                  </div>
                </div>

                <div>
                  {isTaken ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      ✓ Taken at {new Date(log.takenAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTakeMedication(log.id, log.medicationName)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
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

      {/* Emergency Contact Card */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Designated Care Circle Guardian
          </span>
          <h4 className="text-xl font-bold">{senior.emergencyContact.name} ({senior.emergencyContact.relationship})</h4>
          <p className="text-sm text-slate-300">
            Phone: <strong className="text-white">{senior.emergencyContact.phone}</strong>
          </p>
        </div>

        <a
          href={`tel:${senior.emergencyContact.phone}`}
          className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-base hover:bg-slate-100 active:scale-95 transition-all shadow-md"
        >
          <PhoneCall className="w-5 h-5 text-emerald-600" />
          <span>Call Guardian Now</span>
        </a>
      </section>
    </div>
  );
}
