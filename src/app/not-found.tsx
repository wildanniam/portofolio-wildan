import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pfn-shell" data-portfolio-v2>
      <section className="pfn-contact">
        <p className="pfn-eyebrow">404 / field note unavailable</p>
        <h1>This page could not be found.</h1>
        <Link className="pfn-action-link pfn-action-link--solid" href="/">
          Return to the portfolio
        </Link>
      </section>
    </main>
  );
}
