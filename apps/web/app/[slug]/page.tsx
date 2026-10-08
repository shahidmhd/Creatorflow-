import Link from "next/link";
import { ArrowRight, BarChart3, Check, CircleDollarSign, Clapperboard, Gauge, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { Footer, PublicNav } from "../components";

const pageData = {
  creators: {
    eyebrow: "For creators",
    title: <>Get paid for<br /><span className="text-navy">posting content.</span></>,
    copy: "Join live campaigns, publish your work, and get paid for the attention you earn. No audience-size gatekeeping.",
    cta: "Join as a creator",
    stat: "₹5,00,000+",
    statCopy: "paid to creators last quarter",
    features: [["Withdraw your earnings", "See what is available, pending, and ready for your next payout.", CircleDollarSign], ["Flexible by design", "Pick briefs that fit your voice, platform, and schedule.", Clapperboard], ["Fast and transparent", "Clear rates, human review, and weekly settlement.", Zap]],
  },
  agencies: {
    eyebrow: "For agencies",
    title: <>Built for agencies<br /><span className="text-navy">that move content.</span></>,
    copy: "Give every client a better campaign operation: verified creators, faster approvals, and reports your team can trust.",
    cta: "Join as an agency",
    stat: "24/7",
    statCopy: "visibility across every active campaign",
    features: [["Get verified, grow faster", "Unlock stronger opportunities and a workspace built for repeatable execution.", ShieldCheck], ["Work with trusted brands", "Run campaigns with clear scopes, budgets, and payout rules.", Users], ["One platform for all your work", "Keep creators, content, and reporting connected.", BarChart3]],
  },
  pricing: {
    eyebrow: "Pricing",
    title: <>Simple pricing,<br /><span className="text-navy">no subscriptions.</span></>,
    copy: "No setup fees, seat fees, or listing fees. Pay for delivered work and keep your campaign economics clear.",
    cta: "Launch a campaign",
    stat: "10%",
    statCopy: "platform fee on approved work",
    features: [["Standard", "10% platform fee with no monthly commitment."], ["Verified", "8% platform fee for verified businesses."], ["Creator-first", "Creators pay no fee to join or submit work."]],
  },
  branding: {
    eyebrow: "Brand guidelines",
    title: <>A clearer way to<br /><span className="text-navy">build your brand.</span></>,
    copy: "Keep your campaign voice, visual system, and creator guidance in one accessible reference.",
    cta: "Download brand assets",
    stat: "01",
    statCopy: "One source of truth for every campaign",
    features: [["Introduction", "The principles behind our visual language and campaign experience."], ["Tone of voice", "Clear, direct, warm, and always creator-respectful."], ["Visual assets", "Download approved marks, colours, and usage guidance."]],
  },
} as const;

export function generateStaticParams() { return Object.keys(pageData).map((slug) => ({ slug })); }

export default async function Landing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pageData[slug as keyof typeof pageData] ?? pageData.creators;
  const isPricing = slug === "pricing";
  return <><PublicNav /><main className="bg-paper">
    <section className={`px-6 py-24 ${slug === "branding" ? "bg-navy text-white" : "grid-bg"}`}><div className="container"><p className={`text-sm font-bold uppercase tracking-[.2em] ${slug === "branding" ? "text-white/80" : "text-navy"}`}>{page.eyebrow}</p><h1 className="mt-5 max-w-4xl text-6xl font-bold leading-[.95] md:text-8xl">{page.title}</h1><p className={`mt-7 max-w-xl text-xl leading-8 ${slug === "branding" ? "text-white/80" : "text-neutral-500"}`}>{page.copy}</p><Link href={isPricing ? "/?auth=brand-create" : slug === "creators" ? "/?auth=clipper-create" : slug === "branding" ? "/branding" : "/?auth=brand-create"} className={`mt-9 inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold ${slug === "branding" ? "bg-white text-neutral-900" : "bg-navy text-white shadow-navy"}`}>{page.cta} <ArrowRight size={16}/></Link></div></section>
    <section className="container py-20"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-navy">The numbers</p><div className={`mt-5 font-bold ${page.stat.length > 10 ? "text-4xl sm:text-5xl md:text-6xl" : "text-7xl"}`}>{page.stat}</div><p className="mt-3 text-neutral-500">{page.statCopy}</p></div><div className="mt-16 grid gap-5 md:grid-cols-3">{page.features.map((feature) => { const [title, copy, Icon] = feature as [string, string, typeof ShieldCheck | undefined]; return <article key={title} className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm"><>{Icon ? <Icon className="text-navy" /> : <Gauge className="text-navy" />}</><h2 className="mt-14 text-2xl font-bold">{title}</h2><p className="mt-3 leading-7 text-neutral-500">{copy}</p>{!isPricing && <div className="mt-7 text-sm font-semibold"><Check className="mr-2 inline text-navy" size={16}/> Built for momentum</div>}</article>; })}</div></section>
    {isPricing ? <section className="container pb-20"><div className="rounded-3xl bg-gradient-to-br from-navy-soft to-navy-light p-8 md:p-14"><h2 className="max-w-xl text-4xl font-bold">Ready to launch your next campaign?</h2><div className="mt-8 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2"><span>✓ No monthly subscription</span><span>✓ Real-time analytics</span><span>✓ Verified creator network</span><span>✓ Human support</span></div><Link href="/?auth=brand-create" className="mt-9 inline-flex rounded-full bg-navy-deep px-5 py-3 font-semibold text-white">Launch a campaign</Link></div></section> : <section className="container pb-20"><div className="rounded-3xl bg-navy-deep p-8 text-white md:p-14"><Sparkles className="text-navy" /><h2 className="mt-10 max-w-xl text-4xl font-bold">Your next great piece of content is closer than you think.</h2><p className="mt-4 max-w-lg leading-7 text-white/60">{slug === "creators" ? "Find a brief, make it yours, and let the work compound." : "Make every campaign easier to launch, manage, and scale."}</p></div></section>}
  </main><Footer /></>;
}
