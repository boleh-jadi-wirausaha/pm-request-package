import React from "react";
import { useTicketChat } from "../hooks/useTicketChat";
import type { SaasClientConfig, Ticket } from "../types";
import { ChatPanel } from "./ChatPanel";
import { StatusPill } from "./StatusPill";

export interface TicketDetailProps {
  config: SaasClientConfig;
  ticket: Ticket;
  token: string | null;
  onUnauthorized: () => void;
}

export function TicketDetail({ config, ticket, token, onUnauthorized }: TicketDetailProps) {
  const chat = useTicketChat(config, ticket.id, token, onUnauthorized);

  return (
    <div className="pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col">
      <div className="pmw:shrink-0 pmw:border-b pmw:border-[#f1f2f6] pmw:px-[18px] pmw:pb-3 pmw:pt-3.5">
        <div className="pmw:text-[15px] pmw:font-extrabold pmw:leading-tight pmw:tracking-tight pmw:text-[#171a22]">
          {ticket.description}
        </div>
        <div className="pmw:mt-[7px] pmw:flex pmw:items-center pmw:gap-2">
          <StatusPill stateName={ticket.ticketState?.stateName} />
          {ticket.ticketIdentifier && (
            <span className="pmw:text-xs pmw:font-medium pmw:text-[#a4a9b4]">#{ticket.ticketIdentifier}</span>
          )}
        </div>
      </div>
      <ChatPanel
        messages={chat.messages}
        loading={chat.loading}
        error={chat.error}
        sending={chat.sending}
        onSend={chat.sendMessage}
      />
    </div>
  );
}
