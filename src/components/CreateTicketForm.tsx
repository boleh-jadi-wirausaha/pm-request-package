import React, { useEffect, useState } from "react";
import type { ProblemDefinition, TicketFieldValueInputDTO, Workspace } from "../types";
import { FormFieldControl } from "./FormFieldControl";

export interface CreateTicketFormProps {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  onSubmit: (
    description: string,
    workspaceId: string,
    problemDefinitionId: string,
    photos: File[],
    fieldValues: TicketFieldValueInputDTO[]
  ) => Promise<boolean>;
}

interface FlatProblemDefinition extends ProblemDefinition {
  workspaceId: string;
}

function flattenProblemDefinitions(workspaces: Workspace[]): FlatProblemDefinition[] {
  return workspaces.flatMap((w) =>
    (w.problemDefinitions ?? []).map((pd) => ({ ...pd, workspaceId: w.id }))
  );
}

function isBlank(values: string[] | undefined): boolean {
  return !values || values.length === 0 || values.every((v) => v.trim() === "");
}

export function CreateTicketForm({ workspaces, loading, error, onSubmit }: CreateTicketFormProps) {
  const problemDefinitions = flattenProblemDefinitions(workspaces);
  const [description, setDescription] = useState("");
  const [problemDefinitionId, setProblemDefinitionId] = useState(problemDefinitions[0]?.id ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [fieldAnswers, setFieldAnswers] = useState<Record<string, string[]>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedProblemDefinition = problemDefinitions.find((pd) => pd.id === problemDefinitionId);
  const selectedWorkspace = workspaces.find((w) => w.id === selectedProblemDefinition?.workspaceId);
  const formFields = (selectedWorkspace?.formFields ?? []).slice().sort((a, b) => a.order - b.order);

  useEffect(() => {
    setFieldAnswers({});
  }, [selectedWorkspace?.id]);

  if (workspaces.length === 0) {
    return (
      <p className="pmw:text-sm pmw:font-medium pmw:text-[#6a7180]">
        No request workspace available in your organization.
      </p>
    );
  }

  if (problemDefinitions.length === 0) {
    return (
      <p className="pmw:text-sm pmw:font-medium pmw:text-[#6a7180]">
        No request categories available in your organization.
      </p>
    );
  }

  return (
    <form
      className="pmw:flex pmw:flex-col pmw:gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        const titleRegex = selectedWorkspace?.ticketTitleRegex;
        if (titleRegex && !new RegExp(titleRegex).test(description)) {
          setValidationError("Description doesn't match the required format.");
          return;
        }
        const missingRequired = formFields.some(
          (field) => field.isRequired && isBlank(fieldAnswers[field.id])
        );
        if (missingRequired) {
          setValidationError("Please fill in all required fields.");
          return;
        }
        setValidationError(null);
        const fieldValues: TicketFieldValueInputDTO[] = formFields
          .filter((field) => !isBlank(fieldAnswers[field.id]))
          .map((field) => ({
            workspaceFormFieldId: field.id,
            values: fieldAnswers[field.id],
          }));
        void onSubmit(
          description,
          selectedProblemDefinition!.workspaceId,
          problemDefinitionId,
          photos,
          fieldValues
        );
      }}
    >
      <div>
        <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">New request</h2>
        <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
          Tell us what you need help with.
        </p>
      </div>
      <div className="pmw:flex pmw:max-h-[360px] pmw:flex-col pmw:gap-3.5 pmw:overflow-y-auto pmw:pr-1">
        <label className="pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
          Problem Definitions
          <select
            value={problemDefinitionId}
            onChange={(e) => setProblemDefinitionId(e.target.value)}
            required
            className="pmw:accent-ring pmw:mt-[7px] pmw:h-11 pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none"
          >
            {problemDefinitions.map((pd) => (
              <option key={pd.id} value={pd.id}>
                {pd.problemDefinitionText}
              </option>
            ))}
          </select>
        </label>
        <label className="pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
          Note
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`${selectedWorkspace?.ticketTitlePlaceholder ?? "Enter ticket description"
              } | Please make sure you follow the required format.`}
            required
            rows={3}
            className="pmw:accent-ring pmw:mt-[7px] pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:py-2.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none"
          />
        </label>
        {formFields.map((field) => (
          <label key={field.id} className="pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
            {field.label}
            {field.isRequired && <span className="pmw:ml-0.5 pmw:text-red-600">*</span>}
            <FormFieldControl
              field={field}
              values={fieldAnswers[field.id] ?? []}
              onChange={(values) => setFieldAnswers((prev) => ({ ...prev, [field.id]: values }))}
            />
          </label>
        ))}
        <label className="pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
          Photos
          <div className="pmw:accent-ring pmw:w-36 pmw:mt-[7px] pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:py-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              className="pmw:block pmw:w-full pmw:text-xs pmw:font-normal pmw:text-[#6a7180]"
            />
          </div>
        </label>
      </div>
      {(validationError || error) && (
        <p className="pmw:text-xs pmw:text-red-600">{validationError ?? error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="pmw:accent-submit pmw:mt-1 pmw:h-[46px] pmw:rounded-[11px] pmw:border-none pmw:text-[14.5px] pmw:font-bold pmw:text-white pmw:disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
