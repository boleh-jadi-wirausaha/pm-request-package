import React from "react";
import type { WorkspaceFormFieldDTO } from "../types";

export interface FormFieldControlProps {
  field: WorkspaceFormFieldDTO;
  values: string[];
  onChange: (values: string[]) => void;
}

const inputClasses =
  "pmw:accent-ring pmw:mt-[7px] pmw:h-11 pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none";

export function FormFieldControl({ field, values, onChange }: FormFieldControlProps) {
  if (field.type === "Text") {
    return (
      <input
        type="text"
        value={values[0] ?? ""}
        onChange={(e) => onChange([e.target.value])}
        required={field.isRequired}
        className={inputClasses}
      />
    );
  }

  if (field.type === "Toggle") {
    const checked = values[0] === "true";
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange([checked ? "false" : "true"])}
        className={`pmw:mt-[7px] pmw:flex pmw:h-11 pmw:w-full pmw:items-center pmw:justify-between pmw:rounded-[11px] pmw:border-[1.5px] pmw:px-3.5 pmw:text-sm pmw:font-medium pmw:transition-colors ${checked
          ? "pmw:border-transparent pmw:bg-[color-mix(in_srgb,var(--accent)_12%,#fff)] pmw:text-[var(--accent)]"
          : "pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:text-[#6a7180]"
          }`}
      >
        {checked ? "Yes" : "No"}
        <span
          className={`pmw:relative pmw:h-6 pmw:w-11 pmw:flex-none pmw:rounded-full pmw:transition-colors ${checked ? "pmw:bg-[var(--accent)]" : "pmw:bg-[#d7dae1]"
            }`}
        >
          <span
            className={`pmw:absolute pmw:top-0.5 pmw:h-5 pmw:w-5 pmw:rounded-full pmw:bg-white pmw:shadow pmw:transition-transform ${checked ? "pmw:translate-x-[22px]" : "pmw:translate-x-0.5"
              }`}
          />
        </span>
      </button>
    );
  }

  if (field.type === "Date") {
    return (
      <input
        type="date"
        value={values[0] ?? ""}
        onChange={(e) => onChange([e.target.value])}
        required={field.isRequired}
        className={inputClasses}
      />
    );
  }

  if (field.type === "MultipleChoice") {
    return (
      <div className="pmw:mt-[7px] pmw:flex pmw:flex-wrap pmw:gap-1.5">
        {(field.options ?? []).map((option, i) => {
          const selected = values[0] === option;
          const letter = String.fromCharCode(65 + i);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(selected ? [] : [option])}
              aria-pressed={selected}
              className={`pmw:rounded-md pmw:text-left pmw:border-[1.5px] pmw:px-3.5 pmw:py-2 pmw:text-[13px] pmw:font-medium pmw:transition-colors ${selected
                ? "pmw:border-transparent pmw:bg-[var(--accent)] pmw:text-white"
                : "pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:text-[#3a3f4a]"
                }`}
            >
              {letter}. {option}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pmw:mt-[7px] pmw:flex pmw:flex-col pmw:gap-1.5">
      {(field.options ?? []).map((option) => {
        const checked = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() =>
              onChange(checked ? values.filter((v) => v !== option) : [...values, option])
            }
            aria-pressed={checked}
            className={`pmw:accent-card-hover pmw:flex pmw:items-center pmw:justify-between pmw:rounded-[10px] pmw:border-[1.5px] pmw:px-3.5 pmw:py-2.5 pmw:text-left pmw:text-sm pmw:font-normal pmw:transition-colors ${checked
              ? "pmw:border-[color-mix(in_srgb,var(--accent)_35%,#e2e5ec)] pmw:bg-[color-mix(in_srgb,var(--accent)_6%,#fff)] pmw:text-[#171a22]"
              : "pmw:border-[#e2e5ec] pmw:bg-white pmw:text-[#171a22]"
              }`}
          >
            {option}
            <span
              className={`pmw:flex pmw:h-[18px] pmw:w-[18px] pmw:flex-none pmw:items-center pmw:justify-center pmw:rounded-[5px] pmw:border-[1.5px] pmw:text-[11px] pmw:font-bold pmw:transition-colors ${checked
                ? "pmw:border-[var(--accent)] pmw:bg-[var(--accent)] pmw:text-white"
                : "pmw:border-[#d7dae1] pmw:bg-white pmw:text-transparent"
                }`}
            >
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}
