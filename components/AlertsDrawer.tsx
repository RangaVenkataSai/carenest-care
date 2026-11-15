'use client';

import React, { useState } from 'react';
import { CaregiverAlert } from '@/lib/types';
import { Bell, AlertTriangle, Calendar, ShieldAlert, CheckCircle2, X, Clock, Heart } from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CaregiverAlert[];
  onAcknowledgeAlert: (id: string) => void;
}

export function AlertsDrawer({ isOpen, onClose, alerts, onAcknowledgeAlert }: AlertsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'medication' | 'missed' | 'appointment' | 'alert'>('all');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'medication') return alert.type === 'upcoming_dose';
    if (activeTab === 'missed') return alert.type === 'missed_dose_escalation' || alert.type === 'missed_dose';
    if (activeTab === 'appointment') return alert.type === 'upcoming_appointment' || alert.type === 'doctor_appointment';
    if (activeTab === 'alert') return alert.type === 'emergency_sos' || alert.type === 'interaction_warning' || alert.type === 'refill_alert';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white h-full max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl flex flex-col border-l border-[#E6E4DC] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E8F3F3] text-[#167C80]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#263238]">Smart Reminder Center</h3>
              <p className="text-xs text-[#546E7A]">Categorized notifications & proactive escalations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1.5 rounded-lg hover:bg-[#F8F7F2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F7F2] p-1 rounded-2xl border border-[#E6E4DC] text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'medication', label: 'Meds' },
            { id: 'missed', label: 'Missed' },
            { id: 'appointment', label: 'Visits' },
            { id: 'alert', label: 'Alerts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-2xs'
                  : 'text-[#546E7A] hover:text-[#263238]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 text-[#546E7A] text-xs">
              No notifications in this category.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              let icon = <Clock className="w-4 h-4 text-[#167C80]" />;
              let cardBorder = 'border-[#E6E4DC] bg-white';

              if (alert.severity === 'critical' || alert.type === 'missed_dose_escalation') {
                icon = <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />;
                cardBorder = 'border-[#F2A58A] bg-[#FDF3EF]/60';
              } else if (alert.type === 'upcoming_appointment' || alert.type === 'doctor_appointment') {
                icon = <Calendar className="w-4 h-4 text-blue-700" />;
                cardBorder = 'border-blue-200 bg-blue-50/40';
              }

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all shadow-2xs ${cardBorder}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-[#263238]">
                      {icon}
                      <span className="line-clamp-1">{alert.title}</span>
                    </div>

                    <span className="text-[10px] text-[#546E7A] font-mono shrink-0">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[#546E7A] leading-relaxed">{alert.message}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E6E4DC]/60">
                    <span className="text-[10px] text-[#546E7A]">
                      Recipient: {alert.recipientEmail} •{' '}
                      <span className="text-[#1B8354] font-semibold">
                        {alert.delivered ? '✓ Dispatched' : 'Pending'}
                      </span>
                    </span>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E6E4DC] hover:border-[#167C80] text-[#263238] font-bold text-[10px] transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
