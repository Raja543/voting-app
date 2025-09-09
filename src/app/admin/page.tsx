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

  // Redirect non-admins
  useEffect(() => {
    if (status === "authenticated" && session?.user && !session.user.isAdmin) router.replace("/");
    if (status === "unauthenticated") router.replace("/login");
  }, [status, session, router]);

  // Fetch users and posts
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetch("/api/users")
        .then(res => res.json())
        .then((data: any[]) => setUsers(data.map(u => ({ ...u, _id: u._id || u.id }))))
        .catch(console.error);

      fetch("/api/posts")
        .then(res => res.json())
        .then(setPosts)
        .catch(console.error);
    }
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
        setUsers(prev =>
          prev.map(u => (u.email === email ? { ...u, isWhitelisted: true } : u))
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
        setUsers(prev =>
          prev.map(u => (u.email === email ? { ...u, isWhitelisted: false } : u))
        );
      }
    } catch (err) {
      console.error("Remove whitelist error:", err);
    }
  };

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
        setPosts(prev => [...prev, post]);
        setNewPost({ title: "", description: "", link: "" });
      }
    } catch (err) {
      console.error("Add post error:", err);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  if (status === "loading") return <div className="text-gray-300 text-center mt-10">Loading...</div>;
  if (!session?.user?.isAdmin) return <div className="text-red-400 text-center mt-10">Access Denied</div>;

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(postSearch.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <>
      <Navbar session={session} showAdminHeading={true} />
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Add Post + Users */}
          <div className="space-y-6">

            {/* Add New Post */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 sticky top-6">
              <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Add New Post</h3>
              <form onSubmit={addPost} className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={newPost.title}
                  onChange={e => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newPost.description}
                  onChange={e => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Link"
                  value={newPost.link}
                  onChange={e => setNewPost(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                />
                <button className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200 px-4 py-2 rounded-lg font-semibold">
                  ➕ Add Post
                </button>
              </form>
            </section>

            {/* Users */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 max-h-[500px] flex flex-col">
              <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Users</h3>

              {/* Sticky Search Bar */}
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 mb-4 border border-gray-600 focus:border-green-500 focus:outline-none sticky top-0 z-10"
              />

              {/* Scrollable User List */}
              <div className="space-y-3 overflow-y-auto flex-1">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user._id || `${user.email}-${index}`}
                    className="flex justify-between items-center bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white font-bold">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-gray-300">{user.email}</p>
                        <div className="mt-1 flex gap-2 flex-wrap">
                          {user.isAdmin && (
                            <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          )}
                          {user.isWhitelisted ? (
                            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Whitelisted
                            </span>
                          ) : (
                            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Not Whitelisted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Whitelist toggle button */}
                    <button
                      onClick={() =>
                        user.isWhitelisted
                          ? removeWhitelist(user.email)
                          : whitelistUser(user.email)
                      }
                      className={`px-3 py-1 rounded-lg font-semibold text-white transition ${user.isWhitelisted
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {user.isWhitelisted ? "Remove" : "Whitelist"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Posts */}
          <div className="space-y-6">
            <section className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 max-h-[750px] flex flex-col">
              <h3 className="text-2xl font-semibold mb-3 text-yellow-400">Posts</h3>

              {/* Sticky Search Bar */}
              <input
                type="text"
                placeholder="Search posts..."
                value={postSearch}
                onChange={e => setPostSearch(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 mb-4 border border-gray-600 focus:border-green-500 focus:outline-none sticky top-0 z-10"
              />

              {/* Scrollable Post List */}
              <ul className="space-y-3 overflow-y-auto flex-1">
                {filteredPosts.map((post, index) => (
                  <li
                    key={post._id || `${post.title}-${index}`}
                    className="flex justify-between items-start bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors flex-col sm:flex-row"
                  >
                    <div className="flex-1">
                      <strong className="text-green-400">{post.title}</strong>
                      <p className="text-gray-300">{post.description}</p>
                      {post.link && (
                        <a
                          href={post.link}
                          target="_blank"
                          className="text-blue-400 hover:underline"
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
                  </li>
                ))}
              </ul>
            </section>
          </div>


        </div>
      </div>
    </>
  );
}

