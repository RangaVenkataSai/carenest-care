'use client';

import React from 'react';
import { Medication, MedicationDoseLog } from '@/lib/types';
import { CheckCircle2, Clock, AlertCircle, Coffee, Pill } from 'lucide-react';

interface SmartMedicationTimelineProps {
  medications: Medication[];
  doseLogs: MedicationDoseLog[];
  onSelectDose?: (log: MedicationDoseLog) => void;
}

export function SmartMedicationTimeline({
  medications,
  doseLogs,
  onSelectDose,
}: SmartMedicationTimelineProps) {
  // Current time representation
  const now = new Date();
  const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  // Sort logs by scheduledTime
  const sortedLogs = [...doseLogs].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return (
    <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E4DC] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#167C80]" />
            <span>Smart Medication Timeline</span>
          </h2>
          <p className="text-xs text-[#546E7A]">
            Chronological daily routine with live progress tracking
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-[#1B8354] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B8354]"></span> Taken
          </span>
          <span className="flex items-center gap-1.5 text-[#167C80] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#167C80]"></span> Upcoming
          </span>
          <span className="flex items-center gap-1.5 text-[#D97706] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> Pending
          </span>
        </div>
      </div>

      {/* Timeline track */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E6E4DC]">
        {sortedLogs.map((log) => {
          const med = medications.find((m) => m.id === log.medicationId);
          const isTaken = log.status === 'taken';
          const isSnoozed = log.status === 'snoozed';
          const isPast = log.scheduledTime < currentHourMinute && !isTaken;

          let badgeColor = 'bg-[#E8F3F3] text-[#167C80] border-[#B7D4C2]';
          let dotColor = 'bg-[#167C80] ring-4 ring-[#E8F3F3]';
          let statusText = 'Scheduled';

          if (isTaken) {
            badgeColor = 'bg-[#F0F6F2] text-[#1B8354] border-[#B7D4C2]';
            dotColor = 'bg-[#1B8354] ring-4 ring-[#F0F6F2]';
            statusText = `Confirmed at ${new Date(log.takenAt || '').toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`;
          } else if (isPast) {
            badgeColor = 'bg-[#FDF3EF] text-[#D32F2F] border-[#F2A58A]';
            dotColor = 'bg-[#D32F2F] ring-4 ring-[#FDF3EF]';
            statusText = 'Window Elapsed (Grace Period)';
          } else if (isSnoozed) {
            badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            dotColor = 'bg-amber-500 ring-4 ring-amber-100';
            statusText = 'Snoozed 15 mins';
          }

          return (
            <div key={log.id} className="relative flex items-start gap-4 group">
              {/* Dot on timeline */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full border-2 border-white transition-all ${dotColor}`}
              />

              {/* Card content */}
              <div
                onClick={() => onSelectDose?.(log)}
                className="flex-1 bg-[#F8F7F2]/60 hover:bg-white border border-[#E6E4DC] hover:border-[#167C80] p-4 rounded-2xl transition-all cursor-pointer shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#263238]">
                      {log.medicationName}
                    </span>
                    {med?.pillColor && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#E6E4DC] text-[#546E7A]">
                        {med.pillColor} {med.pillShape}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#263238]">
                      {log.scheduledTime}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#546E7A]">
                  <span>Dosage: <strong className="text-[#263238]">{log.dosage}</strong></span>
                  {med?.withFood && (
                    <span className="flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-[#167C80]" />
                      <span className="capitalize">{med.withFood.replace('_', ' ')}</span>
                    </span>
                  )}
                  {med?.purpose && (
                    <span className="truncate max-w-xs text-[#546E7A]">
                      • {med.purpose}
                    </span>
                  )}
                </div>

                {log.notes && (
                  <p className="text-[11px] italic text-[#546E7A] bg-white p-2 rounded-lg border border-[#E6E4DC]/60">
                    &ldquo;{log.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
