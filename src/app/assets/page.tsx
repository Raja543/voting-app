"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";

/* ---------------- TYPES ---------------- */

interface Asset {
  _id: string;
  title: string;
  gdriveLink: string;
  type: "image" | "video" | "banner";
  category?: string;
}

type TabId = "branding" | "icons" | "images" | "videos" | "misc";

const TABS: { id: TabId; label: string }[] = [
  { id: "branding", label: "Branding" },
  { id: "icons", label: "Game Icons" },
  { id: "images", label: "Images" },
  { id: "videos", label: "Videos" },
  { id: "misc", label: "Misc." },
];

/* ---------------- PAGE ---------------- */

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("branding");
  const [search, setSearch] = useState("");

  /* ---------------- FETCH ASSETS ---------------- */

  useEffect(() => {
    fetch("/api/assets")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  /* ---------------- FILTER ASSETS ---------------- */

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (search && !asset.title.toLowerCase().includes(search.toLowerCase()))
        return false;

      switch (activeTab) {
        case "branding":
          return asset.category === "branding";
        case "icons":
          return asset.category === "icons";
        case "images":
          return asset.type === "image";
        case "videos":
          return asset.type === "video";
        case "misc":
          return !asset.category && !["image", "video"].includes(asset.type);
        default:
          return true;
      }
    });
  }, [assets, activeTab, search]);

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#0b0f14] overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

          {/* Subtitle */}
          <h1 className="text-center text-white text-sm sm:text-base font-medium">
            Gigaverse assets for content creation and distribution
          </h1>

          {/* Tabs + Search */}
          <div
            className="
              bg-[#11161c] border border-gray-800
              p-3
              flex flex-col gap-3
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            {/* Tabs
              - grid-cols-2 on very small phones
              - flex-wrap on sm+
              - NO horizontal scroll
            */}
            <div
              className="
                grid grid-cols-2 gap-2
                sm:flex sm:flex-wrap
              "
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-3 py-1
                      text-xs sm:text-sm font-medium
                      transition
                      ${
                        active
                          ? "bg-white text-black"
                          : "bg-[#0b0f14] text-white/70 hover:text-white"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search assets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full sm:w-56
                bg-[#0b0f14]
                border border-gray-700
                px-3 py-1
                text-xs sm:text-sm text-white
                placeholder-white/50
                focus:outline-none
              "
            />
          </div>

          {/* Assets Grid */}
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-3 sm:gap-4
            "
          >
            {/* Empty placeholders */}
            {filteredAssets.length === 0 &&
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#11161c] border border-gray-800"
                />
              ))}

            {/* Assets */}
            {filteredAssets.map((asset) => (
              <a
                key={asset._id}
                href={asset.gdriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  aspect-square
                  bg-[#11161c]
                  border border-gray-800
                  hover:border-gray-600
                  transition
                  overflow-hidden
                  flex items-center justify-center
                "
              >
                {asset.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.gdriveLink}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-[10px] sm:text-xs text-white/80 break-words">
                    {asset.type === "video" ? "Video" : "Asset"}: {asset.title}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
