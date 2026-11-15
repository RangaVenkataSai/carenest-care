'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-[#1B8354]" />;
        let border = 'border-[#B7D4C2] bg-white';

        if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-[#D97706]" />;
          border = 'border-amber-200 bg-amber-50/90';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#167C80]" />;
          border = 'border-[#B7D4C2] bg-[#E8F3F3]/90';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 text-xs font-semibold text-[#263238] transition-all animate-in slide-in-from-bottom-5 duration-200 ${border}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#546E7A] hover:text-[#263238] p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
