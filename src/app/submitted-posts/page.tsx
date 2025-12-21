"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface SubmittedPost {
  _id: string;
  twitterHandle: string;
  discordUsername: string;
  contentLink: string;
  contentType: string;
  title?: string;
  description?: string;
  createdAt: string;
}

export default function SubmittedPostsPage() {
  const { status } = useSession();

  const [posts, setPosts] = useState<SubmittedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Fetch submissions */
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/content-submissions?scope=self")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch submissions");
        return res.json();
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#0b0f14] overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {status === "loading" || (status === "authenticated" && loading) ? (
            <div className="min-h-[60vh] flex items-center justify-center text-white/60 text-sm">
              Loading…
            </div>
          ) : status === "unauthenticated" ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white/60 text-sm">
              <div>You need to login first to view your submitted posts.</div>
              <a
                href="/login"
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded"
              >
                Login
              </a>
            </div>
          ) : error ? (
            <div className="min-h-[60vh] flex items-center justify-center text-red-500 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Page Title */}
              <h1 className="text-white text-3xl sm:text-4xl font-mono tracking-wide">
                Your Submitted Posts
              </h1>

              {posts.length === 0 ? (
                <div className="text-white/50 text-sm">
                  You have not submitted any posts yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="
                        bg-white/5
                        border border-white/5
                        rounded-xl
                        px-6 py-5
                        space-y-3
                      "
                    >
                      {/* Main line: link + type */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-white text-sm break-words">
                          <a
                            href={post.contentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#3aa0d8] hover:underline break-words"
                          >
                            {post.contentLink}
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-white/10 text-white/80 uppercase tracking-wide">
                            {post.contentType}
                          </span>
                        </div>
                      </div>

                      {/* Optional title / description */}
                      {(post.title || post.description) && (
                        <div className="space-y-1">
                          {post.title && (
                            <div className="text-white text-sm font-medium break-words">
                              {post.title}
                            </div>
                          )}
                          {post.description && (
                            <div className="text-white/60 text-xs leading-relaxed break-words">
                              {post.description}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta: handles + date */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs text-white/50">
                        <div className="space-x-3">
                          <span>@{post.twitterHandle}</span>
                          <span>|</span>
                          <span>{post.discordUsername}</span>
                        </div>
                        <div className="font-mono">
                          Submitted on: {new Date(post.createdAt).toLocaleDateString("en-US")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
