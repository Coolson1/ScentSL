"use client";

import { useState } from "react";

export default function AdminNotificationsPage() {
  const [targetType, setTargetType] = useState<"ALL" | "SPECIFIC_USER">("ALL");
  const [targetId, setTargetId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/products");
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setResultMessage(null);

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId: targetType === "SPECIFIC_USER" ? targetId.trim() : undefined,
          title,
          message,
          url,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.count > 0) {
          setResultMessage({
            type: "success",
            text: `Notification successfully sent to ${data.count} active device(s)! 🎉`,
          });
        } else {
          setResultMessage({
            type: "error",
            text: "No active push subscriptions found in database. Make sure browser notifications are enabled on customer devices.",
          });
        }
        setTitle("");
        setMessage("");
      } else {
        setResultMessage({
          type: "error",
          text: data.error || `Server responded with status ${res.status}`,
        });
      }
    } catch (err) {
      setResultMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error sending notification.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-medium">
          Admin Operations
        </span>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-light text-ink">
          Web Push Broadcast & Announcements
        </h1>
        <p className="mt-1 font-serif text-xs sm:text-sm text-ink/75">
          Send live luxury fragrance announcements, new collection alerts, or custom updates directly to customer devices via VAPID Web Push.
        </p>
      </div>

      {resultMessage && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium ${
            resultMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-rose-500/30 bg-rose-500/10 text-rose-700"
          }`}
        >
          {resultMessage.text}
        </div>
      )}

      <form onSubmit={handleSend} className="rounded-2xl border border-ink/15 bg-parchment-soft p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/70 font-medium mb-2">
            Target Audience
          </label>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "ALL"}
                onChange={() => setTargetType("ALL")}
                className="text-brand-gold focus:ring-brand-gold"
              />
              All Opted-in Customers (Broadcast)
            </label>
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "SPECIFIC_USER"}
                onChange={() => setTargetType("SPECIFIC_USER")}
                className="text-brand-gold focus:ring-brand-gold"
              />
              Specific Customer (User ID / Email)
            </label>
          </div>
        </div>

        {targetType === "SPECIFIC_USER" && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/70 font-medium mb-1">
              Customer User ID or Email
            </label>
            <input
              type="text"
              required
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000 or customer@example.com"
              className="w-full rounded-xl border border-ink/20 bg-parchment p-3 text-xs text-ink focus:border-brand-gold focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/70 font-medium mb-1">
            Notification Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Fragrance Just Arrived ✨"
            className="w-full rounded-xl border border-ink/20 bg-parchment p-3 text-xs text-ink focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/70 font-medium mb-1">
            Notification Message
          </label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Discover our latest regal scent blend now available in the ScentSL atelier."
            className="w-full rounded-xl border border-ink/20 bg-parchment p-3 text-xs text-ink focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/70 font-medium mb-1">
            Target Deep Link / URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/products/creed-royal-oud"
            className="w-full rounded-xl border border-ink/20 bg-parchment p-3 text-xs text-ink focus:border-brand-gold focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="w-full sm:w-auto rounded-full bg-ink px-6 py-3 sm:px-8 text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-parchment hover:bg-brand-gold hover:text-ink disabled:opacity-50 transition-all font-medium shadow-sm"
        >
          {isSending ? "Dispatching Web Push..." : "Send Web Push Broadcast →"}
        </button>
      </form>
    </div>
  );
}
