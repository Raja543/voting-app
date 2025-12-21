"use client";

import Image from "next/image";
import React from "react";

interface Asset {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  type: "image" | "video" | "banner";
  category?: string;
  createdAt: string;
}

interface NewAsset {
  title: string;
  description: string;
  gdriveLink: string;
  type: "image" | "video" | "banner";
  category: string;
}

interface AssetsTabProps {
  assets?: Asset[]; // optional list of existing assets
  newAsset: NewAsset;
  setNewAsset: (asset: NewAsset) => void;
  addAsset: (e: React.FormEvent<HTMLFormElement>) => void;
  assetFiles: File[];
  setAssetFiles: (files: File[]) => void;
  deleteAsset?: (id: string) => void | Promise<void>; // optional delete handler
  assetSearch?: string; // optional search string
  setAssetSearch?: (value: string) => void; // optional search setter
}

export default function AssetsTab({
  newAsset,
  setNewAsset,
  addAsset,
  assetFiles,
  setAssetFiles,
}: AssetsTabProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

  // Create/revoke blob URLs only when assetFiles changes
  React.useEffect(() => {
    if (!assetFiles || assetFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = assetFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [assetFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAssetFiles(files);
  };

  return (
    <form
      onSubmit={addAsset}
      className="bg-[#11161c] border border-gray-800"
    >
      {/* Upload Header */}
      <div
        className="p-6 border-b border-gray-800 flex items-center justify-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src="/upload.png"
          alt="Upload"
          width={48}
          height={48}
          className="opacity-80"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* LEFT  Preview Area */}
        <div className="lg:col-span-2 bg-[#0b0f14] border border-gray-800 flex flex-col min-h-[220px] lg:min-h-[360px]">
          {/* Preview */}
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            {assetFiles && assetFiles.length > 0 ? (
              <span className="text-xs text-gray-300 break-all px-3 text-center">
                {assetFiles.length === 1
                  ? `Selected file: ${assetFiles[0].name}`
                  : `${assetFiles.length} files selected`}
              </span>
            ) : (
              <span>Asset preview will appear here</span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-2 p-2 border-t border-gray-800 overflow-x-auto">
            {assetFiles && assetFiles.length > 0
              ? assetFiles.slice(0, 10).map((file, i) => {
                  const isImage = file.type.startsWith("image/");
                  const url = previewUrls[i];
                  return (
                    <div
                      key={i}
                      className="h-14 bg-[#11161c] border border-gray-800 flex items-center justify-center overflow-hidden"
                    >
                      {isImage && url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-300 px-1 truncate">
                          {file.name}
                        </span>
                      )}
                    </div>
                  );
                })
              : Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-[#11161c] border border-gray-800"
                  />
                ))}
          </div>
        </div>

        {/* RIGHT  Metadata */}
        <div className="space-y-6">
          {/* Category (for organizing assets) */}
          <div>
            <label className="block text-[#3aa0d8] text-sm mb-2">
              Category
            </label>
            <select
              value={newAsset.category}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  category: e.target.value,
                })
              }
              className="
                w-full
                bg-[#0b0f14]
                border border-gray-800
                px-3 py-2
                text-white text-sm
                focus:outline-none
              "
            >
              <option value="">Select category...</option>
              <option value="Branding">Branding</option>
              <option value="Game Icons">Game Icons</option>
              <option value="Images">Images</option>
              <option value="Videos">Videos</option>
              <option value="Misc">Misc.</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[#3aa0d8] text-sm mb-2">
              Title
            </label>
            <input
              type="text"
              value={newAsset.title}
              onChange={(e) =>
                setNewAsset({ ...newAsset, title: e.target.value })
              }
              placeholder="Title"
              required
              className="
                w-full
                bg-[#0b0f14]
                border border-gray-800
                px-3 py-2
                text-white text-sm
                focus:outline-none
              "
            />
          </div>

          {/* File input (hidden, triggered by header icon) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Hidden link (kept for logic consistency) */}
          <input type="hidden" value={newAsset.gdriveLink} />

          {/* Submit */}
          <button
            type="submit"
            className="
              w-full
              bg-[#10B981]
              hover:bg-[#059669]
              text-white
              py-2
              text-sm
              font-medium
            "
          >
            Upload Asset
          </button>
        </div>
      </div>
    </form>
  );
}
