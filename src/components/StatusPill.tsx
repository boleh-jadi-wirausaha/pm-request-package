import React from "react";
import { getStatusPillVariant, type PillVariant } from "../lib/format";

export interface StatusPillProps {
  stateName?: string;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  accent: "pmw:pill-accent",
  green: "pmw:bg-[#e7f7ee] pmw:text-[#0f9d58]",
  orange: "pmw:bg-[#fdf1e1] pmw:text-[#c26a12]",
  gray: "pmw:bg-[#f3f4f7] pmw:text-[#5b616e]",
};

export function StatusPill({ stateName }: StatusPillProps) {
  if (!stateName) return null;
  const variant = getStatusPillVariant(stateName);

  return (
    <span
      className={`pmw:inline-flex pmw:h-[22px] pmw:items-center pmw:gap-[5px] pmw:rounded-[999px] pmw:px-[9px] pmw:text-[11.5px] pmw:font-bold ${VARIANT_CLASSES[variant]}`}
    >
      <span className="pmw:h-[6px] pmw:w-[6px] pmw:rounded-full pmw:bg-current" />
      {stateName}
    </span>
  );
}
