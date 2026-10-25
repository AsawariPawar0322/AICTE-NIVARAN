import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        let bg = 'bg-white';
        let border = 'border-[#CBD2DC]';
        let Icon = Info;
        let iconColor = 'text-[#1D4ED8]';

        if (toast.type === 'success') {
          border = 'border-[#86EFAC]';
          Icon = CheckCircle2;
          iconColor = 'text-[#166534]';
        } else if (toast.type === 'warning') {
          border = 'border-[#FCD34D]';
          Icon = AlertTriangle;
          iconColor = 'text-[#92400E]';
        } else if (toast.type === 'danger') {
          border = 'border-[#FCA5A5]';
          Icon = AlertCircle;
          iconColor = 'text-[#B91C1C]';
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white border ${border} rounded-[8px] shadow-md transition-all`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1A1F2B] uppercase tracking-wide">
                  {toast.title}
                </h4>
                <span className="text-[10px] text-[#4B5565]">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-[#4B5565] mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-[#4B5565] hover:text-[#1A1F2B] hover:bg-[#F3F5F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
