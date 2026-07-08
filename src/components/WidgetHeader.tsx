import React from "react";

export interface WidgetHeaderProps {
  brandName: string;
  onClose: () => void;
  onBack?: () => void;
}

export function WidgetHeader({ brandName, onClose, onBack }: WidgetHeaderProps) {
  return (
    <div className="pmw:flex pmw:items-center pmw:gap-3 pmw:border-b pmw:border-[#eef0f4] pmw:px-[18px] pmw:py-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="pmw:accent-back-btn pmw:-ml-2 pmw:flex pmw:items-center pmw:gap-1.5 pmw:rounded-[9px] pmw:border-none pmw:bg-transparent pmw:px-2 pmw:py-1.5 pmw:text-[13.5px] pmw:font-semibold pmw:text-[var(--accent)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Tickets
        </button>
      ) : (
        <>
          <div className="pmw:flex pmw:h-[38px] pmw:w-[38px] pmw:items-center pmw:justify-center pmw:rounded-[11px] pmw:bg-[var(--accent)] pmw:brand-icon-shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div className="pmw:leading-tight">
            <div className="pmw:text-[15px] pmw:font-bold pmw:text-[#171a22]">{brandName}</div>
            <div className="pmw:flex pmw:items-center pmw:gap-[5px] pmw:text-xs pmw:font-medium pmw:text-[#6a7180]">
              <span className="pmw:h-[7px] pmw:w-[7px] pmw:rounded-full pmw:bg-[#22c55e] pmw:shadow-[0_0_0_3px_#dcfce7]" />
              Typically replies in minutes
            </div>
          </div>
        </>
      )}
      <a
        href="https://pm.bojawi.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open PM Website"
        className="pmw:ml-auto pmw:flex pmw:h-8 pmw:items-center pmw:gap-1.5 pmw:rounded-[9px] pmw:border-none pmw:bg-[#f3f4f7] pmw:px-2.5 pmw:text-[13px] pmw:font-semibold pmw:text-[#5b616e]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6" />
          <path d="M10 14L21 3" />
        </svg>
        <span>Open PM</span>
      </a>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="pmw:flex pmw:h-8 pmw:w-8 pmw:items-center pmw:justify-center pmw:rounded-[9px] pmw:border-none pmw:bg-[#f3f4f7] pmw:text-[#5b616e]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
