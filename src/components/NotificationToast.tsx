import React from "react";
import type { NotificationToastData } from "../hooks/useNotifications";

export interface NotificationToastProps {
  toasts: NotificationToastData[];
  onDismiss: (id: string) => void;
  onSelect: (ticketId: string) => void;
}

export function NotificationToast({ toasts, onDismiss, onSelect }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pmw:pointer-events-none pmw:flex pmw:w-80 pmw:max-w-[calc(100vw-3rem)] pmw:flex-col pmw:gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(toast.ticketId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(toast.ticketId);
          }}
          className="pmw:pointer-events-auto pmw:flex pmw:items-start pmw:gap-2 pmw:rounded-[12px] pmw:border pmw:border-[#e7e9ef] pmw:bg-white pmw:p-3 pmw:shadow-[0_8px_24px_rgba(23,26,45,.14)]"
        >
          <div className="pmw:min-w-0 pmw:flex-1">
            <div className="pmw:text-[13px] pmw:font-semibold pmw:text-[#171a22]">{toast.authorName}</div>
            <div className="pmw:truncate pmw:text-[12.5px] pmw:text-[#6a7180]">{toast.message}</div>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            className="pmw:flex pmw:h-6 pmw:w-6 pmw:shrink-0 pmw:items-center pmw:justify-center pmw:rounded-[7px] pmw:border-none pmw:bg-[#f3f4f7] pmw:text-[#5b616e]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
