"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface VoteButtonProps {
  postId: string;
  onVoted?: () => void;
  disabled?: boolean;
}

export default function VoteButton({ postId, onVoted, disabled }: VoteButtonProps) {
  const { data: session } = useSession();
  
  const [hasVoted, setHasVoted] = useState(false);
  const [userTotalVotes, setUserTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Refetch vote status when postId OR user session changes
  useEffect(() => {
    if (!postId) return;

    // Reset state when user or post changes
    setHasVoted(false);
    setUserTotalVotes(0);
    setLoading(true);

    const fetchVoteStatus = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/votes?postId=${postId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch vote status: ${res.status}`);
        }
        
        const data = await res.json();
        setHasVoted(data.hasVoted || false);
        setUserTotalVotes(data.userTotalVotes || 0);
      } catch (err) {
        console.error("Error fetching vote status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteStatus();
  }, [postId, session?.user?.email]); // ✅ Added session dependency

  const handleVote = async () => {
    if (hasVoted || disabled || submitting) return;

    if (!session?.user?.email) {
      alert("Please log in to vote.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (res.ok) {
        setHasVoted(true);
        setUserTotalVotes(prev => prev + 1);
        onVoted?.();
      } else {
        alert(data.error || "Error voting");
      }
    } catch (err) {
      console.error("Vote error:", err);
      alert("Error voting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (!session?.user?.email) {
    return (
      <button disabled className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
        Login to Vote
      </button>
    );
  }

  // Determine button state
  let buttonText = "Vote";
  let buttonClass = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition";
  let isDisabled = false;

  if (hasVoted) {
    buttonText = "✓ Voted";
    buttonClass = "bg-green-600 text-white px-4 py-2 rounded cursor-not-allowed";
    isDisabled = true;
  } else if (userTotalVotes >= 2) {
    buttonText = "Vote Limit Reached";
    buttonClass = "bg-red-600 text-white px-4 py-2 rounded cursor-not-allowed";
    isDisabled = true;
  } else if (submitting) {
    buttonText = "Voting...";
    buttonClass = "bg-gray-600 text-white px-4 py-2 rounded cursor-not-allowed";
    isDisabled = true;
  }

  return (
    <button
      onClick={handleVote}
      disabled={isDisabled || disabled}
      className={buttonClass}
    >
      {buttonText}
    </button>
  );
}
