"use client";

import React, { useMemo, useState } from "react";

interface ContentSubmission {
  _id: string;
  twitterHandle?: string;
  discordUsername?: string;
  contentLink: string;
  contentType?: string;
  createdAt?: string;
  impressions?: number;
}

interface SubmissionsTabProps {
  contentSubmissions: ContentSubmission[];
  updateSubmissionStatus: (
    id: string,
    status: "pending" | "approved" | "rejected",
    adminNotes?: string
  ) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  submissionSearch: string;
  setSubmissionSearch: React.Dispatch<React.SetStateAction<string>>;
}

export default function SubmissionsTab({
  contentSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
  submissionSearch,
  setSubmissionSearch,
}: SubmissionsTabProps) {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const years = Array.from(
    new Set(
      contentSubmissions
        .map((s) => (s.createdAt ? new Date(s.createdAt).getFullYear() : null))
        .filter((y): y is number => y !== null)
    )
  ).sort((a, b) => b - a);

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const filteredSubmissions = useMemo(
    () =>
      contentSubmissions.filter((sub) => {
        const search = submissionSearch.toLowerCase();
        const matchesSearch =
          (sub.twitterHandle || "").toLowerCase().includes(search) ||
          (sub.discordUsername || "").toLowerCase().includes(search) ||
          sub.contentLink.toLowerCase().includes(search);

        if (!matchesSearch) return false;

        if (yearFilter !== "all" && sub.createdAt) {
          const y = new Date(sub.createdAt).getFullYear().toString();
          if (y !== yearFilter) return false;
        }

        if (monthFilter !== "all" && sub.createdAt) {
          const m = new Date(sub.createdAt).getMonth();
          if ((m + 1).toString() !== monthFilter) return false;
        }

        if (typeFilter !== "all" && sub.contentType) {
          if (sub.contentType !== typeFilter) return false;
        }

        return true;
      }),
    [contentSubmissions, submissionSearch, yearFilter, monthFilter, typeFilter]
  );

  return (
    <div className="bg-[#11161c] border border-gray-800 overflow-x-hidden">
      {/* Search + Filters */}
      <div className="p-3 sm:p-4 border-b border-gray-800 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
        <input
          type="text"
          placeholder="Search submissions"
          value={submissionSearch}
          onChange={(e) => setSubmissionSearch(e.target.value)}
          className="
            w-full sm:w-56 bg-[#0b0f14]
            border border-gray-800
            px-3 py-2
            text-[11px] sm:text-sm
            text-white
            focus:outline-none
          "
        />

        <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
          {/* Year */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-[#0b0f14] border border-gray-800 px-2 py-1 text-white"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-[#0b0f14] border border-gray-800 px-2 py-1 text-white"
          >
            <option value="all">All months</option>
            {MONTHS.map((m, idx) => (
              <option key={m} value={(idx + 1).toString()}>
                {m}
              </option>
            ))}
          </select>

          {/* Type / Category */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0b0f14] border border-gray-800 px-2 py-1 text-white"
          >
            <option value="all">All types</option>
            <option value="short-form">Short form</option>
            <option value="thread">Thread</option>
            <option value="video">Video</option>
            <option value="infographics">Infographics</option>
            <option value="artwork">Artwork</option>
            <option value="stream-clip">Stream clip</option>
          </select>
        </div>
      </div>

      {/* Header */}
      <div
        className="
          grid grid-cols-6
          px-2 sm:px-4 py-2
          text-[11px] sm:text-sm
          font-bold text-white
          border-b border-gray-800
        "
      >
        <div className="truncate">Twitter</div>
        <div className="truncate">Discord</div>
        <div className="truncate">Link</div>
        <div className="truncate">Category</div>
        <div className="truncate">Submitted</div>
        <div className="text-right truncate">Impressions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800">
        {filteredSubmissions.length === 0 ? (
          <div className="p-4 text-[11px] sm:text-sm text-gray-400">
            No submissions found
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub._id}
              className="
                grid grid-cols-6
                px-2 sm:px-4 py-2
                text-[11px] sm:text-sm
                items-center
              "
            >
              {/* Twitter */}
              <div className="text-white truncate min-w-0 text-left">
                {sub.twitterHandle || "—"}
              </div>

              {/* Discord */}
              <div className="text-white truncate min-w-0 text-left">
                {sub.discordUsername || "—"}
              </div>

              {/* Link */}
              <div className="min-w-0 text-left">
                <a
                  href={sub.contentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#10B981] truncate inline-block"
                >
                  Open
                </a>
              </div>

              {/* Category / Type */}
              <div className="text-white truncate min-w-0 text-left">
                {sub.contentType || "—"}
              </div>

              {/* Submitted date */}
              <div className="text-white truncate min-w-0 text-left">
                {sub.createdAt
                  ? new Date(sub.createdAt).toLocaleDateString("en-US")
                  : "—"}
              </div>

              {/* Impressions */}
              <div className="text-right text-[#3aa0d8] truncate">
                {typeof sub.impressions === "number" ? sub.impressions : "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
