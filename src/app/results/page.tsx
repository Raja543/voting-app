"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

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

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [results, setResults] = useState<VotingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect logic
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
  }, [status, router]);

  // Fetch available voting periods
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/voting-periods");
        
        if (!response.ok) {
          throw new Error('Failed to fetch voting periods');
        }
        
        const periods = await response.json();
        setAvailablePeriods(periods);
        
        // Auto-select the most recent period if available
        if (periods.length > 0 && !selectedPeriod) {
          setSelectedPeriod(periods[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPeriods();
    }
  }, [status, selectedPeriod]);

  // Fetch results for selected period
  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedPeriod) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/voting-results?period=${encodeURIComponent(selectedPeriod)}`);
        
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

    if (selectedPeriod) {
      fetchResults();
    }
  }, [selectedPeriod]);

  // Loading state
  if (status === "loading") return <div>Loading...</div>;

  // Not authenticated
  if (status === "unauthenticated") return <div>Access Denied</div>;

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-green-400">
              Voting Results
            </h1>

            {/* Period Selection */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Select Voting Period
              </h2>
              {availablePeriods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePeriods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`p-4 rounded-lg border transition ${
                        selectedPeriod === period
                          ? "bg-green-600 border-green-500 text-white"
                          : "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-100"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">{period}</div>
                        <div className="text-sm opacity-75">Click to view results</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No voting results available yet.</p>
                  <p className="text-sm mt-2">Results will appear here after admin closes voting for a month.</p>
                </div>
              )}
            </div>

            {/* Results Table */}
            {selectedPeriod && (
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-semibold text-green-400 mb-2">
                    Results for {selectedPeriod}
                  </h2>
                  <p className="text-gray-400">
                    Posts ranked by total votes (highest to lowest)
                  </p>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-2 text-gray-400">Loading results...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-400">
                    <p>Error: {error}</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p>No results found for {selectedPeriod}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                            Sr. No
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                            Content
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                            Link
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                            Votes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {results.map((result) => (
                          <tr key={result._id} className="hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
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
                            <td className="px-6 py-4">
                              <div className="max-w-md">
                                <div className="text-lg font-semibold text-blue-400 mb-1">
                                  {result.title}
                                </div>
                                <div className="text-sm text-gray-300 line-clamp-2">
                                  {result.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {result.link ? (
                                <a
                                  href={result.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 text-sm font-medium transition"
                                >
                                  View Link
                                </a>
                              ) : (
                                <span className="text-gray-500 text-sm">No link</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                {result.totalVotes} votes
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary */}
                {results.length > 0 && (
                  <div className="p-6 border-t border-gray-700 bg-gray-750">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <div>
                        <span className="font-semibold">Total entries:</span> {results.length}
                      </div>
                      <div>
                        <span className="font-semibold">Total votes cast:</span> {results.reduce((sum, result) => sum + result.totalVotes, 0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
