"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import VoteButton from "@/components/VoteButton";
import VotingCountdown from "@/components/VotingCountdown";

interface Post {
  _id: string;
  title: string;
  description: string;
  votes: number;
  link?: string;
}

// Memoized PostCard component to prevent unnecessary re-renders
const PostCard = memo(({ post, voteStatus, userTotalVotes, onVoteSuccess }: {
  post: Post;
  voteStatus: Record<string, boolean>;
  userTotalVotes: number;
  onVoteSuccess: (postId: string) => void;
}) => (
  <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 hover:border-blue-500 hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col h-full">
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
      <VoteButton 
        postId={post._id} 
        hasVoted={voteStatus[post._id] || false}
        userTotalVotes={userTotalVotes}
        onVoted={() => onVoteSuccess(post._id)} 
      />
    </div>
  </div>
));

PostCard.displayName = 'PostCard';

const Postlist = memo(function Postlist() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteStatus, setVoteStatus] = useState<Record<string, boolean>>({});
  const [userTotalVotes, setUserTotalVotes] = useState(0);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch posts, vote status, and voting status in parallel
        const [postsRes, votesRes, votingStatusRes] = await Promise.all([
          fetch("/api/posts"),
          session?.user?.email ? fetch("/api/votes?allPosts=true") : Promise.resolve(null),
          fetch("/api/voting-status")
        ]);

        const postsData: Post[] = await postsRes.json();
        setPosts(postsData.map(post => ({ ...post, _id: post._id.toString() })));

        // Handle vote status if user is logged in
        if (votesRes && votesRes.ok) {
          const votesData = await votesRes.json();
          setVoteStatus(votesData.voteStatus || {});
          setUserTotalVotes(votesData.userTotalVotes || 0);
        } else {
          setVoteStatus({});
          setUserTotalVotes(0);
        }

        // Handle voting status
        if (votingStatusRes && votingStatusRes.ok) {
          const votingStatusData = await votingStatusRes.json();
          setIsVotingActive(votingStatusData.isVotingActive);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setPosts([]);
        setVoteStatus({});
        setUserTotalVotes(0);
        setIsVotingActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.email]);

  // Memoize posts to prevent unnecessary re-renders
  const memoizedPosts = useMemo(() => posts, [posts]);

  const handleVoteSuccess = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, votes: post.votes + 1 } : post
      )
    );
    // Update vote status locally
    setVoteStatus(prev => ({ ...prev, [postId]: true }));
    setUserTotalVotes(prev => prev + 1);
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">
            Vote for Your Favorites
          </h1>
          
          <VotingCountdown />

          {!isVotingActive ? (
            // When voting is inactive, don't show "No posts available" or voting tip
            null
          ) : loading ? (
            null
          ) : memoizedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-gray-500">No posts available</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memoizedPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  voteStatus={voteStatus}
                  userTotalVotes={userTotalVotes}
                  onVoteSuccess={handleVoteSuccess}
                />
              ))}
            </div>
          )}

          {session?.user?.email && !session.user.isAdmin && isVotingActive && (
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
});

export default Postlist;
