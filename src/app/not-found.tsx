import Link from "next/link";

import { LegacyShell } from "@/components/legacy/legacy-shell";

export default function NotFound() {
  return (
    <LegacyShell>
      <main className="mx-auto flex min-h-[70svh] max-w-5xl flex-col items-start justify-center gap-6 px-6 py-32">
        <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground">
          404 / ROUTE NOT FOUND
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          This page could not be found.
        </h1>
        <Link
          className="text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-8 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4"
          href="/"
        >
          Return to the portfolio
        </Link>
      </main>
    </LegacyShell>
  );
}
