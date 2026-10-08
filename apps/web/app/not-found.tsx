import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-navy">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold">That page went off-script.</h1>
        <p className="mt-4 leading-7 text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-navy px-5 py-3 font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
