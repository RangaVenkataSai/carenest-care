'use client';

import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, Calendar, ShieldAlert, ExternalLink, X } from 'lucide-react';

export interface EmailModalData {
  isOpen: boolean;
  type: 'upcoming_dose' | 'missed_dose_escalation' | 'doctor_appointment' | 'emergency_sos';
  recipient: string;
  subject: string;
  status: string;
  htmlPreview: string;
  timestamp: string;
}

interface EmailPreviewModalProps {
  data: EmailModalData | null;
  onClose: () => void;
}

export function EmailPreviewModal({ data, onClose }: EmailPreviewModalProps) {
  if (!data || !data.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                data.type === 'missed_dose_escalation' || data.type === 'emergency_sos'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Proactive Email Dispatch Receipt
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ✓ Dispatched
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Autonomous Escalate Loop Triggered • Sent to: <strong className="text-slate-800">{data.recipient}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Metadata Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Subject</span>
            <span className="font-bold text-slate-900 truncate max-w-md">{data.subject}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Status</span>
            <span className="font-mono text-emerald-700 font-bold">Delivered (Resend / Autonomous Gateway)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Timestamp</span>
            <span className="font-mono text-slate-700">{new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Live HTML Email Preview Frame */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl p-4 bg-slate-100/60">
          <div
            className="bg-white rounded-xl shadow-xs overflow-hidden"
            dangerouslySetInnerHTML={{ __html: data.htmlPreview }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
