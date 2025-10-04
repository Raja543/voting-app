"use client";

interface Asset {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  type: "image" | "video" | "banner";
  category?: string;
  createdAt: string;
}

interface AssetsTabProps {
  assets: Asset[];
  newAsset: { title: string; description: string; gdriveLink: string; type: "image" | "video" | "banner"; category: string };
  setNewAsset: (asset: { title: string; description: string; gdriveLink: string; type: "image" | "video" | "banner"; category: string }) => void;
  addAsset: (e: React.FormEvent) => void;
  deleteAsset: (id: string) => void;
  assetSearch: string;
  setAssetSearch: (search: string) => void;
}

export default function AssetsTab({
  assets,
  newAsset,
  setNewAsset,
  addAsset,
  deleteAsset,
  assetSearch,
  setAssetSearch,
}: AssetsTabProps) {
  const filteredAssets = assets.filter(asset => 
    asset.title.toLowerCase().includes(assetSearch.toLowerCase()) ||
    (asset.description && asset.description.toLowerCase().includes(assetSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Add Asset Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Add New Asset</h2>
        <form onSubmit={addAsset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Asset Title"
            value={newAsset.title}
            onChange={(e) => setNewAsset(prev => ({ ...prev, title: e.target.value }))}
            required
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <select
            value={newAsset.type}
            onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value as "image" | "video" | "banner" }))}
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          >
            <option value="image">🖼️ Image</option>
            <option value="video">🎥 Video</option>
            <option value="banner">🎨 Banner</option>
          </select>
          <input
            type="url"
            placeholder="GDrive Link"
            value={newAsset.gdriveLink}
            onChange={(e) => setNewAsset(prev => ({ ...prev, gdriveLink: e.target.value }))}
            required
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={newAsset.category}
            onChange={(e) => setNewAsset(prev => ({ ...prev, category: e.target.value }))}
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={newAsset.description}
            onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
            className="md:col-span-2 rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={2}
          />
          <button
            type="submit"
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            ➕ Add Asset
          </button>
        </form>
      </div>

      {/* Assets List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-blue-400">Assets</h2>
          <input
            type="text"
            placeholder="Search assets..."
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            className="mt-4 w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredAssets.map((asset) => (
            <div key={asset._id} className="p-4 border-b border-gray-700 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {asset.type === "image" ? "🖼️" : asset.type === "video" ? "🎥" : "🎨"}
                    </span>
                    <h3 className="font-semibold text-lg text-blue-400">{asset.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.type === "image" ? "bg-blue-100 text-blue-800" :
                      asset.type === "video" ? "bg-red-100 text-red-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                    </span>
                  </div>
                  {asset.description && (
                    <p className="text-gray-300 mb-2">{asset.description}</p>
                  )}
                  {asset.category && (
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                      {asset.category}
                    </span>
                  )}
                  <div className="mt-2">
                    <a
                      href={asset.gdriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      {asset.gdriveLink}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => deleteAsset(asset._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
