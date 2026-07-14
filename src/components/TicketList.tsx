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

type StatusTab = "active" | "resolved" | "cancelled";

function ticketStatusTab(ticket: Ticket): StatusTab {
  const name = ticket.ticketState?.stateName?.toLowerCase() ?? "";
  if (name === "resolved") return "resolved";
  if (name === "cancelled") return "cancelled";
  return "active";
}

export function TicketList({ tickets, loading, error, onSelect, onCreateNew }: TicketListProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("active");

  const ticketCounts = tickets.reduce(
    (acc, t) => {
      acc[ticketStatusTab(t)] += 1;
      return acc;
    },
    { active: 0, resolved: 0, cancelled: 0 } as Record<StatusTab, number>
  );

  const unreadCounts = tickets.reduce(
    (acc, t) => {
      acc[ticketStatusTab(t)] += t.customerChatUnreadCount ?? 0;
      return acc;
    },
    { active: 0, resolved: 0, cancelled: 0 } as Record<StatusTab, number>
  );

  const filtered = tickets
    .filter((t) => ticketStatusTab(t) === tab)
    .filter((t) => t.description.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col pmw:px-4 pmw:pb-[18px] pmw:pt-4">
      <div className="pmw:mb-3 pmw:flex pmw:shrink-0 pmw:items-center pmw:justify-between pmw:gap-2.5">
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

      <div className="pmw:mb-3 pmw:flex pmw:shrink-0 pmw:gap-1.5">
        {(["active", "resolved", "cancelled"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pmw:relative pmw:flex-1 pmw:rounded-[9px] pmw:border-none pmw:py-1.5 pmw:text-[12.5px] pmw:font-bold pmw:capitalize ${tab === t ? "pmw:accent-action pmw:text-white" : "pmw:bg-[#f2f3f6] pmw:text-[#6a7180]"
              }`}
          >
            {t}
            <span className="pmw:ml-1 pmw:text-[12px] pmw:font-semibold pmw:opacity-70">
              ({ticketCounts[t]})
            </span>
            {unreadCounts[t] > 0 && (
              <span
                className="pmw:absolute pmw:-right-1 pmw:-top-1 pmw:flex pmw:h-[16px] pmw:min-w-[16px] pmw:items-center pmw:justify-center pmw:rounded-full pmw:bg-red-500 pmw:px-1 pmw:text-[9.5px] pmw:font-bold pmw:text-white"
              >
                {unreadCounts[t] > 99 ? "99+" : unreadCounts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="pmw:relative pmw:mb-3 pmw:shrink-0">
        <span className="pmw:pointer-events-none pmw:absolute pmw:inset-y-0 pmw:left-3 pmw:flex pmw:items-center">
          <svg
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
        </span>
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
        <div className="pmw:sw-scroll pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col pmw:gap-2 pmw:overflow-y-auto pmw:pr-0.5">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket)}
              className="pmw:accent-card-hover pmw:flex pmw:w-full pmw:flex-col pmw:gap-1 pmw:rounded-[13px] pmw:border-[1.5px] pmw:border-[#edeff3] pmw:bg-white pmw:px-3.5 pmw:py-3 pmw:text-left"
            >
              <div className="pmw:flex pmw:items-start pmw:gap-2">
                <p className="pmw:min-w-0 pmw:flex-1 pmw:truncate pmw:text-sm pmw:font-bold pmw:leading-tight pmw:text-[#171a22]">
                  {ticket.description}
                </p>
                {formatRelativeTime(ticket.lastCustomerChatAt ?? ticket.createdDate) && (
                  <span className="pmw:shrink-0 pmw:text-[11px] pmw:font-medium pmw:leading-tight pmw:text-[#a4a9b4]">
                    {formatRelativeTime(ticket.lastCustomerChatAt ?? ticket.createdDate)}
                  </span>
                )}
              </div>
              {ticket.lastCustomerChatMessage && (
                <p className="pmw:truncate pmw:text-[12.5px] pmw:leading-tight pmw:text-[#8a8f9b]">
                  {ticket.lastCustomerChatMessage}
                </p>
              )}
              <div className="pmw:mt-1.5 pmw:flex pmw:items-center pmw:justify-between pmw:gap-2">
                <StatusPill stateName={ticket.ticketState?.stateName} />
                {!!ticket.customerChatUnreadCount && (
                  <span className="pmw:flex pmw:h-[19px] pmw:min-w-[19px] pmw:shrink-0 pmw:items-center pmw:justify-center pmw:rounded-full pmw:bg-red-500 pmw:px-[5px] pmw:text-[10.5px] pmw:font-bold pmw:leading-none pmw:text-white">
                    {ticket.customerChatUnreadCount > 99 ? "99+" : ticket.customerChatUnreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="pmw:py-8 pmw:text-center pmw:text-[#9aa0ad]">
              <div className="pmw:text-[13.5px] pmw:font-semibold pmw:text-[#6a7180]">
                {ticketCounts[tab] === 0 ? `No ${tab} tickets.` : "No tickets found"}
              </div>
              {tickets.length > 0 && <div className="pmw:mt-[3px] pmw:text-xs">Try a different search.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
