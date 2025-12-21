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
  setNewPost: React.Dispatch<
    React.SetStateAction<{ title: string; description: string; link: string }>
  >;
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
  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">

      {/* Voting Control */}
      <div className="bg-[#11161c] border border-gray-800 p-4 sm:p-6 overflow-x-hidden">
        <h2 className="text-[#3aa0d8] text-sm sm:text-lg mb-4">
          Voting control
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
          <span className="text-gray-300 text-xs sm:text-sm break-words">
            Status:
            <span
              className={`ml-2 font-medium ${
                isVotingActive ? "text-[#10B981]" : "text-[#E40041]"
              }`}
            >
              {isVotingActive ? "Active" : "Inactive"}
            </span>
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={startVoting}
              disabled={isVotingActive || isLoading}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${
                isVotingActive
                  ? "bg-gray-700 text-white cursor-not-allowed"
                  : "bg-[#10B981] text-white hover:bg-[#059669]"
              }`}
            >
              Start Voting
            </button>

            <button
              onClick={stopVoting}
              disabled={!isVotingActive || isLoading}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${
                !isVotingActive
                  ? "bg-[#E40041] text-white cursor-not-allowed"
                  : "bg-[#E40041] text-white hover:bg-[#B0003A]"
              }`}
            >
              Close Voting
            </button>
          </div>
        </div>

        {currentPeriod && (
          <div className="text-[10px] sm:text-xs text-gray-500 mt-2 break-words">
            Current period: {currentPeriod}
          </div>
        )}
      </div>

      {/* Add New Post */}
      <div className="bg-[#11161c] border border-gray-800 p-4 sm:p-6 overflow-x-hidden">
        <h2 className="text-[#3aa0d8] text-sm sm:text-lg mb-4">
          Add New Post
        </h2>

        <form onSubmit={addPost} className="space-y-3 sm:space-y-4">
          <input
            placeholder="Post Title"
            value={newPost.title}
            onChange={(e) =>
              setNewPost((p) => ({ ...p, title: e.target.value }))
            }
            className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-xs sm:text-sm text-white min-w-0"
            required
          />

          <textarea
            placeholder="Post Description"
            value={newPost.description}
            onChange={(e) =>
              setNewPost((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-xs sm:text-sm text-white min-w-0"
            required
          />

          <input
            placeholder="Link"
            value={newPost.link}
            onChange={(e) =>
              setNewPost((p) => ({ ...p, link: e.target.value }))
            }
            className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-xs sm:text-sm text-white min-w-0"
          />

          <button
            type="submit"
            className="px-5 py-2 bg-[#10B981] text-white text-xs sm:text-sm hover:bg-[#059669]"
          >
            ADD
          </button>
        </form>
      </div>

      {/* Posts List */}
      <div className="bg-[#11161c] border border-gray-800 overflow-x-hidden">
        <div className="p-4 border-b border-gray-800">
          <input
            placeholder="Search"
            value={postSearch}
            onChange={(e) => setPostSearch(e.target.value)}
            className="w-full sm:w-1/2 bg-[#0b0f14] px-3 py-2 text-xs sm:text-sm text-white min-w-0"
          />
        </div>

        <div className="divide-y divide-gray-800 max-h-[420px] overflow-y-auto overflow-x-hidden">
          {filteredPosts.map((post, i) => (
            <div
              key={post._id}
              className="p-4 flex flex-col sm:flex-row justify-between gap-4 min-w-0"
            >
              <div className="min-w-0">
                <div className="text-[#3aa0d8] text-sm sm:text-lg break-words">
                  {i + 1}. {post.title}
                </div>

                <div className="text-gray-300 text-xs sm:text-sm break-words">
                  {post.description}
                </div>

                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10B981] text-xs sm:text-sm break-all block"
                  >
                    {post.link}
                  </a>
                )}

                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Votes: {post.votes || 0}
                </div>
              </div>

              <button
                onClick={() => deletePost(post._id)}
                className="bg-[#E40041] hover:bg-[#B0003A] text-[10px] sm:text-xs px-4 py-1 text-white self-start shrink-0"
              >
                Delete
              </button>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="p-6 text-gray-500 text-xs sm:text-sm">
              No posts found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
