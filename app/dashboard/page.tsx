"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OEItem = {
  project: string;
  response: string;
  createdAt: string;
  userId?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [savedResponses, setSavedResponses] = useState<OEItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem("oe_user_id") || "";
    const savedRole = localStorage.getItem("oe_user_role") || "";

    if (!savedUserId) {
      router.push("/login");
      return;
    }

    setUserId(savedUserId);
    setUserRole(savedRole);
  }, [router]);

  useEffect(() => {
    const fetchOEData = async () => {
      try {
        const res = await fetch("/api/get-oe");
        const data = await res.json();

        if (res.ok && data.success) {
          setSavedResponses(data.data || []);
        } else {
          setSavedResponses([]);
        }
      } catch {
        setSavedResponses([]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchOEData();
  }, []);

  const uniqueProjectCount = useMemo(() => {
    const projects = new Set(
      savedResponses
        .map((item) => item.project?.trim())
        .filter(Boolean)
    );
    return projects.size;
  }, [savedResponses]);

  const handleLogout = () => {
    localStorage.removeItem("oe_user_id");
    localStorage.removeItem("oe_user_role");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <aside className="hidden w-64 border-r border-gray-200 bg-white p-4 md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-8 flex justify-center">
              <Image
                src="/logo.png"
                alt="Voicentra Research"
                width={180}
                height={60}
                className="h-auto w-auto max-h-14 object-contain"
                priority
              />
            </div>

            <div className="mb-6 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 text-center shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Logged In As
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">{userId || "User"}</p>
              <div className="mt-2 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {userRole === "superadmin" ? "Super Admin" : "User"}
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/add-oe"
                className="block w-full rounded-2xl bg-black px-4 py-3 text-left font-medium text-white transition hover:opacity-90"
              >
                Add OE
              </Link>

              <Link
                href="/search-oe"
                className="block w-full rounded-2xl bg-black px-4 py-3 text-left font-medium text-white transition hover:opacity-90"
              >
                Search OE
              </Link>

              {userRole === "superadmin" && (
                <Link
                  href="/user-management"
                  className="block w-full rounded-2xl bg-black px-4 py-3 text-left font-medium text-white transition hover:opacity-90"
                >
                  User Management
                </Link>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="mb-4 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Logout
            </button>

            <div className="text-center text-xs text-gray-500">
              © 2026 Voicentra Research. All rights reserved.
            </div>
          </div>
        </aside>

        {/* MOBILE/TABLET */}
        <div className="w-full md:hidden">
          <div className="border-b border-gray-200 bg-white p-4 text-center">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Voicentra Research"
                width={160}
                height={50}
                className="h-auto w-auto max-h-12 object-contain"
                priority
              />
            </div>

            <div className="mt-3 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Logged In As
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">{userId || "User"}</p>
              <div className="mt-2 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {userRole === "superadmin" ? "Super Admin" : "User"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/add-oe"
                className="rounded-2xl bg-black px-4 py-3 font-medium text-white"
              >
                Add OE
              </Link>

              <Link
                href="/search-oe"
                className="rounded-2xl bg-black px-4 py-3 font-medium text-white"
              >
                Search OE
              </Link>

              {userRole === "superadmin" && (
                <Link
                  href="/user-management"
                  className="rounded-2xl bg-black px-4 py-3 font-medium text-white"
                >
                  User Management
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white"
              >
                Logout
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              © 2026 Voicentra Research. All rights reserved.
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                OE Platform
              </h1>
              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                Dashboard Overview
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total Projects</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loadingStats ? "..." : uniqueProjectCount}
                </h2>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Saved Responses</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loadingStats ? "..." : savedResponses.length}
                </h2>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}