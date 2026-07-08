import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CreateTicketForm } from "./components/CreateTicketForm";
import { GuestTab } from "./components/GuestTab";
import { LoginForm } from "./components/LoginForm";
import { TicketDetail } from "./components/TicketDetail";
import { TicketList } from "./components/TicketList";
import { WidgetHeader } from "./components/WidgetHeader";
import { useAuth } from "./hooks/useAuth";
import { useCreateTicket } from "./hooks/useCreateTicket";
import { useTickets } from "./hooks/useTickets";
import { useWorkspace } from "./hooks/useWorkspace";
import type { SaasClientConfig, Ticket } from "./types";
// esbuild "text" loader (configured in tsup.config.ts) inlines this as a string at build time.
import compiledStyles from "./styles.generated.css";

export type PMWidgetCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface PMWidgetProps extends SaasClientConfig {
  corner?: PMWidgetCorner;
  accentColor?: string;
  brandName?: string;
}

function useShadowRoot() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = compiledStyles;
    shadowRoot.appendChild(style);

    const mountPoint = document.createElement("div");
    shadowRoot.appendChild(mountPoint);
    setContainer(mountPoint);

    return () => {
      document.body.removeChild(host);
    };
  }, []);

  return container;
}

function cornerClasses(corner: PMWidgetCorner): string {
  const vertical = corner.startsWith("top") ? "pmw:top-6" : "pmw:bottom-6";
  const horizontal = corner.endsWith("left") ? "pmw:left-6" : "pmw:right-6";
  const direction = corner.startsWith("top") ? "pmw:flex-col" : "pmw:flex-col-reverse";
  const align = corner.endsWith("left") ? "pmw:items-start" : "pmw:items-end";
  return `pmw:fixed ${vertical} ${horizontal} pmw:flex ${direction} ${align} pmw:gap-2`;
}

type View = { name: "list" } | { name: "create" } | { name: "detail"; ticket: Ticket };

function PMWidgetPanel({
  brandName,
  onClose,
  ...config
}: SaasClientConfig & { brandName: string; onClose: () => void }) {
  const auth = useAuth(config);
  const workspace = useWorkspace(config, auth.token, auth.logout);
  const tickets = useTickets(config, auth.token, auth.logout);
  const createTicket = useCreateTicket(config, auth.token, auth.logout);
  const [view, setView] = useState<View>({ name: "list" });
  const [authTab, setAuthTab] = useState<"login" | "guest">("login");

  if (!auth.token) {
    return (
      <>
        <WidgetHeader brandName={brandName} onClose={onClose} />
        {config.guestShareUrl && (
          <div className="pmw:flex pmw:border-b pmw:border-[#e7e9ef] pmw:px-5">
            <button
              type="button"
              onClick={() => setAuthTab("login")}
              className={`pmw:-mb-px pmw:border-b-2 pmw:px-3 pmw:py-2.5 pmw:text-[13.5px] pmw:font-semibold ${
                authTab === "login"
                  ? "pmw:border-[var(--accent)] pmw:text-[#171a22]"
                  : "pmw:border-transparent pmw:text-[#6a7180]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("guest")}
              className={`pmw:-mb-px pmw:border-b-2 pmw:px-3 pmw:py-2.5 pmw:text-[13.5px] pmw:font-semibold ${
                authTab === "guest"
                  ? "pmw:border-[var(--accent)] pmw:text-[#171a22]"
                  : "pmw:border-transparent pmw:text-[#6a7180]"
              }`}
            >
              Guest
            </button>
          </div>
        )}
        {authTab === "guest" && config.guestShareUrl ? (
          <GuestTab guestShareUrl={config.guestShareUrl} />
        ) : (
          <LoginForm onSubmit={auth.login} loading={auth.loading} error={auth.error} />
        )}
      </>
    );
  }

  if (view.name === "detail") {
    return (
      <>
        <WidgetHeader brandName={brandName} onClose={onClose} onBack={() => setView({ name: "list" })} />
        <TicketDetail config={config} ticket={view.ticket} token={auth.token} onUnauthorized={auth.logout} />
      </>
    );
  }

  if (view.name === "create") {
    return (
      <>
        <WidgetHeader brandName={brandName} onClose={onClose} />
        <div className="pmw:flex pmw:flex-col pmw:gap-2 pmw:p-4">
          <button
            type="button"
            onClick={() => setView({ name: "list" })}
            className="pmw:self-start pmw:text-xs pmw:text-[var(--accent)] pmw:hover:underline"
          >
            ← Back to tickets
          </button>
          <CreateTicketForm
            workspaces={workspace.workspaces}
            loading={createTicket.loading}
            error={createTicket.error}
            onSubmit={async (description, workspaceId, problemDefinitionId, photos, fieldValues) => {
              const ticket = await createTicket.createTicket({
                workspaceId,
                description,
                problemDefinitionId,
                photos,
                fieldValues,
              });
              if (!ticket) return false;
              tickets.refetch();
              setView({ name: "list" });
              return true;
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <WidgetHeader brandName={brandName} onClose={onClose} />
      <TicketList
        tickets={tickets.tickets}
        loading={tickets.loading}
        error={tickets.error}
        onSelect={(ticket) => setView({ name: "detail", ticket })}
        onCreateNew={() => setView({ name: "create" })}
      />
    </>
  );
}

export function PMWidget({
  corner = "bottom-right",
  accentColor = "#4b5bf0",
  brandName = "Support",
  ...config
}: PMWidgetProps) {
  const [open, setOpen] = useState(false);
  const container = useShadowRoot();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (typeof document === "undefined" || !container) return null;

  const content = (
    <div
      className={cornerClasses(corner)}
      style={{ zIndex: 2147483000, ["--accent" as string]: accentColor }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="PM Widget"
          className="pmw:sw-pop pmw:w-2xl pmw:max-w-[calc(100vw-3rem)] pmw:overflow-hidden pmw:rounded-[20px] pmw:border-2 pmw:border-[#e7e9ef] pmw:bg-white pmw:shadow-[0_18px_48px_rgba(23,26,45,.18),0_4px_12px_rgba(23,26,45,.06)]"
        >
          <PMWidgetPanel brandName={brandName} onClose={() => setOpen(false)} {...config} />
        </div>
      )}
      {!open &&
        <button
          type="button"
          aria-label={open ? "Close PM widget" : "Open PM widget"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="pmw:p-3 pmw:launcher-btn pmw:flex pmw:items-center pmw:justify-center pmw:rounded-full pmw:border-none pmw:text-white"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      }

    </div>
  );

  return createPortal(content, container);
}
