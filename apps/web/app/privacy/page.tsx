import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { PublicNav, Footer } from "../components";

export const metadata: Metadata = {
  title: "Privacy Policy | Reviral",
  description: "Learn how Reviral collects, uses, and protects your data as a brand, creator, or video editor.",
};

export default function PrivacyPolicyPage() {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 mb-4">
              <Shield size={12} />
              <span>Privacy &amp; Data Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950 dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              Last updated: {lastUpdated} • Effective Date: January 1, 2026
            </p>
          </div>

          {/* Content Body */}
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {/* Intro */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                1. Overview &amp; Scope
              </h2>
              <p>
                At <strong>Reviral</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we take your privacy and data security seriously. This Privacy Policy details how we collect, store, use, and share personal information and creative media assets when you access or use our platform, APIs, campaign marketplace, and verification services.
              </p>
              <p className="mt-3">
                This policy applies to all users of Reviral, including Brands and Creators who submit video content and fund campaigns, and Video Editors and Clippers who edit, publish, and earn from short-form clips.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Lock className="text-blue-600 dark:text-blue-400" size={20} />
                2. Information We Collect
              </h2>
              <p className="mb-4">We collect information that you directly provide to us as well as data gathered automatically through your use of the service:</p>

              <div className="space-y-4">
                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">A. Account &amp; Identity Information</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    When you register as a Brand or Editor, we collect your name, email address, chosen username, authentication credentials, and profile details.
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">B. Media Assets &amp; Video Submissions</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    Brands provide raw video files, YouTube links, podcast audio, and campaign guidelines. Editors provide cut short-form clips (9:16 vertical video URLs, social post links, hashtags, and social handles on YouTube Shorts, Instagram Reels, and TikTok).
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">C. Financial &amp; Payout Information</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    To process escrow deposits and distribute the 85% editor payouts, we securely handle transaction records, bank transfer details, UPI IDs, and billing statements through certified payment gateways. We never store raw credit card numbers on our servers.
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 border border-neutral-100 dark:border-white/5">
                  <h3 className="font-bold text-neutral-900 dark:text-white">D. View Verification &amp; Platform Telemetry</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    Our proprietary verification engine analyzes public metrics (video view counts, engagement rates, retention patterns, timestamps, and referral domains) to detect artificial engagement and ensure payout accuracy.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Eye className="text-blue-600 dark:text-blue-400" size={20} />
                3. How We Use Your Information
              </h2>
              <ul className="space-y-2.5">
                {[
                  "Facilitating video editing campaigns, matching editors with suitable video footage.",
                  "Verifying legitimate, human-generated views across social platforms.",
                  "Operating our secure escrow system and calculating accurate payouts (85% editor share / 15% platform fee).",
                  "Preventing fraud, bot farming, duplicate link submissions, and malicious activity.",
                  "Sending important transaction notifications, campaign approval alerts, and wallet status updates.",
                  "Improving site speed, reliability, and user interface responsiveness.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Data Sharing & Third Parties */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
                4. Data Sharing &amp; Third Parties
              </h2>
              <p>
                We do not sell, rent, or trade your personal data. We disclose your information only in specific circumstances:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                <li><strong>Between Campaign Participants:</strong> Video editors receive access to brand footage and campaign parameters. Brands can see editor submissions, public links, and verified analytics.</li>
                <li><strong>Payment Processors:</strong> Trusted banking and payment gateways to complete deposits and wallet withdrawals.</li>
                <li><strong>Legal Requirements:</strong> When mandated by law, court orders, or regulations to protect our rights, users, or public safety.</li>
              </ul>
            </section>

            {/* Data Retention & Security */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
                5. Security &amp; Data Retention
              </h2>
              <p>
                All network transmissions are encrypted with TLS 1.3. User passwords are encrypted with industry-standard salted hashing algorithms. We retain your account data for as long as your account remains active or as required by financial auditing regulations. You may request account deletion and media asset removal at any time through our support portal.
              </p>
            </section>

            {/* Contact */}
            <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#0c182b]">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-3">
                6. Contact &amp; Grievance Officer
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                If you have questions, feedback, or concerns regarding your privacy or data rights, please contact our privacy compliance team at:
              </p>
              <div className="mt-4 rounded-2xl bg-neutral-50 dark:bg-white/5 p-4 text-xs sm:text-sm font-semibold">
                <p className="text-neutral-900 dark:text-white font-bold">Reviral Privacy Operations</p>
                <p className="text-neutral-500 dark:text-neutral-400">Email: <a href="mailto:privacy@reviral.app" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@reviral.app</a></p>
                <p className="text-neutral-500 dark:text-neutral-400">Response time: Within 24-48 business hours</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
