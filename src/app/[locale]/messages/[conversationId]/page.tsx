"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Clock } from "lucide-react";

interface Sender {
  id: string;
  name: string;
}

interface OtherUser {
  id: string;
  name: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: Sender;
}

interface ConversationData {
  conversation: {
    id: string;
    participant1: Sender;
    participant2: Sender;
  };
  otherUser: OtherUser;
  messages: Message[];
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [data, setData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check auth
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => setUser(null));
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load conversation");
      const json: ConversationData = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [conversationId, router]);

  // Initial fetch + poll
  useEffect(() => {
    if (!user) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [user, fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !data) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: data.conversation.id,
          receiverId: data.otherUser.id,
          subject: `Re: ${data.messages[0]?.subject || "Message"}`,
          content: replyText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setReplyText("");
      await fetchMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold mb-4">
          Sign in to view messages
        </h1>
        <Link
          href="/login"
          className="bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface)] border border-[var(--color-border)]" />
          <div className="h-[400px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-page py-10">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Messages
        </Link>
        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
          <p className="text-[var(--color-error)]">{error || "Conversation not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Messages
        </Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)]">
          {data.otherUser.name}
        </h1>
      </div>

      {/* Messages */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6 space-y-4">
          {data.messages.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)] py-8">
              No messages yet. Start the conversation.
            </p>
          ) : (
            data.messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-lg p-4 ${
                      isMine
                        ? "bg-[var(--color-accent)] text-[var(--color-surface-dark)]"
                        : "bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                    }`}
                  >
                    {!isMine && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.sender.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isMine
                          ? "justify-end text-[var(--color-surface-dark)]/60"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      <Clock size={10} />
                      <span className="text-[10px]">{formatDate(msg.createdAt)}</span>
                      {isMine && (
                        <span className="text-[10px]">
                          {msg.read ? " · Read" : " · Sent"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply form */}
        <form
          onSubmit={handleSend}
          className="border-t border-[var(--color-border)] p-4 md:p-6"
        >
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!replyText.trim() || sending}
              className="self-end shrink-0 bg-[var(--color-accent)] text-[var(--color-surface-dark)] p-3 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}