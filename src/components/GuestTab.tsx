import React from "react";

export interface GuestTabProps {
  guestShareUrl: string;
}

export function GuestTab({ guestShareUrl }: GuestTabProps) {
  return (
    <div className="pmw:flex pmw:flex-col pmw:px-5 pmw:pb-6 pmw:pt-[22px]">
      <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">Continue as guest</h2>
      <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
        No account needed. Fill out a request form and we'll get back to you.
      </p>
      <button
        type="button"
        onClick={() => window.open(guestShareUrl, "_blank", "noopener,noreferrer")}
        className="pmw:accent-submit pmw:mt-4 pmw:h-[46px] pmw:rounded-[11px] pmw:border-none pmw:text-[14.5px] pmw:font-bold pmw:text-white"
      >
        Open request form
      </button>
    </div>
  );
}
