"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push(session?.user?.isAdmin ? "/admin" : "/");
    }
  }, [status, session, router]);

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email format";
    if (!password) return "Password is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    }
  };

  return (
    <>
      {/* ✅ Pass session and loading status properly */}
      <Navbar 
        session={session} 
        loading={status === "loading"} 
      />
      
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-400">Login</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition"
            >
              {status === "loading" ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-400 hover:text-blue-300 transition">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
