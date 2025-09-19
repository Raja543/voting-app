"use client";

import { useEffect, useState, memo } from "react";
import { useSession } from "next-auth/react";

interface VoteButtonProps {
  postId: string;
  hasVoted?: boolean;
  userTotalVotes?: number;
  onVoted?: () => void;
  disabled?: boolean;
}

const VoteButton = memo(function VoteButton({ postId, hasVoted: initialHasVoted, userTotalVotes: initialUserTotalVotes, onVoted, disabled }: VoteButtonProps) {
  const { data: session } = useSession();
  
  const [hasVoted, setHasVoted] = useState(initialHasVoted || false);
  const [userTotalVotes, setUserTotalVotes] = useState(initialUserTotalVotes || 0);
  const [submitting, setSubmitting] = useState(false);

  // Update state when props change
  useEffect(() => {
    setHasVoted(initialHasVoted || false);
    setUserTotalVotes(initialUserTotalVotes || 0);
  }, [initialHasVoted, initialUserTotalVotes]);

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
});

export default VoteButton;
