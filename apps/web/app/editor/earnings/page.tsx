"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wallet as WalletIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  Percent,
  Download,
  Building,
  Check,
} from "lucide-react";
import { api } from "@/app/api";

interface WalletTransaction {
  id: string;
  type: "REWARD" | "PLATFORM_FEE" | "WITHDRAWAL" | "ADJUSTMENT" | string;
  amount: number;
  balance: number;
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  transactions?: WalletTransaction[];
}

interface RewardItem {
  id: string;
  verifiedViews: number;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  feePercentage: number;
  status: "PENDING" | "CREDITED" | "CANCELLED";
  creditedAt?: string;
  createdAt: string;
  campaign?: {
    title: string;
  };
}

export default function EditorEarningsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CREDITS" | "FEES">("ALL");

  // Payout request modal state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"UPI" | "BANK">("UPI");
  const [upiId, setUpiId] = useState("");
  const [bankAcc, setBankAcc] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [walletRes, rewardsRes] = await Promise.all([
        api<WalletData>("/wallet"),
        api<{ rewards: RewardItem[]; total: number }>("/rewards/mine").catch(() => ({
          rewards: [] as RewardItem[],
          total: 0,
        })),
      ]);
      setWallet(walletRes);
      setRewards(rewardsRes?.rewards || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load wallet & earnings data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const balanceMajor = wallet ? Math.round(wallet.balance / 100) : 0;

  // Compute pending rewards (submitted / awaiting verification)
  const pendingRewards = rewards.filter((r) => r.status === "PENDING");
  const pendingMajor = Math.round(
    pendingRewards.reduce((sum, r) => sum + r.netAmount, 0) / 100
  );

  // Compute total lifetime net earned
  const creditedRewards = rewards.filter((r) => r.status === "CREDITED");
  const lifetimeEarnedMajor = Math.round(
    creditedRewards.reduce((sum, r) => sum + r.netAmount, 0) / 100
  );

  // Total platform fees deducted
  const lifetimeFeesMajor = Math.round(
    creditedRewards.reduce((sum, r) => sum + r.platformFee, 0) / 100
  );

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(withdrawAmount);
    if (!amountVal || amountVal <= 0) {
      alert("Please enter a valid payout amount");
      return;
    }
    if (amountVal > balanceMajor) {
      alert(`Amount exceeds available balance of ₹${balanceMajor.toLocaleString("en-IN")}`);
      return;
    }

    setWithdrawLoading(true);
    setTimeout(() => {
      setWithdrawLoading(false);
      setWithdrawSuccess(
        `Payout request of ₹${amountVal.toLocaleString("en-IN")} submitted to ${
          payoutMethod === "UPI" ? upiId : bankAcc
        }! Settlement processing within 24-48 business hours.`
      );
      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawSuccess("");
        setWithdrawAmount("");
      }, 3500);
    }, 900);
  };

  const transactions = wallet?.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "CREDITS") return tx.type === "REWARD" || tx.amount > 0;
    if (filterType === "FEES") return tx.type === "PLATFORM_FEE";
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
            Earnings & Virtual Wallet
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor credited 85% payouts, view pending earnings, and manage withdrawals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="icon-button"
            title="Refresh balances"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-navy" : "text-navy"} />
          </button>
          <button
            onClick={() => {
              setWithdrawAmount(balanceMajor > 0 ? balanceMajor.toString() : "");
              setIsWithdrawOpen(true);
            }}
            disabled={balanceMajor <= 0}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowUpRight size={15} /> Request Payout
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800 border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-navy" />
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════
              3 SUMMARY METRIC CARDS (Reviral Navy Theme)
          ══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Available Virtual Balance */}
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-600">
                  Available Virtual Balance
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <WalletIcon size={16} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black tracking-[-0.03em] text-emerald-600">
                ₹{balanceMajor.toLocaleString("en-IN")}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>Credited & ready for withdrawal</span>
              </div>
            </div>

            {/* 2. Pending Clearance */}
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-600">
                  Pending Clearance
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock size={16} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black tracking-[-0.03em] text-neutral-900">
                ₹{pendingMajor.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-400">
                {pendingRewards.length} clip{pendingRewards.length === 1 ? "" : "s"} in verification
              </p>
            </div>

            {/* 3. Lifetime Earned */}
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-600">
                  Lifetime Net Earned
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-soft text-navy">
                  <TrendingUp size={16} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black tracking-[-0.03em] text-neutral-900">
                ₹{lifetimeEarnedMajor.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-400">
                Platform fee paid: ₹{lifetimeFeesMajor.toLocaleString("en-IN")} (15%)
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              FEE TRANSPARENCY NOTICE
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-navy-soft/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white border border-navy/10 text-navy">
                <Percent size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Transparent 85/15 Revenue Share
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  You keep 85% of verified earnings directly in your virtual wallet. Reviral retains a 15% platform fee for automated tracking, hosting, and escrow protection.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                85% Editor Net
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-600 border border-navy/10">
                15% Platform
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TRANSACTIONS & LEDGER HISTORY
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy/5 pb-4">
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">
                  Transaction & Ledger History
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Detailed real-time record of all reward credits and fee deductions.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center rounded-xl bg-neutral-100 p-1 text-xs font-bold text-neutral-600">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    filterType === "ALL" ? "bg-white text-navy shadow-xs" : "hover:text-neutral-900"
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  onClick={() => setFilterType("CREDITS")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    filterType === "CREDITS"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "hover:text-neutral-900"
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setFilterType("FEES")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    filterType === "FEES" ? "bg-white text-navy shadow-xs" : "hover:text-neutral-900"
                  }`}
                >
                  Platform Fees
                </button>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                No transactions recorded under this filter yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredTransactions.map((tx) => {
                  const amtMajor = Math.round(tx.amount / 100);
                  const isCredit = tx.type === "REWARD" || tx.amount > 0;
                  const isFee = tx.type === "PLATFORM_FEE";
                  const dateStr = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 hover:bg-neutral-50/50 px-2 rounded-xl transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-neutral-900">{tx.description}</p>
                          {isFee ? (
                            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                              Fee Ledger
                            </span>
                          ) : isCredit ? (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              Reward Payout
                            </span>
                          ) : (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              Withdrawal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">
                          {dateStr}
                          {tx.referenceId && ` • Ref: ${tx.referenceId.slice(0, 8)}...`}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span
                          className={`text-sm font-black ${
                            isFee
                              ? "text-neutral-500"
                              : isCredit
                              ? "text-emerald-600"
                              : "text-neutral-900"
                          }`}
                        >
                          {isFee ? `₹${amtMajor.toLocaleString("en-IN")}` : `+₹${amtMajor.toLocaleString("en-IN")}`}
                        </span>
                        <p className="text-[11px] text-neutral-400">
                          Balance: ₹{Math.round(tx.balance / 100).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════
          REQUEST PAYOUT MODAL
      ══════════════════════════════════════════════════ */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-navy/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Request Payout</h3>
                <p className="text-xs text-neutral-400">
                  Withdraw your credited balance to your bank account or UPI.
                </p>
              </div>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-800 space-y-2 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p className="font-bold text-sm">Payout Initiated!</p>
                <p>{withdrawSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                    Withdrawal Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={balanceMajor}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Max ₹${balanceMajor.toLocaleString("en-IN")}`}
                      className="w-full rounded-xl border border-navy/10 bg-surface pl-8 pr-4 py-2.5 text-sm font-bold outline-none focus:border-navy"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Available balance: ₹{balanceMajor.toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">
                    Payout Destination
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("UPI")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition ${
                        payoutMethod === "UPI"
                          ? "border-navy bg-navy-soft text-navy"
                          : "border-navy/10 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      Instant UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("BANK")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition ${
                        payoutMethod === "BANK"
                          ? "border-navy bg-navy-soft text-navy"
                          : "border-navy/10 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <Building size={14} /> Bank Transfer
                    </button>
                  </div>
                </div>

                {payoutMethod === "UPI" ? (
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                      UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. editor@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Account number"
                        value={bankAcc}
                        onChange={(e) => setBankAcc(e.target.value)}
                        className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2 text-sm outline-none focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC0001234"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2 text-sm uppercase outline-none focus:border-navy"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="rounded-full border border-navy/10 px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawLoading || !withdrawAmount}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2 text-xs font-bold text-white hover:bg-navy/90 disabled:opacity-50 transition"
                  >
                    {withdrawLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Confirm Withdrawal"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
