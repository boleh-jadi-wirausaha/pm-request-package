import React, { useState } from "react";
import type { Workspace } from "../types";

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

export function CreateTicketForm({ workspaces, loading, error, onSubmit }: CreateTicketFormProps) {
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const selectedWorkspace = workspaces.find((w) => w.id === workspaceId);
  const problemDefinitions = selectedWorkspace?.problemDefinitions ?? [];
  const [problemDefinitionId, setProblemDefinitionId] = useState(problemDefinitions[0]?.id ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <form
      className="pmw:flex pmw:flex-col pmw:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const titleRegex = selectedWorkspace?.ticketTitleRegex;
        if (titleRegex && !new RegExp(titleRegex).test(description)) {
          setValidationError("Description doesn't match the required format.");
          return;
        }
        setValidationError(null);
        void onSubmit(description, workspaceId, problemDefinitionId, photos);
      }}
    >
      <h2 className="pmw:text-sm pmw:font-semibold pmw:text-gray-800">New request</h2>
      <label className="pmw:flex pmw:flex-col pmw:gap-1 pmw:text-xs pmw:text-gray-600">
        Workspace
        <select
          value={workspaceId}
          onChange={(e) => {
            setWorkspaceId(e.target.value);
            const nextWorkspace = workspaces.find((w) => w.id === e.target.value);
            setProblemDefinitionId(nextWorkspace?.problemDefinitions?.[0]?.id ?? "");
          }}
          required
          className="pmw:rounded pmw:border pmw:border-gray-300 pmw:px-2 pmw:py-1.5 pmw:text-sm"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.workspaceName}
            </option>
          ))}
        </select>
      </label>
      <label className="pmw:flex pmw:flex-col pmw:gap-1 pmw:text-xs pmw:text-gray-600">
        Category
        <select
          value={problemDefinitionId}
          onChange={(e) => setProblemDefinitionId(e.target.value)}
          required
          className="pmw:rounded pmw:border pmw:border-gray-300 pmw:px-2 pmw:py-1.5 pmw:text-sm"
        >
          {problemDefinitions.map((pd) => (
            <option key={pd.id} value={pd.id}>
              {pd.problemDefinitionText}
            </option>
          ))}
        </select>
      </label>
      <label className="pmw:flex pmw:flex-col pmw:gap-1 pmw:text-xs pmw:text-gray-600">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={selectedWorkspace?.ticketTitlePlaceholder}
          required
          rows={3}
          className="pmw:rounded pmw:border pmw:border-gray-300 pmw:px-2 pmw:py-1.5 pmw:text-sm pmw:outline-none pmw:focus:border-blue-500"
        />
      </label>
      <label className="pmw:flex pmw:flex-col pmw:gap-1 pmw:text-xs pmw:text-gray-600">
        Photos
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          className="pmw:text-xs"
        />
      </label>
      {(validationError || error) && (
        <p className="pmw:text-xs pmw:text-red-600">{validationError ?? error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="pmw:rounded pmw:bg-blue-600 pmw:px-3 pmw:py-1.5 pmw:text-sm pmw:font-medium pmw:text-white pmw:disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
