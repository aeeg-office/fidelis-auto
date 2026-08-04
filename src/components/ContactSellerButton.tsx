"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

interface ContactSellerButtonProps {
  vehicleSlug: string;
  vehicleTitle: string;
}

export default function ContactSellerButton({
  vehicleSlug,
  vehicleTitle,
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => setUser(null));
  }, []);

  const handleOpen = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setOpen(true);
    setSent(false);
    setError(null);
    setMessage(
      `Hi, I'm interested in the ${vehicleTitle}. Is it still available?`
    );
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    setError(null);

    try {
      // We need to find an admin/seller user to send to.
      // For MVP, find the first user that isn't the current user (admin/seller account)
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Inquiry about ${vehicleTitle}`,
          content: message.trim(),
          // Omit receiverId — backend will route to default seller / admin
        }),
      });

      // If direct receiverId is required, try to get an admin user
      if (res.status === 400) {
        // Try fetching the first user as a fallback seller
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const users = await usersRes.json();
          const seller = users.find((u: any) => u.id !== user.id);
          if (seller) {
            const retryRes = await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                receiverId: seller.id,
                subject: `Inquiry about ${vehicleTitle}`,
                content: message.trim(),
              }),
            });
            if (!retryRes.ok) throw new Error("Failed to send message");
          } else {
            throw new Error("No seller account available");
          }
        } else {
          throw new Error("Could not find seller");
        }
      } else if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setSent(true);
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Non-logged-in: show "Contact Seller" link that goes to login
  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        <MessageSquare size={18} />
        Sign In to Contact Seller
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        <MessageSquare size={18} />
        Message Seller
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[var(--color-text-primary)]">
                Contact Seller
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-verified)]/20 flex items-center justify-center mx-auto mb-4">
                    <Send size={24} className="text-[var(--color-verified)]" />
                  </div>
                  <h4 className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Message Sent!
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                    The seller will get back to you soon. You can track this conversation in your Messages.
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push("/messages");
                    }}
                    className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    <MessageSquare size={16} />
                    View Messages
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    Send a message about <strong className="text-[var(--color-text-primary)]">{vehicleTitle}</strong>
                  </p>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />

                  {error && (
                    <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      onClick={() => setOpen(false)}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className="flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      Send Message
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}