export default function Loading() {
  return (
    <main
      aria-label="Loading Vantage"
      className="flex min-h-screen items-center justify-center bg-paper px-6"
    >
      <div className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
        <span className="h-3 w-3 animate-pulse rounded-full bg-navy" />
        Loading Vantage…
      </div>
    </main>
  );
}
