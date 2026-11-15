'use client';

import React from 'react';
import { CaregiverAlert } from '@/lib/types';
import { Bell, AlertTriangle, Calendar, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CaregiverAlert[];
  onAcknowledgeAlert: (id: string) => void;
}

export function AlertsDrawer({ isOpen, onClose, alerts, onAcknowledgeAlert }: AlertsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white h-full max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Care Circle Notification Hub</h3>
              <p className="text-xs text-slate-500">Autonomous alert & proactive escalation history</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No alerts currently recorded.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                  alert.severity === 'critical' || alert.severity === 'high'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {alert.severity === 'critical' ? (
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    ) : alert.severity === 'high' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">{alert.message}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400">
                    To: {alert.recipientEmail} • {alert.delivered ? '✓ Dispatched' : 'Pending'}
                  </span>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[10px] transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
