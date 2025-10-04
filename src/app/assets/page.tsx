"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Asset {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  type: "image" | "video" | "banner";
  category?: string;
  createdAt: string;
}

export default function AssetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "banner">("all");
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

    const fetchAssets = async () => {
      try {
        const response = await fetch("/api/assets");
        const data = await response.json();
        setAssets(data);
        setFilteredAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [status, session]);

  useEffect(() => {
    let filtered = assets;

    if (filter !== "all") {
      filtered = filtered.filter(asset => asset.type === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.category && asset.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredAssets(filtered);
  }, [assets, filter, searchTerm]);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return "🖼️";
      case "video": return "🎥";
      case "banner": return "🎨";
      default: return "📁";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-blue-600";
      case "video": return "bg-red-600";
      case "banner": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <>
      <Navbar showHomeHeading={false} />
      
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">📁 Assets Library</h1>
            <p className="text-gray-400 text-lg">Access images, videos, and banners for your content creation</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setFilter("image")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === "image"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  🖼️ Images
                </button>
                <button
                  onClick={() => setFilter("video")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === "video"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  🎥 Videos
                </button>
                <button
                  onClick={() => setFilter("banner")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === "banner"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  🎨 Banners
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-full md:w-64"
              />
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${getTypeColor(asset.type)} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {getTypeIcon(asset.type)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.type === "image" ? "bg-blue-100 text-blue-800" :
                    asset.type === "video" ? "bg-red-100 text-red-800" :
                    "bg-purple-100 text-purple-800"
                  }`}>
                    {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {asset.title}
                </h3>

                {asset.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                    {asset.description}
                  </p>
                )}

                {asset.category && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                      {asset.category}
                    </span>
                  </div>
                )}

                <a
                  href={asset.gdriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition duration-200"
                >
                  📥 Download
                </a>
              </div>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No assets found</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "No assets have been uploaded yet"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
