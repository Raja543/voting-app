"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

// React Icons
import { FaEye, FaEyeSlash, FaGoogle, FaTwitter } from "react-icons/fa";

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

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email address";
    if (password.length === 0) return "Password is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const handleOAuthLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 text-white">
          <h1 className="text-3xl font-semibold mb-6 text-center text-blue-400">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border border-t-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-800 px-4 text-gray-400">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center justify-center space-x-2 rounded bg-white/10 py-3 text-white hover:bg-white/20 transition"
            >
              <FaGoogle size={20} className="text-red-500" />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleOAuthLogin("twitter")}
              className="flex items-center justify-center space-x-2 rounded bg-white/10 py-3 text-white hover:bg-white/20 transition"
            >
              <FaTwitter size={20} className="text-sky-400" />
              <span>Twitter</span>
            </button>
          </div>
          <p className="mt-6 text-center text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Create One
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
