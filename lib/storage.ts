'use client';

import { CareCircleState, Medication, MedicationDoseLog, DoctorAppointment, CaregiverAlert, DailyWellnessLog, UserRole } from './types';
import { INITIAL_STATE } from './seedData';
import { VoiceLanguage } from './voiceAssistant';

const STORAGE_KEY = 'carenest_state_v1';
const ROLE_KEY = 'carenest_current_role_v1';
const AUTH_KEY = 'carenest_auth_token_v1';
const LANG_KEY = 'carenest_voice_lang_v1';

export function getInitialOrSavedState(): CareCircleState {
  if (typeof window === 'undefined') {
    return INITIAL_STATE;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sentinelcare_state_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to read from localStorage', err);
  }
  return INITIAL_STATE;
}

export function saveState(state: CareCircleState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function resetToSeedData(): CareCircleState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return INITIAL_STATE;
}

export function getSavedRole(): UserRole {
  if (typeof window === 'undefined') return 'elderly';
  return (localStorage.getItem(ROLE_KEY) as UserRole) || 'elderly';
}

export function saveRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_KEY, role);
}

export function getAuthPasscode(): string | null {
  if (typeof window === 'undefined') return '892144';
  return localStorage.getItem(AUTH_KEY) || '892144';
}

export function saveAuthPasscode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, code);
}

export function getSavedVoiceLang(): VoiceLanguage {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem(LANG_KEY) as VoiceLanguage) || 'en';
}

export function saveVoiceLang(lang: VoiceLanguage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
}
