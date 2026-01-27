"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "CRITICAL" | "GENERAL" | "CONTENT_FOCUS";
  createdBy: string;
  createdAt: string;
}

const READ_KEY = "read_announcements_v1";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState("");
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(READ_KEY);
    if (stored) {
      try {
        setReadIds(JSON.parse(stored));
      } catch {
        setReadIds([]);
      }
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    fetch("/api/announcements")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  const priorityStyles: Record<
    Announcement["priority"],
    { label: string; text: string; bg: string }
  > = {
    CRITICAL: {
      label: "CRITICAL",
      text: "#E40041",
      bg: "rgba(228, 0, 65, 0.15)",
    },
    GENERAL: {
      label: "GENERAL",
      text: "#027DA4",
      bg: "rgba(2, 125, 164, 0.15)",
    },
    CONTENT_FOCUS: {
      label: "CONTENT FOCUS",
      text: "#10B981",
      bg: "rgba(16, 185, 129, 0.15)",
    },
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;

    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem(READ_KEY, JSON.stringify(updated));
  };

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#0b0f14] overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
          {/* Page title */}
          <h1 className="text-center text-white text-sm sm:text-base font-medium">
            Stay updated with the latest news and updates
          </h1>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && !error && (
            <div className="space-y-4" aria-hidden="true">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#11161c] border border-gray-800 p-4 sm:p-6"
                >
                  <div className="h-4 w-40 bg-gray-700 rounded mb-3" />
                  <div className="h-3 w-full bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-5/6 bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && announcements.length === 0 && !error ? (
            <div className="text-white/70 text-center text-sm">
              No announcements yet.
            </div>
          ) : null}

          {!loading && announcements.length > 0 && (
            <div className="space-y-4">
              {announcements.map((a) => {
                const priority = priorityStyles[a.priority];
                const isUnread = !readIds.includes(a._id);

                return (
                  <button
                    key={a._id}
                    onClick={() => markAsRead(a._id)}
                    className="
                      w-full text-left
                      bg-[#11161c]
                      border border-gray-800
                      p-4 sm:p-6
                      hover:border-gray-700
                      transition
                      focus:outline-none
                    "
                  >
                    {/* HEADER */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left side */}
                      <div className="flex items-start gap-2 min-w-0">
                        {isUnread && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-[#3aa0d8] shrink-0" />
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[#3aa0d8] text-[16px] break-word break-all overflow-hidden">
                              {a.title}
                            </h2>

                            {isUnread && (
                              <span className="text-[10px] px-2 py-[2px] bg-[#3aa0d8]/20 text-[#3aa0d8] font-semibold">
                                NEW
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Priority badge */}
                      <span
                        className="text-[16x] px-2 py-[2px] font-medium w-fit"
                        style={{
                          background: priority.bg,
                          color: priority.text,
                        }}
                      >
                        {priority.label}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <p className="mt-3 text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {a.content}
                    </p>

                    {/* FOOTER */}
                    <div className="mt-4 text-xs text-white/60 text-right">
                      {formatDate(a.createdAt)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
