"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!userId.trim() || !password.trim()) {
      setErrorMessage("Please enter User ID and Password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("oe_user_id", data.userId);
        localStorage.setItem("oe_user_role", data.role);
        router.push("/dashboard");
      } else {
        setErrorMessage(data.error || "Login failed");
      }
    } catch {
      setErrorMessage("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex flex-col justify-between">
      <div className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Voicentra Research"
              width={220}
              height={60}
              className="h-auto w-auto max-h-16 object-contain"
              priority
            />
          </div>

          <p className="mb-6 text-center text-sm text-gray-500">
            Every Voice Counts. Every Insight Matters.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
              />
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login to OE Platform"}
            </button>
          </form>
        </div>
      </div>

      <div className="pb-4 text-center text-xs text-gray-500">
        © 2026 Voicentra Research. All rights reserved.
      </div>
    </main>
  );
}