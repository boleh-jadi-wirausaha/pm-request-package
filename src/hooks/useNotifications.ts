import { useCallback, useEffect, useRef, useState } from "react";
import { buildWsUrl, parseAnyCustomerChatEvent, parseNotificationEvent } from "../lib/ws-client";
import type { NotificationType, SaasClientConfig } from "../types";

export interface NotificationToastData {
  id: string;
  ticketId: string;
  authorName: string;
  message: string;
  createdDate: string;
  notificationType?: NotificationType;
  entityId?: string;
  entityType?: string;
}

export interface UseNotificationsResult {
  toasts: NotificationToastData[];
  dismiss: (id: string) => void;
}

const TOAST_LIFETIME_MS = 6000;

// TODO: unverified backend assumption — no per-ticket {action:"join"} is sent here,
// unlike useTicketChat.ts. Assumes the server pushes events for all of the
// authenticated user's tickets over this connection just from the token. If
// notifications never arrive, the fix is to join every ticket id explicitly.
export function useNotifications(
  config: SaasClientConfig,
  token: string | null,
  activeTicketId: string | null
): UseNotificationsResult {
  const { baseUrl } = config;
  const [toasts, setToasts] = useState<NotificationToastData[]>([]);
  const activeTicketIdRef = useRef(activeTicketId);
  activeTicketIdRef.current = activeTicketId;

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // No reconnect/backoff for v1 — mirrors useTicketChat.ts's stance.
  useEffect(() => {
    if (!token) return;
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(buildWsUrl(baseUrl, token));
      socket.addEventListener("message", (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          throw new Error("Failed to parse WebSocket message as JSON: " + event.data);
        }

        const chatEvent = parseAnyCustomerChatEvent(parsed);
        if (chatEvent) {
          if (chatEvent.chat.isCustomer) return; // only notify on staff replies
          if (chatEvent.ticketId === activeTicketIdRef.current) return; // already visible in open chat

          const toast: NotificationToastData = {
            id: chatEvent.chat.id,
            ticketId: chatEvent.ticketId,
            authorName: chatEvent.chat.authorName,
            message: chatEvent.chat.message,
            createdDate: chatEvent.chat.createdDate,
          };
          setToasts((prev) => (prev.some((t) => t.id === toast.id) ? prev : [...prev, toast]));
          setTimeout(() => dismiss(toast.id), TOAST_LIFETIME_MS);
          return;
        }

        console.log(parsed)
        const notification = parseNotificationEvent(parsed);
        if (!notification) return;

        const toast: NotificationToastData = {
          id: notification.id,
          ticketId: notification.entityId,
          authorName: notification.title,
          message: notification.message,
          createdDate: notification.createdDate,
          notificationType: notification.type,
          entityId: notification.entityId,
          entityType: String(notification.entityType),
        };
        setToasts((prev) => (prev.some((t) => t.id === toast.id) ? prev : [...prev, toast]));
        setTimeout(() => dismiss(toast.id), TOAST_LIFETIME_MS);
      });
    } catch {
      // WebSocket constructor can throw synchronously (e.g. sandboxed iframe, invalid URL)
    }

    return () => {
      if (!socket) return;
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener("open", () => socket?.close());
      } else {
        socket.close();
      }
    };
  }, [baseUrl, token, dismiss]);

  return { toasts, dismiss };
}
