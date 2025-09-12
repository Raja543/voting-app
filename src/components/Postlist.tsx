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
  const { data: session, status } = useSession();

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

  const handleVoteSuccess = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, votes: post.votes + 1 } : post
      )
    );
  };

  return (
    <>
      <Navbar session={session} loading={status === "loading"} showHomeHeading={true} />

      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">
            Vote for Your Favorites
          </h1>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500 mx-auto mb-6" />
              <p className="text-xl text-gray-300">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-gray-500">No posts available</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map(post => (
                <div
                  key={post._id}
                  className="bg-gray-800 rounded-xl shadow-md border border-gray-700 hover:border-blue-500 hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 text-blue-400 line-clamp-1">{post.title}</h3>
                    <p className="text-gray-300 text-sm mb-3 leading-snug line-clamp-3">{post.description}</p>

                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-green-400 hover:text-green-300 transition"
                      >
                        🔗 Visit Link
                      </a>
                    )}
                    <div className="flex-1" /> {/* pushes vote section to bottom */}
                  </div>

                  <div className="p-4 border-t border-gray-700 flex flex-col items-center gap-2">
                    <VoteButton postId={post._id} onVoted={() => handleVoteSuccess(post._id)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {session?.user?.email && !session.user.isAdmin && (
            <div className="mt-10 bg-blue-900/30 border border-blue-700 rounded-lg p-5 text-center">
              <p className="text-blue-300 font-medium text-lg">
                💡 You can vote for up to 2 different posts. Choose wisely!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
