import React, { useState } from "react";
import type { TicketCustomerChat } from "../types";

export interface ChatPanelProps {
  messages: TicketCustomerChat[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  onSend: (message: string) => Promise<boolean>;
}

export function ChatPanel({ messages, loading, error, sending, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  return (
    <div className="pmw:flex pmw:flex-col pmw:gap-2">
      <div className="pmw:flex pmw:max-h-48 pmw:flex-col pmw:gap-2 pmw:overflow-y-auto pmw:rounded pmw:border pmw:border-gray-200 pmw:p-2">
        {loading && <p className="pmw:text-xs pmw:text-gray-500">Loading chat...</p>}
        {error && <p className="pmw:text-xs pmw:text-red-600">{error}</p>}
        {!loading && messages.length === 0 && (
          <p className="pmw:text-xs pmw:text-gray-500">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`pmw:max-w-[85%] pmw:rounded pmw:px-2 pmw:py-1 pmw:text-xs ${
              m.isCustomer
                ? "pmw:self-end pmw:bg-blue-600 pmw:text-white"
                : "pmw:self-start pmw:bg-gray-100 pmw:text-gray-800"
            }`}
          >
            <p className="pmw:font-medium">{m.authorName}</p>
            <p>{m.message}</p>
          </div>
        ))}
      </div>
      <form
        className="pmw:flex pmw:gap-2"
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
          placeholder="Message the handler..."
          className="pmw:flex-1 pmw:rounded pmw:border pmw:border-gray-300 pmw:px-2 pmw:py-1.5 pmw:text-sm pmw:outline-none pmw:focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="pmw:rounded pmw:bg-blue-600 pmw:px-3 pmw:py-1.5 pmw:text-sm pmw:font-medium pmw:text-white pmw:disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
