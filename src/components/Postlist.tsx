"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import VoteButton from "@/components/VoteButton";

interface Post {
  _id: string;
  title: string;
  description: string;
  votes: number;
  link?: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasVoted, setUserHasVoted] = useState(false);

  const { data: session } = useSession();

  // Fetch posts + check if user has voted
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();

        const postsWithId: Post[] = Array.isArray(data)
          ? data.map((p: any) => ({
              ...p,
              _id: p._id?.toString() || "",
            }))
          : [];

        setPosts(postsWithId);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      }

      if (session?.user?.email) {
        try {
          const voteRes = await fetch("/api/votes");
          const voteData = await voteRes.json();
          setUserHasVoted(Boolean(voteData?.hasVoted));
        } catch (err) {
          console.error("Failed to check vote status:", err);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [session]);

  // Update vote count for a post after voting
  const handleVoteSuccess = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, votes: p.votes + 1 } : p
      )
    );
    setUserHasVoted(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <Navbar session={session} showHomeHeading={true} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-gray-400 text-center">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-center">No posts available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div
                key={post._id || `${post.title}-${index}`}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 mt-2 line-clamp-3">
                    {post.description}
                  </p>
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline mt-3 block"
                    >
                      🔗 Visit Link
                    </a>
                  )}
                </div>

                {/* Voting Section */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                  <VoteButton
                    postId={post._id}
                    onVoted={() => post._id && handleVoteSuccess(post._id)}
                    disabled={userHasVoted || !post._id}
                  />
                  <span className="text-gray-400 text-sm font-medium">
                    👍 {post.votes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

