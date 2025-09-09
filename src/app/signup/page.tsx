"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ added this
import Navbar from "@/components/Navbar";

export default function SignupPage() {
  const { data: session, status } = useSession(); // ✅ fixed
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
      {/* ✅ Navbar now receives session + loading just like login.tsx */}
      <Navbar session={session} loading={status === "loading"} />

      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl border border-gray-700">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-lg bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-green-700 disabled:bg-gray-500"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-green-400 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
