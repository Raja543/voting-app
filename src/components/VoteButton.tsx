"use client";

import { useEffect, useState, memo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface VoteButtonProps {
  postId: string;
  hasVoted?: boolean;
  userTotalVotes?: number;
  onVoted?: () => void;
}

const VoteButton = memo(function VoteButton({
  postId,
  hasVoted: initialHasVoted,
  userTotalVotes: initialUserTotalVotes,
  onVoted,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [hasVoted, setHasVoted] = useState(!!initialHasVoted);
  const [userTotalVotes, setUserTotalVotes] = useState(initialUserTotalVotes || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHasVoted(!!initialHasVoted);
    setUserTotalVotes(initialUserTotalVotes || 0);
  }, [initialHasVoted, initialUserTotalVotes]);

  const handleVote = async () => {
    if (loading || hasVoted || userTotalVotes >= 2) return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        setHasVoted(true);
        setUserTotalVotes((v) => v + 1);
        onVoted?.();
      }
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- Button State --------------------------- */

  let label = "Vote";
  let disabled = false;
  let classes =
    "px-3 py-1 text-xs font-medium whitespace-nowrap transition rounded";

  if (!session?.user?.email) {
    label = "Login to Vote";
    classes += " bg-[#10B981] hover:bg-[#0ea371] text-white";
  } else if (hasVoted) {
    label = "✓ Voted";
    disabled = true;
    classes += " bg-[#10B981] text-white opacity-60 cursor-not-allowed";
  } else if (userTotalVotes >= 2) {
    label = "Vote Limit Reached";
    disabled = true;
    classes += " bg-gray-600 text-white cursor-not-allowed";
  } else if (loading) {
    label = "Voting...";
    disabled = true;
    classes += " bg-gray-600 text-white cursor-not-allowed";
  } else {
    classes += " bg-[#10B981] hover:bg-[#0ea371] text-white";
  }

  return (
    <button onClick={handleVote} disabled={disabled} className={classes}>
      {label}
    </button>
  );
});

export default VoteButton;
