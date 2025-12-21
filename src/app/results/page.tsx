"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";

/* ---------------- TYPES ---------------- */

interface VotingResult {
  _id: string;
  title: string;
  description: string;
  link?: string;
  totalVotes: number;
  rank: number;
  votingPeriod: string;
}

/* ---------------- CONSTANTS ---------------- */

const MONTH_LABELS = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
];

const MONTH_NAME_MAP: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

/* ---------------- PAGE ---------------- */

export default function ResultsPage() {
  const [periods, setPeriods] = useState<string[]>([]);
  const [activePeriod, setActivePeriod] = useState("");
  const [results, setResults] = useState<VotingResult[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH PERIODS ---------------- */

  useEffect(() => {
    fetch("/api/voting-periods")
      .then((r) => r.json())
      .then((data: string[]) => {
        setPeriods(data);
        if (data.length > 0) setActivePeriod(data[data.length - 1]);
      });
  }, []);

  /* ---------------- FETCH RESULTS ---------------- */

  useEffect(() => {
    if (!activePeriod) return;

    setLoading(true);
    fetch(`/api/voting-results?period=${activePeriod}`)
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [activePeriod]);

  /* ---------------- YEAR / MONTH MAP ---------------- */

  const yearMap = useMemo(() => {
    const map: Record<string, Set<number>> = {};

    periods.forEach((p) => {
      const parts = p.split(" ");
      if (parts.length < 2) return;

      const year = parts.at(-1)!;
      const monthKey = parts.slice(0, -1).join(" ").toLowerCase();
      const idx = MONTH_NAME_MAP[monthKey];
      if (idx === undefined) return;

      if (!map[year]) map[year] = new Set();
      map[year].add(idx);
    });

    return map;
  }, [periods]);

  const years = Object.keys(yearMap).sort((a, b) => Number(b) - Number(a));

  const isActive = (year: string, idx: number) =>
    activePeriod.toLowerCase().includes(year) &&
    MONTH_NAME_MAP[
      activePeriod.split(" ").slice(0, -1).join(" ").toLowerCase()
    ] === idx;

  const hasData = (year: string, idx: number) =>
    yearMap[year]?.has(idx);

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#0b0f14] overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* HEADER */}
          <div className="text-center space-y-1">
            <h1 className="text-white text-sm font-medium">
              Voting results
            </h1>
            {activePeriod && (
              <p className="text-xs text-white/60">{activePeriod}</p>
            )}
          </div>

          {/* PERIOD GRID */}
          <div className="bg-[#11161c] border border-gray-800 p-4 space-y-6">
            {years.map((year) => (
              <div key={year} className="space-y-2">
                <div className="text-white text-sm font-medium">
                  {year}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2">
                  {MONTH_LABELS.map((label, idx) => {
                    const active = isActive(year, idx);
                    const available = hasData(year, idx);

                    return (
                      <button
                        key={`${year}-${label}`}
                        onClick={() =>
                          setActivePeriod(
                            `${Object.keys(MONTH_NAME_MAP).find(
                              (k) => MONTH_NAME_MAP[k] === idx && k.length > 3
                            )?.replace(/^\w/, c => c.toUpperCase())} ${year}`
                          )
                        }
                        className={`
                          text-xs py-1 border
                          ${
                            active
                              ? "bg-white text-black border-white"
                              : available
                              ? "bg-[#0b0f14] text-white/70 border-gray-700 hover:border-gray-500"
                              : "bg-[#0b0f14] text-white/30 border-gray-800"
                          }
                        `}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RESULTS TABLE */}
          <div className="bg-[#11161c] border border-gray-800">

            {/* DESKTOP HEADER */}
            <div className="hidden md:grid grid-cols-[40px_minmax(0,1fr)_60px_60px]
              px-4 py-3 text-xs text-white border-b border-gray-800">
              <div>#</div>
              <div>Creator & Content</div>
              <div>Link</div>
              <div className="text-right">Votes</div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-white/60 text-sm">
                Loading results…
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-white/60 text-sm">
                No results found for this period
              </div>
            ) : (
              results.map((r) => (
                <div
                  key={r._id}
                  className="border-b border-gray-800 px-4 py-3 hover:bg-[#0f141a]"
                >
                  {/* MOBILE */}
                  <div className="md:hidden space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Rank #{r.rank}</span>
                      <span className="text-[#3aa0d8]">{r.totalVotes} votes</span>
                    </div>

                    <div>
                      <div className="text-white font-medium break-words">
                        {r.title}
                      </div>
                      <div className="text-white/60 text-xs line-clamp-2">
                        {r.description}
                      </div>
                      {r.link && (
                        <a
                          href={r.link}
                          target="_blank"
                          className="text-[#10B981] text-xs"
                        >
                          Open link
                        </a>
                      )}
                    </div>
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden md:grid grid-cols-[20px_minmax(0,1fr)_60px_60px]
                    gap-2 items-center text-sm text-white">
                    <div>{r.rank}</div>

                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">
                        {r.title}
                      </div>
                      <div className="text-white/50 text-xs truncate">
                        {r.description}
                      </div>
                    </div>

                    <div>
                      {r.link ? (
                        <a
                          href={r.link}
                          target="_blank"
                          className="text-[#10B981]"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>

                    <div className="text-right text-[#3aa0d8]">
                      {r.totalVotes}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
