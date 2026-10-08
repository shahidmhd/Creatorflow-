import Link from "next/link";
import { ArrowRight, BarChart3, Check, CircleDollarSign, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Footer, PublicNav } from "./components";

type LandingConfig = {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  primary: string;
  secondary: string;
  features: [string, string][];
  accountType?: "brand" | "clipper";
};

export function MarketingPage({ config }: { config: LandingConfig }) {
  const authType = config.accountType ?? "brand";
  return (
    <>
      <PublicNav />
      <main>
        <section className="relative overflow-hidden bg-paper px-6 pb-24 pt-20 md:pb-32 md:pt-28">
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_center,_#4a73a833,_transparent_70%)]" />
          <div className="container relative">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-navy">{config.eyebrow}</p>
            <div className="mt-5 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-6xl font-bold leading-[.92] md:text-8xl">{config.title}</h1>
                <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600">{config.copy}</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  {authType === "clipper" ? (
                    <Link href="/?auth=clipper-create" className="rounded-full bg-navy px-6 py-3.5 font-bold text-white shadow-navy">Clipper sign in / Create account <ArrowRight className="ml-1 inline" size={16} /></Link>
                  ) : (
                    <>
                      <Link href={`/?auth=${authType}-create`} className="rounded-full bg-navy px-6 py-3.5 font-bold text-white shadow-navy">{config.primary} <ArrowRight className="ml-1 inline" size={16} /></Link>
                      <Link href={config.accountType ? `/?auth=${authType}-login` : "/book-a-demo"} className="rounded-full border border-black/10 bg-white px-6 py-3.5 font-bold">{config.accountType ? "Sign in as a Brand" : config.secondary}</Link>
                    </>
                  )}
                </div>
              </div>
              <div className="relative min-h-64 overflow-hidden rounded-[2rem] bg-navy-deep p-6 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_#4a73a8,_transparent_36%),linear-gradient(135deg,#0c182b,#17345c)] opacity-90" />
                <div className="relative flex h-full min-h-52 flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-white/60"><span>CONTENT REWARDS</span><span className="rounded-full bg-white/10 px-3 py-1">Live workspace</span></div>
                  <div><p className="text-sm text-navy-light">Campaign performance</p><p className="mt-1 text-4xl font-bold">₹2,40,000 <span className="text-sm font-medium text-emerald-300">+28.4%</span></p><div className="mt-5 flex h-14 items-end gap-2">{[30,45,38,62,55,82,70,100].map((height, index) => <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-navy to-navy-light" style={{ height: `${height}%` }} />)}</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container py-16 md:py-24">
          <div className="grid gap-5 md:grid-cols-3">
            {config.features.map(([title, copy], index) => {
              const Icon = [Sparkles, ShieldCheck, BarChart3][index];
              return <article key={title} className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm"><Icon className="text-navy" /><h2 className="mt-14 text-2xl font-bold">{title}</h2><p className="mt-3 leading-7 text-neutral-500">{copy}</p><div className="mt-7 text-sm font-semibold"><Check className="mr-2 inline text-navy" size={16} /> Built for the real workflow</div></article>;
            })}
          </div>
        </section>
        <section className="bg-navy-deep px-6 py-20 text-white md:py-28">
          <div className="container grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-center">
            <div><p className="text-sm font-bold uppercase tracking-[.2em] text-navy">The better way to grow</p><h2 className="mt-5 text-4xl font-bold md:text-6xl">Make work that gets remembered.</h2><p className="mt-5 max-w-lg leading-7 text-white/60">From the first brief to the final payout, ContentRewards makes every step visible, measurable, and human.</p></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-3xl bg-white/10 p-6"><Users className="text-navy" /><p className="mt-12 text-3xl font-bold">12k+</p><p className="mt-1 text-white/60">active creators</p></div><div className="rounded-3xl bg-navy p-6 text-white"><CircleDollarSign /><p className="mt-12 text-xl font-bold sm:text-2xl">₹18,00,00,000+</p><p className="mt-1 text-white/80">paid to creators</p></div></div>
          </div>
        </section>
        <section className="container py-20 md:py-28">
          <div className="rounded-[2rem] bg-gradient-to-br from-navy-soft via-paper to-navy-light p-8 md:p-16"><p className="text-sm font-bold uppercase tracking-[.2em] text-neutral-700">Ready when you are</p><h2 className="mt-4 max-w-2xl text-4xl font-bold md:text-6xl">Run your next campaign without the noise.</h2><Link href={`/?auth=${authType}-create`} className="mt-8 inline-flex rounded-full bg-navy-deep px-6 py-3.5 font-bold text-white">{authType === "clipper" ? "Clipper sign in / Create account" : "Create a Brand account"} <ArrowRight className="ml-2" size={17} /></Link></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
