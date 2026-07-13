import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../lib/api-client";
import type { PagedResult, SaasClientConfig, Ticket } from "../types";

export interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  bumpUnread: (ticketId: string) => void;
  clearUnread: (ticketId: string) => void;
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
        setTickets(result.data?.items ?? []);
      });

    return () => controller.abort();
  }, [baseUrl, token, onUnauthorized, refetchIndex]);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  // Bumps the badge locally instead of refetching the whole list. Callers (see PMWidget.tsx)
  // drive this off the notifications socket rather than a socket owned by this hook —
  // PrivateSocketManager keeps only one connection per user, so a second socket here would
  // get silently evicted whenever useNotifications' socket connects.
  const bumpUnread = useCallback((ticketId: string) => {
    setTickets((prev) => {
      const target = prev.find((t) => t.id === ticketId);
      if (!target) return prev;
      const bumped: Ticket = {
        ...target,
        customerChatUnreadCount: (target.customerChatUnreadCount ?? 0) + 1,
        lastCustomerChatAt: new Date().toISOString(),
      };
      // WhatsApp-style: the ticket with the newest activity moves to the top.
      return [bumped, ...prev.filter((t) => t.id !== ticketId)];
    });
  }, []);

  // Mirrors the read-receipt the backend writes when the ticket's customer chat is fetched
  // (see TicketHandler.GetCustomerChat / MarkCustomerChatRead) — call this when a ticket is opened.
  const clearUnread = useCallback((ticketId: string) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, customerChatUnreadCount: 0 } : t)));
  }, []);

  return { tickets, loading, error, refetch, bumpUnread, clearUnread };
}
