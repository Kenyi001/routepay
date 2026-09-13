import React from "react";

export type ToastType = "success" | "error" | "info";

interface ToastNotificationProps {
  message: string | null;
  type?: ToastType;
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = "info",
  onClose,
}) => {
  if (!message) return null;

  const bgStyles = {
    success: "bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]",
    error: "bg-[#E84142]/15 border-[#E84142]/40 text-[#E84142]",
    info: "bg-[#1E3A8A]/30 border-blue-400/40 text-blue-300",
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    info: (
      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
  };

  return (
    <div
      className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between font-medium transition-all shadow-lg animate-fadeIn ${bgStyles[type]}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0">{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-base leading-none px-1"
        >
          ×
        </button>
      )}
    </div>
  );
};
