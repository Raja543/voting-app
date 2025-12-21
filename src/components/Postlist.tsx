"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import VoteButton from "@/components/VoteButton";
import VotingCountdown from "@/components/VotingCountdown";

interface Post {
  _id: string;
  title: string;
  description: string;
  votes: number;
  link?: string;
}

/* ----------------------------- Post Card ----------------------------- */

const PostCard = memo(function PostCard({
  post,
  hasVoted,
  userTotalVotes,
  onVoteSuccess,
}: {
  post: Post;
  hasVoted: boolean;
  userTotalVotes: number;
  onVoteSuccess: (postId: string) => void;
}) {
  return (
    <div className="bg-[#161B22] border border-[#1f2933] p-4 flex flex-col min-h-[170px]">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-[#027DA4] truncate">
          {post.title}
        </h3>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-2 break-words">
          {post.description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 justify-between">
        {/* POST */}
        {post.link ? (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#027DA4] hover:bg-[#026b8f] px-3 py-1 text-xs text-white"
          >
            ✕ POST
          </a>
        ) : (
          <span className="shrink-0 bg-[#027DA4]/40 px-3 py-1 text-xs text-white/60">
            ✕ POST
          </span>
        )}

        {/* VOTE */}
        <div className="shrink-0">
          <VoteButton
            postId={post._id}
            hasVoted={hasVoted}
            userTotalVotes={userTotalVotes}
            onVoted={() => onVoteSuccess(post._id)}
          />
        </div>
      </div>
    </div>
  );
});

/* ----------------------------- Main Page ----------------------------- */

const Postlist = memo(function Postlist() {
  const { data: session, status } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [voteStatus, setVoteStatus] = useState<Record<string, boolean>>({});
  const [userTotalVotes, setUserTotalVotes] = useState(0);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, votesRes, votingStatusRes] = await Promise.all([
          fetch("/api/posts"),
          session?.user?.email
            ? fetch("/api/votes?allPosts=true")
            : Promise.resolve(null),
          fetch("/api/voting-status"),
        ]);

        setPosts(await postsRes.json());

        if (votesRes?.ok) {
          const votes = await votesRes.json();
          setVoteStatus(votes.voteStatus || {});
          setUserTotalVotes(votes.userTotalVotes || 0);
        }

        if (votingStatusRes.ok) {
          const s = await votingStatusRes.json();
          setIsVotingActive(s.isVotingActive);
          setCurrentPeriod(s.currentPeriod);
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.email, status]);

  const handleVoteSuccess = useCallback((postId: string) => {
    setVoteStatus((p) => ({ ...p, [postId]: true }));
    setUserTotalVotes((v) => v + 1);
  }, []);

  const memoizedPosts = useMemo(() => posts, [posts]);

  // Compute previous month label from currentPeriod (e.g. "December 2025" -> "November 2025")
  const previousPeriod = useMemo(() => {
    if (!currentPeriod) return null;

    const parts = currentPeriod.split(" ");
    if (parts.length < 2) return null;

    const monthName = parts[0];
    const yearNum = Number(parts[1]);
    if (!yearNum) return null;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const idx = monthNames.findIndex(
      (m) => m.toLowerCase() === monthName.toLowerCase()
    );
    if (idx === -1) return null;

    let prevIdx = idx - 1;
    let prevYear = yearNum;
    if (prevIdx < 0) {
      prevIdx = 11;
      prevYear -= 1;
    }

    return `${monthNames[prevIdx]} ${prevYear}`;
  }, [currentPeriod]);

  return (
    <>
      <Sidebar />

      <div className="min-h-screen bg-[#0b0f14] text-gray-100 px-4 py-6">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <div className="mb-6 text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2 text-base sm:text-lg font-semibold">
              <span>Vote for your favorite content from</span>
              {previousPeriod && (
                <span className="px-2 py-1 text-[#027DA4] bg-[#027DA4]/10 rounded">
                  {previousPeriod}
                </span>
              )}
            </div>
            <VotingCountdown />
          </div>

          {/* Grid */}
          {!isVotingActive || loading ? null : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {memoizedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  hasVoted={!!voteStatus[post._id]}
                  userTotalVotes={userTotalVotes}
                  onVoteSuccess={handleVoteSuccess}
                />
              ))}
            </div>
          )}

          {/* Footer Hint */}
          {session?.user?.email && !session.user.isAdmin && isVotingActive && (
            <div className="mt-8 text-center text-xs text-gray-500">
              You can vote for up to{" "}
              <span className="text-[#10B981] font-medium">2</span> posts
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Postlist;
