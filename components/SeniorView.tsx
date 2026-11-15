'use client';

import React, { useState } from 'react';
import { 
  SeniorProfile, Medication, MedicationDoseLog, DoctorAppointment, 
  DailyWellnessLog, CareUpdateNotice 
} from '@/lib/types';
import { 
  CheckCircle2, Clock, Volume2, Heart, ShieldAlert, Sparkles, 
  Coffee, Pill, PhoneCall, Smile, Meh, Frown, Calendar, Info, 
  Printer, Mic, MicOff, Eye, Check, ShieldCheck, Sun, Compass, Languages, Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PillVerifierModal } from './PillVerifierModal';
import { PrintableRoutine } from './PrintableRoutine';
import { VoiceLanguage, VOICE_TRANSLATIONS, speakText, stopSpeech } from '@/lib/voiceAssistant';

interface SeniorViewProps {
  senior: SeniorProfile;
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
  appointments: DoctorAppointment[];
  wellnessLogs: DailyWellnessLog[];
  careUpdates?: CareUpdateNotice[];
  voiceLang?: VoiceLanguage;
  onVoiceLangChange?: (lang: VoiceLanguage) => void;
  onMarkDoseTaken: (logId: string) => void;
  onSnoozeDose: (logId: string) => void;
  onLogWellness: (mood: 'thriving' | 'good' | 'tired' | 'unwell', pain: number) => void;
  onTriggerSOS: () => void;
  onAcknowledgeCareUpdate?: (updateId: string) => void;
}

