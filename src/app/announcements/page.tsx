"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsError, setAnnouncementsError] = useState<string>("");
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.isWhitelisted) return;
    fetch("/api/announcements")
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch announcements"))
      .then(data => setAnnouncements(data || []))
      .catch(() => setAnnouncementsError("Failed to load announcements."));
  }, [status, session]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && session?.user && !session.user.isWhitelisted) {
      router.replace("/");
    }
  }, [status, session, router]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-600 text-white";
      case "medium": return "bg-yellow-600 text-white";
      case "low": return "bg-green-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated" || !session?.user?.isWhitelisted) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Access Denied</div>;
  }

  return (
    <>
      <Navbar showHomeHeading={false} />
      
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">📢 Announcements</h1>
            <p className="text-gray-400 text-lg">Stay updated with the latest news and updates</p>
          </div>

          {/* Announcements List */}
          <div className="max-w-4xl mx-auto">
            {(announcements?.length ?? 0) > 0 ? (
              <div className="space-y-6">
                {(announcements ?? []).map((announcement) => (
                  <div
                    key={announcement._id}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getPriorityIcon(announcement.priority)}
                        </span>
                        <h2 className="text-xl font-semibold text-white">
                          {announcement.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Posted on {formatDate(announcement.createdAt)}</span>
                        <span>By {announcement.createdBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📢</div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No announcements yet</h3>
                <p className="text-gray-500">
                  Check back later for updates and important information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
