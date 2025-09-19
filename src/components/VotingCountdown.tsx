"use client";

import { useState, useEffect } from "react";

interface VotingStatus {
  isVotingActive: boolean;
  currentPeriod: string | null;
  votingEndTime: string | null;
  timeRemaining: number | null;
}

export default function VotingCountdown() {
  const [votingStatus, setVotingStatus] = useState<VotingStatus>({
    isVotingActive: false,
    currentPeriod: null,
    votingEndTime: null,
    timeRemaining: null
  });
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const fetchVotingStatus = async () => {
      try {
        const response = await fetch("/api/voting-status");
        const data = await response.json();
        setVotingStatus(data);
      } catch (err) {
        console.error("Failed to fetch voting status:", err);
      }
    };

    fetchVotingStatus();
    
    // Update every minute
    const interval = setInterval(fetchVotingStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!votingStatus.isVotingActive || !votingStatus.timeRemaining) {
      setTimeLeft("");
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const endTime = new Date(votingStatus.votingEndTime!).getTime();
      const remaining = Math.max(0, endTime - now);

      if (remaining <= 0) {
        setTimeLeft("Voting has ended");
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [votingStatus]);

  if (!votingStatus.isVotingActive) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center mb-6">
        <div className="text-red-300 font-medium text-lg">
          🔴 Voting is currently inactive
        </div>
        <div className="text-red-400 text-sm mt-1">
          Check back later when admin starts voting
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center mb-6">
      <div className="text-green-300 font-medium text-lg mb-2">
        🟢 Voting is Active - {votingStatus.currentPeriod}
      </div>
      {timeLeft && (
        <div className="text-green-400 text-sm">
          Voting ends in: <span className="font-bold text-green-300">{timeLeft}</span>
        </div>
      )}
    </div>
  );
}
