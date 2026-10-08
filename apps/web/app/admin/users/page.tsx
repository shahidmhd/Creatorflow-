"use client";

import { useState } from "react";
import { UserX, UserCheck, Shield } from "lucide-react";
import { StatusBadge } from "@/app/components";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    { id: "u-1", name: "Alex Rivera", username: "alexrivera", email: "alex@creatorflow.app", role: "CREATOR", isActive: true, joined: "Oct 1, 2026" },
    { id: "u-2", name: "Alex Visuals", username: "alexcut", email: "alexcut@creatorflow.app", role: "EDITOR", isActive: true, joined: "Oct 2, 2026" },
    { id: "u-3", name: "Sarah Edits", username: "sarahedits", email: "sarah@creatorflow.app", role: "EDITOR", isActive: true, joined: "Oct 3, 2026" },
    { id: "u-4", name: "Suspicious User", username: "bot123", email: "spam@example.com", role: "EDITOR", isActive: false, joined: "Oct 5, 2026" },
  ]);

  const toggleStatus = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">User Management</h1>
        <p className="text-sm text-neutral-500">View and manage CREATOR and EDITOR accounts across the marketplace.</p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-neutral-500 font-bold uppercase tracking-wider border-b border-navy/10">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/50">
                  <td className="p-4">
                    <p className="font-bold text-neutral-900">{u.name}</p>
                    <p className="text-neutral-400">@{u.username} • {u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold px-2.5 py-1 rounded-full text-[10px] bg-navy-soft text-navy">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-bold ${u.isActive ? "text-emerald-600" : "text-red-500"}`}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-500">{u.joined}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        u.isActive
                          ? "border border-red-200 text-red-600 hover:bg-red-50"
                          : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {u.isActive ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
