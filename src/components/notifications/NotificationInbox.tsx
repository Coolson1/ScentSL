"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type NotificationItem = {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  url?: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchInbox = async () => {
    try {
      const res = await fetch("/api/notifications/inbox?limit=15", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silent catch
    }
  };

  useEffect(() => {
    fetchInbox();

    // Poll for unread notification updates every 30 seconds
    const interval = setInterval(fetchInbox, 30000);

    // Click outside handler
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchInbox();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/inbox/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || id === "mark-all-read" ? { ...n, isRead: true } : n))
      );
      if (id === "mark-all-read") {
        setUnreadCount(0);
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent catch
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center p-2 text-ink/75 transition-colors hover:text-brand-gold focus:outline-none"
        aria-label="Notification inbox"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-ink shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl border border-ink/15 bg-parchment-soft p-4 shadow-2xl backdrop-blur-md z-50 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <div>
              <h3 className="font-display text-sm font-medium text-ink">Notifications</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold">
                Atelier Updates
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => handleMarkAsRead("mark-all-read")}
                className="text-[10px] uppercase tracking-wider text-ink/60 hover:text-brand-gold transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs italic text-ink/50 font-serif">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  className={`group relative flex flex-col gap-1 rounded-xl p-3 text-left transition-colors border ${
                    item.isRead
                      ? "border-transparent bg-transparent opacity-80"
                      : "border-brand-gold/25 bg-brand-gold/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-xs font-semibold text-ink">
                      {item.title}
                    </span>
                    <span className="text-[9px] text-ink/40 shrink-0 font-sans">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-serif text-xs text-ink/75 leading-relaxed">
                    {item.message}
                  </p>
                  {item.url && (
                    <Link
                      href={item.url}
                      onClick={() => setIsOpen(false)}
                      className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-brand-gold hover:underline font-medium"
                    >
                      View details →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
        fill="currentColor"
      />
    </svg>
  );
}
