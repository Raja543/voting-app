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

export default function Postlist() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/posts");
        const data: Post[] = await res.json();
        setPosts(data.map(post => ({ ...post, _id: post._id.toString() })));
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Update post votes in parent state
  const handleVoteSuccess = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, votes: post.votes + 1 } : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar session={session} showHomeHeading={true} />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-6 py-10">
        {loading ? (
          <p className="text-gray-400 text-center">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-center">No posts available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {posts.map(post => (
              <div
                key={post._id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between min-h-[260px]"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 mt-2 line-clamp-3 text-base">
                    {post.description}
                  </p>
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline mt-3 block text-base"
                    >
                      🔗 Visit Link
                    </a>
                  )}
                </div>

                {/* Voting Section */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                  <VoteButton
                    postId={post._id}
                    onVoted={() => handleVoteSuccess(post._id)}
                  />
                  <span className="text-gray-400 text-sm font-medium">
                    👍 {post.votes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
