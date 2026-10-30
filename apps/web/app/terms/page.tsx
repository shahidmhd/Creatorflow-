import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, CheckCircle2, ShieldAlert, Award, CreditCard, AlertCircle } from "lucide-react";
import { PublicNav, Footer } from "../components";

export const metadata: Metadata = {
  title: "Terms & Conditions | Reviral",
  description: "Read the Terms and Conditions governing use of the Reviral video repurposing platform, escrow pools, and payout policies.",
};

export default function TermsPage() {
  const lastUpdated = "October 30, 2026";

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#070b14] text-neutral-900 dark:text-neutral-100 transition-colors">
      <PublicNav />

      <main className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-8 transition"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          {/* Page Header */}
          <div className="mb-12 border-b border-neutral-200/80 dark:border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/80 px-3.5 py-1 text-xs font-bold text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-300 mb-4">
              <Scale size={12} />
              <span>Platform Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950 dark:text-white">
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              Last updated: {lastUpdated} • Effective Date: January 1, 2026
            </p>
          </div>

          {/* Content Body */}
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {/* 1. Introduction */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By registering, accessing, or using the Reviral platform (&ldquo;Reviral&rdquo;, &ldquo;Service&rdquo;, or &ldquo;Platform&rdquo;), you agree to be bound by these Terms and Conditions (&ldquo;Terms&rdquo;). If you do not agree to all terms, you must not access or use the Platform.
              </p>
              <p className="mt-3">
                Reviral acts as an escrow-secured marketplace connecting video content owners (&ldquo;Brands&rdquo; or &ldquo;Creators&rdquo;) with freelance video editors and clippers (&ldquo;Editors&rdquo;).
              </p>
            </section>

            {/* 2. Platform Economics & Revenue Share */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard className="text-purple-600 dark:text-purple-400" size={20} />
                2. Economics, Escrow &amp; 85/15 Revenue Split
              </h2>
              <div className="space-y-4">
                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">A. Escrow Funding</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    Brands deposit campaign budgets into an escrow pool prior to editors accepting briefs. Funds remain secured in escrow and are released only upon independent view verification.
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">B. 85% Editor Share / 15% Platform Fee</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    For all verified earnings, the video editor receives exactly <strong>85%</strong> of eligible campaign payouts directly credited to their Reviral wallet. Reviral retains a <strong>15%</strong> platform facilitation and verification fee.
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">C. 100% No Views = No Cost Guarantee</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    Brands only pay for real verified views that actually occur. If a submitted clip receives zero verified views during the campaign window, the brand incurs no payout charge for that clip.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Brand & Creator Responsibilities */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Award className="text-purple-600 dark:text-purple-400" size={20} />
                3. Brand Responsibilities &amp; Content Licensing
              </h2>
              <ul className="space-y-2.5">
                {[
                  "Brands warrant that they own or have obtained all necessary licenses, copyrights, and permissions for any footage, audio, or trademarks provided to the platform.",
                  "Brands grant approved editors a revocable, non-exclusive license to edit, remix, caption, and publish derivative 9:16 vertical short clips on agreed social channels solely in connection with the campaign brief.",
                  "Campaign budgets must be accurately funded before editors are approved to ensure guaranteed liquidity upon clip delivery.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 size={16} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Editor Responsibilities & Anti-Fraud */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={20} />
                4. Editor Obligations &amp; Strict Anti-Fraud Policy
              </h2>
              <p className="mb-3">
                Reviral maintains zero tolerance for artificial view inflation or fraudulent submissions:
              </p>
              <div className="rounded-2xl bg-red-50/70 border border-red-200/80 dark:bg-red-950/20 dark:border-red-900/40 p-4 text-xs sm:text-sm text-red-900 dark:text-red-300 space-y-2">
                <p><strong>Strictly Prohibited Practices:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use of bot farms, view exchange networks, fake social engagement, or automated scripts.</li>
                  <li>Submitting false, re-uploaded, or recycled video links from outside the campaign period.</li>
                  <li>Inappropriate, defamatory, hateful, or deceptive content editing that harms brand reputation.</li>
                </ul>
                <p className="pt-1 text-[11px] font-semibold text-red-700 dark:text-red-400">
                  Violation results in immediate disqualification, forfeiture of escrow earnings, and permanent platform ban.
                </p>
              </div>
            </section>

            {/* 5. Wallet Payouts & Taxes */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
                5. Wallet Payouts &amp; Tax Obligations
              </h2>
              <p>
                Verified earnings become available in the editor&rsquo;s wallet after standard verification clearance. Editors may withdraw funds to their registered bank account or UPI handle subject to minimum withdrawal thresholds. Users are solely responsible for determining and fulfilling all local tax liabilities arising from earnings generated through Reviral.
              </p>
            </section>

            {/* 6. Limitation of Liability */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertCircle className="text-neutral-500" size={20} />
                6. Disclaimers &amp; Limitation of Liability
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Reviral provides the platform on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. We do not guarantee specific viral performance or algorithmic distribution on third-party social media networks (YouTube, Instagram, TikTok). To the maximum extent permitted by law, Reviral is not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            {/* 7. Dispute Resolution & Contact */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
                7. Dispute Resolution &amp; Contact
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                Any dispute regarding campaign verification or payout settlement shall first be submitted to Reviral platform arbitration for amicable resolution. For legal inquiries or terms clarification, reach out to:
              </p>
              <div className="mt-4 rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 text-xs sm:text-sm font-semibold">
                <p className="text-neutral-900 dark:text-white font-bold">Reviral Legal Team</p>
                <p className="text-neutral-500 dark:text-neutral-400">Email: <a href="mailto:legal@reviral.app" className="text-purple-600 dark:text-purple-400 hover:underline">legal@reviral.app</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
