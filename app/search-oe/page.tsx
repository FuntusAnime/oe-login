"use client";

import { useState } from "react";
import Link from "next/link";

type OEItem = {
  project: string;
  response: string;
  createdAt: string;
  userId?: string;
};

export default function SearchOEPage() {
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("");
  const [results, setResults] = useState<OEItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setPage(1);

    try {
      const res = await fetch("/api/get-oe");
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Error fetching data");
        setResults([]);
        return;
      }

      const projectValue = project.trim().toLowerCase();
      const queryValue = query.trim().toLowerCase();

      let filtered = data.data.filter((item: OEItem) => {
        const matchProject =
          projectValue === "" ||
          item.project.toLowerCase().includes(projectValue);

        const matchText =
          queryValue === "" ||
          item.response.toLowerCase().includes(queryValue);

        return matchProject && matchText;
      });

      // latest first
      filtered.sort(
        (a: OEItem, b: OEItem) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setResults(filtered);
    } catch {
      alert("Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const paginatedResults = results.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const formatTime = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 text-black">
      <div className="mx-auto max-w-4xl">

        {/* BACK BUTTON */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-black px-4 py-2 text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Search OE</h1>

        {/* SEARCH BOX */}
        <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
          <input
            type="text"
            placeholder="Project Name"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
          />

          <input
            type="text"
            placeholder="Search OE text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
          />

          <button
            onClick={handleSearch}
            className="w-full rounded-xl bg-black py-3 text-white"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* RESULTS */}
        <div className="mt-6 space-y-4">
          {paginatedResults.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-700">{item.project}</p>

              <p className="mt-1 text-gray-900">
                {item.response}
              </p>

              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>User: {item.userId || "Unknown"}</span>
                <span>{formatTime(item.createdAt)}</span>
              </div>
            </div>
          ))}

          {searched && !loading && results.length === 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
              <p className="text-gray-500">No matching OE found.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

            {/* PREVIOUS */}
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-xl ${
                page === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
            >
              Previous
            </button>

            {/* PAGE NUMBERS */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-xl ${
                  p === page
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {p}
              </button>
            ))}

            {/* NEXT */}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-xl ${
                page === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
            >
              Next
            </button>

          </div>
        )}
      </div>
    </main>
  );
}