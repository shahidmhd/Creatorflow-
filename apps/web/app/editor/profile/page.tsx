"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Link as LinkIcon, Plus, Trash2, Video } from "lucide-react";
import { api } from "@/app/api";

export default function EditorProfilePage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [skills, setSkills] = useState<string[]>([
    "Fast Paced Reels",
    "Sound Design",
    "CapCut Pro",
    "Premiere Pro",
    "Color Grading",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    portfolioLink: "",
    tiktok: "",
    instagram: "",
    youtube: "",
  });

  useEffect(() => {
    api<{
      id: string;
      name: string;
      username: string;
      email: string;
      editorProfile?: {
        bio?: string;
        skills?: string[];
        portfolio?: { link?: string };
        socialLinks?: { tiktok?: string; instagram?: string; youtube?: string };
      };
    }>("/auth/me")
      .then((data) => {
        if (data) {
          const links = data.editorProfile?.socialLinks || {};
          const portfolio = data.editorProfile?.portfolio || {};
          if (data.editorProfile?.skills && data.editorProfile.skills.length > 0) {
            setSkills(data.editorProfile.skills);
          }
          setForm({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            bio: data.editorProfile?.bio || "",
            portfolioLink: portfolio.link || "",
            tiktok: links.tiktok || "",
            instagram: links.instagram || "",
            youtube: links.youtube || "",
          });
        }
      })
      .catch(() => {
        const raw = localStorage.getItem("creatorflow-session");
        if (raw) {
          const s = JSON.parse(raw);
          setForm((prev) => ({
            ...prev,
            name: s.name || s.username || "Editor",
            username: s.username || "editor",
            email: s.email || "editor@creatorflow.app",
          }));
        }
      });
  }, []);

  const handleAddSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

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

      // 2. Update editor-specific profile
      await api("/auth/profile/editor", {
        method: "PATCH",
        body: JSON.stringify({
          bio: form.bio,
          skills,
          portfolio: { link: form.portfolioLink },
          socialLinks: {
            tiktok: form.tiktok,
            instagram: form.instagram,
            youtube: form.youtube,
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
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Editor Profile</h1>
        <p className="text-sm text-neutral-500">
          Highlight your editing specialty, portfolio links, and video capabilities.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Bio */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-neutral-900">Identity & Pitch</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Editor Bio / Pitch Statement
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="e.g. Retention-first vertical video specialist. Proficient in sound design, motion graphics, and high-impact pacing..."
              className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>
        </div>

        {/* Skills & Software */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-neutral-900">Editing Specialties & Software</h2>

          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-3 py-1.5 text-xs font-bold text-navy"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600 transition"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Add skill or tool (e.g. DaVinci Resolve, 3D Typography)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 rounded-xl border border-navy/10 bg-surface px-4 py-2 text-xs outline-none focus:border-navy"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-navy"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Portfolio & Sample Works */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-neutral-900">Portfolio & Sample Showreel</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Portfolio Link (Google Drive / Notion / Website)
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2.5 text-sm">
              <LinkIcon size={16} className="text-navy" />
              <input
                value={form.portfolioLink}
                onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })}
                placeholder="https://drive.google.com/... or portfolio URL"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                TikTok Handle
              </label>
              <input
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="@handle"
                className="w-full rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Instagram
              </label>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@handle"
                className="w-full rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                YouTube Channel
              </label>
              <input
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                placeholder="channel link"
                className="w-full rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check size={14} /> Editor profile updated successfully
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
