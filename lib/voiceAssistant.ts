export type VoiceLanguage = 'en' | 'hi' | 'te';

export interface LocalizedPhrases {
  greeting: (name: string, timeGreeting: string) => string;
  nextMedication: (name: string, dosage: string, time: string, foodInstruction?: string) => string;
  allDone: (name: string) => string;
  confirmedTaken: (name: string, medName: string) => string;
  snoozed: () => string;
  emergency: () => string;
  voiceListening: string;
  voiceButtonLabel: string;
  readScheduleLabel: string;
  quickCommands: {
    label: string;
    command: string;
    speech: string;
  }[];
}

export const VOICE_TRANSLATIONS: Record<VoiceLanguage, LocalizedPhrases> = {
  en: {
    greeting: (name, timeGreeting) => `${timeGreeting}, ${name}. Let's make today a healthy day.`,
    nextMedication: (name, dosage, time, food) =>
      `Your next medicine is ${name}, dosage ${dosage}, scheduled for ${time}. ${food ? `Please take ${food.replace('_', ' ')}.` : ''}`,
    allDone: (name) => `Wonderful job ${name}! All your scheduled medicines for today have been taken. Rest and stay hydrated!`,
    confirmedTaken: (name, medName) => `Great job ${name}! ${medName} has been marked as taken.`,
    snoozed: () => 'Reminder snoozed for 15 minutes. We will remind you shortly.',
    emergency: () => 'Emergency assistance signal activated! Notifying family and caregiver immediately.',
    voiceListening: 'CareNest is listening... Speak your command now.',
    voiceButtonLabel: 'Voice Command',
    readScheduleLabel: 'Read My Schedule',
    quickCommands: [
      { label: '🗣️ "I took my medicine"', command: 'took medicine', speech: 'I took my medicine' },
      { label: '🗣️ "What is my next pill?"', command: 'next pill', speech: 'What is my next medicine?' },
      { label: '🗣️ "Call daughter Sarah"', command: 'call sarah', speech: 'Call my daughter Sarah' },
      { label: '🚨 "Emergency Help"', command: 'emergency', speech: 'Emergency help' },
    ],
  },
  hi: {
    greeting: (name, timeGreeting) => `नमस्ते ${name} जी! आज का दिन आपके लिए स्वस्थ और मंगलमय रहे।`,
    nextMedication: (name, dosage, time, food) =>
      `आपकी अगली दवाई ${name} है, मात्रा ${dosage}, जो ${time} बजे लेनी है। ${food ? 'कृपया इसे भोजन के निर्देशानुसार लें।' : ''}`,
    allDone: (name) => `बहुत खूब ${name} जी! आज की सभी निर्धारित दवाइयाँ समय पर ले ली गई हैं। आप बहुत अच्छा कर रहे हैं।`,
    confirmedTaken: (name, medName) => `शाबाश ${name} जी! ${medName} दवाई सफलतापूर्वक दर्ज कर ली गई है।`,
    snoozed: () => '15 मिनट के लिए रिमाइंडर सेट कर दिया गया है। हम आपको फिर से याद दिलाएंगे।',
    emergency: () => 'आपातकालीन सहायता संकेत सक्रिय कर दिया गया है! परिवार और नर्स को सूचित किया जा रहा है।',
    voiceListening: 'केयरनेस्ट आपकी बात सुन रहा है... कृपया बोलें।',
    voiceButtonLabel: 'आवाज़ से निर्देश (Voice)',
    readScheduleLabel: 'दवाइयों की सूची सुनें',
    quickCommands: [
      { label: '🗣️ "मैंने दवाई ले ली"', command: 'took medicine', speech: 'मैंने दवाई ले ली' },
      { label: '🗣️ "अगली दवाई क्या है?"', command: 'next pill', speech: 'मेरी अगली दवाई कौन सी है?' },
      { label: '🗣️ "बेटी सारा को कॉल करो"', command: 'call sarah', speech: 'बेटी सारा को फोन मिलाओ' },
      { label: '🚨 "मदद चाहिए (SOS)"', command: 'emergency', speech: 'मुझे तुरंत मदद चाहिए' },
    ],
  },
  te: {
    greeting: (name, timeGreeting) => `నమస్కారం ${name} గారు! ఈ రోజు మీ ఆరోగ్యం బాగుండాలని కోరుకుంటున్నాము.`,
    nextMedication: (name, dosage, time, food) =>
      `మీ తర్వాతి మందు ${name}, మోతాదు ${dosage}, సమయం ${time} గంటలకు తీసుకోవాలి. ${food ? 'దయచేసి భోజన సూచనల ప్రకారం తీసుకోండి.' : ''}`,
    allDone: (name) => `చాలా సంతోషం ${name} గారు! ఈ రోజుకు సంబంధించిన అన్ని మందులు విజయవంతంగా తీసుకున్నారు. విశ్రాంతి తీసుకోండి!`,
    confirmedTaken: (name, medName) => `చాలా మంచిది ${name} గారు! ${medName} మందు తీసుకున్నట్లు నమోదు చేయబడింది.`,
    snoozed: () => 'మందు సమయాన్ని 15 నిమిషాలు వాయిదా వేయడం జరిగింది. త్వరలోనే మళ్లీ గుర్తుచేస్తాము.',
    emergency: () => 'అత్యవసర సహాయ సంకేతం పంపబడింది! కుటుంబ సభ్యులకు మరియు నర్సుకు వెంటనే సమాచారం అందింది.',
    voiceListening: 'కేర్‌నెస్ట్ మీ మాట వింటోంది... దయచేసి మాట్లాడండి.',
    voiceButtonLabel: 'వాయిస్ కమాండ్ (తెలుగు)',
    readScheduleLabel: 'మందుల వివరాలు వినండి',
    quickCommands: [
      { label: '🗣️ "నేను మందు తీసుకున్నాను"', command: 'took medicine', speech: 'నేను మందు తీసుకున్నాను' },
      { label: '🗣️ "నా తర్వాతి మందు ఏమిటి?"', command: 'next pill', speech: 'నా తర్వాతి మందు ఏమిటి?' },
      { label: '🗣️ "సారాకు కాల్ చేయండి"', command: 'call sarah', speech: 'మా అమ్మాయి సారాకు కాల్ చేయండి' },
      { label: '🚨 "అత్యవసర సహాయం (SOS)"', command: 'emergency', speech: 'నాకు సహాయం కావాలి' },
    ],
  },
};

export function speakText(text: string, lang: VoiceLanguage, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.0;

  if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (lang === 'te') {
    utterance.lang = 'te-IN';
  } else {
    utterance.lang = 'en-US';
  }

  // Attempt to select specific Indian voice if available in user's OS
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) =>
      (lang === 'hi' && (v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('hemant'))) ||
      (lang === 'te' && (v.lang.includes('te') || v.name.toLowerCase().includes('telugu') || v.name.toLowerCase().includes('chitra') || v.name.toLowerCase().includes('mohan'))) ||
      (lang === 'en' && (v.lang.includes('en-IN') || v.lang.includes('en-US')))
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}
