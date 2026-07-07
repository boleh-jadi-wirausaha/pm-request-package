import { DEFAULT_BASE_URL } from "./api-client";
import type { TicketCustomerChat } from "../types";

export function buildWsUrl(baseUrl: string | undefined, token: string | null): string {
  const base = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  const url = new URL(`${wsBase}/ws`);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

export interface CustomerChatSocketEventRaw {
  TicketId: string;
  Chat: {
    Id: string;
    Message: string;
    CreatedDate: string;
    AuthorName: string;
    IsCustomer: boolean;
    ImageUrl: string | null;
    HasImage: boolean;
    ReplyToId: string | null;
    ReplyToMessage: string | null;
    ReplyToSenderName: string | null;
  };
  Type: number; // 0 = Add, 1 = Delete (delete not sent for customer chat today)
}

export function parseCustomerChatEvent(raw: unknown, ticketId: string): CustomerChatSocketEventRaw | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.TicketId !== "string" || r.TicketId !== ticketId) return null;
  if (typeof r.Type !== "number") return null;
  const chat = r.Chat as Record<string, unknown> | undefined;
  if (!chat || typeof chat.Id !== "string" || typeof chat.Message !== "string") return null;
  return r as unknown as CustomerChatSocketEventRaw;
}

export function mapSocketChatToTicketCustomerChat(
  chat: CustomerChatSocketEventRaw["Chat"]
): TicketCustomerChat {
  return {
    id: chat.Id,
    message: chat.Message,
    createdDate: chat.CreatedDate,
    authorName: chat.AuthorName,
    isCustomer: chat.IsCustomer,
    imageUrl: chat.ImageUrl ?? undefined,
    hasImage: chat.HasImage,
    replyToId: chat.ReplyToId ?? undefined,
    replyToMessage: chat.ReplyToMessage ?? undefined,
    replyToSenderName: chat.ReplyToSenderName ?? undefined,
  };
}
