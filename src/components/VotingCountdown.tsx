"use client";
import { useState, useEffect } from "react";

export default function VotingCountdown() {
  const [timeLeft, setTimeLeft] = useState("");
  const [isVotingActive, setIsVotingActive] = useState<boolean | null>(null);

  useEffect(() => {
    const update = async () => {
      const res = await fetch("/api/voting-status");
      const data = await res.json();

      if (!data) {
        setIsVotingActive(null);
        setTimeLeft("");
        return;
      }

      if (!data.isVotingActive || !data.votingEndTime) {
        setIsVotingActive(false);
        setTimeLeft("");
        return;
      }

      setIsVotingActive(true);

      const diff = new Date(data.votingEndTime).getTime() - Date.now();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);

      setTimeLeft(d > 0 ? `${d}D ${h}H ${m}M` : `${h}H ${m}M`);
    };

    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, []);
  if (isVotingActive === null) return null;
  if (!isVotingActive) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
        <span className="h-2 w-2 rounded-full bg-gray-500" />
        <span>Voting is not live right now</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center justify-center gap-3 text-xs sm:text-sm">
      <span className="flex items-center gap-2 text-[#10B981]">
        <span className="h-2 w-2 rounded-full bg-[#10B981]" />
        LIVE
      </span>
      <span className="text-gray-500">ENDS IN</span>
      <span className="text-[#10B981] font-medium">{timeLeft}</span>
    </div>
  );
}
