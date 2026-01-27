"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";

/* ---------------- TYPES ---------------- */

interface TownhallRecording {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  recordingDate: string;
}

/* ---------------- PAGE ---------------- */

export default function TownhallPage() {
  const [recordings, setRecordings] = useState<TownhallRecording[]>([]);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [search, setSearch] = useState("");

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetch("/api/townhall-recordings")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRecordings(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, []);

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    return recordings.filter((r) => {
      const date = new Date(r.recordingDate);

      if (year !== "all" && date.getFullYear().toString() !== year)
        return false;

      if (month !== "all" && date.getMonth() + 1 !== Number(month))
        return false;

      if (
        search &&
        !(
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;

      return true;
    });
  }, [recordings, year, month, search]);

  /* ---------------- META ---------------- */

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          recordings.map((r) =>
            new Date(r.recordingDate).getFullYear()
          )
        )
      ).sort((a, b) => b - a),
    [recordings]
  );

  const months = useMemo(
    () =>
      Array.from(
        new Set(
          recordings.map(
            (r) => new Date(r.recordingDate).getMonth() + 1
          )
        )
      ).sort((a, b) => b - a),
    [recordings]
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#0b0f14] overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

          {/* Subtitle */}
          <h1 className="text-center text-white text-sm sm:text-base font-medium">
            Stay updated with the latest news and updates
          </h1>

          {/* Sort + Search */}
          <div
            className="
              bg-[#11161c] border border-gray-800
              p-4
              flex flex-col gap-3
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white">
              <span className="opacity-60">Sort</span>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-[#0b0f14] border border-gray-700 px-2 py-1 focus:outline-none"
              >
                <option value="all">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-[#0b0f14] border border-gray-700 px-2 py-1 focus:outline-none"
              >
                <option value="all">All months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString("en", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <input
              placeholder="Search recordings"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full sm:w-64
                bg-[#0b0f14]
                border border-gray-700
                px-3 py-1
                text-xs sm:text-sm text-white
                placeholder-white/50
                focus:outline-none
              "
            />
          </div>

          {/* Grid */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
            "
          >
            {filtered.map((r) => (
              <div
                key={r._id}
                className="bg-[#11161c] border border-gray-800 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-[#4b3b75]" />

                {/* Content */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <h2 className="text-[#3aa0d8] text-sm font-medium line-clamp-2">
                    {r.title}
                  </h2>

                  {r.description && (
                    <p className="text-xs text-white/70 line-clamp-2">
                      {r.description}
                    </p>
                  )}

                  <div className="text-xs text-white/50">
                    {formatDate(r.recordingDate)}
                  </div>

                  <a
                    href={r.gdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-[#027DA4] hover:bg-[#016381] px-3 py-1 text-xs text-white w-fit">
                    ▶ WATCH RECORDING
                  </a>
                </div>
              </div>
            ))}
            {filtered.length === 0 &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#11161c] border border-gray-800 h-64"
                />
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
