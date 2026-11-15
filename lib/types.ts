export type UserRole = 'elderly' | 'family' | 'caretaker';

export interface SeniorProfile {
  id: string;
  name: string;
  preferredName: string;
  age: number;
  circleCode: string;
  avatarUrl?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  primaryDoctor: {
    name: string;
    clinic: string;
    phone: string;
  };
  chronicConditions: string[];
  allergies: string[];
  notes: string;
}

export type MedicationForm = 'pill' | 'capsule' | 'liquid' | 'injection' | 'inhaler';

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: MedicationForm;
  pillColor: string; // for visual recognition
  pillShape: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'as_needed' | 'custom';
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  withFood: 'before_meal' | 'with_meal' | 'after_meal' | 'anytime';
  purpose: string;
  specialInstructions: string;
  prescribedBy: string;
  prescribedDate: string;
  stockCount: number;
  refillReminderThreshold: number;
  safetyWarnings?: string[];
  dietaryInteractions?: string[];
}

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // e.g. "08:00"
  scheduledDate: string; // YYYY-MM-DD
  status: 'pending' | 'taken' | 'snoozed' | 'missed';
  takenAt?: string; // ISO string
  confirmedBy?: UserRole;
  confirmedByName?: string;
  notes?: string;
}

export interface DoctorAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  location: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (e.g. "10:30")
  durationMinutes: number;
  preparationInstructions: string[];
  accompaniedBy?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface CaregiverAlert {
  id: string;
  type:
    | 'missed_dose'
    | 'upcoming_appointment'
    | 'refill_alert'
    | 'emergency_sos'
    | 'interaction_warning'
    | 'wellness_check'
    | 'upcoming_dose'
    | 'missed_dose_escalation'
    | 'doctor_appointment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  recipientEmail: string;
  delivered: boolean;
  acknowledged: boolean;
  actionRequired?: string;
}

export interface DailyWellnessLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  mood: 'thriving' | 'good' | 'tired' | 'unwell';
  energyLevel: 'high' | 'medium' | 'low';
  painScale: number; // 0 - 10
  waterGlasses: number;
  notes?: string;
}

export interface CareCircleState {
  senior: SeniorProfile;
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
  appointments: DoctorAppointment[];
  alerts: CaregiverAlert[];
  wellnessLogs: DailyWellnessLog[];
}
