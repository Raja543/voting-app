"use client";

import { useEffect, useState } from "react";

interface VoteButtonProps {
  postId: string;
  onVoted?: () => void;
  disabled?: boolean;
}

export default function VoteButton({ postId, onVoted, disabled }: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState<number>(0);

  // ✅ Load vote status + count ONCE
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await fetch(`/api/votes?postId=${postId}`);
        const data = await res.json();
        setCount(data.count || 0);
        setHasVoted(data.hasVoted || false);
      } catch (err) {
        console.error("Error fetching votes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [postId]);

  // ✅ Handle vote
  const handleVote = async () => {
    if (hasVoted || disabled) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();

      if (res.ok) {
        setHasVoted(true);
        setCount((prev) => prev + 1);
        onVoted?.();
      } else {
        alert(data.error || "Error voting");
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-400 rounded">
        Loading...
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleVote}
        disabled={hasVoted || submitting || disabled}
        className={`px-4 py-2 rounded ${
          hasVoted
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {hasVoted ? "Already Voted" : submitting ? "Voting..." : "Vote"}
      </button>
    </div>
  );
}
