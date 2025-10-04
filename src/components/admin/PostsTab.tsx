"use client";

interface Post {
  _id: string;
  title: string;
  description: string;
  link?: string;
  votes: number;
}

interface PostsTabProps {
  posts: Post[];
  newPost: { title: string; description: string; link: string };
  setNewPost: React.Dispatch<React.SetStateAction<{ title: string; description: string; link: string }>>;
  addPost: (e: React.FormEvent) => void;
  deletePost: (id: string) => void;
  postSearch: string;
  setPostSearch: (search: string) => void;
  isVotingActive: boolean;
  currentPeriod: string;
  startVoting: () => void;
  stopVoting: () => void;
  isLoading: boolean;
}

export default function PostsTab({
  posts,
  newPost,
  setNewPost,
  addPost,
  deletePost,
  postSearch,
  setPostSearch,
  isVotingActive,
  currentPeriod,
  startVoting,
  stopVoting,
  isLoading,
}: PostsTabProps) {
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Post Form */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Add New Post</h2>
          <form onSubmit={addPost} className="space-y-4">
            <input
              type="text"
              placeholder="Post Title"
              value={newPost.title}
              onChange={(e) => setNewPost((prev: { title: string; description: string; link: string }) => ({ ...prev, title: e.target.value }))}
              required
              className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
            />
            <textarea
              placeholder="Post Description"
              value={newPost.description}
              onChange={(e) => setNewPost((prev: { title: string; description: string; link: string }) => ({ ...prev, description: e.target.value }))}
              required
              className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
              rows={3}
            />
            <input
              type="url"
              placeholder="Optional Link"
              value={newPost.link}
              onChange={(e) => setNewPost((prev: { title: string; description: string; link: string }) => ({ ...prev, link: e.target.value }))}
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

        {/* Voting Control */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Voting Control</h2>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isVotingActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {isVotingActive ? "🟢 Active" : "🔴 Inactive"}
                </span>
              </div>
              {currentPeriod && (
                <div className="text-sm text-gray-400">
                  Period: <span className="text-blue-400 font-medium">{currentPeriod}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={startVoting}
                disabled={isLoading || isVotingActive}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                  isLoading || isVotingActive
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isLoading ? "Loading..." : "▶️ Start Voting"}
              </button>
              
              <button
                onClick={stopVoting}
                disabled={isLoading || !isVotingActive}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                  isLoading || !isVotingActive
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isLoading ? "Loading..." : "⏹️ Close Voting"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-yellow-400">Posts</h2>
          <input
            type="text"
            placeholder="Search posts..."
            value={postSearch}
            onChange={(e) => setPostSearch(e.target.value)}
            className="mt-4 w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredPosts.map((post) => (
            <div key={post._id} className="p-4 border-b border-gray-700 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-blue-400 mb-2">{post.title}</h3>
                  <p className="text-gray-300 mb-2">{post.description}</p>
                  {post.link && (
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-sm">
                      {post.link}
                    </a>
                  )}
                  <p className="text-yellow-400 font-semibold mt-2">Votes: {post.votes || 0}</p>
                </div>
                <button
                  onClick={() => deletePost(post._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
