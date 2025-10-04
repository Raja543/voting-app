"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  walletAddress?: string;
  website?: string;
  location?: string;
  image?: string;
  provider: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    discord?: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    walletAddress: "",
    website: "",
    location: "",
    socialLinks: {
      twitter: "",
      github: "",
      linkedin: "",
      discord: "",
    },
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session, status]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/users/profile", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setFormData({
          name: data.user.name || "",
          username: data.user.username || "",
          bio: data.user.bio || "",
          walletAddress: data.user.walletAddress || "",
          website: data.user.website || "",
          location: data.user.location || "",
          socialLinks: {
            twitter: data.user.socialLinks?.twitter || "",
            github: data.user.socialLinks?.github || "",
            linkedin: data.user.socialLinks?.linkedin || "",
            discord: data.user.socialLinks?.discord || "",
          },
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [key]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          walletAddress: formData.walletAddress,
          website: formData.website,
          location: formData.location,
          socialLinks: formData.socialLinks,
          ...(formData.newPassword ? { currentPassword: formData.currentPassword, newPassword: formData.newPassword } : {}),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Profile updated successfully.");
        setProfile(data.user);
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch {
      setError("Network error, please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-6 bg-gray-800 rounded border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
            <p>Please log in to view profile.</p>
            <a href="/login" className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
              Login
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-10 text-white">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded shadow p-8">
          {/* User info */}
          <div className="flex items-center mb-8 space-x-6">
            {profile?.image && (
              <img src={profile.image} alt="User image" className="w-24 h-24 rounded-full border border-gray-600" />
            )}
            <div>
              <h1 className="text-4xl font-bold">{profile?.name}</h1>
              <p className="text-gray-400">{profile?.username ? `@${profile.username}` : profile?.email}</p>
              <div className="mt-2 space-x-2">
                <span className="inline-block px-3 py-1 text-xs bg-blue-600 rounded">{profile?.provider}</span>
                {profile?.isAdmin && <span className="inline-block px-3 py-1 text-xs bg-green-600 rounded">Admin</span>}
                {profile?.isWhitelisted ? (
                  <span className="inline-block px-3 py-1 text-xs bg-green-600 rounded">Whitelisted</span>
                ) : (
                  <span className="inline-block px-3 py-1 text-xs bg-yellow-600 rounded">Not Whitelisted</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                />
                <small className="text-gray-400">3-20 chars, letters/numbers/_ only</small>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block mb-2 font-semibold">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                rows={3}
                maxLength={500}
                placeholder="Tell us about yourself"
              />
            </div>

            {/* Wallet & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold">Wallet Address</label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 font-semibold">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="City, Country"
              />
            </div>

            {/* Social Links */}
            <div>
              <label className="block mb-4 font-semibold">Social Links</label>
              <input
                type="url"
                name="socialLinks.twitter"
                placeholder="Twitter URL"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                className="w-full p-3 mb-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
              <input
                type="url"
                name="socialLinks.github"
                placeholder="GitHub URL"
                value={formData.socialLinks.github}
                onChange={handleChange}
                className="w-full p-3 mb-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
              <input
                type="url"
                name="socialLinks.linkedin"
                placeholder="LinkedIn URL"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                className="w-full p-3 mb-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
              <input
                type="text"
                name="socialLinks.discord"
                placeholder="Discord Username"
                value={formData.socialLinks.discord}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>

            {/* Password change */}
            {profile?.provider === 'credentials' && (
              <>
                <hr className="my-6 border-gray-700" />
                <h3 className="mb-4 text-xl font-semibold">Change Password</h3>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-3 mb-4 rounded border border-gray-600 bg-gray-700 text-white"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 mb-4 rounded border border-gray-600 bg-gray-700 text-white"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 mb-4 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-gray-600 rounded hover:bg-gray-700"
                disabled={saving}
                onClick={() => window.location.reload()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
