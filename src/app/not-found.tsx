import Link from "next/link";

import { PortfolioShell } from "@/components/portfolio/shell/portfolio-shell";
import { getSiteShell } from "@/content/queries.server";

export default function NotFound() {
  const shell = getSiteShell();
  return (
    <PortfolioShell currentPath="/404" mainId="portfolio-main" {...shell}>
      <main className="v4-not-found portfolio-container" id="portfolio-main" tabIndex={-1}>
        <p className="v4-route-hero__index"><span aria-hidden="true" className="v4-origin-mark" />404 / Page unavailable</p>
        <h1>This page could not be found.</h1>
        <p>The atlas has no record at this address.</p>
        <Link className="v4-button v4-button--primary" href="/" prefetch={false}>Return to the portfolio</Link>
      </main>
    </PortfolioShell>
  );
}
