"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Filter,
  History,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";
import { api } from "@/app/api";
import { formatDate, type AdminAuditLog } from "../data";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await api<{ logs: AdminAuditLog[]; total: number }>("/admin/audit-logs?limit=100");
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        search === "" ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entity.toLowerCase().includes(search.toLowerCase()) ||
        log.actor?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.entityId?.toLowerCase().includes(search.toLowerCase());

      const matchesEntity = entityFilter === "ALL" || log.entity === entityFilter;

      return matchesSearch && matchesEntity;
    });
  }, [logs, search, entityFilter]);

  const uniqueEntities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.entity));
    return Array.from(set);
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">
            System Activity & Audit Trail
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Immutable log of all financial events, moderation actions, and user updates.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-navy" : "text-neutral-500"} />
          Refresh Logs
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {notice}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>

        {/* Entity Filters */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-black/10 bg-white p-1 text-xs">
          <button
            onClick={() => setEntityFilter("ALL")}
            className={`rounded-lg px-3 py-1 font-bold transition ${
              entityFilter === "ALL"
                ? "bg-navy text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            All Entities ({logs.length})
          </button>
          {uniqueEntities.map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`rounded-lg px-2.5 py-1 font-bold transition ${
                entityFilter === ent
                  ? "bg-navy text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-neutral-500 font-bold uppercase tracking-wider border-b border-navy/10">
              <tr>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Performed By (Actor)</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400">
                    <RefreshCw size={20} className="mx-auto animate-spin mb-2 text-navy" />
                    Loading system audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400">
                    No activity logs found for your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const hasPayload = Boolean(log.oldValue || log.newValue || log.metadata);

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/50 transition">
                      <td className="p-4">
                        <span className="font-bold text-neutral-900 block">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          ID: {log.id.substring(0, 8)}...
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 font-bold text-neutral-700">
                          {log.entity}
                        </span>
                        {log.entityId && (
                          <span className="block font-mono text-[10px] text-neutral-400 mt-0.5">
                            {log.entityId.substring(0, 8)}...
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {log.actor ? (
                          <div>
                            <span className="font-semibold text-neutral-800">{log.actor.name}</span>
                            <span className="block text-[10px] text-neutral-400">({log.actor.role})</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 font-mono italic">System / Engine</span>
                        )}
                      </td>

                      <td className="p-4 font-medium text-neutral-500">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="p-4 text-right">
                        {hasPayload ? (
                          <div>
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-navy hover:underline"
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              {isExpanded ? "Hide diff" : "Inspect payload"}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 text-left bg-neutral-900 text-neutral-100 p-3 rounded-xl text-[10px] font-mono overflow-x-auto max-w-sm ml-auto">
                                {Boolean(log.oldValue) ? (
                                  <div className="mb-1 text-amber-300">
                                    <span className="font-bold">Previous:</span> {JSON.stringify(log.oldValue)}
                                  </div>
                                ) : null}
                                {Boolean(log.newValue) ? (
                                  <div className="text-emerald-300">
                                    <span className="font-bold">New:</span> {JSON.stringify(log.newValue)}
                                  </div>
                                ) : null}
                                {Boolean(log.metadata) ? (
                                  <div className="text-blue-300 mt-1">
                                    <span className="font-bold">Meta:</span> {JSON.stringify(log.metadata)}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-300 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
