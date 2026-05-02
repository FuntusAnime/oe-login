"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserItem = {
  userId: string;
  password: string;
  active: boolean;
};

export default function UserManagementPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("oe_user_role");
    const user = localStorage.getItem("oe_user_id");

    if (role === "superadmin" && user === "Vibes151203") {
      setAuthorized(true);
      fetchUsers();
    } else {
      setAuthorized(false);
    }

    setCheckedAuth(true);
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (data.success) {
      setUsers(Array.isArray(data.users) ? data.users : []);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !password) {
      setMessage("Fill all fields");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, password }),
    });

    const data = await res.json();

    if (data.success) {
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (data.user) {
        setUsers((prev) => [...prev, data.user]);
      }

      setUserId("");
      setPassword("");
      setMessage("User added");
      setPage(1);
    } else {
      setMessage(data.error || "Error");
    }

    setLoading(false);
  };

  const toggleActive = async (id: string) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });

    const data = await res.json();
    if (data.success) {
      setUsers(Array.isArray(data.users) ? data.users : []);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteTarget(id);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget }),
      });

      const data = await res.json();

      if (data.success) {
        const updatedUsers = Array.isArray(data.users) ? data.users : [];
        setUsers(updatedUsers);
        setMessage("User deleted successfully");

        setShowPasswords((prev) => {
          const updated = { ...prev };
          delete updated[deleteTarget];
          return updated;
        });

        const nextTotalPages = Math.max(
          1,
          Math.ceil(updatedUsers.length / USERS_PER_PAGE)
        );
        if (page > nextTotalPages) {
          setPage(nextTotalPages);
        }

        closeDeleteModal();
      } else {
        setMessage(data.error || "Failed to delete user");
      }
    } catch {
      setMessage("Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  const paginatedUsers = users.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE
  );

  if (!checkedAuth) return <div className="text-black">Checking...</div>;

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center text-black">
        <div className="bg-white p-6 rounded-2xl text-center">
          <h1 className="text-xl text-red-600 font-bold">Access Denied</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 bg-black text-white px-4 py-2 rounded-xl"
          >
            Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-100 p-6 text-black">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold mt-4 mb-6 text-gray-900">
            User Management
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl">
              <h2 className="text-xl font-semibold mb-4">Add New User</h2>

              <form onSubmit={handleAddUser} className="space-y-4">
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User ID"
                  className="w-full border px-4 py-3 rounded-xl"
                />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full border px-4 py-3 rounded-xl"
                />

                {message && <p className="text-sm">{message}</p>}

                <button className="w-full bg-black text-white py-3 rounded-xl">
                  {loading ? "Adding..." : "Add User"}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl">
              <h2 className="text-xl font-semibold mb-4">Users</h2>

              <div className="space-y-4">
                {paginatedUsers.map((u, i) => (
                  <div key={i} className="border p-4 rounded-xl">
                    <p>
                      <b>{u.userId}</b>
                    </p>

                    <p>
                      Password: {showPasswords[u.userId] ? u.password : "••••••"}
                    </p>

                    <p className={u.active ? "text-green-600" : "text-red-600"}>
                      {u.active ? "Active" : "Inactive"}
                    </p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => togglePassword(u.userId)}
                        className="px-3 py-1 border rounded"
                      >
                        {showPasswords[u.userId] ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleActive(u.userId)}
                        className={`px-3 py-1 text-white rounded ${
                          u.active ? "bg-orange-500" : "bg-green-600"
                        }`}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(u.userId)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {users.length === 0 && <p>No users</p>}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 flex-wrap">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-xl ${
                      page === 1
                        ? "bg-gray-300 text-gray-500"
                        : "bg-black text-white"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
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
                    )
                  )}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-xl ${
                      page === totalPages
                        ? "bg-gray-300 text-gray-500"
                        : "bg-black text-white"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Delete User</h3>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">{deleteTarget}</span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
                className="rounded-xl bg-red-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}