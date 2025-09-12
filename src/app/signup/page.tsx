"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Redirect authenticated users away from signup
  useEffect(() => {
    if (status === "authenticated") {
      router.push(session?.user?.isAdmin ? "/admin" : "/");
    }
  }, [status, session, router]);

  const validateForm = () => {
    if (!name.trim()) return "Name is required";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters long";
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

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
          <h1 className="text-2xl font-bold text-center mb-6 text-green-400">Sign Up</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition"
            >
              {status === "loading" ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-green-400 hover:text-green-300 transition">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
