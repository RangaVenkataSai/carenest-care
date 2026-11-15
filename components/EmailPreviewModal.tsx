'use client';

import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, Calendar, ShieldAlert, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col border border-[#E6E4DC]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                data.type === 'missed_dose_escalation' || data.type === 'emergency_sos'
                  ? 'bg-[#FDF3EF] text-[#D32F2F]'
                  : 'bg-[#E8F3F3] text-[#167C80]'
              }`}
            >
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#263238]">
                  Proactive Email Dispatch Receipt
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0F6F2] text-[#1B8354] border border-[#B7D4C2]">
                  ✓ Dispatched
                </span>
              </div>
              <p className="text-xs text-[#546E7A]">
                Autonomous Escalation Loop Triggered • Recipient: <strong className="text-[#263238]">{data.recipient}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-2 rounded-xl hover:bg-[#F8F7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Bar */}
        <div className="bg-[#F8F7F2] border border-[#E6E4DC] rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#546E7A] font-semibold uppercase text-[10px] tracking-wider">Subject</span>
            <span className="font-bold text-[#263238] truncate max-w-md">{data.subject}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#546E7A] font-semibold uppercase text-[10px] tracking-wider">Delivery Mode</span>
            <span className="font-mono text-[#1B8354] font-bold">Autonomous Gateway • Verified HTML Preview</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#546E7A] font-semibold uppercase text-[10px] tracking-wider">Dispatched Timestamp</span>
            <span className="font-mono text-[#263238]">{new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Rendered HTML Email Frame */}
        <div className="flex-1 overflow-y-auto border border-[#E6E4DC] rounded-2xl p-4 bg-[#F8F7F2]/60">
          <div
            className="bg-white rounded-xl shadow-2xs overflow-hidden"
            dangerouslySetInnerHTML={{ __html: data.htmlPreview }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white font-bold text-xs shadow-xs transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
