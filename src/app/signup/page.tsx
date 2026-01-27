"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) throw new Error("Signup failed");

      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-[#11161c] border border-gray-800 p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-white text-center">
          Create your account
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm text-center mt-2">
          Welcome! Please fill in the details to get started
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#3aa0d8] text-xs sm:text-sm">
              Username
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="text-[#3aa0d8] text-xs sm:text-sm">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
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
                className="w-full bg-black border border-gray-700 px-3 py-2 text-white text-sm"
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
            className="w-full bg-[#10B981] text-white py-2 text-sm mt-4"
          >
            {loading ? "Signing up..." : "CONTINUE"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs sm:text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3aa0d8]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
