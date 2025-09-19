"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState, memo } from "react";

interface NavbarProps {
  session?: import("next-auth").Session | null;
  loading?: boolean;
  showAdminHeading?: boolean;
  showHomeHeading?: boolean;
}

const Navbar = memo(function Navbar({
  session,
  loading,
  showAdminHeading,
  showHomeHeading,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = session?.user?.name || session?.user?.email || "User";
  const isAdmin = session?.user?.isAdmin;

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4 relative flex items-center justify-between">
      {/* Left: Logo */}
      <Link href="/" className="text-xl font-bold text-white z-20">
        Voting App
      </Link>

      {/* Center: Heading */}
      {(showAdminHeading && isAdmin) && (
        <span className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-4xl font-bold text-green-400 text-center z-10">
          ⚙️ Admin Panel
        </span>
      )}

      {(showHomeHeading && !showAdminHeading) && (
        <span className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-4xl font-bold text-blue-400 text-center z-10">
          Available Posts
        </span>
      )}

      {/* Right: Desktop Actions */}
      <div className="hidden md:flex gap-4 items-center z-20">
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : session?.user ? (
          <>
            <span className="text-gray-300">
              Hello, {displayName} {isAdmin ? "(Admin)" : ""}
            </span>
            <Link
              href="/results"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-white transition"
            >
              📊 Results
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white transition"
              >
                ⚙️ Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white transition"
            >
              Signup
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden z-20">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none"
        >
          {isMenuOpen ? "✖️" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav
          className="absolute top-full right-0 w-48 bg-gray-800 border border-gray-700 rounded-b-lg shadow-lg py-2 md:hidden z-20"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col space-y-2">
            {loading ? (
              <li>
                <span className="text-gray-400 px-4">Loading...</span>
              </li>
            ) : session?.user ? (
              <>
                <li>
                  <span className="text-gray-300 px-4">
                    Hello, {displayName} {isAdmin ? "(Admin)" : ""}
                  </span>
                </li>
                <li>
                  <Link
                    href="/results"
                    className="block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-white mx-2"
                  >
                    📊 Results
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white mx-2"
                    >
                      ⚙️ Admin
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white mx-2 w-[calc(100%-1rem)]"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white mx-2"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white mx-2"
                  >
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </nav>
  );
});

export default Navbar;
