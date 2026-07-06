import React, { useState } from "react";
import { formatRelativeTime } from "../lib/format";
import type { Ticket } from "../types";
import { StatusPill } from "./StatusPill";

export interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  onSelect: (ticket: Ticket) => void;
  onCreateNew: () => void;
}

export function TicketList({ tickets, loading, error, onSelect, onCreateNew }: TicketListProps) {
  const [query, setQuery] = useState("");
  const filtered = tickets.filter((t) => t.description.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="pmw:px-4 pmw:pb-[18px] pmw:pt-4">
      <div className="pmw:mb-3 pmw:flex pmw:items-center pmw:justify-between pmw:gap-2.5">
        <h2 className="pmw:text-base pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">My tickets</h2>
        <button
          type="button"
          onClick={onCreateNew}
          className="pmw:accent-action pmw:flex pmw:h-[34px] pmw:items-center pmw:gap-1.5 pmw:rounded-[9px] pmw:border-none pmw:px-[13px] pmw:text-[13px] pmw:font-bold pmw:text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
      </div>

      <div className="pmw:relative pmw:mb-3">
        <svg
          className="pmw:pointer-events-none pmw:absolute pmw:left-3 pmw:top-1/2 pmw:-translate-y-1/2"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9aa0ad"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tickets"
          className="pmw:accent-ring-sm pmw:h-10 pmw:w-full pmw:rounded-[10px] pmw:border-[1.5px] pmw:border-[#e9ebf0] pmw:bg-[#f7f8fa] pmw:pl-9 pmw:pr-3 pmw:text-[13.5px] pmw:text-[#171a22] pmw:outline-none"
        />
      </div>

      {loading && <p className="pmw:text-xs pmw:text-[#9aa0ad]">Loading tickets...</p>}
      {error && <p className="pmw:text-xs pmw:text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="pmw:sw-scroll pmw:flex pmw:max-h-[352px] pmw:flex-col pmw:gap-2 pmw:overflow-y-auto pmw:pr-0.5">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket)}
              className="pmw:accent-card-hover pmw:flex pmw:w-full pmw:flex-col pmw:gap-2 pmw:rounded-[13px] pmw:border-[1.5px] pmw:border-[#edeff3] pmw:bg-white pmw:px-3.5 pmw:py-[13px] pmw:text-left"
            >
              <p className="pmw:truncate pmw:text-sm pmw:font-bold pmw:text-[#171a22]">{ticket.description}</p>
              <div className="pmw:flex pmw:items-center pmw:gap-2">
                <StatusPill stateName={ticket.ticketState?.stateName} />
                {formatRelativeTime(ticket.createdDate) && (
                  <span className="pmw:ml-auto pmw:text-[11.5px] pmw:font-medium pmw:text-[#a4a9b4]">
                    {formatRelativeTime(ticket.createdDate)}
                  </span>
                )}
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="pmw:py-8 pmw:text-center pmw:text-[#9aa0ad]">
              <div className="pmw:text-[13.5px] pmw:font-semibold pmw:text-[#6a7180]">
                {tickets.length === 0 ? "No active tickets yet." : "No tickets found"}
              </div>
              {tickets.length > 0 && <div className="pmw:mt-[3px] pmw:text-xs">Try a different search.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
