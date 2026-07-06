import React from "react";
import { useTicketChat } from "../hooks/useTicketChat";
import type { SaasClientConfig, Ticket } from "../types";
import { ChatPanel } from "./ChatPanel";

export interface TicketDetailProps {
  config: SaasClientConfig;
  ticket: Ticket;
  token: string | null;
  onUnauthorized: () => void;
  onBack: () => void;
}

export function TicketDetail({ config, ticket, token, onUnauthorized, onBack }: TicketDetailProps) {
  const chat = useTicketChat(config, ticket.id, token, onUnauthorized);

  return (
    <div className="pmw:flex pmw:flex-col pmw:gap-3">
      <button
        type="button"
        onClick={onBack}
        className="pmw:self-start pmw:text-xs pmw:text-blue-600 pmw:hover:underline"
      >
        ← Back to tickets
      </button>
      <div>
        <p className="pmw:text-sm pmw:text-gray-800">{ticket.description}</p>
        {ticket.ticketState?.stateName && (
          <span className="pmw:mt-1 pmw:inline-block pmw:rounded-full pmw:bg-blue-50 pmw:px-2 pmw:py-0.5 pmw:text-xs pmw:text-blue-700">
            Status: {ticket.ticketState.stateName}
          </span>
        )}
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
