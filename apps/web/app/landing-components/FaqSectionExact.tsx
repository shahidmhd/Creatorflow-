"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "How does the 3-step workflow work?",
    a: "Brands deposit footage and fund an escrow pool. Certified editors apply and cut 9:16 vertical clips. When clips are published, our verification engine tracks views and releases 85% directly to editor wallets.",
  },
  {
    q: "How much does Reviral charge?",
    a: "Reviral retains 15% of verified payouts. If a clip gets no views, it costs nothing. Brands only pay for real, verified views.",
  },
  {
    q: "How do brands launch and fund campaigns?",
    a: "Sign up as a brand, create a campaign brief, set your budget and view rate (e.g. ₹200 per 1,000 views). Editors apply, create clips, and post them with approved hashtags and mentions.",
  },
  {
    q: "How are editor payouts calculated?",
    a: "Your verified views × your campaign rate per 1,000 = gross payout. Reviral deducts 15% platform fee and credits 85% straight to your wallet.",
  },
];

export function FaqSectionExact() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section className="py-12 lg:py-20 bg-transparent transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">
            QUESTIONS
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Frequently Asked Questions.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-colors dark:border-white/10 dark:bg-[#0c182b]"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-neutral-900 dark:text-white transition-opacity hover:opacity-80"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 shrink-0 text-neutral-400 dark:text-neutral-500">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium pt-2 border-t border-neutral-100 dark:border-white/5">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
