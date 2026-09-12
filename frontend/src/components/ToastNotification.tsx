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

  const icons = {
    success: "✓",
    error: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between font-medium transition-all shadow-lg animate-fadeIn ${bgStyles[type]}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icons[type]}</span>
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
