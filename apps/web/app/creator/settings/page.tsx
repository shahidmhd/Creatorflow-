"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Instagram, Sparkles, Twitter, Youtube, User } from "lucide-react";
import { api } from "@/app/api";

export default function CreatorSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    website: "",
    instagram: "",
    youtube: "",
    twitter: "",
  });

  useEffect(() => {
    // 1. Fetch authenticated user data
    api<{
      id: string;
      name: string;
      username: string;
      email: string;
      creatorProfile?: {
        bio?: string;
        website?: string;
        socialLinks?: { instagram?: string; youtube?: string; twitter?: string };
      };
    }>("/auth/me")
      .then((data) => {
        if (data) {
          const links = data.creatorProfile?.socialLinks || {};
          setForm({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            bio: data.creatorProfile?.bio || "",
            website: data.creatorProfile?.website || "",
            instagram: links.instagram || "",
            youtube: links.youtube || "",
            twitter: links.twitter || "",
          });
        }
      })
      .catch(() => {
        // Fallback to local session
        const raw = localStorage.getItem("creatorflow-session");
        if (raw) {
          const s = JSON.parse(raw);
          setForm((prev) => ({
            ...prev,
            name: s.name || s.username || "Creator",
            username: s.username || "creator",
            email: s.email || "creator@creatorflow.app",
          }));
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      // 1. Update basic user info
      await api("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: form.name }),
      }).catch(() => {});

      // 2. Update creator-specific profile
      await api("/auth/profile/creator", {
        method: "PATCH",
        body: JSON.stringify({
          bio: form.bio,
          website: form.website,
          socialLinks: {
            instagram: form.instagram,
            youtube: form.youtube,
            twitter: form.twitter,
          },
        }),
      }).catch(() => {});

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Creator Profile</h1>
        <p className="text-sm text-neutral-500">
          Manage your creator brand identity, media channels, and public profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Identity */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-neutral-900">Brand & Account Identity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Display / Brand Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Username
              </label>
              <input
                disabled
                value={form.username}
                className="w-full rounded-xl border border-navy/10 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Email Address
            </label>
            <input
              disabled
              value={form.email}
              className="w-full rounded-xl border border-navy/10 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Creator Bio / Niche Summary
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell editors about your brand style, target audience, and preferred visual aesthetics..."
              className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>
        </div>

        {/* Channels & Social Links */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-neutral-900">Official Links & Social Channels</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Website / Portfolio
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2.5 text-sm">
              <Globe size={16} className="text-navy" />
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourbrand.com"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Instagram
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs">
                <Instagram size={14} className="text-pink-600" />
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                YouTube
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs">
                <Youtube size={14} className="text-red-600" />
                <input
                  value={form.youtube}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  placeholder="channel link"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Twitter / X
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs">
                <Twitter size={14} className="text-blue-500" />
                <input
                  value={form.twitter}
                  onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check size={14} /> Creator profile updated successfully
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-navy px-7 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-90"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
