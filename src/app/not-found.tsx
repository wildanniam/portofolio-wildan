import Link from "next/link";

import { PfnFooter } from "@/components/pfn/pfn-footer";
import { PfnHeader } from "@/components/pfn/pfn-shell";

export default function NotFound() {
  return (
    <div className="pfn-shell" data-portfolio-v3>
      <PfnHeader currentPath="/404" />
      <main className="pfn-contact pfn-not-found">
        <p>404 / Page unavailable</p>
        <h1>This page could not be found.</h1>
        <Link className="pfn-button pfn-button--primary" href="/" prefetch={false}>Return to the portfolio</Link>
      </main>
      <PfnFooter />
    </div>
  );
}
