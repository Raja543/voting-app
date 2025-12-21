"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    abstractWallet: "",
    evmWallet: "",
    discord: "",
    twitter: "",
    youtube: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!session?.user) return;

    setFormData((p) => ({
      ...p,
      displayName: session.user.name || "",
      username: session.user.username || "",
    }));
  }, [session]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  if (status === "loading") return null;

  const userName =
    session?.user?.name || session?.user?.username || "Creator";
  const userEmail = session?.user?.email || "";

  const tags: string[] = [];
  if (session?.user?.isWhitelisted) tags.push("Whitelisted");
  if (session?.user?.isAdmin) tags.push("Admin");

  return (
    <>
      <Sidebar />

      <div className="min-h-screen bg-[#0b0f14] flex justify-center px-4 sm:px-6">
        <div className="w-full max-w-5xl py-10">

          {status === "unauthenticated" ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white/60 text-sm">
              <div>You need to login first to view your profile.</div>
              <a
                href="/login"
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded"
              >
                Login
              </a>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-[#3aa0d8] text-xl sm:text-2xl break-words">
                    {userName}
                  </h1>
                  {userEmail && (
                    <div className="text-sm text-white break-words">
                      {userEmail}
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-[#3aa0d8] px-2 py-[4px] text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Container */}
              <div className="bg-[#11161c] border border-gray-800 p-4 sm:p-6 space-y-6">

            {/* Display Name + Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-[#3aa0d8]">Display Name</label>
                <input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full mt-2 bg-[#0b0f14] border border-gray-700 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#3aa0d8]">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full mt-2 bg-[#0b0f14] border border-gray-700 px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm text-[#3aa0d8]">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full mt-2 bg-[#0b0f14] border border-gray-700 px-3 py-2 text-white"
              />
            </div>

            {/* Wallets */}
            <div>
              <label className="text-sm text-[#3aa0d8]">Wallets</label>

              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#10B981]">ABSTRACT</span>
                  <input
                    name="abstractWallet"
                    value={formData.abstractWallet}
                    onChange={handleChange}
                    placeholder="AGW"
                    className="flex-1 min-w-0 bg-[#0b0f14] border border-gray-700 px-3 py-2 text-white truncate"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">EVM</span>
                  <input
                    name="evmWallet"
                    value={formData.evmWallet}
                    onChange={handleChange}
                    placeholder="0x..."
                    className="flex-1 min-w-0 bg-[#0b0f14] border border-gray-700 px-3 py-2 text-white truncate"
                  />
                </div>
              </div>
            </div>

            {/* Socials */}
            <div>
              <label className="text-sm text-[#3aa0d8]">Socials</label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                {/* Discord */}
                <div className="flex items-center gap-2 bg-[#0b0f14] border border-gray-700 px-3 py-2">
                  <Image
                    src="/discord.png"
                    alt="Discord"
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <input
                    name="discord"
                    placeholder="Discord"
                    value={formData.discord}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-gray-500"
                  />
                </div>

                {/* X / Twitter */}
                <div className="flex items-center gap-2 bg-[#0b0f14] border border-gray-700 px-3 py-2">
                  <Image
                    src="/x.png"
                    alt="X / Twitter"
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <input
                    name="twitter"
                    placeholder="X / Twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-gray-500"
                  />
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-2 bg-[#0b0f14] border border-gray-700 px-3 py-2">
                  <Image
                    src="/youtube.png"
                    alt="YouTube"
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <input
                    name="youtube"
                    placeholder="YouTube"
                    value={formData.youtube}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6">
                  <button className="px-6 py-2 bg-gray-700 text-white">
                    CANCEL
                  </button>
                  <button className="px-6 py-2 bg-[#10B981] text-white">
                    SAVE CHANGES
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
