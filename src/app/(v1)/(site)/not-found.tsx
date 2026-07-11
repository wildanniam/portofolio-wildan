import { ActionLink } from "@/components/v1/foundations/action-link";
import { SiteContainer } from "@/components/v1/foundations/site-container";

export default function PortfolioSiteNotFound() {
  return (
    <section className="opg-site-not-found" data-public-v1-not-found>
      <SiteContainer>
        <p className="opg-site-not-found__eyebrow">404 / Record unavailable</p>
        <h1>This page is not part of the public archive.</h1>
        <p>
          It may still be under review, or the address may not exist. Published
          work remains available from the archive.
        </p>
        <nav aria-label="Not found">
          <ActionLink href="/work">Browse work</ActionLink>
          <ActionLink direction="back" href="/">
            Return home
          </ActionLink>
        </nav>
      </SiteContainer>
    </section>
  );
}
