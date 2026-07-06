# Request Workspace — How It Works

Reference doc for building an external integration (e.g. an embeddable widget in another project) against this app's Request Workspace feature.

## 1. What it is

A `Workspace` (`models/data/workspace.ts`) with `type: "Request"`. Lives under an `Organization`, holds `problemDefinitions` (categories) and tickets submitted against it. Distinct from `Division`/`Personal`/`Team` workspaces — request workspaces are the "public-facing intake" type.

```ts
Workspace {
  id, workspaceName, workspaceDescription?, type: "Request" | ...,
  organizationId?, ongoingTicketCount, hasGuest, guestAccess?: "View"|"Edit"|null,
  ticketTitlePlaceholder?, ticketTitleRegex?,
  problemDefinitions?: ProblemDefinition[],   // { id, problemDefinitionText, workspaceId }
  ticketStates?: TicketState[]
}
```

## 2. Auth model (base for everything)

All requests go through an axios wrapper: `services/base-service.ts`.
- Base URL: `NEXT_PUBLIC_BACKEND_URL` (default `https://request.itel.com.sg/request-api/`)
- Every service is constructed with a token: `new RequestWorkspaceService(accessToken)` → sets `Authorization: Bearer <token>` manually per instantiation (no global interceptor)
- Token comes from NextAuth session: `session.user.accessToken`, set in `pages/api/auth/[...nextauth].ts` after backend login
- Every call resolves `{ data?: T; error?: { message, code } }` — never throws. 401 triggers `signOut()`.

**Implication for external integration:** there is currently only JWT-bearer auth (internal logged-in users) or a separate one-off guest link-token (see §6). No public API-key scheme exists in the backend today.

## 3. Listing workspaces (`services/request-workspace-service.ts`)

```
GET /request-workspace/by-organization/{organizationId} → Workspace[]
```
Frontend caches this in a zustand store (`stores/request-workspace-store.ts`) keyed by org id, refetches only when org changes (`components/sidebar/workspace/request/request-section.tsx:62-71`).

## 4. Creating/editing a workspace (admin-only, gated by `useIsSuperAdmin()`)

```
POST /request-workspace/by-organization/{organizationId}   CreateRequestWorkspaceDTO → Workspace
PUT  /request-workspace/{workspaceId}                        UpdateRequestWorkspaceDTO → Workspace
```
```ts
CreateRequestWorkspaceDTO {
  workspaceName, workspaceDescription?,
  problemDefinitions: string[],      // free-text category list
  memberUserIds?: string[],          // who can manage this workspace's tickets, create-only field
  ticketTitlePlaceholder?, ticketStateTemplateId?
}
```
Forms: `app/(content)/entity/_components/requests/create-request-workspace-modal.tsx` / `edit-request-workspace-modal.tsx`, validated with zod (`models/schema/request-workspace.dto.ts`).

## 5. Creating a ticket in a workspace — the core "submit a request" action

```
POST /request-workspace/{workspaceId}/ticket   (multipart/form-data)
```
```ts
CreateRequestWorkspaceTicketDTO {
  description: string,
  problemDefinitionId: string,
  ticketUrgencyId?: string,
  handlerId?: string,
  deadline?: string,
  photos?: File[]
}
```
→ returns a `Ticket`. Reference implementation of the form: `components/ticket/modals/forms/create-request-ticket-form.tsx` — it:
1. Fetches workspaces for the org + urgency list
2. User picks workspace → problem definition → fills description/urgency/photos
3. Client-side validates description against `selectedWorkspace.ticketTitleRegex` if the workspace enforces a title format
4. On success, bumps local unread/count stores (`useWorkspaceCountStore`) and appends the new ticket to context state

## 6. Checking status / chatting afterward — two different, non-overlapping mechanisms exist today

### a) Internal "Chat with Requester" tab

`components/ticket/detail/ticket/requester-chat-panel.tsx`:
```
GET  /ticket/{ticketId}/customer-chat → TicketCustomerChat[]
POST /ticket/{ticketId}/customer-chat  (multipart: message, image?, replyToId?) → TicketCustomerChat
```
```ts
TicketCustomerChat {
  id, message, createdDate, authorName, isCustomer: boolean,
  imageUrl?, hasImage, replyToId?, replyToMessage?, replyToSenderName?
}
```
Fetch-on-mount only — no realtime/socket wiring, just a plain GET on open + local append after POST. This is JWT-bearer, i.e. currently only reachable by a logged-in internal user viewing the ticket — there's no external/customer-facing counterpart wired to this exact endpoint pair yet.

### b) Guest ticket flow

`services/ticket-guest-service.ts` — a separate channel, token-based instead of JWT:
```
GET   /tickets/guest/resolve?access=<token>          → ticket + guest identity
GET   /tickets/guest/{ticketId}?access=<token>        → Ticket
GET   /tickets/guest/{ticketId}/chats?access=<token>  → TicketChatDTO[]   (different model than TicketCustomerChat!)
POST  /tickets/guest/{ticketId}/chats?access=<token>  → TicketChatDTO
PATCH /tickets/guest/{ticketId}?access=<token>        → Ticket
```
This chat uses `TicketChatDTO` (richer: `creator`, `mentions`, etc.) — the same model as the internal team "Activity" tab, not `TicketCustomerChat`. It's also the only channel with realtime push, via a raw WebSocket (`hooks/socket/use-ticket-chat-socket.ts`, `wss://.../ws`, join message `{action:"join", ticketId}` — no token in the socket handshake itself).

**Gap:** the `access` token for this guest flow is only ever minted when an internal team member invites a guest by email after the ticket already exists (`services/ticket-guest-admin-service.ts` → `POST /tickets/guest-admin/{ticketId}/invite`). Submitting a ticket through the existing anonymous public form (`app/guest/request/page.tsx` → `services/request-form-service.ts` → `POST /request-form?share=<token>`) returns only the plain `Ticket`, no access/status token — so today, a public submitter has no self-service way to check status or chat afterward.

## 7. Workspace "public link" precedent

`services/share-links-service.ts` + `components/workspace/public-request-link-dialog.tsx`:
```
POST /share-links                      (JWT, admin) → creates a share token for resourceType "request-form"
GET  /share-links/resolve?share=<tok>  (public)      → { access, resourceId, resourceType, organizationName, organizationLogo }
```
This is how the existing anonymous request-form page resolves which workspace to submit into from a public link, without exposing the org's internal auth.

## Summary table

| Action | Endpoint | Auth |
|---|---|---|
| List workspaces | `GET /request-workspace/by-organization/{orgId}` | JWT |
| Create/edit workspace | `POST/PUT /request-workspace/...` | JWT (admin) |
| Create ticket | `POST /request-workspace/{id}/ticket` | JWT |
| Customer chat (internal view) | `GET/POST /ticket/{id}/customer-chat` | JWT |
| Guest ticket view/chat | `GET/POST /tickets/guest/{id}/...?access=` | opaque guest token (invite-only, post-hoc) |
| Public anonymous submit | `POST /request-form?share=` | share token, no status/chat return |
| Resolve public link | `GET /share-links/resolve?share=` | share token |
