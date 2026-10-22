"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/app/api";
import { formatDate, type AdminReport } from "../data";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await api<{ reports: AdminReport[]; total: number }>("/admin/reports?limit=50");
      setReports(res.reports || []);
      setTotal(res.total || 0);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await api(`/admin/reports/${id}/resolve`, { method: "POST" });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, resolved: true, resolvedAt: new Date().toISOString() } : r
        )
      );
      setNotice("Report marked as resolved.");
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to resolve report");
    } finally {
      setResolvingId(null);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter === "PENDING") return !r.resolved;
      if (statusFilter === "RESOLVED") return r.resolved;
      return true;
    });
  }, [reports, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">
            Disputes & Moderation Queue
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Live queue of reported campaigns, fraud alerts, and user disputes.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-navy" : "text-neutral-500"} />
          Refresh Queue
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-navy/15 bg-navy-soft/60 px-4 py-3 text-xs font-semibold text-navy">
          {notice}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1 text-xs">
          {(["ALL", "PENDING", "RESOLVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                statusFilter === s
                  ? "bg-navy text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {s === "ALL" ? `All (${reports.length})` : s === "PENDING" ? `Pending (${reports.filter(r => !r.resolved).length})` : "Resolved"}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-neutral-500 font-bold uppercase tracking-wider border-b border-navy/10">
              <tr>
                <th className="p-4">Report Details</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Reported By</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    <RefreshCw size={20} className="mx-auto animate-spin mb-2 text-navy" />
                    Checking dispute queue...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="font-bold text-sm text-neutral-800">Dispute queue is clean!</p>
                    <p className="text-xs text-neutral-500 mt-1">No active reports or flagged submissions.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-neutral-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-neutral-900">{report.reason}</p>
                      {report.description && (
                        <p className="text-neutral-500 mt-0.5 line-clamp-2 max-w-sm">
                          {report.description}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 font-bold text-neutral-700">
                        {report.entityType}
                      </span>
                      <span className="block font-mono text-[10px] text-neutral-400 mt-0.5">
                        {report.entityId.substring(0, 8)}...
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-neutral-800">
                      {report.reporter?.name || "Anonymous / Platform"}
                    </td>

                    <td className="p-4">
                      {report.resolved ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock size={12} /> Action Needed
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-medium text-neutral-500">
                      {formatDate(report.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      {!report.resolved ? (
                        <button
                          onClick={() => handleResolve(report.id)}
                          disabled={resolvingId === report.id}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          {resolvingId === report.id ? "Resolving..." : "Mark Resolved"}
                        </button>
                      ) : (
                        <span className="text-neutral-400 font-medium">Closed</span>
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
