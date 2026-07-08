import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../lib/api-client";
import { buildWsUrl, mapSocketChatToTicketCustomerChat, parseCustomerChatEvent } from "../lib/ws-client";
import type { SaasClientConfig, TicketCustomerChat } from "../types";

export interface UseTicketChatResult {
  messages: TicketCustomerChat[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  sendMessage: (message: string) => Promise<boolean>;
}

// TODO: doc only confirms GET/POST /ticket/{id}/customer-chat works for internal
// staff viewing a ticket — confirm a plain requester JWT is authorized here too.
export function useTicketChat(
  config: SaasClientConfig,
  ticketId: string,
  token: string | null,
  onUnauthorized: () => void
): UseTicketChatResult {
  const { baseUrl } = config;
  const [messages, setMessages] = useState<TicketCustomerChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const client = new ApiClient({ baseUrl, token, onUnauthorized });
    client
      .get<TicketCustomerChat[]>(`/ticket/${ticketId}/customer-chat`, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setLoading(false);
        if (result.error) {
          setError(result.error.message);
          return;
        }
        setMessages(result.data ?? []);
      });

    return () => controller.abort();
  }, [baseUrl, ticketId, token, onUnauthorized]);

  // No reconnect/backoff for v1 — a ticket detail view is a bounded session;
  // if the socket drops it just stays down until the view remounts.
  useEffect(() => {
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(buildWsUrl(baseUrl, token));

      socket.addEventListener("open", () => {
        try {
          socket?.send(JSON.stringify({ action: "join", ticketId }));
        } catch {
          // ignore send failures, no reconnect for v1
        }
      });

      socket.addEventListener("message", (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return; // ignore malformed frames
        }
        const chatEvent = parseCustomerChatEvent(parsed, ticketId);
        if (!chatEvent || chatEvent.Type !== 0) return; // only Add is defined for customer chat today
        const mapped = mapSocketChatToTicketCustomerChat(chatEvent.Chat);
        setMessages((prev) => (prev.some((m) => m.id === mapped.id) ? prev : [...prev, mapped]));
      });
    } catch {
      // WebSocket constructor can throw synchronously (e.g. sandboxed iframe, invalid URL)
    }

    return () => socket?.close();
  }, [baseUrl, ticketId, token]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!token) return false;
      setSending(true);
      const formData = new FormData();
      formData.append("message", message);

      const client = new ApiClient({ baseUrl, token, onUnauthorized });
      const result = await client.postForm<TicketCustomerChat>(`/ticket/${ticketId}/customer-chat`, formData);
      setSending(false);
      if (result.error || !result.data) {
        setError(result.error?.message ?? "Failed to send message");
        return false;
      }
      setMessages((prev) =>
        prev.some((m) => m.id === (result.data as TicketCustomerChat).id)
          ? prev
          : [...prev, result.data as TicketCustomerChat]
      );
      return true;
    },
    [baseUrl, ticketId, token, onUnauthorized]
  );

  return { messages, loading, error, sending, sendMessage };
}
