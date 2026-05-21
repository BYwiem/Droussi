import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import type { ChatMessage } from "../types";

interface Props {
  scope: "document" | "exam";
  scopeId: string;
}

export default function ChatPanel({ scope, scopeId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<ChatMessage[]>(`/api/chat/${scope}/${scopeId}`)
      .then((m) => {
        if (!cancelled) setMessages(m);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [scope, scopeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");
    try {
      const updated = await apiFetch<ChatMessage[]>(
        `/api/chat/${scope}/${scopeId}`,
        { method: "POST", body: JSON.stringify({ content }) }
      );
      setMessages(updated);
    } catch (e) {
      // restore input on failure
      setInput(content);
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[500px] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
        Chat with AI ({scope === "document" ? "about this document" : "refine this exam"})
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Send a message to give the AI extra context or instructions.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-end gap-2 border-t border-slate-200 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Type a message…"
          rows={2}
          className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={() => void send()}
          disabled={sending || !input.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </div>
    </div>
  );
}
