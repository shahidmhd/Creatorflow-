"use client";

import { useEffect, useState } from "react";
import { Check, KeyRound, ShieldCheck, User } from "lucide-react";
import { api } from "@/app/api";

export default function AdminProfilePage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "CreatorFlow Admin",
    username: "admin",
    email: "admin@creatorflow.app",
    role: "ADMIN",
  });

  useEffect(() => {
    api<{
      id: string;
      name: string;
      username: string;
      email: string;
      role: string;
    }>("/auth/me")
      .then((data) => {
        if (data) {
          setForm({
            name: data.name || "CreatorFlow Admin",
            username: data.username || "admin",
            email: data.email || "admin@creatorflow.app",
            role: data.role || "ADMIN",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await api("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: form.name }),
      }).catch(() => {});

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Admin Profile</h1>
        <p className="text-sm text-neutral-500">
          Supervisory account identity and platform security credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900">Platform Administrator</h2>
            <p className="text-xs text-neutral-400">Full system oversight and ledger governance</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
            Display Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Admin Username
            </label>
            <input
              disabled
              value={form.username}
              className="w-full rounded-xl border border-navy/10 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Assigned Role
            </label>
            <input
              disabled
              value={form.role}
              className="w-full rounded-xl border border-navy/10 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 outline-none font-black text-navy"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
            Admin Email Address
          </label>
          <input
            disabled
            value={form.email}
            className="w-full rounded-xl border border-navy/10 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 outline-none"
          />
        </div>

        <div className="rounded-xl bg-navy-soft/60 p-4 text-xs text-neutral-600 space-y-1">
          <p className="font-bold text-navy flex items-center gap-1.5">
            <KeyRound size={14} /> Security & System Authority
          </p>
          <p>
            Administrative actions, ledger disputes, and fee changes executed by this account are permanently recorded in the platform <strong>AuditLog</strong>.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check size={14} /> Admin profile updated
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-90"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
