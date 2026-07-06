import { useCallback, useState } from "react";
import { ApiClient } from "../lib/api-client";
import type { CreateRequestWorkspaceTicketDTO, SaasClientConfig, Ticket } from "../types";

export interface UseCreateTicketResult {
  createTicket: (dto: CreateRequestWorkspaceTicketDTO) => Promise<Ticket | null>;
  loading: boolean;
  error: string | null;
}

export function useCreateTicket(
  config: SaasClientConfig,
  token: string | null,
  onUnauthorized: () => void
): UseCreateTicketResult {
  const { baseUrl } = config;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = useCallback(
    async (dto: CreateRequestWorkspaceTicketDTO) => {
      if (!token) return null;
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("description", dto.description);
      formData.append("problemDefinitionId", dto.problemDefinitionId);
      if (dto.ticketUrgencyId) formData.append("ticketUrgencyId", dto.ticketUrgencyId);
      if (dto.handlerId) formData.append("handlerId", dto.handlerId);
      if (dto.deadline) formData.append("deadline", dto.deadline);
      for (const photo of dto.photos ?? []) formData.append("photos", photo);

      const client = new ApiClient({ baseUrl, token, onUnauthorized });
      const result = await client.postForm<Ticket>(`/request-workspace/${dto.workspaceId}/ticket`, formData);
      setLoading(false);
      if (result.error) {
        setError(result.error.message);
        return null;
      }
      return result.data ?? null;
    },
    [baseUrl, token, onUnauthorized]
  );

  return { createTicket, loading, error };
}
