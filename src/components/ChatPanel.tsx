import React, { useEffect, useRef, useState } from "react";
import { formatRelativeTime, getInitials } from "../lib/format";
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
}

function groupMessages(messages: TicketCustomerChat[]): GroupedMessage[] {
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameAsPrev = prev && prev.isCustomer === m.isCustomer && prev.authorName === m.authorName;
    const sameAsNext = next && next.isCustomer === m.isCustomer && next.authorName === m.authorName;
    return {
      message: m,
      isFirstInGroup: !sameAsPrev,
      isLastInGroup: !sameAsNext,
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
    <div className="pmw:flex pmw:flex-col">
      <div
        ref={scrollRef}
        className="pmw:sw-scroll pmw:flex pmw:h-[296px] pmw:flex-col pmw:gap-1 pmw:overflow-y-auto pmw:bg-[#fbfbfc] pmw:p-[18px]"
      >
        {loading && <p className="pmw:text-xs pmw:text-[#9aa0ad]">Loading chat...</p>}
        {error && <p className="pmw:text-xs pmw:text-red-600">{error}</p>}
        {!loading && messages.length === 0 && <p className="pmw:text-xs pmw:text-[#9aa0ad]">No messages yet.</p>}

        {grouped.map(({ message: m, isFirstInGroup, isLastInGroup }) =>
          m.isCustomer ? (
            <div key={m.id} className={`pmw:flex pmw:justify-end${isFirstInGroup ? "" : " pmw:mt-[-8px]"}`}>
              <div className="pmw:max-w-[86%]">
                {isFirstInGroup && (
                  <div className="pmw:mb-1 pmw:text-right pmw:text-[11px] pmw:font-medium pmw:text-[#a4a9b4]">
                    {m.authorName}
                  </div>
                )}
                <div
                  className={`pmw:bg-[var(--accent)] pmw:px-[13px] pmw:py-2.5 pmw:text-[13.5px] pmw:leading-[1.45] pmw:text-white`}
                >
                  {m.message}
                </div>
                {isLastInGroup && (
                  <div className="pmw:mr-1 pmw:mt-[5px] pmw:text-right pmw:text-[11px] pmw:font-medium pmw:text-[#a4a9b4]">
                    {m.authorName} · {formatRelativeTime(m.createdDate)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={m.id} className={`pmw:flex pmw:max-w-[88%] pmw:items-end pmw:gap-[9px]${isFirstInGroup ? "" : " pmw:pl-10"}`}>
              {isFirstInGroup && (
                <div className="pmw:flex pmw:h-7 pmw:w-7 pmw:flex-none pmw:items-center pmw:justify-center pmw:rounded-full pmw:bg-[var(--accent)] pmw:text-[11px] pmw:font-bold pmw:text-white">
                  {getInitials(m.authorName)}
                </div>
              )}
              <div>
                {isFirstInGroup && (
                  <div className="pmw:mb-1 pmw:text-[11px] pmw:font-medium pmw:text-[#a4a9b4]">
                    {m.authorName}
                  </div>
                )}
                <div
                  className={`pmw:border pmw:border-[#ecedf1] pmw:bg-white pmw:px-[13px] pmw:py-2.5 pmw:text-[13.5px] pmw:leading-[1.45] pmw:text-[#2b2f38]`}
                >
                  {m.message}
                </div>
                {isLastInGroup && (
                  <div className="pmw:ml-1 pmw:mt-[5px] pmw:text-[11px] pmw:font-medium pmw:text-[#a4a9b4]">
                    {m.authorName} · {formatRelativeTime(m.createdDate)}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
      <form
        className="pmw:flex pmw:items-center pmw:gap-[9px] pmw:border-t pmw:border-[#f1f2f6] pmw:bg-white pmw:px-3.5 pmw:py-3"
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
          className="pmw:accent-ring-sm pmw:h-[42px] pmw:flex-1 pmw:rounded-xl pmw:border-[1.5px] pmw:border-[#e6e8ee] pmw:bg-[#f7f8fa] pmw:px-3.5 pmw:text-[13.5px] pmw:text-[#171a22] pmw:outline-none"
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
