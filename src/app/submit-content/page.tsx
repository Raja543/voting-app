"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

const CONTENT_TYPES = [
  { value: "short-form", label: "Short Form Post" },
  { value: "thread", label: "Thread / Long Form Post" },
  { value: "video", label: "Video" },
  { value: "infographics", label: "Infographics" },
  { value: "artwork", label: "Artwork" },
  { value: "stream-clip", label: "Stream Clip" },
];

export default function SubmitContentPage() {
  const { data: session, status } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    twitterHandle: "",
    discordUsername: "",
    contentLink: "",
    contentType: "",
  });
  if (status === "loading") return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("You need to login first to submit content.");
      return;
    }

    if (
      !formData.twitterHandle ||
      !formData.discordUsername ||
      !formData.contentLink ||
      !formData.contentType
    ) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/content-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Content submitted successfully!");
      setFormData({
        twitterHandle: "",
        discordUsername: "",
        contentLink: "",
        contentType: "",
      });
    } catch {
      alert("Submission failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="min-h-screen bg-[#0b0f14] flex justify-center px-4">
        <div className="w-full max-w-3xl py-10">
          <div className="mb-6">
            <span className="inline-block bg-[#10B981]/20 text-[#10B981] px-3 py-1 text-xs font-medium">
              SUBMISSION GUIDELINES
            </span>
            <ul className="mt-4 text-sm text-gray-300 space-y-1">
              <li>• Content focus must be Gigaverse</li>
              <li>• All social media platform content is accepted</li>
              <li>• When posting on X, tag @playgigaverse</li>
            </ul>
          </div>

          {/* Form Card */}
          <div className="bg-[#11161c] border border-gray-800 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Twitter */}
              <div>
                <label className="block text-sm text-[#3aa0d8] mb-2">
                  Twitter Handle
                </label>
                <input
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleChange}
                  placeholder="e.g. @playgigaverse"
                  className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#3aa0d8]"
                />
              </div>

              {/* Discord */}
              <div>
                <label className="block text-sm text-[#3aa0d8] mb-2">
                  Discord Username
                </label>
                <input
                  name="discordUsername"
                  value={formData.discordUsername}
                  onChange={handleChange}
                  placeholder="e.g. giga.noob5"
                  className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#3aa0d8]"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm text-[#3aa0d8] mb-2">
                  Content Link
                </label>
                <input
                  name="contentLink"
                  value={formData.contentLink}
                  onChange={handleChange}
                  placeholder="https://"
                  className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#3aa0d8]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-[#3aa0d8] mb-2">
                  Type Of Content
                </label>
                <select
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleChange}
                  className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-gray-200 focus:outline-none focus:border-[#3aa0d8]"
                >
                  <option value="">Select content type...</option>
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#10B981] hover:bg-[#059669] px-6 py-2 text-sm text-white font-medium disabled:opacity-50"
              >
                ✓ SUBMIT CONTENT
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
