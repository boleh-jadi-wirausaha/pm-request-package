import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../lib/api-client";
import type { PagedResult, SaasClientConfig, Ticket } from "../types";

export interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// TODO: this endpoint is not documented in request-workspace.md — guessed as
// GET /request-workspace/{workspaceId}/ticket returning Ticket[]. Confirm against
// the real backend and adjust the path/filter below once known.
export function useTickets(
  config: SaasClientConfig,
  token: string | null,
  onUnauthorized: () => void
): UseTicketsResult {
  const { baseUrl, organizationId } = config;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const client = new ApiClient({ baseUrl, token, onUnauthorized });
    client
      .get<PagedResult<Ticket>>(`/request-workspace/tickets/mine?organizationId=${organizationId}`, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setLoading(false);
        if (result.error) {
          setError(result.error.message);
          return;
        }
        const active = (result.data?.items ?? []).filter((t) => !isTerminalState(t));
        setTickets(active);
      });

    return () => controller.abort();
  }, [baseUrl, token, onUnauthorized, refetchIndex]);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  return { tickets, loading, error, refetch };
}

function isTerminalState(ticket: Ticket): boolean {
  const name = ticket.ticketState?.stateName?.toLowerCase() ?? "";
  return name === "closed" || name === "resolved" || name === "done" || name === "cancelled";
}
