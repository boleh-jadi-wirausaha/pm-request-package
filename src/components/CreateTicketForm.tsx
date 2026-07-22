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
  onDirtyChange?: (dirty: boolean) => void;
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

export function CreateTicketForm({ workspaces, loading, error, onSubmit, onDirtyChange }: CreateTicketFormProps) {
  const problemDefinitions = flattenProblemDefinitions(workspaces);
  const [description, setDescription] = useState("");
  const [problemDefinitionId, setProblemDefinitionId] = useState(problemDefinitions[0]?.id ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [fieldAnswers, setFieldAnswers] = useState<Record<string, string[]>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectedProblemDefinition = problemDefinitions.find((pd) => pd.id === problemDefinitionId);
  const selectedWorkspace = workspaces.find((w) => w.id === selectedProblemDefinition?.workspaceId);
  const formFields = (selectedWorkspace?.formFields ?? []).slice().sort((a, b) => a.order - b.order);

  useEffect(() => {
    setFieldAnswers({});
  }, [selectedWorkspace?.id]);

  useEffect(() => {
    const urls = photos.map((p) => URL.createObjectURL(p));
    setPhotoPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const hasFieldAnswer = Object.values(fieldAnswers).some((values) => !isBlank(values));
    const dirty = description.trim() !== "" || photos.length > 0 || hasFieldAnswer;
    onDirtyChange?.(dirty);
  }, [description, photos, fieldAnswers, onDirtyChange]);

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
      className="pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col pmw:gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        const titleRegex = selectedWorkspace?.ticketTitleRegex;
        if (titleRegex && !new RegExp(titleRegex).test(description)) {
          setValidationError("Description doesn't match the required format.");
          return;
        }
        if (description.trim() === "") {
          setValidationError("Please fill in Note.");
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
      <div className="pmw:shrink-0">
        <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">New request</h2>
        <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
          Tell us what you need help with.
        </p>
      </div>
      <div className="pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col pmw:gap-3.5 pmw:overflow-y-auto pmw:pr-1">
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
          Note<span className="pmw:ml-0.5 pmw:text-red-600">*</span>
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
        <div className="pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
          <label htmlFor="pmw-create-ticket-photos">Photos</label>
          {photos.length > 0 && (
            <div className="pmw:mt-[7px] pmw:flex pmw:flex-wrap pmw:gap-2">
              {photos.map((photo, i) => (
                <div key={`${photo.name}-${i}`} className="pmw:relative pmw:h-16 pmw:w-16 pmw:shrink-0">
                  <img
                    src={photoPreviews[i]}
                    alt={photo.name}
                    onClick={() => setPreviewUrl(photoPreviews[i])}
                    className="pmw:h-full pmw:w-full pmw:cursor-pointer pmw:rounded-[9px] pmw:border pmw:border-[#e2e5ec] pmw:object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove ${photo.name}`}
                    className="pmw:absolute pmw:-right-1.5 pmw:-top-1.5 pmw:flex pmw:h-5 pmw:w-5 pmw:items-center pmw:justify-center pmw:rounded-full pmw:border-none pmw:bg-[#171a22] pmw:text-white"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="pmw:accent-ring pmw:mt-[7px] pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:py-3">
            <input
              id="pmw-create-ticket-photos"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                setPhotos((prev) => [...prev, ...picked]);
                e.target.value = "";
              }}
              className="pmw:block pmw:w-full pmw:text-xs pmw:font-normal pmw:text-[#6a7180]"
            />
          </div>
        </div>
        {previewUrl && (
          <div
            role="button"
            aria-label="Close photo preview"
            onClick={() => setPreviewUrl(null)}
            className="pmw:fixed pmw:inset-0 pmw:z-[999999] pmw:flex pmw:items-center pmw:justify-center pmw:bg-black/80 pmw:p-8"
          >
            <img
              src={previewUrl}
              alt="Photo preview"
              className="pmw:max-h-full pmw:max-w-full pmw:rounded-[10px] pmw:object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              aria-label="Close preview"
              className="pmw:absolute pmw:right-4 pmw:top-4 pmw:flex pmw:h-9 pmw:w-9 pmw:items-center pmw:justify-center pmw:rounded-full pmw:border-none pmw:bg-white/90 pmw:text-[#171a22]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {(validationError || error) && (
        <p className="pmw:shrink-0 pmw:text-xs pmw:text-red-600">{validationError ?? error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="pmw:accent-submit pmw:mt-1 pmw:h-[46px] pmw:shrink-0 pmw:rounded-[11px] pmw:border-none pmw:text-[14.5px] pmw:font-bold pmw:text-white pmw:disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
