"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, ChevronRight, Clock, AlertCircle } from "lucide-react";

interface OtherUser {
  id: string;
  name: string;
}

interface LastMessage {
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  otherUser: OtherUser;
  lastMessage: LastMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.status === 401) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => setUser(null));
  }, []);

  // Initial fetch + poll every 30s
  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [user, fetchConversations]);

  if (!user) {
    return (
      <div className="container-page py-20 text-center">
        <MessageSquare size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[var(--color-text-primary)] mb-2">
          Messages
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Sign in to view and send messages.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] mb-8">
        Messages
      </h1>

      {loading && conversations.length === 0 ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 text-[var(--color-error)] p-4 rounded-lg border border-red-200 bg-red-50">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
          <MessageSquare size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
            No conversations yet
          </h3>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
            When you contact a seller about a vehicle, your conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                <span className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[var(--color-accent)]">
                  {conv.otherUser.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[var(--color-text-primary)] truncate">
                    {conv.otherUser.name}
                  </span>
                  {conv.lastMessageAt && (
                    <span className="shrink-0 text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                      <Clock size={12} />
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">
                    {truncate(conv.lastMessage.content, 80)}
                  </p>
                )}
              </div>

              {/* Unread badge / chevron */}
              <div className="flex items-center gap-2 shrink-0">
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-surface-dark)] text-xs font-bold flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
                <ChevronRight
                  size={18}
                  className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}