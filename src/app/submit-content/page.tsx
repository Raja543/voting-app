"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const CONTENT_TYPES = [
  { value: "short-form", label: "Short Form Post", icon: "📱" },
  { value: "thread", label: "Thread / Long Form Post", icon: "🧵" },
  { value: "video", label: "Video", icon: "🎥" },
  { value: "infographics", label: "Infographics", icon: "📊" },
  { value: "artwork", label: "Artwork", icon: "🎨" },
  { value: "stream-clip", label: "Stream Clip", icon: "🎬" },
];

export default function SubmitContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    twitterHandle: "",
    discordUsername: "",
    contentLink: "",
    contentType: "",
    title: "",
    description: "",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  if (status === "authenticated" && session?.user && !session.user.isWhitelisted) {
    router.replace("/");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.twitterHandle || !formData.discordUsername || !formData.contentLink || !formData.contentType) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/content-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Content submitted successfully! Thank you for your submission.");
        setFormData({
          twitterHandle: "",
          discordUsername: "",
          contentLink: "",
          contentType: "",
          title: "",
          description: "",
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to submit content"}`);
      }
    } catch (error) {
      console.error("Error submitting content:", error);
      alert("Failed to submit content. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar showHomeHeading={false} />
      
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">📝 Submit Content</h1>
              <p className="text-gray-400 text-lg">Share your creative content with the community</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Twitter Handle */}
                <div>
                  <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter Handle <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="twitterHandle"
                    name="twitterHandle"
                    value={formData.twitterHandle}
                    onChange={handleInputChange}
                    placeholder="e.g., playgigaverse"
                    required
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Discord Username */}
                <div>
                  <label htmlFor="discordUsername" className="block text-sm font-medium text-gray-300 mb-2">
                    Discord Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="discordUsername"
                    name="discordUsername"
                    value={formData.discordUsername}
                    onChange={handleInputChange}
                    placeholder="e.g., giga.noob"
                    required
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Content Link */}
                <div>
                  <label htmlFor="contentLink" className="block text-sm font-medium text-gray-300 mb-2">
                    Content Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    id="contentLink"
                    name="contentLink"
                    value={formData.contentLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    required
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Content Type */}
                <div>
                  <label htmlFor="contentType" className="block text-sm font-medium text-gray-300 mb-2">
                    Type of Content <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="contentType"
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select content type...</option>
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title (Optional) */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Give your content a catchy title..."
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Description (Optional) */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your content..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-200 ${
                    isSubmitting
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Content"}
                </button>
              </form>

              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">📋 Submission Guidelines:</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Ensure your content is original and follows community guidelines</li>
                  <li>• Provide accurate social media handles for proper attribution</li>
                  <li>• Include a working link to your content</li>
                  <li>• Your submission will be reviewed before being published</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