export function SeniorView({
  senior,
  medications,
  doseLogs,
  appointments,
  wellnessLogs,
  careUpdates = [],
  voiceLang: propVoiceLang,
  onVoiceLangChange,
  onMarkDoseTaken,
  onSnoozeDose,
  onLogWellness,
  onTriggerSOS,
  onAcknowledgeCareUpdate,
}: SeniorViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [localVoiceLang, setLocalVoiceLang] = useState<VoiceLanguage>('en');
  const [zenMode, setZenMode] = useState(false);
  const [inspectMedication, setInspectMedication] = useState<Medication | null>(null);
  const [verifyingPill, setVerifyingPill] = useState<Medication | null>(null);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [wellnessSuccess, setWellnessSuccess] = useState(false);

  const voiceLang = propVoiceLang || localVoiceLang;

  const handleLanguageChange = (newLang: VoiceLanguage) => {
    if (onVoiceLangChange) {
      onVoiceLangChange(newLang);
    } else {
      setLocalVoiceLang(newLang);
    }

    const phrasesForLang = VOICE_TRANSLATIONS[newLang];
    setVoiceFeedback(phrasesForLang.languageSelected);

    speakText(
      phrasesForLang.languageSelected,
      newLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

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

  // Pending care update requiring senior consent
  const pendingUpdate = careUpdates.find((u) => u.status === 'pending_review');

  const phrases = VOICE_TRANSLATIONS[voiceLang];

  // Multilingual Speech Synthesis voice reader
  const handleReadScheduleAloud = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = phrases.greeting(senior.preferredName, timeGreeting) + ' ';

    if (pendingDoses.length === 0) {
      textToSpeak += phrases.allDone(senior.preferredName);
    } else {
      if (nextDose) {
        textToSpeak += phrases.nextMedication(
          nextDose.medicationName,
          nextDose.dosage,
          nextDose.scheduledTime,
          matchingMedication?.withFood
        );
      }
    }

    speakText(
      textToSpeak,
      voiceLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Interactive Voice Command Recognition
  const handleStartVoiceRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback(`Listening (${voiceLang.toUpperCase()})... Tap a quick voice command below.`);
      setIsListening(true);
      setTimeout(() => {
        handleExecuteVoiceCommand('next');
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang === 'hi' ? 'hi-IN' : voiceLang === 'te' ? 'te-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback(phrases.voiceListening);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceFeedback(`Recognized: "${transcript}"`);
        handleExecuteVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceFeedback('Could not hear clearly. Tap a voice command below:');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleExecuteVoiceCommand = (command: string) => {
    setIsListening(false);
    const cmd = command.toLowerCase();

    if (
      cmd.includes('took') ||
      cmd.includes('taken') ||
      cmd.includes('done') ||
      cmd.includes('दवाई') ||
      cmd.includes('ले ली') ||
      cmd.includes('తీసుకున్నాను')
    ) {
      if (nextDose) {
        handleTakeMedication(nextDose.id, nextDose.medicationName);
        setVoiceFeedback(`✓ Marked ${nextDose.medicationName} taken via voice command!`);
      }
    } else if (
      cmd.includes('next') ||
      cmd.includes('what') ||
      cmd.includes('अगली') ||
      cmd.includes('తర్వాతి')
    ) {
      handleReadScheduleAloud();
      setVoiceFeedback('Reading schedule aloud.');
    } else if (
      cmd.includes('sos') ||
      cmd.includes('help') ||
      cmd.includes('emergency') ||
      cmd.includes('मदद') ||
      cmd.includes('సహాయం')
    ) {
      onTriggerSOS();
      setVoiceFeedback('Emergency SOS beacon activated!');
    } else if (
      cmd.includes('daughter') ||
      cmd.includes('sarah') ||
      cmd.includes('call') ||
      cmd.includes('फोन') ||
      cmd.includes('కాల్')
    ) {
      window.location.href = `tel:${senior.emergencyContact.phone}`;
      setVoiceFeedback(`Calling ${senior.emergencyContact.name}...`);
    } else {
      setVoiceFeedback(`Processed: "${command}". Schedule is synchronized.`);
    }
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

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio not permitted
    }

    // Multilingual spoken positive reinforcement
    const confirmText = phrases.confirmedTaken(senior.preferredName, medName);
    speakText(confirmText, voiceLang);

    onMarkDoseTaken(logId);
  };

  const handleWellnessSubmit = (mood: 'thriving' | 'good' | 'tired' | 'unwell', pain: number) => {
    onLogWellness(mood, pain);
    setWellnessSuccess(true);
    setTimeout(() => setWellnessSuccess(false), 3000);
  };

  // ZEN FOCUS MODE: One Thing At A Time (Cognitive Friendly)
  if (zenMode) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E6E4DC]">
          <span className="font-extrabold text-sm text-[#167C80] flex items-center gap-2">
            <Compass className="w-5 h-5" /> Zen Focus Mode (One Action At A Time)
          </span>
          <button
            onClick={() => setZenMode(false)}
            className="px-4 py-2 rounded-xl bg-[#F8F7F2] hover:bg-[#E6E4DC] text-[#263238] font-bold text-xs"
          >
            Exit Zen Mode ✕
          </button>
        </div>

        {nextDose ? (
          <div className="bg-white rounded-3xl border-4 border-[#167C80] p-8 sm:p-12 shadow-xl space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#167C80] bg-[#E8F3F3] px-4 py-1.5 rounded-full">
                Scheduled for {nextDose.scheduledTime}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-[#263238] pt-2">
                {nextDose.medicationName}
              </h2>
              <p className="text-xl text-[#546E7A] font-bold">Dosage: {nextDose.dosage}</p>
            </div>

            {matchingMedication?.specialInstructions && (
              <div className="p-5 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] text-base text-[#263238] font-semibold">
                💡 {matchingMedication.specialInstructions}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => handleTakeMedication(nextDose.id, nextDose.medicationName)}
                className="w-full py-6 px-8 rounded-3xl bg-[#1B8354] hover:bg-[#156c45] active:scale-95 text-white font-black text-2xl shadow-lg transition-all flex items-center justify-center gap-3 border-4 border-emerald-400"
              >
                <CheckCircle2 className="w-10 h-10" />
                <span>I TOOK THIS MEDICINE</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onSnoozeDose(nextDose.id)}
                  className="py-4 px-6 rounded-2xl bg-[#F8F7F2] hover:bg-[#E6E4DC] text-[#263238] font-bold text-base border-2 border-[#E6E4DC]"
                >
                  Remind in 15 Min
                </button>
                <button
                  onClick={() => matchingMedication && setVerifyingPill(matchingMedication)}
                  className="py-4 px-6 rounded-2xl bg-[#E8F3F3] text-[#167C80] font-bold text-base border-2 border-[#B7D4C2] flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Check Pill</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-[#B7D4C2] p-12 shadow-sm space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F0F6F2] text-[#1B8354] flex items-center justify-center mx-auto">
              <Sun className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-[#263238]">All Done for Now!</h2>
            <p className="text-base text-[#546E7A] max-w-md mx-auto">
              You have taken all scheduled medicines. Rest, stay hydrated, and enjoy your day!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 1. Personalized Welcome & Multilingual Voice Action Bar */}
      <section className="bg-gradient-to-r from-[#167C80] to-[#126366] text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                👴 Senior Independence Portal
              </span>

              {/* Language Selector Pills */}
              <div className="inline-flex items-center bg-black/25 backdrop-blur-xs p-0.5 rounded-full border border-white/20 text-xs font-bold">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    voiceLang === 'en' ? 'bg-white text-[#167C80]' : 'text-white hover:text-teal-200'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    voiceLang === 'hi' ? 'bg-white text-[#167C80]' : 'text-white hover:text-teal-200'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => handleLanguageChange('te')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    voiceLang === 'te' ? 'bg-white text-[#167C80]' : 'text-white hover:text-teal-200'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>

              <button
                onClick={() => setZenMode(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#167C80] text-xs font-bold hover:bg-[#F8F7F2] transition-colors"
                title="Simplified single-action interface"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Zen Mode</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {timeGreeting}, {senior.preferredName}.
            </h1>
            <p className="text-teal-100 text-lg font-medium">
              {voiceLang === 'hi'
                ? 'आज का दिन आपके लिए स्वस्थ और मंगलमय रहे।'
                : voiceLang === 'te'
                ? 'ఈ రోజు మీ ఆరోగ్యం బాగుండాలని కోరుకుంటున్నాము.'
                : "Let's make today a healthy day."}
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
              <span>{phrases.readScheduleLabel}</span>
            </button>

            {/* Hands-Free Voice Assistant Button */}
            <button
              onClick={handleStartVoiceRecognition}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-base shadow-sm transition-all ${
                isListening
                  ? 'bg-[#D32F2F] text-white ring-4 ring-red-200 animate-pulse'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{phrases.voiceButtonLabel}</span>
            </button>

            {/* Printable Fridge Sheet */}
            <button
              onClick={() => setShowPrintSheet(true)}
              className="p-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all"
              title="Print Large Fridge Routine Sheet"
            >
              <Printer className="w-5 h-5" />
            </button>

            {/* Emergency SOS */}
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-base bg-[#D32F2F] hover:bg-red-700 text-white shadow-sm active:scale-95 border-2 border-red-400"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>

        {/* Localized Voice Command Simulation Pills */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-teal-200 text-[11px] font-semibold">
            {voiceLang === 'hi' ? 'आवाज़ से निर्देश दें:' : voiceLang === 'te' ? 'వాయిస్ సూచనలు:' : 'Quick Voice Commands:'}
          </span>
          {phrases.quickCommands.map((qc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setVoiceFeedback(`Command: "${qc.speech}"`);
                handleExecuteVoiceCommand(qc.command);
              }}
              className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/30 text-white font-medium text-xs border border-white/20 transition-all active:scale-95"
            >
              {qc.label}
            </button>
          ))}
        </div>

        {/* Voice Feedback Display */}
        {voiceFeedback && (
          <div className="mt-2 text-xs text-amber-200 font-bold flex items-center justify-between">
            <span>{voiceFeedback}</span>
            <button
              onClick={() => setVoiceFeedback(null)}
              className="text-white hover:underline text-[11px]"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* 2. Elderly Decision & Consent Gate */}
      {pendingUpdate && (
        <section className="bg-[#E8F3F3] rounded-3xl border-2 border-[#167C80] p-6 shadow-sm space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-[#B7D4C2] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white text-[#167C80] shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#167C80]">
                  Patient Autonomy & Consent Gate
                </span>
                <h3 className="text-base font-bold text-[#263238]">{pendingUpdate.title}</h3>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#546E7A]">
              Proposed by {pendingUpdate.updatedBy}
            </span>
          </div>

          <p className="text-sm text-[#263238] leading-relaxed">
            {pendingUpdate.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <a
              href="tel:+15554329011"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#B7D4C2] text-[#263238] text-xs font-bold text-center hover:bg-[#F8F7F2]"
            >
              Ask Nurse Elena About This
            </a>
            <button
              onClick={() => onAcknowledgeCareUpdate?.(pendingUpdate.id)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs transition-colors"
            >
              ✓ I Understand & Agree to This Schedule
            </button>
          </div>
        </section>
      )}

      {/* 3. Today's Health Overview */}
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

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* 4. Daily Senior Wellness Check-in (Re-integrated & Verified) */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E4DC] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#263238] flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#167C80]" />
              <span>How are you feeling right now, Arthur?</span>
            </h3>
            <p className="text-xs text-[#546E7A]">
              One tap logs your wellness state directly to Sarah and Nurse Elena&apos;s feed
            </p>
          </div>

          {wellnessSuccess && (
            <span className="px-3.5 py-1.5 rounded-xl bg-[#F0F6F2] text-[#1B8354] font-bold text-xs border border-[#B7D4C2] animate-bounce">
              ✓ Logged to Family Feed!
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleWellnessSubmit('thriving', 0)}
            className="p-4 rounded-2xl border-2 border-[#B7D4C2] bg-[#F0F6F2] hover:bg-[#d9ede1] active:scale-95 transition-all text-center group"
          >
            <Smile className="w-8 h-8 text-[#1B8354] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-[#1B8354]">Feeling Great</div>
            <div className="text-[10px] text-[#546E7A]">Energetic, no pain</div>
          </button>

          <button
            onClick={() => handleWellnessSubmit('good', 2)}
            className="p-4 rounded-2xl border-2 border-[#E6E4DC] bg-[#F8F7F2] hover:bg-[#E8F3F3] active:scale-95 transition-all text-center group"
          >
            <Smile className="w-8 h-8 text-[#167C80] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-[#263238]">Pretty Good</div>
            <div className="text-[10px] text-[#546E7A]">Normal daily rhythm</div>
          </button>

          <button
            onClick={() => handleWellnessSubmit('tired', 4)}
            className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 active:scale-95 transition-all text-center group"
          >
            <Meh className="w-8 h-8 text-amber-600 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-amber-900">A Bit Tired</div>
            <div className="text-[10px] text-[#546E7A]">Need some rest</div>
          </button>

          <button
            onClick={() => handleWellnessSubmit('unwell', 7)}
            className="p-4 rounded-2xl border-2 border-[#F2A58A] bg-[#FDF3EF] hover:bg-[#fcdfd6] active:scale-95 transition-all text-center group"
          >
            <Frown className="w-8 h-8 text-[#D32F2F] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-extrabold text-sm text-[#D32F2F]">Not Feeling Well</div>
            <div className="text-[10px] text-[#546E7A]">Alerts care team</div>
          </button>
        </div>
      </section>

      {/* 5. Primary Next Medication Focus Card with Visual Pill Verifier */}
      {nextDose && (
        <section className="bg-white rounded-3xl border-2 border-[#167C80] shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DC] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#167C80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#167C80]"></span>
              </span>
              <span className="text-sm font-extrabold tracking-wider text-[#167C80] uppercase">
                Scheduled Next • Target: {nextDose.scheduledTime}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => matchingMedication && setVerifyingPill(matchingMedication)}
                className="text-xs font-bold text-[#167C80] bg-[#E8F3F3] hover:bg-[#d8eaea] px-3 py-1.5 rounded-xl border border-[#B7D4C2] flex items-center gap-1.5 transition-colors"
                title="Visual Pill Identifier"
              >
                <Eye className="w-4 h-4" />
                <span>Verify Pill in Hand</span>
              </button>

              <button
                onClick={() => matchingMedication && setInspectMedication(matchingMedication)}
                className="text-xs font-bold text-[#546E7A] hover:text-[#263238] flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                <span>View Instructions</span>
              </button>
            </div>
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

      {/* 6. Today's Full Medication List Overview */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#263238] flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#167C80]" />
            <span>All Today&apos;s Medications</span>
          </h3>

          <button
            onClick={() => setShowPrintSheet(true)}
            className="text-xs font-bold text-[#167C80] hover:underline flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" /> Large-Print Fridge Sheet
          </button>
        </div>

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
                  {med && (
                    <>
                      <button
                        onClick={() => setInspectMedication(med)}
                        className="p-2 text-[#546E7A] hover:text-[#167C80] rounded-lg border border-[#E6E4DC] hover:bg-[#F8F7F2]"
                        title="View medication instructions"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setVerifyingPill(med)}
                        className="p-2 text-[#546E7A] hover:text-[#167C80] rounded-lg border border-[#E6E4DC] hover:bg-[#F8F7F2]"
                        title="Verify pill in hand"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </>
                  )}

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

      {/* 7. Upcoming Appointment Card */}
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
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] space-y-2 text-xs">
              <strong className="text-[#167C80] block text-sm">Preparation Instructions:</strong>
              <ul className="list-disc list-inside space-y-1 text-[#263238]">
                {nextAppointment.preparationInstructions.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 8. Quick Assistance Channels */}
      <section className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-[#263238] flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-[#167C80]" />
          <span>Quick Contact Channels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="tel:+15554329011"
            className="p-5 rounded-2xl bg-[#F8F7F2] hover:bg-[#E8F3F3] border border-[#E6E4DC] hover:border-[#167C80] transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-base text-[#263238]">Call Nurse Elena, RN</h4>
              <p className="text-xs text-[#546E7A]">Visiting Registered Nurse • Shift Active</p>
            </div>
            <span className="p-3 rounded-xl bg-white border border-[#E6E4DC] text-[#167C80]">
              <PhoneCall className="w-5 h-5" />
            </span>
          </a>

          <a
            href={`tel:${senior.emergencyContact.phone}`}
            className="p-5 rounded-2xl bg-[#F8F7F2] hover:bg-[#FDF3EF] border border-[#E6E4DC] hover:border-[#F2A58A] transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-base text-[#263238]">Call Sarah (Daughter)</h4>
              <p className="text-xs text-[#546E7A]">Primary Family Proxy • {senior.emergencyContact.phone}</p>
            </div>
            <span className="p-3 rounded-xl bg-white border border-[#E6E4DC] text-[#D32F2F]">
              <Heart className="w-5 h-5" />
            </span>
          </a>
        </div>
      </section>

      {/* Pill Verifier Modal */}
      <PillVerifierModal
        medication={verifyingPill}
        onClose={() => setVerifyingPill(null)}
        onConfirmMatch={(med) => {
          setVerifyingPill(null);
          if (nextDose && nextDose.medicationId === med.id) {
            handleTakeMedication(nextDose.id, nextDose.medicationName);
          }
        }}
      />

      {/* Senior Medication Instructions & Guidance Modal */}
      {inspectMedication && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-[#167C80] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F3F3] text-[#167C80] flex items-center justify-center font-bold">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#167C80] tracking-wider">
                    Medication Instructions
                  </span>
                  <h3 className="text-2xl font-black text-[#263238]">{inspectMedication.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setInspectMedication(null)}
                className="text-[#546E7A] hover:text-[#263238] p-2 rounded-xl text-xl font-bold hover:bg-[#F8F7F2]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-[#263238]">
              <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E6E4DC] grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#546E7A] block">Dosage</span>
                  <strong className="text-base text-[#167C80]">{inspectMedication.dosage}</strong>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#546E7A] block">Food Rule</span>
                  <strong className="text-base text-[#263238] capitalize">
                    {inspectMedication.withFood?.replace('_', ' ') || 'Anytime'}
                  </strong>
                </div>
              </div>

              {inspectMedication.purpose && (
                <div className="text-sm">
                  <span className="text-[11px] font-bold uppercase text-[#546E7A] block">Purpose</span>
                  <p className="font-semibold text-[#263238]">{inspectMedication.purpose}</p>
                </div>
              )}

              {inspectMedication.specialInstructions && (
                <div className="p-4 rounded-2xl bg-[#E8F3F3] border border-[#B7D4C2] space-y-1">
                  <span className="text-xs font-bold uppercase text-[#167C80] block">
                    Important Guidance
                  </span>
                  <p className="text-sm font-semibold text-[#263238] leading-relaxed">
                    💡 {inspectMedication.specialInstructions}
                  </p>
                </div>
              )}

              {inspectMedication.pillColor && (
                <div className="text-xs text-[#546E7A]">
                  Pill Appearance: <strong>{inspectMedication.pillColor}</strong> ({inspectMedication.pillShape || 'Round'})
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  const speech = `${inspectMedication.name}, dosage ${inspectMedication.dosage}. ${
                    inspectMedication.specialInstructions || ''
                  }. Food requirement: ${inspectMedication.withFood?.replace('_', ' ') || 'anytime'}.`;
                  speakText(speech, voiceLang);
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#E8F3F3] hover:bg-[#d8eaea] text-[#167C80] font-bold text-sm flex items-center justify-center gap-2 border border-[#B7D4C2]"
              >
                <Volume2 className="w-5 h-5" />
                <span>Read Aloud</span>
              </button>

              <button
                onClick={() => setInspectMedication(null)}
                className="py-3.5 px-6 rounded-2xl bg-[#167C80] hover:bg-[#126366] text-white font-bold text-sm shadow-xs"
              >
                Understood / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Routine Sheet */}
      {showPrintSheet && (
        <PrintableRoutine
          senior={senior}
          medications={medications}
          appointments={appointments}
          onClose={() => setShowPrintSheet(false)}
        />
      )}
    </div>
  );
}
