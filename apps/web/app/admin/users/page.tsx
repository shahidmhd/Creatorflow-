"use client";

import { useEffect, useState, useMemo } from "react";
import {
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { api } from "@/app/api";
import { formatDate, type AdminUser } from "../data";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await api<{ users: AdminUser[]; total: number }>("/admin/users?limit=100");
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to load platform users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setActionLoadingId(id);
    try {
      await api(`/admin/users/${id}/toggle-active`, { method: "POST" });
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
      );
      setNotice(`User account ${!currentStatus ? "activated" : "suspended"}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to change user status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.isActive) ||
        (statusFilter === "SUSPENDED" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">User Management</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Live database registry of CREATOR, EDITOR, and ADMIN accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-navy" : "text-neutral-500"} />
          Refresh Users
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-navy/15 bg-navy-soft/60 px-4 py-3 text-xs font-semibold text-navy">
          {notice}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, username (@), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1 text-xs">
            {["ALL", "CREATOR", "EDITOR", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  roleFilter === r
                    ? "bg-navy text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1 text-xs">
            {["ALL", "ACTIVE", "SUSPENDED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-2.5 py-1 font-bold transition ${
                  statusFilter === s
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-neutral-500 font-bold uppercase tracking-wider border-b border-navy/10">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400">
                    <RefreshCw size={20} className="mx-auto animate-spin mb-2 text-navy" />
                    Loading real users from database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400">
                    No users match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-navy-soft text-navy font-bold text-xs shrink-0">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">
                            @{u.username} • {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "CREATOR"
                            ? "bg-navy-soft text-navy"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          u.isActive ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            u.isActive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {u.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="p-4 text-neutral-500 font-medium">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== "ADMIN" ? (
                        <button
                          onClick={() => toggleStatus(u.id, u.isActive)}
                          disabled={actionLoadingId === u.id}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
                            u.isActive
                              ? "border border-red-200 text-red-600 hover:bg-red-50"
                              : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {actionLoadingId === u.id
                            ? "Updating..."
                            : u.isActive
                            ? "Suspend Account"
                            : "Activate Account"}
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-neutral-400">Admin Protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
