"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Wallet,
  Calendar,
  Layers,
  BarChart3,
  LineChart,
  Instagram,
  Youtube,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowDownRight,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { api } from "../../api";
import {
  formatPaise,
  formatDate,
  formatViews,
  type RevenueAnalyticsResponse,
  type RevenueChartPoint,
  type RevenueTransaction,
} from "../data";

type TimeframeType = "daily" | "weekly" | "monthly" | "yearly";

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueAnalyticsResponse | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeType>("monthly");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chart configuration
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [activeMetric, setActiveMetric] = useState<"fee" | "gross" | "net" | "all">("all");
  const [hoveredPoint, setHoveredPoint] = useState<RevenueChartPoint | null>(null);

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Sample simulation toggle for previewing high-volume platforms
  const [useSimulation, setUseSimulation] = useState(false);

  const fetchRevenue = async (tf: TimeframeType, isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api<RevenueAnalyticsResponse>(`/admin/revenue?timeframe=${tf}`);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load revenue analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue(timeframe);
  }, [timeframe]);

  // Simulated multi-month dataset for demonstration if admin desires to test high-volume graphing
  const simulatedChartData: RevenueChartPoint[] = useMemo(() => {
    if (timeframe === "daily") {
      const days = ["Mon 20 Oct", "Tue 21 Oct", "Wed 22 Oct", "Thu 23 Oct", "Fri 24 Oct", "Sat 25 Oct", "Sun 26 Oct"];
      return days.map((label, idx) => {
        const gross = [450000, 320000, 780000, 610000, 950000, 1120000, 840000][idx];
        const fee = Math.round(gross * 0.15);
        const net = gross - fee;
        return {
          key: `sim-d-${idx}`,
          label,
          gross,
          platformFee: fee,
          netPayout: net,
          transactions: [3, 2, 5, 4, 6, 8, 5][idx],
        };
      });
    } else if (timeframe === "weekly") {
      const weeks = ["Wk 38", "Wk 39", "Wk 40", "Wk 41", "Wk 42", "Wk 43", "Wk 44", "Wk 45"];
      return weeks.map((label, idx) => {
        const gross = [1850000, 2400000, 3100000, 2900000, 4200000, 4800000, 5600000, 6200000][idx];
        const fee = Math.round(gross * 0.15);
        const net = gross - fee;
        return {
          key: `sim-w-${idx}`,
          label,
          gross,
          platformFee: fee,
          netPayout: net,
          transactions: [12, 16, 21, 19, 28, 32, 38, 41][idx],
        };
      });
    } else if (timeframe === "yearly") {
      const years = ["2022", "2023", "2024", "2025", "2026"];
      return years.map((label, idx) => {
        const gross = [12000000, 28500000, 54000000, 98000000, 142000000][idx];
        const fee = Math.round(gross * 0.15);
        const net = gross - fee;
        return {
          key: `sim-y-${idx}`,
          label,
          gross,
          platformFee: fee,
          netPayout: net,
          transactions: [85, 210, 440, 780, 1150][idx],
        };
      });
    } else {
      const months = ["Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26", "Oct 26"];
      return months.map((label, idx) => {
        const gross = [1200000, 1650000, 2100000, 1900000, 2800000, 3400000, 4100000, 3800000, 5200000, 6400000, 7800000, 9200000][idx];
        const fee = Math.round(gross * 0.15);
        const net = gross - fee;
        return {
          key: `sim-m-${idx}`,
          label,
          gross,
          platformFee: fee,
          netPayout: net,
          transactions: [8, 11, 14, 13, 19, 23, 27, 25, 34, 42, 51, 62][idx],
        };
      });
    }
  }, [timeframe]);

  // Chart data to display (either real from backend or simulated preview)
  const activeChartData = useMemo(() => {
    if (useSimulation) return simulatedChartData;
    return data?.chartData || [];
  }, [useSimulation, simulatedChartData, data]);

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.filter((tx) => {
      const matchesSearch =
        !searchQuery ||
        tx.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.editorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.editorUsername.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!data?.transactions || data.transactions.length === 0) {
      alert("No transaction records available to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Credited Date",
      "Campaign Title",
      "Category",
      "Social Platform",
      "Creator Name",
      "Editor Name",
      "Editor Username",
      "Verified Views",
      "Gross Amount (Paise)",
      "Gross Amount (INR)",
      "Platform Fee (Paise)",
      "Platform Fee (INR)",
      "Net Payout (Paise)",
      "Net Payout (INR)",
      "Fee Percentage",
      "Status",
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      t.creditedAt,
      `"${t.campaignTitle.replace(/"/g, '""')}"`,
      t.campaignCategory,
      t.platform,
      `"${t.creatorName.replace(/"/g, '""')}"`,
      `"${t.editorName.replace(/"/g, '""')}"`,
      t.editorUsername,
      t.verifiedViews,
      t.grossAmount,
      (t.grossAmount / 100).toFixed(2),
      t.platformFee,
      (t.platformFee / 100).toFixed(2),
      t.netAmount,
      (t.netAmount / 100).toFixed(2),
      `${t.feePercentage}%`,
      t.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reviral-revenue-ledger-${timeframe}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart rendering math
  const maxChartVal = useMemo(() => {
    if (activeChartData.length === 0) return 100000;
    return Math.max(
      ...activeChartData.map((d) => {
        if (activeMetric === "fee") return d.platformFee;
        if (activeMetric === "net") return d.netPayout;
        return d.gross;
      }),
      10000
    );
  }, [activeChartData, activeMetric]);

  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingY * 2;

  return (
    <div className="space-y-8 pb-12">
      {/* ══════════════════════════════════════════════════
          TOP HEADER & REVENUE TOOLBAR
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Treasury & Payouts
            </span>
            <span className="text-xs font-semibold text-neutral-400">• Standard 15% Take Rate</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white sm:text-4xl">
            Revenue Analytics
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Real-time platform fee generation, escrow capitalization, and editor disbursement ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* High volume simulation toggle for testing UI richness */}
          <button
            onClick={() => setUseSimulation(!useSimulation)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition border ${
              useSimulation
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                : "bg-white text-neutral-600 border-navy/10 hover:bg-neutral-50 dark:bg-white/5 dark:text-neutral-300 dark:border-white/10"
            }`}
            title="Toggle high-volume simulation dataset to preview charts under scale"
          >
            <Sparkles size={14} className={useSimulation ? "text-purple-600" : "text-neutral-400"} />
            <span>{useSimulation ? "Demo Mode Active" : "Preview Scale"}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-bold text-neutral-800 shadow-xs hover:bg-neutral-50 transition active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <Download size={14} className="text-neutral-500 dark:text-neutral-400" />
            <span>Export CSV</span>
          </button>

          {/* Refresh data */}
          <button
            onClick={() => fetchRevenue(timeframe, true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy/90 transition active:scale-[0.99] disabled:opacity-50 dark:bg-cyan-500 dark:text-neutral-950"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TOP 4 KEY FINANCIAL KPI CARDS
      ══════════════════════════════════════════════════ */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Platform Fee Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-emerald-500/30 dark:from-emerald-950/20 dark:via-[#0c1829] dark:to-[#0c1829]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Platform Revenue
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <Percent size={15} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
              {loading && !data ? "..." : formatPaise(data?.summary.totalPlatformFees ?? 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={14} /> 15% Take
            </span>
            <span>• Net platform fees collected</span>
          </div>
        </div>

        {/* Card 2: Gross Merchandise Value (GMV) */}
        <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-white/10 dark:bg-[#0c1829]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Gross Volume (GMV)
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-soft text-navy dark:bg-white/10 dark:text-cyan-400">
              <CircleDollarSign size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
              {loading && !data ? "..." : formatPaise(data?.summary.totalGMV ?? 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-bold text-navy dark:text-cyan-400">100% Escrow</span>
            <span>• Total campaign funds deposited</span>
          </div>
        </div>

        {/* Card 3: Disbursed to Editors */}
        <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-white/10 dark:bg-[#0c1829]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Editor Disbursements
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <Wallet size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
              {loading && !data ? "..." : formatPaise(data?.summary.totalDisbursedToEditors ?? 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-bold text-sky-600 dark:text-sky-400">85% Pool</span>
            <span>• Paid out to verified video editors</span>
          </div>
        </div>

        {/* Card 4: Locked Escrow Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-white/10 dark:bg-[#0c1829]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Escrow Locked
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
              {loading && !data ? "..." : formatPaise(data?.summary.pendingEscrow ?? 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-bold text-amber-600 dark:text-amber-400">Reserved</span>
            <span>• Awaiting view milestones</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TIMEFRAME SELECTOR & INTERACTIVE GRAPH SECTION
      ══════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#0c1829] space-y-6">
        {/* Controls Bar: Timeframe Buttons, Chart Metric & Style Toggle */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-navy/10 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Revenue & Escrow Trajectory
              </h2>
              {useSimulation && (
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  Scale Simulation
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Visual breakdown of gross volume, platform fees (15%), and creator disbursements over time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Pill Switcher */}
            <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-white/5 border border-navy/5 dark:border-white/5">
              {(["daily", "weekly", "monthly", "yearly"] as TimeframeType[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                    timeframe === tf
                      ? "bg-white text-navy shadow-xs dark:bg-cyan-500 dark:text-neutral-950 font-black"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Metric Toggle */}
            <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-white/5 border border-navy/5 dark:border-white/5 text-xs font-bold">
              <button
                onClick={() => setActiveMetric("all")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  activeMetric === "all"
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-white/20 dark:text-white font-black"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveMetric("fee")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  activeMetric === "fee"
                    ? "bg-emerald-500 text-white shadow-xs font-black"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                15% Fee Only
              </button>
              <button
                onClick={() => setActiveMetric("gross")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  activeMetric === "gross"
                    ? "bg-navy text-white shadow-xs dark:bg-cyan-500 dark:text-neutral-950 font-black"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                Gross GMV
              </button>
            </div>

            {/* Chart Style Switcher (Area vs Bar) */}
            <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-white/5 border border-navy/5 dark:border-white/5">
              <button
                onClick={() => setChartType("area")}
                title="Area Line Chart"
                className={`rounded-lg p-1.5 transition ${
                  chartType === "area"
                    ? "bg-white text-navy shadow-xs dark:bg-white/20 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                }`}
              >
                <LineChart size={16} />
              </button>
              <button
                onClick={() => setChartType("bar")}
                title="Bar Chart"
                className={`rounded-lg p-1.5 transition ${
                  chartType === "bar"
                    ? "bg-white text-navy shadow-xs dark:bg-white/20 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                }`}
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Legend Row & Live Hover Inspector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Platform Fee (15%)
            </span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Editor Payouts (85%)
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
              Gross Campaign GMV
            </span>
          </div>

          {hoveredPoint ? (
            <div className="inline-flex items-center gap-3 rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-800 dark:bg-white/10 dark:text-white border border-black/5 dark:border-white/10">
              <span>{hoveredPoint.label}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                Fee: {formatPaise(hoveredPoint.platformFee)}
              </span>
              <span className="text-neutral-500">Gross: {formatPaise(hoveredPoint.gross)}</span>
              <span className="text-neutral-400">({hoveredPoint.transactions} tx)</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-400">Hover over any data point for exact figures</span>
          )}
        </div>

        {/* SVG Interactive Chart */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-50/50 p-4 dark:bg-black/20 border border-black/5 dark:border-white/5">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + chartInnerHeight * (1 - ratio);
              const val = Math.round(maxChartVal * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-neutral-200 dark:text-white/10"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-neutral-400 font-mono font-semibold"
                  >
                    {formatPaise(val)}
                  </text>
                </g>
              );
            })}

            {/* Area or Bar Rendering */}
            {activeChartData.length > 0 && chartType === "area" && (
              <>
                {/* Gross Volume Area & Line (if activeMetric === 'all' or 'gross') */}
                {(activeMetric === "all" || activeMetric === "gross") && (
                  <>
                    <path
                      d={(() => {
                        const pts = activeChartData.map((d, i) => {
                          const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                          const y = paddingY + chartInnerHeight * (1 - d.gross / maxChartVal);
                          return `${x},${y}`;
                        });
                        const firstX = paddingX;
                        const lastX = paddingX + chartInnerWidth;
                        const bottomY = paddingY + chartInnerHeight;
                        return `M ${firstX},${bottomY} L ${pts.join(" L ")} L ${lastX},${bottomY} Z`;
                      })()}
                      fill="url(#grossGrad)"
                    />
                    <path
                      d={(() => {
                        const pts = activeChartData.map((d, i) => {
                          const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                          const y = paddingY + chartInnerHeight * (1 - d.gross / maxChartVal);
                          return `${i === 0 ? "M" : "L"} ${x},${y}`;
                        });
                        return pts.join(" ");
                      })()}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </>
                )}

                {/* Editor Net Payout Area (if activeMetric === 'all' or 'net') */}
                {(activeMetric === "all" || activeMetric === "net") && (
                  <>
                    <path
                      d={(() => {
                        const pts = activeChartData.map((d, i) => {
                          const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                          const y = paddingY + chartInnerHeight * (1 - d.netPayout / maxChartVal);
                          return `${x},${y}`;
                        });
                        const firstX = paddingX;
                        const lastX = paddingX + chartInnerWidth;
                        const bottomY = paddingY + chartInnerHeight;
                        return `M ${firstX},${bottomY} L ${pts.join(" L ")} L ${lastX},${bottomY} Z`;
                      })()}
                      fill="url(#skyGrad)"
                    />
                    <path
                      d={(() => {
                        const pts = activeChartData.map((d, i) => {
                          const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                          const y = paddingY + chartInnerHeight * (1 - d.netPayout / maxChartVal);
                          return `${i === 0 ? "M" : "L"} ${x},${y}`;
                        });
                        return pts.join(" ");
                      })()}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                  </>
                )}

                {/* Platform Fee Area & Line (Emerald) */}
                {(activeMetric === "all" || activeMetric === "fee") && (
                  <>
                    <path
                      d={(() => {
                        const pts = activeChartData.map((d, i) => {
                          const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                          const y = paddingY + chartInnerHeight * (1 - d.platformFee / maxChartVal);
                          return `${x},${y}`;
                        });
                        const firstX = paddingX;
                        const lastX = paddingX + chartInnerWidth;
                        const bottomY = paddingY + chartInnerHeight;
                        return `M ${firstX},${bottomY} L ${pts.join(" L ")} L ${lastX},${bottomY} Z`;
                      })()}
                      fill="url(#emeraldGrad)"
                    />
                    <path
                      d={(() => {
                        const pts = activeChartData.map((d, i) => {
                          const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                          const y = paddingY + chartInnerHeight * (1 - d.platformFee / maxChartVal);
                          return `${i === 0 ? "M" : "L"} ${x},${y}`;
                        });
                        return pts.join(" ");
                      })()}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                  </>
                )}

                {/* Interactive Points on Line */}
                {activeChartData.map((d, i) => {
                  const x = paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
                  const feeY = paddingY + chartInnerHeight * (1 - d.platformFee / maxChartVal);
                  const isHovered = hoveredPoint?.key === d.key;

                  return (
                    <g key={d.key} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(d)}>
                      {/* Vertical hover line indicator */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={paddingY + chartInnerHeight}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}
                      {/* Interactive dot */}
                      <circle
                        cx={x}
                        cy={feeY}
                        r={isHovered ? 6 : 4}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* Bar Mode Rendering */}
            {activeChartData.length > 0 && chartType === "bar" && (
              <>
                {activeChartData.map((d, i) => {
                  const totalBars = activeChartData.length;
                  const colWidth = chartInnerWidth / totalBars;
                  const barWidth = Math.min(32, colWidth * 0.65);
                  const x = paddingX + i * colWidth + (colWidth - barWidth) / 2;

                  const grossHeight = chartInnerHeight * (d.gross / maxChartVal);
                  const feeHeight = chartInnerHeight * (d.platformFee / maxChartVal);
                  const netHeight = chartInnerHeight * (d.netPayout / maxChartVal);

                  const isHovered = hoveredPoint?.key === d.key;

                  return (
                    <g key={d.key} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(d)}>
                      {/* Background hover pillar */}
                      {isHovered && (
                        <rect
                          x={paddingX + i * colWidth}
                          y={paddingY}
                          width={colWidth}
                          height={chartInnerHeight}
                          fill="currentColor"
                          className="text-neutral-200/40 dark:text-white/5"
                        />
                      )}

                      {/* Gross GMV Bar */}
                      {(activeMetric === "all" || activeMetric === "gross") && (
                        <rect
                          x={x}
                          y={paddingY + chartInnerHeight - grossHeight}
                          width={barWidth}
                          height={Math.max(2, grossHeight)}
                          rx={3}
                          fill="#cbd5e1"
                          className="transition-all dark:fill-slate-700"
                        />
                      )}

                      {/* Net Editor Payout Bar */}
                      {(activeMetric === "all" || activeMetric === "net") && (
                        <rect
                          x={x}
                          y={paddingY + chartInnerHeight - netHeight}
                          width={barWidth}
                          height={Math.max(2, netHeight)}
                          rx={3}
                          fill="#38bdf8"
                          className="transition-all dark:fill-sky-500"
                        />
                      )}

                      {/* Platform Fee Bar (Emerald) */}
                      {(activeMetric === "all" || activeMetric === "fee") && (
                        <rect
                          x={x}
                          y={paddingY + chartInnerHeight - feeHeight}
                          width={barWidth}
                          height={Math.max(3, feeHeight)}
                          rx={3}
                          fill="#10b981"
                          className="transition-all hover:brightness-110"
                        />
                      )}
                    </g>
                  );
                })}
              </>
            )}

            {/* X-Axis Labels */}
            {activeChartData.map((d, i) => {
              const x =
                chartType === "bar"
                  ? paddingX + i * (chartInnerWidth / activeChartData.length) + (chartInnerWidth / activeChartData.length) / 2
                  : paddingX + (i / Math.max(1, activeChartData.length - 1)) * chartInnerWidth;
              return (
                <text
                  key={`label-${d.key}`}
                  x={x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-neutral-500 dark:fill-neutral-400"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Financial Distribution Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl border border-navy/10 bg-surface/50 p-4 dark:border-white/10 dark:bg-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Selected Period Fee Revenue
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPaise(
                useSimulation
                  ? simulatedChartData.reduce((sum, b) => sum + b.platformFee, 0)
                  : data?.summary.periodPlatformFees ?? 0
              )}
            </p>
            <span className="text-[11px] text-neutral-400">Harvested from verified views</span>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-surface/50 p-4 dark:border-white/10 dark:bg-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Selected Period Gross GMV
            </span>
            <p className="mt-1 text-xl font-black text-neutral-900 dark:text-white">
              {formatPaise(
                useSimulation
                  ? simulatedChartData.reduce((sum, b) => sum + b.gross, 0)
                  : data?.summary.periodGMV ?? 0
              )}
            </p>
            <span className="text-[11px] text-neutral-400">Creator capital settled</span>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-surface/50 p-4 dark:border-white/10 dark:bg-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Average Take per Disbursed Post
            </span>
            <p className="mt-1 text-xl font-black text-sky-600 dark:text-sky-400">
              {formatPaise(data?.summary.averageTransactionFee ?? 0)}
            </p>
            <span className="text-[11px] text-neutral-400">Net platform margin per clip</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TRANSACTIONS REVENUE LEDGER
      ══════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-[#0c1829] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-navy/10 dark:border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Revenue & Disbursement Ledger
              </h2>
              <span className="rounded-full bg-navy/10 dark:bg-white/10 px-2.5 py-0.5 text-xs font-black text-navy dark:text-cyan-400">
                {filteredTransactions.length} Record{filteredTransactions.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Granular breakdown of every view reward credited, showing gross volume, editor payout, and platform fee.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search campaign, creator, editor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-navy/15 bg-surface pl-9 pr-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-navy dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-navy/15 bg-surface px-3 py-2 text-xs font-bold text-neutral-800 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREDITED">Credited Only</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy/10 dark:border-white/10 text-neutral-400 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="py-3 px-3">Date & Timestamp</th>
                <th className="py-3 px-3">Campaign & Creator</th>
                <th className="py-3 px-3">Editor / Clipper</th>
                <th className="py-3 px-3 text-right">Verified Views</th>
                <th className="py-3 px-3 text-right">Gross GMV (100%)</th>
                <th className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">
                  Platform Fee (15%)
                </th>
                <th className="py-3 px-3 text-right text-sky-600 dark:text-sky-400">Net Editor Payout (85%)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5 dark:divide-white/5 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <div className="space-y-2">
                      <CircleDollarSign size={28} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                      <p className="font-semibold text-sm">No revenue transactions match the current criteria.</p>
                      <p className="text-xs">Once view milestones are verified and payouts disburse, transactions populate here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                      {formatDate(tx.creditedAt)}
                    </td>

                    {/* Campaign Title & Platform */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <Link
                          href={`/admin/campaigns/${tx.campaignId}`}
                          className="font-bold text-neutral-900 dark:text-white hover:text-navy dark:hover:text-cyan-400 inline-flex items-center gap-1.5"
                        >
                          <span className="truncate max-w-[220px]">{tx.campaignTitle}</span>
                          <ExternalLink size={11} className="text-neutral-400" />
                        </Link>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                          {tx.platform === "YouTube" ? (
                            <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                              <Youtube size={11} /> YouTube
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-pink-500 font-bold">
                              <Instagram size={11} /> Instagram
                            </span>
                          )}
                          <span>• by {tx.creatorName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Editor */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-navy text-[10px] font-black text-white dark:bg-cyan-500 dark:text-neutral-950">
                          {tx.editorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block">{tx.editorName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">@{tx.editorUsername}</span>
                        </div>
                      </div>
                    </td>

                    {/* Verified Views */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      {formatViews(tx.verifiedViews)}
                    </td>

                    {/* Gross GMV */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      {formatPaise(tx.grossAmount)}
                    </td>

                    {/* Platform Fee 15% */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        +{formatPaise(tx.platformFee)}
                      </span>
                    </td>

                    {/* Net Editor Payout 85% */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-sky-700 dark:text-sky-300 whitespace-nowrap">
                      {formatPaise(tx.netAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 size={11} /> {tx.status}
                      </span>
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
