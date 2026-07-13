import React, { useEffect, useRef, useState } from "react";
import { formatRelativeTime, getDateDividerLabel, getInitials } from "../lib/format";
import type { TicketCustomerChat } from "../types";

export interface ChatPanelProps {
  messages: TicketCustomerChat[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  onSend: (message: string) => Promise<boolean>;
}

interface GroupedMessage {
  message: TicketCustomerChat;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  dateDividerLabel: string | null;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function groupMessages(messages: TicketCustomerChat[]): GroupedMessage[] {
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameAsPrev = prev && prev.isCustomer === m.isCustomer && prev.authorName === m.authorName;
    const sameAsNext = next && next.isCustomer === m.isCustomer && next.authorName === m.authorName;
    const newDay = m.createdDate && (!prev || !prev.createdDate || !isSameDay(prev.createdDate, m.createdDate));
    return {
      message: m,
      isFirstInGroup: !sameAsPrev,
      isLastInGroup: !sameAsNext,
      dateDividerLabel: newDay && m.createdDate ? getDateDividerLabel(m.createdDate) : null,
    };
  });
}

export function ChatPanel({ messages, loading, error, sending, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const grouped = groupMessages(messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  useEffect(() => {
    if (didInitialScroll.current || loading || messages.length === 0) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    didInitialScroll.current = true;
  }, [loading, messages]);

  return (
    <div className="pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col">
      <div
        ref={scrollRef}
        className="pmw:sw-scroll pmw:flex pmw:min-h-0 pmw:flex-1 pmw:flex-col pmw:gap-1 pmw:overflow-y-auto pmw:bg-[#fbfbfc] pmw:p-[18px]"
      >
        {loading && <p className="pmw:text-xs pmw:text-[#9aa0ad]">Loading chat...</p>}
        {error && <p className="pmw:text-xs pmw:text-red-600">{error}</p>}
        {!loading && messages.length === 0 && <p className="pmw:text-xs pmw:text-[#9aa0ad]">No messages yet.</p>}

        {grouped.map(({ message: m, isFirstInGroup, isLastInGroup, dateDividerLabel }) => (
          <React.Fragment key={m.id}>
            {dateDividerLabel && (
              <div className="pmw:my-1.5 pmw:flex pmw:items-center pmw:gap-2.5">
                <div className="pmw:h-px pmw:flex-1 pmw:bg-[#e4e6eb]" />
                <span className="pmw:text-[11px] pmw:font-bold pmw:uppercase pmw:tracking-wide pmw:text-[#9198a6]">
                  {dateDividerLabel}
                </span>
                <div className="pmw:h-px pmw:flex-1 pmw:bg-[#e4e6eb]" />
              </div>
            )}
            {m.isCustomer ? (
              <div className="pmw:flex pmw:items-end pmw:justify-end pmw:gap-[9px]">
                <div className={`pmw:max-w-[74%]${isFirstInGroup ? "" : " pmw:pr-10"}`}>
                  {isFirstInGroup && (
                    <div className="pmw:mb-1 pmw:text-right pmw:text-[12px] pmw:font-semibold pmw:text-[#7b8291]">
                      {m.authorName}
                    </div>
                  )}
                  <div
                    className={`pmw:bg-[var(--accent)] pmw:px-[13px] pmw:py-2.5 pmw:text-[13.5px] pmw:leading-[1.45] pmw:text-white pmw:shadow-[0_2px_6px_color-mix(in_srgb,var(--accent)_25%,transparent)] pmw:rounded-tl-2xl pmw:rounded-tr-[4px] pmw:rounded-bl-2xl ${isLastInGroup ? "pmw:rounded-br-2xl" : "pmw:rounded-br-[4px]"
                      }`}
                  >
                    {m.message}
                  </div>
                  {isLastInGroup && (
                    <div className="pmw:mr-1 pmw:mt-[5px] pmw:text-right pmw:text-[11px] pmw:font-medium pmw:text-[#9aa1ad]">
                      {formatRelativeTime(m.createdDate)}
                    </div>
                  )}
                </div>
                {isFirstInGroup && (
                  <div className="pmw:flex pmw:h-[30px] pmw:w-[30px] pmw:flex-none pmw:items-center pmw:justify-center pmw:rounded-full pmw:bg-[#e2e4e9] pmw:text-[11px] pmw:font-bold pmw:text-[#5b616c]">
                    {getInitials(m.authorName)}
                  </div>
                )}
              </div>
            ) : (
              <div className={`pmw:flex pmw:max-w-[88%] pmw:items-end pmw:gap-[9px]${isFirstInGroup ? "" : " pmw:pl-10"}`}>
                {isFirstInGroup && (
                  <div className="pmw:flex pmw:h-[30px] pmw:w-[30px] pmw:flex-none pmw:items-center pmw:justify-center pmw:rounded-full pmw:bg-[var(--accent)] pmw:text-[11px] pmw:font-bold pmw:text-white pmw:shadow-[0_1px_3px_color-mix(in_srgb,var(--accent)_30%,transparent)]">
                    {getInitials(m.authorName)}
                  </div>
                )}
                <div>
                  {isFirstInGroup && (
                    <div className="pmw:mb-1 pmw:text-[12px] pmw:font-semibold pmw:text-[#7b8291]">
                      {m.authorName}
                    </div>
                  )}
                  <div
                    className={`pmw:border pmw:border-[#e9ebf0] pmw:bg-white pmw:px-[13px] pmw:py-2.5 pmw:text-[13.5px] pmw:leading-[1.45] pmw:text-[#2b2f38] pmw:shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${isLastInGroup ? "pmw:rounded-2xl" : "pmw:rounded-2xl pmw:rounded-bl-[4px]"
                      }`}
                  >
                    {m.message}
                  </div>
                  {isLastInGroup && (
                    <div className="pmw:ml-1 pmw:mt-[5px] pmw:text-[11px] pmw:font-medium pmw:text-[#9aa1ad]">
                      {formatRelativeTime(m.createdDate)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <form
        className="pmw:flex pmw:shrink-0 pmw:items-center pmw:gap-[9px] pmw:border-t pmw:border-[#f1f2f6] pmw:bg-white pmw:px-3.5 pmw:py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          void onSend(draft).then((ok) => {
            if (ok) setDraft("");
          });
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a reply…"
          style={{ borderColor: "var(--accent)" }}
          className="pmw:accent-ring-sm pmw:h-[42px] pmw:flex-1 pmw:rounded-xl pmw:border-[1.5px] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:text-[13.5px] pmw:text-[#171a22] pmw:outline-none"
        />
        <button
          type="submit"
          disabled={sending}
          aria-label="Send message"
          className="pmw:accent-action pmw:flex pmw:h-[42px] pmw:w-[42px] pmw:flex-none pmw:items-center pmw:justify-center pmw:rounded-xl pmw:border-none pmw:text-white pmw:disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
