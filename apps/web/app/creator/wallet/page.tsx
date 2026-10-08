"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, Wallet as WalletIcon } from "lucide-react";

export default function CreatorWalletPage() {
  const [balance] = useState(2500000); // 25,000 INR in paise

  const transactions = [
    { id: "tx-1", type: "REWARD_RELEASE", amount: -85000, description: "Editor payout for Summer Viral Reels", date: "Oct 6, 2026" },
    { id: "tx-2", type: "PLATFORM_FEE", amount: -15000, description: "15% Platform fee for Summer Viral Reels", date: "Oct 6, 2026" },
    { id: "tx-3", type: "VIRTUAL_DEPOSIT", amount: 5000000, description: "Campaign pool virtual top-up", date: "Oct 1, 2026" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Wallet & Ledger</h1>
        <p className="text-sm text-neutral-500">Track campaign reward escrow releases and ledger deductions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:col-span-1 space-y-4">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Virtual Balance</span>
            <WalletIcon size={18} className="text-navy" />
          </div>
          <p className="text-4xl font-black tracking-[-0.05em] text-navy">
            ₹{(balance / 100).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-neutral-400">
            Available virtual money for funding future campaign rewards.
          </p>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-neutral-900">Ledger Transactions</h2>
          <div className="divide-y divide-neutral-100">
            {transactions.map((tx) => {
              const major = Math.abs(tx.amount / 100);
              const isNegative = tx.amount < 0;
              return (
                <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-900">{tx.description}</p>
                    <p className="text-xs text-neutral-400">{tx.date} • Type: {tx.type}</p>
                  </div>
                  <span className={`font-black ${isNegative ? "text-neutral-900" : "text-emerald-600"}`}>
                    {isNegative ? "-" : "+"}₹{major.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
