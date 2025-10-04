"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

interface NavbarProps {
  showAdminHeading?: boolean;
  showHomeHeading?: boolean;
}

export default function Navbar({
  showAdminHeading,
  showHomeHeading,
}: NavbarProps) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = session?.user?.name || session?.user?.email || "User";
  const isAdmin = session?.user?.isAdmin;
  const isWhitelisted = session?.user?.isWhitelisted;

  return (
    <nav className="w-full bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between relative z-10">
      {/* Left: Logo */}
      <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition">
        Voting App
      </Link>

      {/* Center: Heading */}
      {/* {showAdminHeading && isAdmin && (
        <span className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-4xl font-bold text-green-400 text-center">
          ⚙️ Admin Panel
        </span>
      )}
      {showHomeHeading && !showAdminHeading && (
        <span className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-4xl font-bold text-blue-400 text-center">
          Available Posts
        </span>
      )} */}

      {/* Right: Desktop Actions */}
      <div className="hidden md:flex gap-4 items-center">
        {status === "loading" ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : session?.user ? (
          <>
            <div className="flex items-center space-x-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border-2 border-gray-700"
                />
              )}
              <div className="text-right">
                <div className="text-gray-300 font-medium text-sm">Hello {displayName}</div>
                {session.user.username && (
                  <div className="text-gray-500 text-xs">@{session.user.username}</div>
                )}
              </div>
            </div>

            <Link
              href="/profile"
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              👤 Profile
            </Link>

            <Link
              href="/results"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              📊 Results
            </Link>

            <Link
              href="/assets"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              📁 Assets
            </Link>

            <Link
              href="/townhall"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              🏛️ Townhall
            </Link>

            <Link
              href="/announcements"
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              📢 Announcements
            </Link>

            <Link
              href="/submit-content"
              className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              📝 Submit
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
              >
                ⚙️ Admin
              </Link>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden z-20">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none text-2xl"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✖️" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full w-64 bg-gray-900 border border-gray-700 rounded-b-lg shadow-lg py-2 md:hidden z-50">
          {status === "loading" ? (
            <div className="px-4 py-2 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : session?.user ? (
            <>
              <div className="px-4 py-2 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={displayName}
                      className="w-10 h-10 rounded-full border-2 border-gray-700"
                    />
                  )}
                  <div>
                    <div className="text-gray-300 text-sm font-medium"> Hello {displayName}</div>
                    {session.user.username && (
                      <div className="text-gray-500 text-xs">@{session.user.username}</div>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="block bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                👤 Profile
              </Link>

              <Link
                href="/results"
                className="block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 Results
              </Link>

              <Link
                href="/assets"
                className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                📁 Assets
              </Link>

              <Link
                href="/townhall"
                className="block bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                🏛️ Townhall
              </Link>

              <Link
                href="/announcements"
                className="block bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                📢 Announcements
              </Link>

              <Link
                href="/submit-content"
                className="block bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                📝 Submit
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⚙️ Admin
                </Link>
              )}

              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setIsMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 w-[calc(100%-1rem)] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white mx-2 my-1 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
