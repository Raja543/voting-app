"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface TownhallRecording {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  recordingDate: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: string;
}

export default function TownhallPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recordings, setRecordings] = useState<TownhallRecording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<TownhallRecording[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && session?.user && !session.user.isWhitelisted) {
      router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.isWhitelisted) return;

    const fetchRecordings = async () => {
      try {
        const response = await fetch("/api/townhall-recordings");
        const data = await response.json();
        setRecordings(data);
        setFilteredRecordings(data);
      } catch (error) {
        console.error("Error fetching recordings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [status, session]);

  useEffect(() => {
    let filtered = recordings;

    if (selectedYear !== "all") {
      filtered = filtered.filter(recording => {
        const date = new Date(recording.recordingDate);
        return date.getFullYear().toString() === selectedYear;
      });
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter(recording => {
        const date = new Date(recording.recordingDate);
        return (date.getMonth() + 1).toString() === selectedMonth;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(recording =>
        recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recording.description && recording.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRecordings(filtered);
  }, [recordings, selectedYear, selectedMonth, searchTerm]);

  const getAvailableYears = () => {
    const years = new Set(recordings.map(recording => new Date(recording.recordingDate).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  };

  const getAvailableMonths = () => {
    const months = new Set(recordings.map(recording => new Date(recording.recordingDate).getMonth() + 1));
    return Array.from(months).sort((a, b) => b - a);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.isWhitelisted) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Access Denied</div>;
  }

  return (
    <>
      <Navbar showHomeHeading={false} />
      
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🏛️ Townhall Recordings</h1>
            <p className="text-gray-400 text-lg">Watch past townhall meetings and community discussions</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Years</option>
                  {getAvailableYears().map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Months</option>
                  {getAvailableMonths().map(month => (
                    <option key={month} value={month.toString()}>{getMonthName(month)}</option>
                  ))}
                </select>
              </div>
              
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-full lg:w-64"
              />
            </div>
          </div>

          {/* Recordings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((recording) => (
              <div
                key={recording._id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
              >
                {recording.thumbnailUrl ? (
                  <div className="aspect-video bg-gray-700 flex items-center justify-center">
                    <img
                      src={recording.thumbnailUrl}
                      alt={recording.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl">🎥</div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {formatDate(recording.recordingDate)}
                    </span>
                    {recording.duration && (
                      <span className="text-sm text-gray-400">
                        ⏱️ {recording.duration}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {recording.title}
                  </h3>

                  {recording.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {recording.description}
                    </p>
                  )}

                  <a
                    href={recording.gdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-lg font-medium transition duration-200"
                  >
                    ▶️ Watch Recording
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredRecordings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No recordings found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedYear !== "all" || selectedMonth !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No townhall recordings have been uploaded yet"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
