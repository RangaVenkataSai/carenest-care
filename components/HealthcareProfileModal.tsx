'use client';

import React, { useState, useEffect } from 'react';
import { SeniorProfile } from '@/lib/types';
import { User, ShieldCheck, Heart, Stethoscope, Save, X, KeyRound, Plus, Trash2 } from 'lucide-react';

interface HealthcareProfileModalProps {
  senior: SeniorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updated: SeniorProfile) => void;
}

export function HealthcareProfileModal({
  senior,
  isOpen,
  onClose,
  onSaveProfile,
}: HealthcareProfileModalProps) {
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [age, setAge] = useState(76);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    if (senior) {
      setName(senior.name);
      setPreferredName(senior.preferredName);
      setAge(senior.age);
      setEmergencyName(senior.emergencyContact.name);
      setEmergencyRelation(senior.emergencyContact.relationship);
      setEmergencyPhone(senior.emergencyContact.phone);
      setEmergencyEmail(senior.emergencyContact.email);
      setDoctorName(senior.primaryDoctor.name);
      setDoctorClinic(senior.primaryDoctor.clinic);
      setDoctorPhone(senior.primaryDoctor.phone);
      setChronicConditions(senior.chronicConditions || []);
      setAllergies(senior.allergies || []);
      setNotes(senior.notes || '');
    }
  }, [senior]);

  if (!isOpen) return null;

  const handleAddCondition = () => {
    if (newCondition.trim() && !chronicConditions.includes(newCondition.trim())) {
      setChronicConditions([...chronicConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (cond: string) => {
    setChronicConditions(chronicConditions.filter((c) => c !== cond));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (al: string) => {
    setAllergies(allergies.filter((a) => a !== al));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SeniorProfile = {
      ...senior,
      name,
      preferredName,
      age: Number(age) || senior.age,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelation,
        phone: emergencyPhone,
        email: emergencyEmail,
      },
      primaryDoctor: {
        name: doctorName,
        clinic: doctorClinic,
        phone: doctorPhone,
      },
      chronicConditions,
      allergies,
      notes,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6E4DC] my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#E8F3F3] text-[#167C80]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#263238]">Shared Healthcare Profile</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F3F3] text-[#167C80] border border-[#B7D4C2]">
                  Passcode Verified
                </span>
              </div>
              <p className="text-xs text-[#546E7A]">
                Accessible and manageable by Senior, Family Proxy, and Attending Caregiver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1.5 rounded-xl border border-[#E6E4DC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passcode Security Banner */}
        <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E6E4DC] flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-[#546E7A]">
            <KeyRound className="w-4 h-4 text-[#167C80]" />
            Care Circle Passcode: <strong className="font-mono text-[#263238] tracking-wider">{senior.circleCode}</strong>
          </span>
          <span className="text-[11px] text-[#1B8354] font-semibold">
            ✓ End-to-End Care Circle Protected
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Senior Basics */}
          <div className="space-y-3">
            <span className="font-bold text-[#167C80] uppercase tracking-wider text-[11px] block">
              1. Senior Identity
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs focus:ring-2 focus:ring-[#167C80]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Age *</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs focus:ring-2 focus:ring-[#167C80]"
                />
              </div>
            </div>
          </div>

          {/* Emergency Proxy */}
          <div className="space-y-3 pt-2 border-t border-[#E6E4DC]">
            <span className="font-bold text-[#D32F2F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> 2. Emergency Contact & Family Proxy
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Proxy Name *</label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Direct Phone *</label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Notification Email *</label>
                <input
                  type="email"
                  required
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Primary Doctor */}
          <div className="space-y-3 pt-2 border-t border-[#E6E4DC]">
            <span className="font-bold text-[#167C80] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" /> 3. Primary Physician
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={doctorClinic}
                  onChange={(e) => setDoctorClinic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Clinic Phone</label>
                <input
                  type="tel"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Chronic Conditions & Allergies */}
          <div className="space-y-3 pt-2 border-t border-[#E6E4DC]">
            <span className="font-bold text-[#263238] uppercase tracking-wider text-[11px] block">
              4. Clinical Conditions & Critical Allergies
            </span>
            
            {/* Conditions Tag Manager */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#546E7A]">Active Diagnoses / Chronic Conditions</label>
              <div className="flex flex-wrap gap-1.5">
                {chronicConditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6F2] text-[#1B8354] font-semibold text-xs border border-[#B7D4C2]"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      className="text-[#1B8354] hover:text-red-600 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Osteoarthritis"
                  className="flex-1 p-2 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-3 py-2 bg-[#F8F7F2] border border-[#E6E4DC] hover:bg-[#E8F3F3] text-[#167C80] rounded-xl font-bold"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Allergies Tag Manager */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-[#D32F2F]">Critical Drug & Food Allergies</label>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((al) => (
                  <span
                    key={al}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FDF3EF] text-[#D32F2F] font-bold text-xs border border-[#F2A58A]"
                  >
                    <span>⚠️ Allergy: {al}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(al)}
                      className="text-[#D32F2F] hover:text-black font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="e.g. Penicillin"
                  className="flex-1 p-2 rounded-xl border border-[#E6E4DC] bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3 py-2 bg-[#FDF3EF] border border-[#F2A58A] hover:bg-[#F2A58A] text-[#D32F2F] rounded-xl font-bold"
                >
                  + Add Allergy
                </button>
              </div>
            </div>
          </div>

          {/* Care Notes */}
          <div className="space-y-2 pt-2 border-t border-[#E6E4DC]">
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase">
              5. Senior Care Notes & Daily Preferences
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Takes morning medicine right after oatmeal. Prefers 28pt large print."
              className="w-full p-2.5 rounded-xl border border-[#E6E4DC] bg-white text-xs"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E4DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E6E4DC] text-[#546E7A] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Healthcare Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
