"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ✅ added

type SimilarItem = {
  project: string;
  response: string;
  createdAt: string;
};

export default function AddOEPage() {
  const [project, setProject] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!project.trim() || !response.trim()) {
        setBlocked(false);
        setReasons([]);
        setSimilarItems([]);
        setErrorMessage("");
        return;
      }

      setChecking(true);

      try {
        const res = await fetch("/api/check-oe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project,
            response,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setBlocked(data.blocked || false);
          setReasons(data.reasons || []);
          setSimilarItems(data.similar || []);
          setErrorMessage(data.blocked ? "Response may be flagged" : "");
        } else {
          setBlocked(false);
          setReasons([]);
          setSimilarItems([]);
          setErrorMessage("");
        }
      } catch {
        setBlocked(false);
        setReasons([]);
        setSimilarItems([]);
        setErrorMessage("");
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [project, response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project || !response) {
      alert("Please fill all fields");
      return;
    }

    if (blocked) {
      alert("This response is blocked. Please change it before saving.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/save-oe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project,
          response,
          userId: localStorage.getItem("oe_user_id"), // ✅ added
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("OE saved successfully ✅");
        setProject("");
        setResponse("");
        setSimilarItems([]);
        setErrorMessage("");
        setReasons([]);
        setBlocked(false);
      } else {
        setErrorMessage(data.error || "Error saving OE");
        if (data.similar) {
          setSimilarItems(data.similar);
        }
        if (data.reasons) {
          setReasons(data.reasons);
        }
        setBlocked(true);
      }
    } catch {
      setErrorMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">

        {/* ✅ BACK BUTTON (NEW) */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add OE</h1>
          <p className="mt-1 text-sm text-gray-600">
            Save a new open-end response
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Project */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Project Name
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Enter project name"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
              />
            </div>

            {/* OE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Open-End Response
              </label>
              <textarea
                rows={6}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write the open-end response here"
                className={`w-full rounded-2xl border px-4 py-3 text-gray-900 outline-none ${
                  blocked
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
            </div>

            {checking && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">
                  Checking response...
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  {errorMessage}
                </p>

                {reasons.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
                    {reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!blocked && project.trim() && response.trim() && !checking && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  Response looks safe to save.
                </p>
              </div>
            )}

            {similarItems.length > 0 && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="mb-3 text-sm font-semibold text-yellow-800">
                  Similar saved responses in this project
                </p>

                <div className="space-y-3">
                  {similarItems.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-yellow-200 bg-white p-3"
                    >
                      <p className="text-sm text-gray-800">{item.response}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Saved on: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || blocked || checking}
              className={`w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-60 ${
                blocked ? "bg-red-500" : "bg-black hover:opacity-90"
              }`}
            >
              {checking
                ? "Checking..."
                : loading
                ? "Saving..."
                : blocked
                ? "Blocked"
                : "Save OE"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}