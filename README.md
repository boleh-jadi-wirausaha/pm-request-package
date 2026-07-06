# pm-request-widget

React widget that embeds Request Workspace access (login, submit requests, track tickets, chat with the handler) in a customer website.

## Install (local dev, not published yet)

```bash
npm install
npm run build
npm pack   # produces .tgz for local testing in another app
```

## Usage

```tsx
import { PMWidget } from "pm-request-widget";

function App() {
  return (
    <PMWidget
      baseUrl="https://request.itel.com.sg/request-api/"
      organizationId="org-id"
      workspaceId="request-workspace-id"
      corner="bottom-right"
    />
  );
}
```

The widget is self-contained: end users log in with email/password, submit a request against the configured workspace's problem definitions, see their active tickets, and chat with the assigned handler on a ticket. Styling is bundled (Tailwind, `pmw-` prefixed classes, injected at runtime) — no separate CSS import or host-app Tailwind config needed.

**Auth note:** the JWT obtained on login is cached in `localStorage` per workspace so users aren't asked to re-authenticate on every page load.

## Known unknowns (confirm against the real backend before production use)

- `LoginResponse` field names (assumed `{ accessToken }`) — see `src/types.ts`.
- Whether a plain requester JWT (not just internal staff) is authorized on `GET/POST /ticket/{id}/customer-chat`.
- The ticket-list endpoint (`GET /request-workspace/{workspaceId}/ticket`) is not documented anywhere and is a guess — see `src/hooks/useTickets.ts`.

## Status

UI/component under active development. Not published to npm.
