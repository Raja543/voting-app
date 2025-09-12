"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Post {
  _id: string;
  title: string;
  description: string;
  link?: string;
  votes: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isWhitelisted: boolean;
  isAdmin: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: "", description: "", link: "" });
  const [postSearch, setPostSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Redirect logic (type-safe)
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && session?.user && !session.user.isAdmin) {
      router.replace("/");
    }
  }, [status, session, router]);

  // Fetch users + posts with votes
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.isAdmin) return;

    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data.map((u) => ({ ...u, _id: u._id }))))
      .catch(console.error);

    // Fetch posts with synced vote counts
    const fetchPostsWithVotes = async () => {
      try {
        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();

        const postsWithSyncedVotes = await Promise.all(
          postsData.map(async (post: Post) => {
            try {
              const votesRes = await fetch(`/api/votes?postId=${post._id}`);
              const votesData = await votesRes.json();
              return { ...post, votes: votesData.count || 0 };
            } catch (err) {
              console.error(`Failed to sync votes for post ${post._id}:`, err);
              return post;
            }
          })
        );

        setPosts(postsWithSyncedVotes);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPostsWithVotes();
  }, [status, session]);

  // Whitelist a user
  const whitelistUser = async (email: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isWhitelisted: true }),
      });
      const updated = await res.json();
      if (updated.success) {
        setUsers((prev) =>
          prev.map((u) => (u.email === email ? { ...u, isWhitelisted: true } : u))
        );
      }
    } catch (err) {
      console.error("Whitelist user error:", err);
    }
  };

  // Remove a user from whitelist
  const removeWhitelist = async (email: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isWhitelisted: false }),
      });
      const updated = await res.json();
      if (updated.success) {
        setUsers((prev) =>
          prev.map((u) => (u.email === email ? { ...u, isWhitelisted: false } : u))
        );
      }
    } catch (err) {
      console.error("Remove whitelist error:", err);
    }
  };

  // Add a new post
  const addPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const post = await res.json();
      if (post._id) {
        setPosts((prev) => [...prev, { ...post, votes: 0 }]);
        setNewPost({ title: "", description: "", link: "" });
      }
    } catch (err) {
      console.error("Add post error:", err);
    }
  };

  // Delete a post
  const deletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  // Loading state
  if (status === "loading") return <div>Loading...</div>;

  // Not authenticated or not admin
  if (status === "unauthenticated") return <div>Access Denied</div>;
  if (!session?.user?.isAdmin) return <div>Access Denied</div>;

  // Filters
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(postSearch.toLowerCase())
  );
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <>
      <Navbar
        session={session}
        // loading={status === "loading"}
        showAdminHeading={true}
      />

      <div className="min-h-screen bg-gray-900 text-gray-100 flex">
        {/* Left Column - Add Post + Users */}
        <div className="w-1/2 p-6 border-r border-gray-700">
          {/* Add Post */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              Add New Post
            </h2>
            <form onSubmit={addPost} className="space-y-4">
              <input
                type="text"
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
              />
              <textarea
                placeholder="Post Description"
                value={newPost.description}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, description: e.target.value }))
                }
                required
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                rows={2}
              />
              <input
                type="url"
                placeholder="Optional Link"
                value={newPost.link}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, link: e.target.value }))
                }
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition"
              >
                ➕ Add Post
              </button>
            </form>
          </div>

          {/* Users */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold p-4 border-b border-gray-700 text-blue-400">
              Users
            </h2>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 mb-4 border border-gray-600 focus:border-green-500 focus:outline-none sticky top-0 z-10"
            />
            <div className="max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      {user.isAdmin && (
                        <span className="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                          Admin
                        </span>
                      )}
                      <div className="mt-1">
                        {user.isWhitelisted ? (
                          <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            Whitelisted
                          </span>
                        ) : (
                          <span className="inline-block bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                            Not Whitelisted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      user.isWhitelisted
                        ? removeWhitelist(user.email)
                        : whitelistUser(user.email)
                    }
                    className={`px-3 py-1 rounded-lg font-semibold text-white transition ${
                      user.isWhitelisted
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {user.isWhitelisted ? "Remove" : "Whitelist"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Posts */}
        <div className="w-1/2 p-6 min-h-screen">
          <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
            <h2 className="text-xl font-semibold p-4 border-b border-gray-700 text-yellow-400">
              Posts
            </h2>
            <input
              type="text"
              placeholder="Search posts..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 mb-4 border border-gray-600 focus:border-green-500 focus:outline-none sticky top-0 z-10"
            />
            <div className="max-h-screen overflow-y-auto">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="p-4 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-blue-400 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-300 mb-2">{post.description}</p>
                      {post.link && (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm transition"
                        >
                          {post.link}
                        </a>
                      )}
                      <p className="text-yellow-400 font-semibold mt-2">
                        Total Votes: {post.votes || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePost(post._id)}
                      className="mt-2 sm:mt-0 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-semibold self-end"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
