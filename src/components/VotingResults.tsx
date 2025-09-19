"use client";

import { useState, useEffect } from "react";

interface VotingResult {
  _id: string;
  postId: string;
  title: string;
  description: string;
  link?: string;
  authorEmail: string;
  authorName: string;
  totalVotes: number;
  rank: number;
  votingPeriod: string;
  createdAt: string;
}

interface VotingResultsProps {
  votingPeriod: string;
}

export default function VotingResults({ votingPeriod }: VotingResultsProps) {
  const [results, setResults] = useState<VotingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/voting-results?period=${encodeURIComponent(votingPeriod)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch voting results');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (votingPeriod) {
      fetchResults();
    }
  }, [votingPeriod]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-300">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-red-400 text-center">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-gray-400 text-center">
          <p>No voting results found for {votingPeriod}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-green-400">
          Voting Results - {votingPeriod}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Results sorted by total votes (highest to lowest)
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Author
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Link
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Votes
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {results.map((result) => (
              <tr key={result._id} className="hover:bg-gray-700 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      result.rank === 1 
                        ? 'bg-yellow-500 text-black' 
                        : result.rank === 2 
                        ? 'bg-gray-400 text-black' 
                        : result.rank === 3 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-600 text-white'
                    }`}>
                      {result.rank}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {result.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-100">
                        {result.authorName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {result.authorEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-blue-400">
                    {result.title}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-300 max-w-xs truncate">
                    {result.description}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {result.link ? (
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-sm transition"
                    >
                      View Link
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No link</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {result.totalVotes} votes
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-700 bg-gray-750">
        <div className="text-sm text-gray-400">
          <p>Total entries: {results.length}</p>
          <p>Total votes cast: {results.reduce((sum, result) => sum + result.totalVotes, 0)}</p>
        </div>
      </div>
    </div>
  );
}
