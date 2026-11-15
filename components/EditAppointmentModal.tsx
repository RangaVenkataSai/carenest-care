'use client';

import React, { useState, useEffect } from 'react';
import { DoctorAppointment } from '@/lib/types';
import { Calendar, Edit3, X, Save } from 'lucide-react';

interface EditAppointmentModalProps {
  appointment: DoctorAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: DoctorAppointment) => void;
}

export function EditAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSave,
}: EditAppointmentModalProps) {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [prep, setPrep] = useState('');

  useEffect(() => {
    if (appointment) {
      setDoctorName(appointment.doctorName);
      setSpecialty(appointment.specialty);
      setClinicName(appointment.clinicName);
      setLocation(appointment.location || '');
      setDate(appointment.date);
      setTime(appointment.time);
      setPrep(appointment.preparationInstructions.join('; '));
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DoctorAppointment = {
      ...appointment,
      doctorName,
      specialty,
      clinicName,
      location,
      date,
      time,
      preparationInstructions: prep.split(';').map((s) => s.trim()).filter(Boolean),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E6E4DC] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
              <Edit3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#263238]">Edit Doctor Appointment</h3>
              <p className="text-xs text-[#546E7A]">Modify appointment date, clinic, or preparation notes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Doctor Name *</label>
            <input
              type="text"
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs focus:ring-2 focus:ring-[#167C80]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Clinic Name *</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Time *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Location / Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
              Preparation Instructions (separated by semicolon)
            </label>
            <textarea
              rows={2}
              value={prep}
              onChange={(e) => setPrep(e.target.value)}
              placeholder="e.g. Fasting 8 hours; Bring blood pressure log"
              className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
            />
          </div>

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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
