import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CircleDollarSign, ShieldAlert, Users } from "lucide-react";
import { adminCampaigns, flaggedSubmissions, formatRupees } from "./data";

const metricCards = [
  { label: "Total Users", value: "12,486", note: "11,930 clippers · 556 brands", Icon: Users },
  { label: "Total Campaigns", value: "284", note: "158 active · 126 completed", Icon: BriefcaseBusiness },
  { label: "Total GMV Processed", value: formatRupees(18420000), note: "Across funded campaign pools", Icon: CircleDollarSign },
  { label: "Total Commission Earned", value: formatRupees(2763000), note: "15% platform commission", Icon: CircleDollarSign },
];

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-navy">Platform overview</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-sm text-neutral-500">Platform activity, campaign volume, and revenue at a glance.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform summary">
        {metricCards.map(({ label, value, note, Icon }) => (
          <article key={label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-neutral-500">{label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-soft/70 text-navy"><Icon size={18} /></span>
            </div>
            <p className="mt-5 text-2xl font-black tracking-[-0.05em]">{value}</p>
            <p className="mt-1 text-xs text-neutral-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <article className="rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-5">
            <div><h2 className="font-black">Recent platform campaigns</h2><p className="mt-1 text-sm text-neutral-500">Latest campaign activity</p></div>
            <Link href="/admin/campaigns" className="text-sm font-bold text-navy hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-black/5">
            {adminCampaigns.slice(0, 4).map((campaign) => (
              <Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50">
                <div className="min-w-0"><p className="truncate font-bold">{campaign.title}</p><p className="mt-1 text-xs text-neutral-500">{campaign.brand} · {campaign.submissions} submissions</p></div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${campaign.status === "Active" ? "bg-emerald-50 text-emerald-700" : campaign.status === "Paused" ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-600"}`}>{campaign.status}</span>
              </Link>
            ))}
            {!adminCampaigns.length && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-neutral-500">No campaigns have been created yet.</p>
                <Link href="/admin/campaigns" className="mt-3 inline-flex text-sm font-bold text-navy hover:underline">Review campaigns</Link>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-black">Fraud queue</h2><p className="mt-1 text-sm text-neutral-500">Submissions needing a platform review.</p></div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-soft/70 text-navy"><ShieldAlert size={18} /></span>
          </div>
          <p className="mt-6 text-4xl font-black">{flaggedSubmissions.length}</p>
          <p className="mt-1 text-sm text-neutral-500">flagged submissions to review</p>
          <Link href="/admin/fraud-queue" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white">Open fraud queue <ArrowUpRight size={15} /></Link>
        </article>
      </section>
    </div>
  );
}
