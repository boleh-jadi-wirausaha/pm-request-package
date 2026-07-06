import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CreateTicketForm } from "./components/CreateTicketForm";
import { LoginForm } from "./components/LoginForm";
import { TicketDetail } from "./components/TicketDetail";
import { TicketList } from "./components/TicketList";
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
}

const STYLE_TAG_ID = "pm-widget-styles";

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_TAG_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_TAG_ID;
    style.textContent = compiledStyles;
    document.head.appendChild(style);
  }, []);
}

function cornerClasses(corner: PMWidgetCorner): string {
  const vertical = corner.startsWith("top") ? "pmw:top-6" : "pmw:bottom-6";
  const horizontal = corner.endsWith("left") ? "pmw:left-6" : "pmw:right-6";
  const direction = corner.startsWith("top") ? "pmw:flex-col" : "pmw:flex-col-reverse";
  const align = corner.endsWith("left") ? "pmw:items-start" : "pmw:items-end";
  return `pmw:fixed ${vertical} ${horizontal} pmw:flex ${direction} ${align} pmw:gap-2`;
}

type View = { name: "list" } | { name: "create" } | { name: "detail"; ticket: Ticket };

function PMWidgetPanel(config: SaasClientConfig) {
  const auth = useAuth(config);
  const workspace = useWorkspace(config, auth.token, auth.logout);
  const tickets = useTickets(config, auth.token, auth.logout);
  const createTicket = useCreateTicket(config, auth.token, auth.logout);
  const [view, setView] = useState<View>({ name: "list" });

  if (!auth.token) {
    return <LoginForm onSubmit={auth.login} loading={auth.loading} error={auth.error} />;
  }

  if (view.name === "detail") {
    return (
      <TicketDetail
        config={config}
        ticket={view.ticket}
        token={auth.token}
        onUnauthorized={auth.logout}
        onBack={() => setView({ name: "list" })}
      />
    );
  }

  if (view.name === "create") {
    return (
      <div className="pmw:flex pmw:flex-col pmw:gap-2">
        <button
          type="button"
          onClick={() => setView({ name: "list" })}
          className="pmw:self-start pmw:text-xs pmw:text-blue-600 pmw:hover:underline"
        >
          ← Back to tickets
        </button>
        <CreateTicketForm
          workspaces={workspace.workspaces}
          loading={createTicket.loading}
          error={createTicket.error}
          onSubmit={async (description, workspaceId, problemDefinitionId, photos) => {
            const ticket = await createTicket.createTicket({
              workspaceId,
              description,
              problemDefinitionId,
              photos,
            });
            if (!ticket) return false;
            tickets.refetch();
            setView({ name: "list" });
            return true;
          }}
        />
      </div>
    );
  }

  return (
    <div className="pmw:flex pmw:flex-col pmw:gap-3">
      <div className="pmw:flex pmw:items-center pmw:justify-between">
        <h2 className="pmw:text-sm pmw:font-semibold pmw:text-gray-800">My tickets</h2>
        <button
          type="button"
          onClick={() => setView({ name: "create" })}
          className="pmw:rounded pmw:bg-blue-600 pmw:px-2 pmw:py-1 pmw:text-xs pmw:font-medium pmw:text-white"
        >
          New request
        </button>
      </div>
      <TicketList
        tickets={tickets.tickets}
        loading={tickets.loading}
        error={tickets.error}
        onSelect={(ticket) => setView({ name: "detail", ticket })}
      />
    </div>
  );
}

export function PMWidget({ corner = "bottom-right", ...config }: PMWidgetProps) {
  const [open, setOpen] = useState(false);
  useInjectStyles();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (typeof document === "undefined") return null;

  const content = (
    <div className={cornerClasses(corner)} style={{ zIndex: 2147483000 }}>
      {open && (
        <div
          role="dialog"
          aria-label="PM Widget"
          className="pmw:w-80 pmw:max-w-[calc(100vw-3rem)] pmw:rounded-lg pmw:border pmw:border-gray-200 pmw:bg-white pmw:p-4 pmw:shadow-xl"
        >
          <PMWidgetPanel {...config} />
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close PM widget" : "Open PM widget"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="pmw:flex pmw:h-12 pmw:w-12 pmw:items-center pmw:justify-center pmw:rounded-full pmw:bg-blue-600 pmw:text-xl pmw:text-white pmw:shadow-lg"
      >
        {open ? "×" : "◆"}
      </button>
    </div>
  );

  return createPortal(content, document.body);
}
