'use client';

import React from 'react';
import { SeniorProfile, Medication, DoctorAppointment } from '@/lib/types';
import { Printer, X, Shield, Phone, Heart } from 'lucide-react';

interface PrintableRoutineProps {
  senior: SeniorProfile;
  medications: Medication[];
  appointments: DoctorAppointment[];
  onClose: () => void;
}

export function PrintableRoutine({
  senior,
  medications,
  appointments,
  onClose,
}: PrintableRoutineProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 space-y-6 shadow-2xl border-2 border-[#167C80] my-8">
        {/* Actions Bar (Hidden during actual print) */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#263238]">
                Large-Print Refrigerator / Nightstand Care Sheet
              </h3>
              <p className="text-xs text-[#546E7A]">
                Printable physical routine for Arthur&apos;s home
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Care Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#546E7A] hover:text-[#263238] rounded-xl border border-[#E6E4DC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="space-y-6 text-[#263238] font-sans">
          {/* Header */}
          <div className="border-b-2 border-[#263238] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-[#167C80]">
                CareNest Senior Health Routine
              </span>
              <h1 className="text-3xl sm:text-4xl font-black">{senior.name}&apos;s Daily Medication Plan</h1>
              <p className="text-sm text-[#546E7A]">Passcode Care Circle: {senior.circleCode} • Age {senior.age}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F7F2] border-2 border-[#263238] text-xs space-y-1">
              <div className="font-bold uppercase text-[10px] text-[#546E7A]">Emergency Contacts</div>
              <div className="font-extrabold text-sm">{senior.emergencyContact.name}: {senior.emergencyContact.phone}</div>
              <div>Nurse Elena, RN: +1 (555) 432-9011</div>
            </div>
          </div>

          {/* Medication Schedule Table */}
          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-wider text-[#167C80]">
              Daily Prescription Schedule
            </h2>
            <div className="border-2 border-[#263238] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#167C80] text-white font-black text-xs uppercase">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Medicine & Dosage</th>
                    <th className="p-3">Pill Appearance</th>
                    <th className="p-3">How to Take</th>
                    <th className="p-3 text-center">Daily Checkbox</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DC]">
                  {medications.map((med) => (
                    <tr key={med.id} className="hover:bg-[#F8F7F2]">
                      <td className="p-3 font-mono font-bold text-sm text-[#167C80]">
                        {med.scheduledTimes.join(' & ')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {med.imageUrl && (
                            <img
                              src={med.imageUrl}
                              alt={med.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#263238] shrink-0"
                            />
                          )}
                          <div>
                            <strong className="text-base text-[#263238] block">{med.name}</strong>
                            <span className="text-xs text-[#546E7A]">{med.dosage} • {med.purpose}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-1 rounded-md bg-[#F8F7F2] border border-[#E6E4DC] font-semibold text-xs">
                          {med.pillColor} ({med.pillShape})
                          {med.pillImprint && <span className="block font-mono text-[11px] text-[#167C80]">Imprint: {med.pillImprint}</span>}
                        </span>
                      </td>
                      <td className="p-3 text-xs leading-relaxed">
                        <span className="font-bold block text-[#263238] capitalize">
                          {med.withFood.replace('_', ' ')}
                        </span>
                        <span className="text-[#546E7A]">{med.specialInstructions}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-[#263238] rounded-md"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Doctor Visits */}
          {appointments.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-black uppercase tracking-wider text-[#167C80]">
                Upcoming Medical Appointments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl border-2 border-[#E6E4DC] text-xs space-y-1">
                    <div className="font-extrabold text-sm text-[#263238]">{apt.doctorName} ({apt.specialty})</div>
                    <div className="font-semibold text-[#167C80]">📅 {apt.date} at {apt.time}</div>
                    <div className="text-[#546E7A]">{apt.clinicName} • {apt.location}</div>
                    {apt.preparationInstructions.length > 0 && (
                      <div className="font-bold text-[#D32F2F] pt-1">
                        Prep: {apt.preparationInstructions.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Senior Autonomy Note */}
          <div className="p-3 rounded-xl bg-[#F0F6F2] border border-[#B7D4C2] text-xs text-[#1B8354] font-medium">
            💡 <strong>Arthur&apos;s Independence Reminder:</strong> You are the master of your healthcare decisions. Take your time, drink a full glass of water with your morning medicines, and never hesitate to call your daughter Sarah or Nurse Elena whenever you have a question.
          </div>
        </div>
      </div>
    </div>
  );
}
