# pm-request-widget

Embeddable React widget for a customer's website. Talks to the "Request Workspace" feature of the user's other SaaS project. **Read `request-workspace.md` first** — it's the reference doc for that backend's endpoints/auth model; this package is an integration against it.

## Status

UI/component implemented (login, ticket list, create ticket, ticket detail + chat). Not published to npm — do NOT run `npm publish` unless the user explicitly asks.

## Architecture

- `src/PMWidget.tsx` — fab + panel shell (portal, corner positioning, escape-to-close), internal router: not-authenticated → `LoginForm`; authenticated → tickets list / create-ticket form / ticket detail.
- `src/hooks/` — `useAuth`, `useWorkspace`, `useTickets`, `useCreateTicket`, `useTicketChat`. Each wraps `src/lib/api-client.ts` (fetch wrapper, `{ data?, error? }` resolve-never-throw pattern, Bearer auth, 401 handling).
- `src/components/` — `LoginForm`, `TicketList`, `TicketDetail`, `ChatPanel`, `CreateTicketForm`.
- `src/types.ts` — domain types (`Ticket`, `Workspace`, `ProblemDefinition`, `TicketCustomerChat`, etc).

## Confirmed design decisions (don't re-litigate these)

- **Auth**: real email/password login form in-widget, `POST /api/end/auth/signIn` — not an API-key/domain-allowlist model. Backend has no public API-key scheme, only JWT-bearer.
- **Chat**: uses `/ticket/{id}/customer-chat` with the requester's own JWT (not the separate guest/share-token flow described in `request-workspace.md` §6b).
- **Scope**: widget targets one fixed `organizationId` passed as a prop. Ticket creation lets the requester pick any workspace in that org (`CreateTicketForm` receives the full `Workspace[]` list from `useWorkspace`); ticket list is org-wide and shows the user's own active tickets only.
- **Session**: JWT cached in `localStorage`, keyed per `organizationId`, so users aren't asked to re-login every page load.

## Styling: Tailwind, inlined into the JS bundle

Tailwind v4, all classes prefixed `pmw-` (avoids clobbering host page styles). Pipeline:
1. `npm run build:css` runs the `tailwindcss` CLI on `src/tailwind-input.css` → `src/styles.generated.css` (gitignored, generated).
2. `tsup.config.ts` sets an esbuild `text` loader for `.css`, so `PMWidget.tsx`'s `import compiledStyles from "./styles.generated.css"` becomes a plain JS string in the built output.
3. `PMWidget` injects that string into a `<style>` tag on mount.

Net effect: consumers get fully self-contained styling with zero config — no separate CSS import, no host-app Tailwind setup needed. `src/css.d.ts` declares the `*.css` module type so this typechecks.

## Demo quirk

`demo/` depends on the package via `"pm-request-widget": "file:.."` and imports from `"pm-request-widget"`, **not** raw `src/`. This is required, not incidental — the CSS-inlining trick only behaves consistently when the demo consumes the built `dist` output (same as a real consumer would); importing raw `src/PMWidget.tsx` into Vite would let Vite's own CSS plugin intercept the `.css` import instead of treating it as inlined text, breaking the built-package behavior. `npm run demo` already chains `npm run build` first — always let it, don't skip to `vite` directly on stale `dist`.

## Known unresolved backend assumptions

These are guesses/TODOs, not verified against the real backend (see README "Known unknowns" + inline `TODO` comments):
- `src/types.ts` — `LoginResponse` shape assumed `{ accessToken }`; real field name unconfirmed.
- `src/hooks/useTickets.ts` — ticket-list endpoint (`GET /request-workspace/{workspaceId}/ticket`) is a guess; `request-workspace.md` doesn't document any "list tickets" endpoint at all.
- `src/hooks/useTicketChat.ts` — unconfirmed whether a plain requester JWT (not internal staff) is authorized on `/ticket/{id}/customer-chat`.

If the user reports one of these is wrong, that's expected — fix the path/shape in the relevant hook, it's not a regression.

## Commands

- `npm run build` — `build:css` (tailwindcss CLI) then `tsup`.
- `npm run dev` — same, in watch mode.
- `npm run demo` — build, `npm install` in `demo/` (picks up the `file:` link), then `vite` dev server.
