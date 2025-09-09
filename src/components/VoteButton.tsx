"use client";

import { useState } from "react";

interface VoteButtonProps {
  postId: string;
  disabled?: boolean;
  onVoted?: () => void;
}

export default function VoteButton({
  postId,
  disabled = false,
  onVoted,
}: VoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (disabled || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle different error cases
        if (res.status === 401 || data?.error === "Not logged in") {
          alert("Please log in first to vote.");
        } else if (res.status === 403 && data?.error === "You are not whitelisted") {
          alert("You are not whitelisted to vote.");
        } else if (res.status === 403 && data?.error === "You have already voted for this post") {
          alert("🗳️ You can vote only once per post.");
        } else {
          setError(data?.error || "Vote failed");
        }

        setLoading(false);
        return;
      }

      // ✅ Success
      onVoted?.();
    } catch (err) {
      console.error("Vote error:", err);
      setError("Vote failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
        disabled || loading
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-500"
      }`}
    >
      {loading ? "Voting..." : "Vote"}
      {error && <span className="text-red-400 ml-2 text-sm">{error}</span>}
    </button>
  );
}
