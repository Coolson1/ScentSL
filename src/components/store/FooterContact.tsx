"use client";

import { useState } from "react";

export function FooterContact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setName("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="md:col-span-4">
      {/* Header */}
      <h3 className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-medium">
        Get in Touch
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment/80">
        Have a question, need help with an order, or just want to say something?
        Send us a message and we&apos;ll get back to you.
      </p>

      {status === "sent" ? (
        <div className="mt-5 border border-brand-gold/40 px-4 py-3">
          <p className="text-sm text-brand-gold">
            ✓ Message received. We&apos;ll be in touch soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          {/* Name */}
          <div className="border-b border-parchment/40 pb-2 focus-within:border-brand-gold transition-colors">
            <input
              id="footer-contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="w-full bg-transparent text-sm text-parchment placeholder:text-parchment/50 focus:outline-none"
            />
          </div>

          {/* Message */}
          <div className="border-b border-parchment/40 pb-2 focus-within:border-brand-gold transition-colors">
            <textarea
              id="footer-contact-message"
              required
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message or concern…"
              aria-label="Your message"
              className="w-full resize-none bg-transparent text-sm text-parchment placeholder:text-parchment/50 focus:outline-none"
            />
          </div>

          {status === "error" && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-400">
              Something went wrong. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="self-start text-[11px] uppercase tracking-[0.32em] text-brand-gold transition-colors hover:text-parchment focus-visible:outline-2 focus-visible:outline-brand-gold disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send Message →"}
          </button>
        </form>
      )}

      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-parchment/65">
        Or reach us directly at scentsl001@gmail.com
      </p>
    </div>
  );
}
