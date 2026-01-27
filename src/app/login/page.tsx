"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(session?.user?.isAdmin ? "/admin" : "/");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) setError("Invalid email or password");
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-[#11161c] border border-gray-800 p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-white text-center">
          Sign in
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm text-center mt-2">
          Welcome back! Please sign in to continue
        </p>

        {/* OAuth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex items-center justify-center gap-2 bg-white text-black py-2 text-sm"
          >
            <Image src="/google.png" alt="Google" width={18} height={18} />
            GOOGLE
          </button>

          <button
            onClick={() => signIn("twitter", { callbackUrl: "/" })}
            className="flex items-center justify-center gap-2 bg-white text-black py-2 text-sm"
          >
            <Image src="/twitter.png" alt="Twitter" width={18} height={18} />
            TWITTER
          </button>
        </div>

        <div className="text-center text-gray-500 text-xs my-5">OR</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#3aa0d8] text-xs sm:text-sm">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[#3aa0d8] text-xs sm:text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs sm:text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10B981] text-white py-2 text-sm mt-4">
            {loading ? "Signing in..." : "CONTINUE"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs sm:text-sm mt-6">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-[#3aa0d8]">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
