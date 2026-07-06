import React from "react";
import type { Ticket } from "../types";

export interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  onSelect: (ticket: Ticket) => void;
}

export function TicketList({ tickets, loading, error, onSelect }: TicketListProps) {
  if (loading) return <p className="pmw:text-xs pmw:text-gray-500">Loading tickets...</p>;
  if (error) return <p className="pmw:text-xs pmw:text-red-600">{error}</p>;
  if (tickets.length === 0) {
    return <p className="pmw:text-xs pmw:text-gray-500">No active tickets yet.</p>;
  }

  return (
    <ul className="pmw:flex pmw:flex-col pmw:gap-2">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <button
            type="button"
            onClick={() => onSelect(ticket)}
            className="pmw:w-full pmw:rounded pmw:border pmw:border-gray-200 pmw:px-3 pmw:py-2 pmw:text-left pmw:hover:border-blue-400"
          >
            <p className="pmw:truncate pmw:text-sm pmw:text-gray-800">{ticket.description}</p>
            {ticket.ticketState?.stateName && (
              <span className="pmw:mt-1 pmw:inline-block pmw:rounded-full pmw:bg-blue-50 pmw:px-2 pmw:py-0.5 pmw:text-xs pmw:text-blue-700">
                {ticket.ticketState.stateName}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
