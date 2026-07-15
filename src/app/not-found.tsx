import Link from "next/link";

import { PortfolioShell } from "@/components/portfolio/shell/portfolio-shell";
import { getSiteShell } from "@/content/queries.server";

export default function NotFound() {
  const shell = getSiteShell();
  return (
    <PortfolioShell currentPath="/404" mainId="portfolio-main" {...shell}>
      <main className="pfn-contact pfn-not-found" id="portfolio-main" tabIndex={-1}>
        <p>404 / Page unavailable</p>
        <h1>This page could not be found.</h1>
        <Link className="pfn-button pfn-button--primary" href="/" prefetch={false}>Return to the portfolio</Link>
      </main>
    </PortfolioShell>
  );
}
