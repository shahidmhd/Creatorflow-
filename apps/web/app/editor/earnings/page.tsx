"use client";

import { useState } from "react";
import { ArrowDownLeft, Wallet as WalletIcon, CheckCircle2 } from "lucide-react";

export default function EditorEarningsPage() {
  const [balance] = useState(1245000); // 12,450 INR in paise

  const transactions = [
    { id: "tx-1", type: "REWARD", amount: 85000, description: "Editor payout (85%) for Summer Viral Reels", date: "Oct 6, 2026", gross: 100000, fee: 15000 },
    { id: "tx-2", type: "REWARD", amount: 425000, description: "Editor payout (85%) for Tech Setup Short", date: "Oct 2, 2026", gross: 500000, fee: 75000 },
    { id: "tx-3", type: "REWARD", amount: 735000, description: "Editor payout (85%) for Gaming Montages", date: "Sep 28, 2026", gross: 865000, fee: 130000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Earnings & Virtual Wallet</h1>
        <p className="text-sm text-neutral-500">View credited reward balances, 85% payouts, and platform fee deductions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:col-span-1 space-y-4">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Editor Virtual Balance</span>
            <WalletIcon size={18} className="text-navy" />
          </div>
          <p className="text-4xl font-black tracking-[-0.05em] text-emerald-600">
            ₹{(balance / 100).toLocaleString("en-IN")}
          </p>
          <div className="rounded-xl bg-navy-soft/60 p-3 text-xs text-neutral-600 space-y-1">
            <p className="font-bold text-navy flex items-center gap-1">
              <CheckCircle2 size={13} /> 100% Ledger Protected
            </p>
            <p className="text-[11px] text-neutral-500">
              Each credit reflects your 85% net earning after the 15% platform fee deduction.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-neutral-900">Earnings History</h2>
          <div className="divide-y divide-neutral-100">
            {transactions.map((tx) => {
              const netMajor = tx.amount / 100;
              const feeMajor = tx.fee / 100;
              const grossMajor = tx.gross / 100;

              return (
                <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-900">{tx.description}</p>
                    <p className="text-xs text-neutral-400">
                      {tx.date} • Gross: ₹{grossMajor.toLocaleString("en-IN")} (Platform fee -₹{feeMajor.toLocaleString("en-IN")})
                    </p>
                  </div>
                  <span className="font-black text-emerald-600">
                    +₹{netMajor.toLocaleString("en-IN")}
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
