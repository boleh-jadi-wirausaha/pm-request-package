import { useEffect, useState } from "react";
import { ApiClient } from "../lib/api-client";
import type { SaasClientConfig, Workspace } from "../types";

export interface UseWorkspaceResult {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
}

export function useWorkspace(
  config: SaasClientConfig,
  token: string | null,
  onUnauthorized: () => void
): UseWorkspaceResult {
  const { baseUrl, organizationId } = config;
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const client = new ApiClient({ baseUrl, token, onUnauthorized });
    client
      .get<Workspace[]>(`/request-workspace/by-organization/for-request/${organizationId}`, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setLoading(false);
        if (result.error) {
          setError(result.error.message);
          return;
        }
        setWorkspaces(result.data ?? []);
      });

    return () => controller.abort();
  }, [baseUrl, organizationId, token, onUnauthorized]);

  return { workspaces, loading, error };
}
