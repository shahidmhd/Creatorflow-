"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wallet as WalletIcon,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/app/api";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

interface WalletData {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions?: Transaction[];
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000];

export default function CreatorWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | string>(10000);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<WalletData>("/wallet");
      setWallet(data);
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(topUpAmount);
    if (!amountVal || amountVal <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const minorAmount = Math.round(amountVal * 100); // INR to paise
      const res = await api<{ wallet: WalletData; transaction: Transaction }>("/wallet/add-funds", {
        method: "POST",
        body: JSON.stringify({
          amount: minorAmount,
          description: `Direct deposit of ₹${amountVal.toLocaleString("en-IN")}`,
        }),
      });

      if (res?.wallet) {
        setWallet((prev) => (prev ? { ...prev, balance: res.wallet.balance } : res.wallet));
      }
      if (res?.transaction) {
        setTransactions((prev) => [res.transaction, ...prev]);
      }

      setNotice(`Successfully added ₹${amountVal.toLocaleString("en-IN")} to your campaign wallet!`);
      setIsModalOpen(false);
      setTopUpAmount(10000);
      setTimeout(() => setNotice(""), 4500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add funds. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const balanceMajor = wallet ? Math.round(wallet.balance / 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
            Wallet & Ledger
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your campaign fund balance and track transparent ledger escrow deductions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWallet}
            disabled={loading}
            className="icon-button"
            title="Refresh balance"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-navy" : "text-navy"} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10"
          >
            <Plus size={15} /> Add Funds
          </button>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3.5 text-xs font-bold text-amber-800 border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && !wallet ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-navy" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Balance Card */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs md:col-span-1 space-y-5">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Available Wallet Balance
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-soft text-navy">
                <WalletIcon size={16} />
              </span>
            </div>

            <div>
              <p className="text-4xl font-black tracking-[-0.04em] text-neutral-900">
                ₹{balanceMajor.toLocaleString("en-IN")}
              </p>
              <p className="text-xs font-medium text-neutral-400 mt-1">
                Real escrow funds ready to allocate to your upcoming campaigns.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10"
            >
              <Plus size={14} /> Add Funds to Wallet
            </button>

            <div className="rounded-xl bg-navy-soft/60 p-3.5 text-xs text-neutral-600 space-y-1.5 border border-navy/5">
              <div className="flex items-center gap-1.5 font-bold text-navy">
                <ShieldCheck size={14} className="text-emerald-600" /> Transparent Escrow
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                When you launch a campaign, funds are held safely in escrow. Editors only earn from verified views, and unspent pools remain in your account.
              </p>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">
                  Ledger Transactions
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verified balance movements, deposits, and campaign escrow reserves.
                </p>
              </div>
              <span className="text-xs font-bold text-neutral-400">
                {transactions.length} record{transactions.length === 1 ? "" : "s"}
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                No ledger transactions yet. Use &ldquo;Add Funds&rdquo; to top up your campaign pool.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-[460px] overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const major = Math.abs(tx.amount / 100);
                  const isNegative = tx.amount < 0;
                  const dateStr = tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3.5 hover:bg-neutral-50/50 transition px-1"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm text-neutral-900">{tx.description}</p>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span className="rounded bg-navy-soft px-1.5 py-0.5 text-[10px] font-bold text-navy uppercase">
                            {tx.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-black ${
                            isNegative ? "text-neutral-900" : "text-emerald-600"
                          }`}
                        >
                          {isNegative ? "-" : "+"}₹{major.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-neutral-400 font-medium">
                          Bal: ₹{(tx.balance / 100).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ADD FUNDS MODAL
      ══════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-navy/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-soft text-navy">
                  <WalletIcon size={16} />
                </span>
                <div>
                  <h3 className="font-black text-base text-neutral-900">Add Funds to Wallet</h3>
                  <p className="text-xs text-neutral-400">Deposit funds to launch campaigns</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Select Quick Amount
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setTopUpAmount(preset)}
                      className={`rounded-xl py-2 px-3 text-xs font-bold border transition ${
                        Number(topUpAmount) === preset
                          ? "border-navy bg-navy text-white"
                          : "border-navy/15 bg-white text-neutral-700 hover:bg-navy-soft hover:text-navy"
                      }`}
                    >
                      ₹{preset.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Or Enter Custom Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="any"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full rounded-xl border border-navy/15 bg-surface pl-8 pr-4 py-2.5 text-sm font-bold text-neutral-900 outline-none focus:border-navy"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Funds will be credited immediately to your virtual campaign balance.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-navy px-5 py-2 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Depositing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} /> Confirm Deposit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
