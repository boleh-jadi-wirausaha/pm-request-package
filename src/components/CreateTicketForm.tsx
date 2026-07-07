import React, { useState } from "react";
import type { ProblemDefinition, Workspace } from "../types";

export interface CreateTicketFormProps {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  onSubmit: (
    description: string,
    workspaceId: string,
    problemDefinitionId: string,
    photos: File[]
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

export function CreateTicketForm({ workspaces, loading, error, onSubmit }: CreateTicketFormProps) {
  const problemDefinitions = flattenProblemDefinitions(workspaces);
  const [description, setDescription] = useState("");
  const [problemDefinitionId, setProblemDefinitionId] = useState(problemDefinitions[0]?.id ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedProblemDefinition = problemDefinitions.find((pd) => pd.id === problemDefinitionId);
  const selectedWorkspace = workspaces.find((w) => w.id === selectedProblemDefinition?.workspaceId);

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
        setValidationError(null);
        void onSubmit(description, selectedProblemDefinition!.workspaceId, problemDefinitionId, photos);
      }}
    >
      <div>
        <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">New request</h2>
        <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
          Tell us what you need help with.
        </p>
      </div>
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
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`${selectedWorkspace?.ticketTitlePlaceholder} | Please make sure you follow the required format.`}
          required
          rows={3}
          className="pmw:accent-ring pmw:mt-[7px] pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:py-2.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none"
        />
      </label>
      <label className="pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
        Photos
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          className="pmw:mt-[7px] pmw:block pmw:text-xs pmw:font-normal pmw:text-[#6a7180]"
        />
      </label>
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
