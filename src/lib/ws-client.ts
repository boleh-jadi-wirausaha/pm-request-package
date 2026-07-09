import { DEFAULT_BASE_URL } from "./api-client";
import type { NotificationType, TicketCustomerChat } from "../types";

export function buildWsUrl(baseUrl: string | undefined, token: string | null): string {
  const base = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  const url = new URL(`${wsBase}/ws`);

  if (token) url.searchParams.set("token", token);

  return url.toString();
}

// Raw socket event (normalized to camelCase)
export interface CustomerChatSocketEventRaw {
  ticketId: string;
  chat: {
    id: string;
    message: string;
    createdDate: string;
    authorName: string;
    isCustomer: boolean;
    imageUrl: string | null;
    hasImage: boolean;
    replyToId: string | null;
    replyToMessage: string | null;
    replyToSenderName: string | null;
  };
  type: number; // 0 = Add, 1 = Delete
}

// Parse and normalize PascalCase → camelCase
export function parseCustomerChatEvent(
  raw: unknown,
  ticketId: string
): CustomerChatSocketEventRaw | null {
  const event = parseAnyCustomerChatEvent(raw);
  if (!event || event.ticketId !== ticketId) return null;
  return event;
}

export function parseAnyCustomerChatEvent(raw: unknown): CustomerChatSocketEventRaw | null {
  if (typeof raw !== "object" || raw === null) return null;

  const r = raw as Record<string, any>;

  if (typeof r.TicketId !== "string") return null;
  if (typeof r.Type !== "number") return null;

  const chat = r.Chat as Record<string, any> | undefined;
  if (!chat || typeof chat.Id !== "string" || typeof chat.Message !== "string") return null;

  return {
    ticketId: r.TicketId,
    type: r.Type,
    chat: {
      id: chat.Id,
      message: chat.Message,
      createdDate: chat.CreatedDate,
      authorName: chat.AuthorName,
      isCustomer: chat.IsCustomer,
      imageUrl: chat.ImageUrl ?? null,
      hasImage: chat.HasImage,
      replyToId: chat.ReplyToId ?? null,
      replyToMessage: chat.ReplyToMessage ?? null,
      replyToSenderName: chat.ReplyToSenderName ?? null,
    },
  };
}

// Notification events arrive wrapped: {type: "notification", data: {...camelCase fields}}
const NOTIFICATION_TYPES: NotificationType[] = [
  "TicketAssigned",
  "TicketStateChanged",
  "TicketApprovalRequested",
  "TicketApprovalDecided",
  "TicketCollaboratorAdded",
  "TicketMentioned",
  "SubtaskAssigned",
  "SubtaskStateChanged",
  "SubtaskApprovalRequested",
  "SubtaskApprovalDecided",
  "SubtaskMentioned",
  "MomInvited",
  "TicketChatted",
  "GroupChatMentioned",
  "TicketCustomerMessage",
  "TicketCustomerChatted",
];

export interface NotificationSocketEventRaw {
  id: string;
  userId: string;
  organizationId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  entityId: string;
  entityType: number;
  isRead: boolean;
  createdDate: string;
}

export function parseNotificationEvent(raw: unknown): NotificationSocketEventRaw | null {
  if (typeof raw !== "object" || raw === null) return null;

  const envelope = raw as Record<string, any>;
  if (envelope.type !== "notification") return null;

  const d = envelope.data as Record<string, any> | undefined;
  if (!d || typeof d.id !== "string" || typeof d.title !== "string" || typeof d.message !== "string") {
    return null;
  }

  return {
    id: d.id,
    userId: d.userId,
    organizationId: d.organizationId ?? null,
    type: NOTIFICATION_TYPES[d.type] ?? d.type,
    title: d.title,
    message: d.message,
    entityId: d.entityId,
    entityType: d.entityType,
    isRead: d.isRead,
    createdDate: d.createdDate,
  };
}

export function mapSocketChatToTicketCustomerChat(
  chat: CustomerChatSocketEventRaw["chat"]
): TicketCustomerChat {
  return {
    id: chat.id,
    message: chat.message,
    createdDate: chat.createdDate,
    authorName: chat.authorName,
    isCustomer: chat.isCustomer,
    imageUrl: chat.imageUrl ?? undefined,
    hasImage: chat.hasImage,
    replyToId: chat.replyToId ?? undefined,
    replyToMessage: chat.replyToMessage ?? undefined,
    replyToSenderName: chat.replyToSenderName ?? undefined,
  };
}